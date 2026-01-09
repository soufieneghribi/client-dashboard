import React, { useState } from 'react';
import { useCredit } from '../../hooks/useCredit';

const EligibilityChecker = ({ simulation, onCheck, loading, eligibility }) => {
    const { calculateTauxEndettement, formatPercentage } = useCredit();
    const [formData, setFormData] = useState({
        salaire_net: '',
        charges: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.salaire_net || parseFloat(formData.salaire_net) <= 0) {
            newErrors.salaire_net = 'Veuillez saisir votre salaire net';
        }
        if (formData.charges && parseFloat(formData.charges) < 0) {
            newErrors.charges = 'Les charges ne peuvent pas être négatives';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onCheck({
                salaire_net: parseFloat(formData.salaire_net),
                charges: parseFloat(formData.charges) || 0,
                mensualite: simulation.details.mensualite
            });
        }
    };

    const tauxEndettement = formData.salaire_net
        ? calculateTauxEndettement(
            simulation.details.mensualite,
            parseFloat(formData.salaire_net),
            parseFloat(formData.charges) || 0
        )
        : 0;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                    <span className="text-xl">💼</span>
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-800">Vérification d'éligibilité</h2>
                    <p className="text-[11px] text-slate-500">Analysez votre capacité de remboursement</p>
                </div>
            </div>

            {!eligibility ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Salaire Net */}
                    <div>
                        <label className="block text-slate-700 font-bold mb-1.5 text-xs">
                            Salaire Net Mensuel *
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="salaire_net"
                                value={formData.salaire_net}
                                onChange={handleChange}
                                step="0.01"
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.salaire_net ? 'border-red-500' : 'border-slate-200'
                                    }`}
                                placeholder="Ex: 1500"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                DT
                            </span>
                        </div>
                        {errors.salaire_net && (
                            <p className="text-red-500 text-sm mt-1">{errors.salaire_net}</p>
                        )}
                    </div>

                    {/* Charges */}
                    <div>
                        <label className="block text-slate-700 font-bold mb-1.5 text-xs">
                            Charges Mensuelles (optionnel)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="charges"
                                value={formData.charges}
                                onChange={handleChange}
                                step="0.01"
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.charges ? 'border-red-500' : 'border-slate-200'
                                    }`}
                                placeholder="Ex: 300"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                DT
                            </span>
                        </div>
                        {errors.charges && (
                            <p className="text-red-500 text-sm mt-1">{errors.charges}</p>
                        )}
                        <p className="text-gray-500 text-sm mt-1">
                            Loyer, autres crédits, etc.
                        </p>
                    </div>

                    {/* Taux d'Endettement Preview */}
                    {formData.salaire_net && (
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Taux d'endettement</span>
                                <span className={`text-base font-black ${tauxEndettement > 33 ? 'text-red-600' : 'text-blue-600'
                                    }`}>
                                    {formatPercentage(tauxEndettement)}
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all ${tauxEndettement > 33 ? 'bg-red-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${Math.min(tauxEndettement, 100)}%` }}
                                ></div>
                            </div>
                            <p className={`text-[10px] font-bold mt-2 uppercase tracking-tight ${tauxEndettement > 33 ? 'text-red-500' : 'text-blue-600'}`}>
                                {tauxEndettement > 33
                                    ? '⚠️ Limite de 33% dépassée'
                                    : '✅ Capacité de remboursement correcte'}
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg font-bold text-sm transition-all duration-200 shadow-sm disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            color: 'white'
                        }}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Analyse...
                            </div>
                        ) : (
                            'Vérifier mon Éligibilité'
                        )}
                    </button>
                </form>
            ) : (
                <div>
                    {eligibility.eligible ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                                    <span className="text-xl">✅</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-blue-900 mb-0">Éligibilité confirmée</h3>
                                    <p className="text-[11px] text-blue-700">Votre profil est compatible avec ce crédit</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="bg-white/50 p-2 rounded border border-blue-100">
                                    <p className="text-[9px] text-blue-500 font-bold uppercase">Taux d'endettement</p>
                                    <p className="text-sm font-black text-blue-700">{formatPercentage(eligibility.taux_endettement)}</p>
                                </div>
                                <div className="bg-white/50 p-2 rounded border border-blue-100">
                                    <p className="text-[9px] text-blue-500 font-bold uppercase">Capacité</p>
                                    <p className="text-sm font-black text-blue-700">Suffisante</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center border border-red-200">
                                    <span className="text-xl">❌</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-red-900 mb-0">Non Éligible</h3>
                                    <p className="text-[11px] text-red-700">Désolé, votre profil n'est pas éligible</p>
                                </div>
                            </div>
                            <div className="bg-white/50 p-3 rounded border border-red-100 mt-2">
                                <p className="text-[10px] text-red-800 font-bold mb-1">Détails :</p>
                                <p className="text-[11px] text-red-700 leading-relaxed font-medium">
                                    {eligibility.message || 'Votre taux d\'endettement (' + formatPercentage(eligibility.taux_endettement) + ') dépasse la limite autorisée de 33%.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EligibilityChecker;
