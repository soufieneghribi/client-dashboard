import React from 'react';
import { useCredit } from '../../hooks/useCredit';

const SimulationResult = ({ simulation }) => {
    const { formatCurrency, formatPercentage } = useCredit();

    if (!simulation || !simulation.can_finance) {
        return null;
    }

    const { details } = simulation;

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 border-2 border-blue-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Résultat de la Simulation</h2>
                    <p className="text-gray-600">Votre crédit est finançable</p>
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Montant Financé */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">💰</span>
                        <p className="text-sm text-gray-600 font-medium">Montant Financé</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                        {formatCurrency(details.montant_finance)}
                    </p>
                </div>

                {/* Mensualité */}
                <div className="bg-white rounded-xl p-5 shadow-sm border-2 border-blue-300">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">📅</span>
                        <p className="text-sm text-gray-600 font-medium">Mensualité</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(details.mensualite)}
                    </p>
                </div>

                {/* Coût Total */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">💳</span>
                        <p className="text-sm text-gray-600 font-medium">Coût Total</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                        {formatCurrency(details.cout_total)}
                    </p>
                </div>

                {/* Taux d'Intérêt */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">📊</span>
                        <p className="text-sm text-gray-600 font-medium">Taux d'Intérêt</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                        {formatPercentage(details.taux_interet)}
                    </p>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                    <span className="text-xl">ℹ️</span>
                    <div>
                        <p className="text-sm text-blue-800 font-medium mb-1">
                            Informations importantes
                        </p>
                        <p className="text-sm text-blue-700">
                            Ces résultats sont indicatifs et peuvent varier selon votre profil.
                            Vérifiez votre éligibilité ci-dessous pour continuer.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimulationResult;
