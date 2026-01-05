import React from "react";
import { FaTimes, FaSpinner } from "react-icons/fa";

const ExchangeConfirmationModal = ({
    show,
    onClose,
    selectedCadeau,
    userCagnotte,
    exchangeLoading,
    echangerCadeau
}) => {
    if (!show || !selectedCadeau) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-3xl">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold">🎁 Confirmer l'échange</h2>
                        <button
                            onClick={onClose}
                            disabled={exchangeLoading}
                            className="text-white hover:bg-white hover:bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                        >
                            <FaTimes className="text-2xl" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="text-center mb-6">
                        <img
                            src={selectedCadeau.image}
                            alt={selectedCadeau.titre}
                            className="w-40 h-40 object-cover rounded-2xl mx-auto shadow-lg"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=Cadeau'; }}
                        />
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 text-center mb-3">{selectedCadeau.titre}</h3>
                    {selectedCadeau.description && <p className="text-sm text-gray-600 text-center mb-6">{selectedCadeau.description}</p>}

                    <div className="bg-gray-50 rounded-xl p-5 mb-6">
                        <div className="flex justify-between mb-3">
                            <span className="text-gray-600">Votre cagnotte :</span>
                            <span className="font-bold text-gray-800">{userCagnotte.toFixed(2)} DT</span>
                        </div>
                        <div className="flex justify-between mb-3">
                            <span className="text-gray-600">Coût du cadeau :</span>
                            <span className="font-bold text-red-600">-{parseFloat(selectedCadeau.prix_cagnotte).toFixed(2)} DT</span>
                        </div>
                        <div className="border-t-2 border-gray-200 my-3"></div>
                        <div className="flex justify-between">
                            <span className="font-bold text-gray-800">Nouveau solde :</span>
                            <span className="font-bold text-green-600 text-lg">{(userCagnotte - parseFloat(selectedCadeau.prix_cagnotte)).toFixed(2)} DT</span>
                        </div>
                    </div>

                    {selectedCadeau.conditions && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-blue-800"><strong>📋 Conditions :</strong> {selectedCadeau.conditions}</p>
                        </div>
                    )}

                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                        <p className="text-sm text-yellow-800"><strong>⚠️ Information :</strong> Cette action est irréversible. Le montant sera déduit de votre cagnotte immédiatement.</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={exchangeLoading}
                            className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={echangerCadeau}
                            disabled={exchangeLoading}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {exchangeLoading ? <><FaSpinner className="animate-spin" /> Échange...</> : <>🎁 Confirmer</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExchangeConfirmationModal;
