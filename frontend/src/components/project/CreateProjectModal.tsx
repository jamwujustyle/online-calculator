import React, { useState } from 'react';
import { X, Plus, User, Phone, FileText } from 'lucide-react';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; client_name?: string; contact?: string; notes?: string }) => void;
    loading: boolean;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSubmit, loading }) => {
    const [title, setTitle] = useState('');
    const [clientName, setClientName] = useState('');
    const [contact, setContact] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title: title.trim() || 'Untitled Project',
            client_name: clientName.trim() || undefined,
            contact: contact.trim() || undefined,
            notes: notes.trim() || undefined,
        });
        setTitle('');
        setClientName('');
        setContact('');
        setNotes('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-lg glass-panel rounded-2xl shadow-2xl shadow-primary-500/10 animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-500/10 text-primary-500 rounded-xl">
                            <Plus size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">New Project</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Title — Required */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300 ml-1">Project Title *</label>
                        <input
                            type="text"
                            required
                            autoFocus
                            placeholder="e.g. Dragon Figurine Batch"
                            className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Client Name & Contact — side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-300 ml-1 flex items-center gap-1.5">
                                <User size={14} className="text-gray-400" /> Client Name
                            </label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                value={clientName}
                                onChange={e => setClientName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-300 ml-1 flex items-center gap-1.5">
                                <Phone size={14} className="text-gray-400" /> Contact
                            </label>
                            <input
                                type="text"
                                placeholder="Email or phone"
                                className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                value={contact}
                                onChange={e => setContact(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300 ml-1 flex items-center gap-1.5">
                            <FileText size={14} className="text-gray-400" /> Notes
                        </label>
                        <textarea
                            placeholder="Any requirements, deadlines, special instructions…"
                            rows={3}
                            className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-dark-800 hover:bg-dark-700 border border-white/10 text-gray-300 font-medium py-3 rounded-xl transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <><Plus size={18} /> Create Project</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
