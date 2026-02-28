import React from 'react';
import { Cpu } from 'lucide-react';
import { useI18n } from '../../lib/i18n';

interface ParametersPanelProps {
    params: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const ParametersPanel: React.FC<ParametersPanelProps> = ({ params, onChange }) => {
    const { t } = useI18n();
    return (
        <div className="w-full lg:w-80 lg:border-r border-b lg:border-b-0 border-gray-800 overflow-y-auto bg-dark-900/50 p-6 shrink-0 custom-scrollbar">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Cpu className="text-primary-500" size={20} /> {t('production_setup')}
            </h2>

            <div className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{t('material_tech')}</h3>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">{t('technology')}</label>
                        <select name="technology" value={params.technology} onChange={onChange} className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500 text-sm">
                            <option>FDM</option>
                            <option>SLA</option>
                            <option>SLS</option>
                            <option>Metal (DMLS)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('material')}</label>
                            <input type="text" name="material" value={params.material} onChange={onChange} className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('density')}</label>
                            <input type="number" step="0.01" name="density" value={params.density} onChange={onChange} className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500 text-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('price_kg')}</label>
                            <input type="number" step="0.5" name="pricePerKg" value={params.pricePerKg} onChange={onChange} className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('waste')}</label>
                            <input type="number" name="wastePercent" value={params.wastePercent} onChange={onChange} className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500 text-sm" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-800">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{t('print_settings')}</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('infill')}</label>
                            <input type="number" name="infill" value={params.infill} onChange={onChange} className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('supports')}</label>
                            <input type="number" name="supports" value={params.supports} onChange={onChange} className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500 text-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('print_time')}</label>
                            <input type="number" step="0.1" name="printTimeHours" value={params.printTimeHours} onChange={onChange} className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('post_proc')}</label>
                            <input type="number" step="0.1" name="postProcessHours" value={params.postProcessHours} onChange={onChange} className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500 text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">{t('model_prep')}</label>
                        <input type="number" step="1" name="modelPrepMins" value={params.modelPrepMins} onChange={onChange} className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500 text-sm" />
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-800">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{t('economics')}</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('markup')}</label>
                            <input type="number" name="markupPercent" value={params.markupPercent} onChange={onChange} className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('defect_risk')}</label>
                            <input type="number" name="defectRateRate" value={params.defectRateRate} onChange={onChange} className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500 text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('batch_qty')}</label>
                            <input type="number" name="quantity" value={params.quantity} onChange={onChange} className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('tax')}</label>
                            <input type="number" name="taxRatePercent" value={params.taxRatePercent} onChange={onChange} className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500 text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('amortization')}</label>
                            <input type="number" step="0.1" name="amortizationCostPerHour" value={params.amortizationCostPerHour} onChange={onChange} className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t('electricity')}</label>
                            <input type="number" step="0.1" name="electricityCostPerHour" value={params.electricityCostPerHour} onChange={onChange} className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500 text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">{t('currency')}</label>
                        <select name="currency" value={params.currency} onChange={onChange} className="w-full bg-dark-800 border border-gray-700 rounded-lg px-3 py-2 text-white outline-none focus:border-primary-500 text-sm">
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="RUB">RUB (₽)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>
                </div>

            </div>
        </div>
    );
};
