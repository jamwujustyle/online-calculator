import React from 'react';
import { Calculator, Box, Zap, CreditCard, Sparkles } from 'lucide-react';
import { Project } from '../../store';
import { useI18n } from '../../lib/i18n';

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$', EUR: '€', RUB: '₽', GBP: '£',
};

interface ResultsPanelProps {
    project: Project;
    results: any | null;
    params: any;
    generatingAi: boolean;
    onGenerateAi: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ project, results, params, generatingAi, onGenerateAi }) => {
    const sym = CURRENCY_SYMBOLS[params.currency] || '$';
    const { t } = useI18n();

    return (
        <div className="w-full lg:w-96 lg:border-l border-t lg:border-t-0 border-gray-800 bg-dark-900/50 flex flex-col shrink-0 min-h-[400px]">
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calculator className="text-primary-500" size={20} /> {t('cost_breakdown')}
                </h2>

                {results ? (
                    <>
                        {/* Cost Breakdown Cards */}
                        <div className="space-y-3">
                            <div className="bg-dark-800 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Box size={18} /></div>
                                    <div>
                                        <p className="text-xs text-gray-400">{t('material_cost')}</p>
                                        <p className="text-sm font-medium text-white">{results.weightGrams.toFixed(1)}g total</p>
                                    </div>
                                </div>
                                <span className="text-lg font-semibold text-white">{sym}{results.materialCost.toFixed(2)}</span>
                            </div>

                            <div className="bg-dark-800 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg"><Zap size={18} /></div>
                                    <div>
                                        <p className="text-xs text-gray-400">{t('operations_power')}</p>
                                        <p className="text-sm font-medium text-white">{params.printTimeHours} hrs</p>
                                    </div>
                                </div>
                                <span className="text-lg font-semibold text-white">{sym}{(results.printCost + results.powerCost).toFixed(2)}</span>
                            </div>

                            <div className="bg-dark-800 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/10 text-green-500 rounded-lg"><CreditCard size={18} /></div>
                                    <div>
                                        <p className="text-xs text-gray-400">{t('labor_prep')}</p>
                                        <p className="text-sm font-medium text-white">{params.postProcessHours}h post</p>
                                    </div>
                                </div>
                                <span className="text-lg font-semibold text-white">{sym}{results.laborCost.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Final Quote Box */}
                        <div className="bg-gradient-to-br from-primary-900/40 to-dark-800 p-5 rounded-xl border border-primary-500/30">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-sm text-primary-400 font-medium mb-1">{t('unit_selling')}</p>
                                    <h3 className="text-4xl font-bold text-white">{sym}{results.totalUnitPrice.toFixed(2)}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">{t('profit_unit')}</p>
                                    <p className="text-sm font-semibold text-green-400">{sym}{results.profitPerUnit.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="bg-dark-900 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
                                <span className="text-sm text-gray-400">{t('batch_total')} (x{params.quantity})</span>
                                <span className="text-lg font-bold text-white">{sym}{results.finalBatchPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* AI Section */}
                        <div className="pt-6 border-t border-gray-800">
                            <button
                                onClick={onGenerateAi}
                                disabled={generatingAi || project.file_status !== 'ready'}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                            >
                                <Sparkles size={18} />
                                {generatingAi ? t('generating') : t('generate_ai')}
                            </button>

                            {project.ai_description && (
                                <div className="mt-6 space-y-4">
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('tech_description')}</h4>
                                        <div className="bg-dark-800 p-3 rounded-lg border border-gray-700 text-sm text-gray-300 leading-relaxed">
                                            {project.ai_description}
                                        </div>
                                    </div>
                                    {project.ai_commercial_text && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('commercial_pitch')}</h4>
                                            <div className="bg-dark-800 p-3 rounded-lg border border-gray-700 text-sm text-gray-300 leading-relaxed">
                                                {project.ai_commercial_text}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 text-gray-500 border border-dashed border-gray-700 rounded-xl">
                        <Calculator size={48} className="mx-auto mb-4 opacity-50" />
                        <p>{t('upload_to_calc')}</p>
                    </div>
                )}

            </div>
        </div>
    );
};
