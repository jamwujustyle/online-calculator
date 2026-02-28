import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { projectsApi } from '../projects/api';
import { Plus, Package, Calendar, LogOut, ChevronRight } from 'lucide-react';

export const Dashboard = () => {
    const { user, projects, setProjects, setCurrentProject, logout } = useStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

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

    const handleCreateProject = async () => {
        setCreating(true);
        try {
            const res = await projectsApi.createProject({
                title: `New Project ${projects.length + 1}`
            });
            setProjects([...projects, res.data]);
            handleOpenProject(res.data.id);
        } catch (err) {
            console.error(err);
            setCreating(false);
        }
    };

    const handleOpenProject = (id: string) => {
        setCurrentProject(id);
        navigate(`/project/${id}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-dark-900 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Package className="text-primary-500" />
                            My Projects
                        </h1>
                        <p className="text-gray-400 mt-2">Welcome back, {user?.email}</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleCreateProject}
                            disabled={creating}
                            className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
                        >
                            <Plus size={20} />
                            {creating ? 'Creating...' : 'New Project'}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-dark-800 hover:bg-gray-800 border border-gray-700 text-gray-300 px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="bg-dark-800 h-48 rounded-xl border border-gray-800 animate-pulse"></div>)}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20 bg-dark-800 border border-gray-800 rounded-2xl">
                        <Package size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-medium text-gray-300 mb-2">No projects yet</h3>
                        <p className="text-gray-500 mb-6">Create your first project to start calculating.</p>
                        <button
                            onClick={handleCreateProject}
                            className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-lg inline-flex items-center gap-2 font-medium transition-colors"
                        >
                            <Plus size={20} /> Start Calculating
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                            <div
                                key={project.id}
                                onClick={() => handleOpenProject(project.id)}
                                className="bg-dark-800 border border-gray-700 rounded-xl p-6 hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer transition-all group relative"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-semibold text-white group-hover:text-primary-400 transition-colors">
                                        {project.title}
                                    </h3>
                                    <div className={`px-2.5 py-1 rounded text-xs font-medium ${project.file_status === 'ready' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                        project.file_status === 'processing' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                            'bg-gray-800 text-gray-400 border border-gray-700'
                                        }`}>
                                        {project.file_status}
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-gray-400 mb-6">
                                    {project.client_name && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-16">Client:</span>
                                            <span className="text-gray-300">{project.client_name}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <span className="w-16">Created:</span>
                                        <span className="text-gray-300 flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {project.calculated_results?.total_price && (
                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700/50">
                                            <span className="w-16 font-medium text-gray-300">Quote:</span>
                                            <span className="text-lg font-bold text-white">
                                                ${project.calculated_results.total_price.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="text-primary-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
