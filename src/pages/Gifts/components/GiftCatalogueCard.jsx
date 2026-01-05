import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCoins, FaCalendarAlt, FaBox, FaCheckCircle } from "react-icons/fa";
import { MdLocalOffer } from "react-icons/md";

const GiftCatalogueCard = ({ cadeau, peutAcheter, estDisponible, estExpire, openConfirmModal }) => {
    const navigate = useNavigate();

    const handleViewDetails = () => {
        navigate(`/cadeaux/${cadeau.id}`);
    };

    return (
        <div className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-300 ${estDisponible && !estExpire && peutAcheter
            ? 'hover:shadow-2xl hover:-translate-y-1 border-purple-200 hover:border-purple-300'
            : 'border-gray-200'
            } ${!(estDisponible && !estExpire) ? 'opacity-60' : ''}`}>
            <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 group cursor-pointer" onClick={handleViewDetails}>
                <img
                    src={cadeau.image}
                    alt={cadeau.titre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Cadeau'; }}
                />
                <div className="absolute top-2 right-2 space-y-2">
                    {!estDisponible && <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold block text-center">Épuisé</span>}
                    {estExpire && <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold block text-center">Expiré</span>}
                    {cadeau.categorie && <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold block text-center">{cadeau.categorie}</span>}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-800 px-4 py-2 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                        Voir les détails
                    </span>
                </div>
                <div className="absolute bottom-2 left-2 bg-white rounded-lg px-4 py-2 shadow-lg">
                    <div className="flex items-center gap-2">
                        <FaCoins className="text-yellow-500" />
                        <span className="font-bold text-blue-600 text-lg">{parseFloat(cadeau.prix_cagnotte).toFixed(2)} DT</span>
                    </div>
                </div>
            </div>

            <div className="p-4 flex flex-col h-[calc(100%-12rem)]">
                <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1" title={cadeau.titre} onClick={handleViewDetails} style={{ cursor: 'pointer' }}>{cadeau.titre}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2 min-h-[2.5em] leading-relaxed">
                    {cadeau.description || "Aucune description disponible."}
                </p>

                {cadeau.partenaire && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                        <MdLocalOffer className="text-purple-500" />
                        <span className="truncate">Par {cadeau.partenaire}</span>
                    </div>
                )}

                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                    <FaCalendarAlt className="text-blue-500" />
                    <span>Fin: {new Date(cadeau.date_fin_validite).toLocaleDateString('fr-FR')}</span>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100 grid grid-cols-5 gap-2">
                    <button
                        onClick={handleViewDetails}
                        className="col-span-2 py-2.5 rounded-xl font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors text-xs border border-gray-200"
                    >
                        Détails
                    </button>
                    <button
                        onClick={() => openConfirmModal(cadeau)}
                        disabled={!peutAcheter || !estDisponible || estExpire}
                        className={`col-span-3 py-2.5 rounded-xl font-bold transition-all duration-300 text-xs flex items-center justify-center gap-1.5 ${peutAcheter && estDisponible && !estExpire
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            }`}
                    >
                        {!estDisponible ? 'Épuisé' : estExpire ? 'Expiré' : !peutAcheter ? 'Crédit Insuf.' : <><span className="text-sm">🎁</span> Échanger</>}
                    </button>
                </div>


            </div>
        </div>
    );
};

export default GiftCatalogueCard;
