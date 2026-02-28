import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { projectsApi } from '../projects/api';
import { authApi } from '../auth/api';
import { Plus, Package, Calendar, LogOut, ChevronRight, Trash2, User } from 'lucide-react';
import { CreateProjectModal } from '../components/project/CreateProjectModal';
import { ConfirmModal } from '../components/project/ConfirmModal';
import { toast } from 'sonner';

export const Dashboard = () => {
    const { user, projects, setProjects, setCurrentProject, removeProject, logout } = useStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await projectsApi.getProjects();
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (data: { title: string; client_name?: string; contact?: string; notes?: string }) => {
        setCreating(true);
        try {
            const res = await projectsApi.createProject(data);
            setProjects([...projects, res.data]);
            setShowModal(false);
            toast.success('Project created');
            handleOpenProject(res.data.id);
        } catch (err) {
            console.error(err);
            toast.error('Failed to create project');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDeleteTarget(id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setDeletingId(deleteTarget);
        try {
            await projectsApi.deleteProject(deleteTarget);
            removeProject(deleteTarget);
            toast.success('Project deleted');
        } catch (err) {
            toast.error('Failed to delete project');
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    };

    const handleOpenProject = (id: string) => {
        setCurrentProject(id);
        navigate(`/project/${id}`);
    };

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error(err);
        }
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-dark-900 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Package className="text-primary-500" />
                            My Projects
                        </h1>
                        <p className="text-gray-400 mt-2">Welcome back, {user?.email}</p>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex-1 sm:flex-none bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-primary-500/20 cursor-pointer"
                        >
                            <Plus size={20} />
                            New Project
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-dark-800 hover:bg-gray-800 border border-white/10 text-gray-300 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="glass-panel h-52 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20 glass-panel rounded-2xl animate-fade-in">
                        <Package size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-medium text-gray-300 mb-2">No projects yet</h3>
                        <p className="text-gray-500 mb-6">Create your first project to start calculating.</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white px-6 py-2.5 rounded-xl inline-flex items-center gap-2 font-medium transition-all shadow-lg shadow-primary-500/20 cursor-pointer"
                        >
                            <Plus size={20} /> Start Calculating
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project, index) => (
                            <div
                                key={project.id}
                                onClick={() => handleOpenProject(project.id)}
                                className={`glass-panel glow-border rounded-2xl p-6 cursor-pointer transition-all group relative hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-0.5 animate-slide-up stagger-${Math.min(index + 1, 6)}`}
                            >
                                {/* Delete button */}
                                <button
                                    onClick={(e) => handleDeleteClick(e, project.id)}
                                    disabled={deletingId === project.id}
                                    className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10 disabled:opacity-50"
                                    title="Delete project"
                                >
                                    {deletingId === project.id ? (
                                        <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                                    ) : (
                                        <Trash2 size={16} />
                                    )}
                                </button>

                                <div className="flex justify-between items-start mb-4 pr-8">
                                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors leading-tight">
                                        {project.title}
                                    </h3>
                                    <div className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 ${project.file_status === 'ready' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                        project.file_status === 'processing' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                            'bg-gray-800/60 text-gray-400 border border-gray-700/50'
                                        }`}>
                                        {project.file_status}
                                    </div>
                                </div>

                                <div className="space-y-2.5 text-sm text-gray-400 mb-5">
                                    {project.client_name && (
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gray-500 shrink-0" />
                                            <span className="text-gray-300 truncate">{project.client_name}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-500 shrink-0" />
                                        <span className="text-gray-300">
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {project.calculated_results?.total_price && (
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                                            <span className="text-xs text-gray-500">Quote:</span>
                                            <span className="text-lg font-bold text-white">
                                                ${project.calculated_results.total_price.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="text-primary-500" size={20} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CreateProjectModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleCreateProject}
                loading={creating}
            />

            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Delete Project"
                message="This will permanently delete this project and all its data. This action cannot be undone."
                confirmText="Delete"
                danger
                loading={!!deletingId}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};
