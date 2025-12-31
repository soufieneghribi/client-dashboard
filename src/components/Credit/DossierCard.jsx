import React from 'react';
import { useNavigate } from 'react-router-dom';

const DossierCard = ({ dossier }) => {
    const navigate = useNavigate();

    const getStatusConfig = (statut) => {
        const configs = {
            depose: {
                label: 'Déposé',
                color: 'bg-blue-100 text-blue-800 border-blue-300',
                icon: '📝'
            },
            en_cours: {
                label: 'En cours',
                color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                icon: '⏳'
            },
            valide: {
                label: 'Validé',
                color: 'bg-green-100 text-green-800 border-green-300',
                icon: '✅'
            },
            refuse: {
                label: 'Refusé',
                color: 'bg-red-100 text-red-800 border-red-300',
                icon: '❌'
            }
        };
        return configs[statut] || configs.depose;
    };

    const statusConfig = getStatusConfig(dossier.statut);

    return (
        <div
            onClick={() => navigate(`/credit/dossier/${dossier.id}`)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border-2 border-gray-100 hover:border-blue-300"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                        Dossier #{dossier.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {new Date(dossier.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </p>
                </div>
                <div className={`px-3 py-1 rounded-full border-2 font-semibold text-sm ${statusConfig.color}`}>
                    <span className="mr-1">{statusConfig.icon}</span>
                    {statusConfig.label}
                </div>
            </div>

            {/* Simulation Details */}
            {dossier.simulation && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-gray-600">Type de crédit</p>
                            <p className="font-bold text-gray-800 capitalize">
                                {dossier.simulation.type_credit}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600">Montant</p>
                            <p className="font-bold text-gray-800">
                                {parseFloat(dossier.simulation.montant_panier).toLocaleString()} DT
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600">Mensualité</p>
                            <p className="font-bold text-blue-600">
                                {parseFloat(dossier.simulation.mensualite).toLocaleString()} DT
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600">Durée</p>
                            <p className="font-bold text-gray-800">
                                {dossier.simulation.duree} mois
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Documents Status */}
            {dossier.documents && dossier.documents.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">📎 Documents:</span>
                    <span className="font-semibold text-gray-800">
                        {dossier.documents.length} fichier(s)
                    </span>
                </div>
            )}

            {/* View Details Link */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-blue-600 font-medium text-sm hover:text-blue-700">
                    Voir les détails →
                </p>
            </div>
        </div>
    );
};

export default DossierCard;
