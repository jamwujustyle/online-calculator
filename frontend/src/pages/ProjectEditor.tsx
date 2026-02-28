import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { projectsApi } from '../projects/api';
import { ArrowLeft, Upload, Save, Trash2, Pencil, Check, X, User, Phone, FileText } from 'lucide-react';
import { ConfirmModal } from '../components/project/ConfirmModal';
import { toast } from 'sonner';

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
    const { projects, updateProjectInList, removeProject } = useStore();

    const [project, setProject] = useState(projects.find(p => p.id === id) || null);
    const [params, setParams] = useState(DEFAULT_PARAMS);
    const [uploading, setUploading] = useState(false);
    const [generatingAi, setGeneratingAi] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Editable fields state
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editClientName, setEditClientName] = useState('');
    const [editContact, setEditContact] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [showDetails, setShowDetails] = useState(false);

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
            toast.success('Model uploaded successfully');
        } catch (err) {
            console.error(err);
            toast.error('Failed to upload file');
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
            toast.success('AI descriptions generated');
        } catch (e) {
            console.error(e);
            toast.error('Failed to generate AI descriptions');
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

    const handleDeleteProject = async () => {
        if (!project) return;
        setDeleting(true);
        try {
            await projectsApi.deleteProject(project.id);
            removeProject(project.id);
            toast.success('Project deleted');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const startEditing = (field: string) => {
        if (!project) return;
        setEditingField(field);
        if (field === 'title') setEditTitle(project.title);
        if (field === 'client_name') setEditClientName(project.client_name || '');
        if (field === 'contact') setEditContact(project.contact || '');
        if (field === 'notes') setEditNotes(project.notes || '');
    };

    const cancelEditing = () => {
        setEditingField(null);
    };

    const saveField = async (field: string) => {
        if (!project) return;
        const updates: any = {};
        if (field === 'title') updates.title = editTitle.trim() || project.title;
        if (field === 'client_name') updates.client_name = editClientName.trim() || null;
        if (field === 'contact') updates.contact = editContact.trim() || null;
        if (field === 'notes') updates.notes = editNotes.trim() || null;

        try {
            const res = await projectsApi.updateProject(project.id, updates);
            setProject(res.data);
            updateProjectInList(res.data);
        } catch (err) {
            console.error(err);
        }
        setEditingField(null);
    };

    const handleFieldKeyDown = (e: React.KeyboardEvent, field: string) => {
        if (e.key === 'Enter') saveField(field);
        if (e.key === 'Escape') cancelEditing();
    };

    if (!project) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="bg-dark-800/80 backdrop-blur-sm border-b border-white/5 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="min-w-0">
                        {/* Editable Title */}
                        {editingField === 'title' ? (
                            <div className="flex items-center gap-2">
                                <input
                                    autoFocus
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    onKeyDown={e => handleFieldKeyDown(e, 'title')}
                                    className="text-xl font-bold bg-dark-900/50 border border-primary-500 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 w-64"
                                />
                                <button onClick={() => saveField('title')} className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors cursor-pointer"><Check size={16} /></button>
                                <button onClick={cancelEditing} className="p-1.5 text-gray-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"><X size={16} /></button>
                            </div>
                        ) : (
                            <h1 className="text-xl font-bold text-white flex items-center gap-2 group/title cursor-pointer truncate" onClick={() => startEditing('title')}>
                                <span className="truncate">{project.title}</span>
                                <Pencil size={14} className="text-gray-500 opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0" />
                                {saving && <span className="text-xs text-primary-500 font-medium ml-1 flex items-center gap-1 shrink-0"><Save size={12} /> Saving...</span>}
                            </h1>
                        )}

                        {/* Editable metadata row */}
                        <div className="flex text-sm text-gray-400 gap-2 sm:gap-4 mt-1 flex-wrap items-center">
                            {/* Client Name */}
                            {editingField === 'client_name' ? (
                                <div className="flex items-center gap-1.5">
                                    <User size={14} className="text-gray-500" />
                                    <input
                                        autoFocus
                                        value={editClientName}
                                        onChange={e => setEditClientName(e.target.value)}
                                        onKeyDown={e => handleFieldKeyDown(e, 'client_name')}
                                        placeholder="Client name"
                                        className="bg-dark-900/50 border border-primary-500 rounded px-2 py-0.5 text-white text-sm focus:outline-none w-32"
                                    />
                                    <button onClick={() => saveField('client_name')} className="text-green-400 hover:bg-green-500/10 rounded p-0.5 cursor-pointer"><Check size={14} /></button>
                                    <button onClick={cancelEditing} className="text-gray-400 hover:bg-white/5 rounded p-0.5 cursor-pointer"><X size={14} /></button>
                                </div>
                            ) : (
                                <span className="flex items-center gap-1.5 group/client cursor-pointer hover:text-gray-300 transition-colors" onClick={() => startEditing('client_name')}>
                                    <User size={14} className="text-gray-500" />
                                    {project.client_name || 'Add client'}
                                    <Pencil size={12} className="opacity-0 group-hover/client:opacity-100 transition-opacity" />
                                </span>
                            )}

                            <span className="hidden sm:inline text-gray-600">•</span>

                            {/* Contact */}
                            {editingField === 'contact' ? (
                                <div className="flex items-center gap-1.5">
                                    <Phone size={14} className="text-gray-500" />
                                    <input
                                        autoFocus
                                        value={editContact}
                                        onChange={e => setEditContact(e.target.value)}
                                        onKeyDown={e => handleFieldKeyDown(e, 'contact')}
                                        placeholder="Contact info"
                                        className="bg-dark-900/50 border border-primary-500 rounded px-2 py-0.5 text-white text-sm focus:outline-none w-36"
                                    />
                                    <button onClick={() => saveField('contact')} className="text-green-400 hover:bg-green-500/10 rounded p-0.5 cursor-pointer"><Check size={14} /></button>
                                    <button onClick={cancelEditing} className="text-gray-400 hover:bg-white/5 rounded p-0.5 cursor-pointer"><X size={14} /></button>
                                </div>
                            ) : (
                                <span className="flex items-center gap-1.5 group/contact cursor-pointer hover:text-gray-300 transition-colors" onClick={() => startEditing('contact')}>
                                    <Phone size={14} className="text-gray-500" />
                                    {project.contact || 'Add contact'}
                                    <Pencil size={12} className="opacity-0 group-hover/contact:opacity-100 transition-opacity" />
                                </span>
                            )}

                            <span className="hidden sm:inline text-gray-600">•</span>

                            {/* Notes toggle */}
                            <span
                                className="flex items-center gap-1.5 cursor-pointer hover:text-gray-300 transition-colors"
                                onClick={() => {
                                    if (!showDetails) {
                                        setShowDetails(true);
                                        startEditing('notes');
                                    } else {
                                        setShowDetails(false);
                                        cancelEditing();
                                    }
                                }}
                            >
                                <FileText size={14} className="text-gray-500" />
                                {project.notes ? 'View notes' : 'Add notes'}
                            </span>
                        </div>

                        {/* Expandable Notes */}
                        {showDetails && (
                            <div className="mt-3 animate-slide-up">
                                {editingField === 'notes' ? (
                                    <div className="flex gap-2 items-start">
                                        <textarea
                                            autoFocus
                                            value={editNotes}
                                            onChange={e => setEditNotes(e.target.value)}
                                            placeholder="Project notes…"
                                            rows={3}
                                            className="flex-1 bg-dark-900/50 border border-primary-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none max-w-md"
                                        />
                                        <div className="flex flex-col gap-1">
                                            <button onClick={() => saveField('notes')} className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors cursor-pointer"><Check size={16} /></button>
                                            <button onClick={() => { cancelEditing(); setShowDetails(false); }} className="p-1.5 text-gray-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"><X size={16} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="bg-dark-900/50 border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-300 max-w-md cursor-pointer hover:border-primary-500/30 transition-colors"
                                        onClick={() => startEditing('notes')}
                                    >
                                        {project.notes || <span className="text-gray-500 italic">No notes yet. Click to add.</span>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        disabled={deleting}
                        className="bg-dark-700/50 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 px-3 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        title="Delete project"
                    >
                        {deleting ? (
                            <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                        ) : (
                            <Trash2 size={18} />
                        )}
                    </button>
                    <label className="flex-1 sm:flex-none justify-center bg-dark-700/50 hover:bg-dark-700 border border-white/10 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer">
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

            <ConfirmModal
                isOpen={showDeleteModal}
                title="Delete Project"
                message="This will permanently delete this project and all its data. This action cannot be undone."
                confirmText="Delete"
                danger
                loading={deleting}
                onConfirm={handleDeleteProject}
                onCancel={() => setShowDeleteModal(false)}
            />
        </div>
    );
};
