import React from 'react';
import { FaCar, FaHome, FaWallet, FaShoppingCart } from 'react-icons/fa';

const CreditTypeSelector = ({ selectedType, onTypeChange, types, loading }) => {
    const getTypeIcon = (type) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('auto') || lowerType.includes('voiture')) return FaCar;
        if (lowerType.includes('immobilier') || lowerType.includes('maison')) return FaHome;
        if (lowerType.includes('personnel')) return FaWallet;
        return FaShoppingCart;
    };

    const getTypeColor = (type) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('auto')) return 'from-blue-500 to-blue-600';
        if (lowerType.includes('immobilier')) return 'from-green-500 to-green-600';
        if (lowerType.includes('personnel')) return 'from-purple-500 to-purple-600';
        return 'from-orange-500 to-orange-600';
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (!types || types.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Aucun type de crédit disponible
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map((type) => {
                const Icon = getTypeIcon(type.type_credit);
                const isSelected = selectedType === type.type_credit;
                const colorClass = getTypeColor(type.type_credit);

                return (
                    <button
                        key={type.id}
                        type="button"
                        onClick={() => onTypeChange(type.type_credit)}
                        className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${isSelected
                                ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }`}
                    >
                        {/* Icon with gradient background */}
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${colorClass} mb-3`}>
                            <Icon className="text-2xl text-white" />
                        </div>

                        {/* Type name */}
                        <h3 className="font-bold text-gray-800 text-lg mb-1 capitalize">
                            {type.type_credit}
                        </h3>

                        {/* Limits */}
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>💰 {parseFloat(type.montant_min).toLocaleString()} - {parseFloat(type.montant_max).toLocaleString()} DT</p>
                            <p>📅 {type.duree_min} - {type.duree_max} mois</p>
                            <p>📊 Taux: {parseFloat(type.taux_interet).toFixed(2)}%</p>
                        </div>

                        {/* Selected indicator */}
                        {isSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default CreditTypeSelector;
