import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { projectsApi } from '../projects/api';
import { ArrowLeft, Upload, Save } from 'lucide-react';

import { ParametersPanel } from '../components/project/ParametersPanel';
import { ViewerPanel } from '../components/project/ViewerPanel';
import { ResultsPanel } from '../components/project/ResultsPanel';
import { calculateEconomics } from '../lib/calculator';

const DEFAULT_PARAMS = {
    technology: 'FDM',
    material: 'PLA',
    density: 1.24, // g/cm3
    pricePerKg: 25, // USD
    wastePercent: 5,
    infill: 20,
    supports: 10,
    printTimeHours: 2,
    postProcessHours: 0.5,
    modelPrepMins: 15,
    quantity: 1,
    markupPercent: 30,
    defectRateRate: 5,
    taxRatePercent: 20,
    amortizationCostPerHour: 0.5,
    electricityCostPerHour: 0.2,
    currency: 'USD'
};

export const ProjectEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { projects, updateProjectInList } = useStore();

    const [project, setProject] = useState(projects.find(p => p.id === id) || null);
    const [params, setParams] = useState(DEFAULT_PARAMS);
    const [uploading, setUploading] = useState(false);
    const [generatingAi, setGeneratingAi] = useState(false);
    const [saving, setSaving] = useState(false);

    // Poll project status if it's processing
    useEffect(() => {
        if (!id) return;

        const fetchProject = async () => {
            try {
                const res = await projectsApi.getProject(id as string);
                setProject(res.data);
                if (res.data.production_params) {
                    setParams(prev => ({ ...prev, ...res.data.production_params }));
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchProject();

        // Poll every 3 seconds if processing
        let interval: NodeJS.Timeout;
        if (project?.file_status === 'processing') {
            interval = setInterval(fetchProject, 3000);
        }

        return () => clearInterval(interval);
    }, [id, project?.file_status]);

    // Reactive calculations via pure function
    const results = useMemo(() => calculateEconomics(params, project?.volume_mm3), [project?.volume_mm3, params]);

    // Auto-save logic (debounced)
    useEffect(() => {
        if (!project || !results) return;

        const timeoutId = setTimeout(async () => {
            setSaving(true);
            try {
                await projectsApi.updateProjectParams(project.id, {
                    production_params: params,
                    calculated_results: results
                });
                updateProjectInList({ ...project, production_params: params, calculated_results: results });
            } catch (e) {
                console.error("Auto-save failed", e);
            } finally {
                setSaving(false);
            }
        }, 1500);

        return () => clearTimeout(timeoutId);
    }, [params, results]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !project) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await projectsApi.uploadFile(project.id, formData);
            setProject(res.data);
            updateProjectInList(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    const handleGenerateAI = async () => {
        if (!project || !results) return;
        setGeneratingAi(true);
        try {
            // Ensure latest calculations are saved before generating
            await projectsApi.updateProjectParams(project.id, {
                production_params: params,
                calculated_results: results
            });

            const res = await projectsApi.generateAi(project.id);
            setProject(res.data);
            updateProjectInList(res.data);
        } catch (e) {
            console.error(e);
            alert("Failed to generate AI data");
        } finally {
            setGeneratingAi(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        setParams(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    if (!project) {
        return <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white">Loading project...</div>;
    }

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="bg-dark-800 border-b border-gray-800 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            {project.title}
                            {saving && <span className="text-xs text-primary-500 font-medium ml-2 flex items-center gap-1"><Save size={12} /> Saving...</span>}
                        </h1>
                        <div className="flex text-sm text-gray-400 gap-2 sm:gap-4 mt-1 flex-wrap">
                            <span>Client: {project.client_name || 'N/A'}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Updated: {new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <label className="w-full sm:w-auto justify-center bg-dark-700 hover:bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                        <Upload size={18} />
                        {uploading ? 'Uploading...' : 'Upload Model'}
                        <input type="file" accept=".stl,.obj,.3mf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                </div>
            </header>

            {/* Main Content - Mobile-first flex-col, lg:flex-row */}
            <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">
                {/* LEFT PANEL: Parameters */}
                <ParametersPanel params={params} onChange={handleChange} />

                {/* CENTER PANEL: 3D Viewer */}
                <ViewerPanel project={project} />

                {/* RIGHT PANEL: Results */}
                <ResultsPanel
                    project={project}
                    results={results}
                    params={params}
                    generatingAi={generatingAi}
                    onGenerateAi={handleGenerateAI}
                />
            </div>
        </div>
    );
};
