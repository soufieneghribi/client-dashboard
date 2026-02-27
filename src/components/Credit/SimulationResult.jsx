import React from 'react';
import { useCredit } from '../../hooks/useCredit';

const SimulationResult = ({ simulation }) => {
    const { formatCurrency, formatPercentage } = useCredit();

    if (!simulation || !simulation.can_finance) {
        return null;
    }

    const { details } = simulation;

    return (
        <div className="bg-white rounded-xl border border-blue-100 p-4 sm:p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                    <span className="text-xl">✅</span>
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-800">Résultat de la simulation</h2>
                    <p className="text-[11px] text-blue-600 font-medium">Financement possible</p>
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Mensualité */}
                <div className="bg-blue-600 rounded-xl p-4 shadow-sm text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <p className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">Mensualité</p>
                    </div>
                    <p className="text-2xl font-black text-white">
                        {formatCurrency(details.mensualite)}
                    </p>
                </div>

                {/* Montant Financé */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 text-center">Montant Financé</p>
                    <p className="text-lg font-bold text-slate-800 text-center">
                        {formatCurrency(details.montant_finance)}
                    </p>
                </div>

                {/* Coût Total */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 text-center">Coût Total</p>
                    <p className="text-lg font-bold text-slate-800 text-center">
                        {formatCurrency(details.cout_total)}
                    </p>
                </div>

                {/* Taux d'Intérêt */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 text-center">Taux d'Intérêt</p>
                    <p className="text-lg font-bold text-slate-800 text-center">
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
