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
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Vérification d'Éligibilité</h2>
                    <p className="text-gray-600">Vérifiez si vous pouvez obtenir ce crédit</p>
                </div>
            </div>

            {!eligibility ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Salaire Net */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Salaire Net Mensuel *
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="salaire_net"
                                value={formData.salaire_net}
                                onChange={handleChange}
                                step="0.01"
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.salaire_net ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="Ex: 1500"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                DT
                            </span>
                        </div>
                        {errors.salaire_net && (
                            <p className="text-red-500 text-sm mt-1">{errors.salaire_net}</p>
                        )}
                    </div>

                    {/* Charges */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Charges Mensuelles (optionnel)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="charges"
                                value={formData.charges}
                                onChange={handleChange}
                                step="0.01"
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.charges ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="Ex: 300"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
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
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 font-medium">Taux d'endettement estimé:</span>
                                <span className={`text-xl font-bold ${tauxEndettement > 33 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                    {formatPercentage(tauxEndettement)}
                                </span>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${tauxEndettement > 33 ? 'bg-red-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min(tauxEndettement, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-gray-600 text-sm mt-2">
                                {tauxEndettement > 33
                                    ? '⚠️ Votre taux d\'endettement dépasse 33%'
                                    : '✅ Votre taux d\'endettement est acceptable'}
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Vérification...
                            </div>
                        ) : (
                            'Vérifier mon Éligibilité'
                        )}
                    </button>
                </form>
            ) : (
                <div>
                    {eligibility.eligible ? (
                        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-4xl">✅</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-green-800">Félicitations !</h3>
                                    <p className="text-green-700">Vous êtes éligible pour ce crédit</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-green-800">
                                <p>📊 Taux d'endettement: <strong>{formatPercentage(eligibility.taux_endettement)}</strong></p>
                                <p>💰 Capacité de remboursement: <strong>Suffisante</strong></p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-4xl">❌</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-red-800">Non Éligible</h3>
                                    <p className="text-red-700">Vous n'êtes pas éligible pour ce crédit</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-red-800">
                                <p>📊 Taux d'endettement: <strong>{formatPercentage(eligibility.taux_endettement)}</strong></p>
                                <p className="text-sm">{eligibility.message || 'Votre taux d\'endettement dépasse la limite autorisée'}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EligibilityChecker;
