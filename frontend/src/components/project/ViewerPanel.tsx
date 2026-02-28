import React from 'react';
import { Box } from 'lucide-react';
import { ThreeViewer } from '../ThreeViewer';
import { Project } from '../../store';
import { useI18n } from '../../lib/i18n';

interface ViewerPanelProps {
    project: Project;
}

export const ViewerPanel: React.FC<ViewerPanelProps> = ({ project }) => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const API_FILE_URL = project.file_path ? `${API_BASE}/${project.file_path}` : undefined;
    const fileExt = project.file_path ? project.file_path.split('.').pop() : undefined;
    const { t } = useI18n();

    return (
        <div className="flex-1 flex flex-col p-6 min-w-0 min-h-[400px]">
            <div className="flex-1 flex flex-col bg-dark-800 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-4 left-4 z-10 bg-dark-900/80 backdrop-blur rounded-lg p-3 border border-gray-700 shadow-xl pointer-events-none">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Box size={14} className="text-primary-500" /> {t('model_specs')}</h3>
                    {project.file_status === 'ready' && project.volume_mm3 ? (
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between gap-6"><span className="text-gray-400">{t('dim_x')}</span> <span className="text-gray-200">{(project.dim_x || 0).toFixed(1)} mm</span></div>
                            <div className="flex justify-between gap-6"><span className="text-gray-400">{t('dim_y')}</span> <span className="text-gray-200">{(project.dim_y || 0).toFixed(1)} mm</span></div>
                            <div className="flex justify-between gap-6"><span className="text-gray-400">{t('dim_z')}</span> <span className="text-gray-200">{(project.dim_z || 0).toFixed(1)} mm</span></div>
                            <div className="h-px bg-gray-700 my-1 !mt-2 !mb-2"></div>
                            <div className="flex justify-between gap-6"><span className="text-gray-400">{t('volume')}</span> <span className="text-gray-200">{(project.volume_mm3 / 1000).toFixed(1)} cm³</span></div>
                            <div className="flex justify-between gap-6"><span className="text-gray-400">{t('polygons')}</span> <span className="text-gray-200">{project.poly_count?.toLocaleString()}</span></div>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500 italic">{t('waiting_processing')}</div>
                    )}
                </div>

                <div className="flex-1 relative min-h-full">
                    <ThreeViewer
                        fileUrl={API_FILE_URL}
                        fileExt={fileExt}
                        status={project.file_status}
                    />
                </div>
            </div>
        </div>
    );
};
