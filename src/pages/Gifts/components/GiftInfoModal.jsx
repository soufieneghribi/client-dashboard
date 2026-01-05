import React from 'react';
import { FaTimes, FaCoins, FaCalendarAlt, FaBox, FaInfoCircle } from 'react-icons/fa';
import { MdLocalOffer } from 'react-icons/md';

const GiftInfoModal = ({ show, onClose, cadeau }) => {
    if (!show || !cadeau) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header Image */}
                <div className="relative h-56 w-full">
                    <img
                        src={cadeau.image}
                        alt={cadeau.titre}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Cadeau'; }}
                    />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                    <div className="absolute bottom-4 left-4">
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                            {cadeau.categorie || 'Cadeau'}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                            {cadeau.titre}
                        </h2>
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl text-blue-700">
                            <FaCoins className="text-yellow-500" />
                            <span className="font-bold whitespace-nowrap">{parseFloat(cadeau.prix_cagnotte).toFixed(2)} DT</span>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="bg-blue-100 p-2 rounded-lg mt-1">
                                <FaInfoCircle className="text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-700 mb-1">Description</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {cadeau.description || "Aucune description disponible pour ce cadeau."}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4 text-sm font-medium">
                            <div className="flex items-center gap-2 text-gray-600 bg-purple-50 p-3 rounded-xl border border-purple-100">
                                <MdLocalOffer className="text-purple-500" size={18} />
                                <div className="truncate">
                                    <span className="text-[10px] block opacity-70">Fournisseur</span>
                                    {cadeau.partenaire || 'Partenaire TN360'}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 bg-orange-50 p-3 rounded-xl border border-orange-100">
                                <FaBox className="text-orange-500" size={18} />
                                <div>
                                    <span className="text-[10px] block opacity-70">Stock</span>
                                    {cadeau.quantite_disponible} unités
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-500 px-1 py-2 border-t border-gray-100 mt-4">
                            <FaCalendarAlt className="text-blue-500" />
                            <span>Offre valable jusqu'au {new Date(cadeau.date_fin_validite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>

                        {cadeau.conditions && (
                            <div className="mt-4 p-3 bg-red-50 rounded-lg text-xs text-red-600 border border-red-100">
                                <span className="font-bold block mb-1">⚠️ Conditions d'utilisation :</span>
                                {cadeau.conditions}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg text-lg uppercase tracking-wider"
                    >
                        Compris
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GiftInfoModal;
