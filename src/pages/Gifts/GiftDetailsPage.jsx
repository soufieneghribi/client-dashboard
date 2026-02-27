import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaArrowLeft, FaCoins, FaCalendarAlt, FaBox, FaInfoCircle } from "react-icons/fa";
import { MdLocalOffer } from "react-icons/md";
import { API_ENDPOINTS, getAuthHeaders } from "../../services/api";

const GiftDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cadeau, setCadeau] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch gift details using the ID
    useEffect(() => {
        const fetchGiftDetails = async () => {
            const token = localStorage.getItem("token");
            try {
                // Since there might not be a direct single-gift endpoint, we fetch all and find (or use a specific one if available)
                // Assuming we can use the same endpoint or filtering. 
                // For optimal performance, a specific endpoint like `/api/v1/cadeaux/${id}` is preferred.
                // Fallback: fetch all and filter client-side if API doesn't support by ID (common in smaller apps)

                const response = await fetch(
                    API_ENDPOINTS.CADEAUX?.ALL || `${API_ENDPOINTS.BASE_URL}/api/v1/cadeaux`,
                    {
                        method: 'GET',
                        headers: token ? getAuthHeaders(token) : {}
                    }
                );

                if (!response.ok) throw new Error("Impossible de charger les détails du cadeau.");

                const result = await response.json();
                if (result.success) {
                    const foundCadeau = result.data.find(c => c.id.toString() === id);
                    if (foundCadeau) {
                        setCadeau(foundCadeau);
                    } else {
                        setError("Cadeau non trouvé.");
                    }
                } else {
                    setError("Erreur lors de la récupération des données.");
                }
            } catch (err) {
                console.error(err);
                setError("Une erreur est survenue.");
            } finally {
                setLoading(false);
            }
        };

        fetchGiftDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin text-4xl text-blue-600">⌛</div>
            </div>
        );
    }

    if (error || !cadeau) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || "Cadeau introuvable"}</h2>
                <button onClick={() => navigate("/cadeaux")} className="text-blue-600 hover:underline flex items-center gap-2">
                    <FaArrowLeft /> Retourner au catalogue
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate("/cadeaux")}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 text-sm font-medium transition-colors"
                >
                    <FaArrowLeft /> Retour au catalogue
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="relative h-48 md:h-64 w-full">
                        <img
                            src={cadeau.image}
                            alt={cadeau.titre}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/800x600?text=Cadeau'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                            <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg mb-2 w-max">
                                {cadeau.categorie || 'Cadeau'}
                            </span>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{cadeau.titre}</h1>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col gap-6">
                            <div className="flex-1 space-y-6">
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <FaInfoCircle className="text-blue-600" />
                                        Description
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed text-sm">
                                        {cadeau.description || "Aucune description disponible pour ce cadeau."}
                                    </p>
                                </div>

                                {cadeau.conditions && (
                                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                        <h4 className="font-bold text-red-700 mb-1 text-sm">Conditions d'utilisation</h4>
                                        <p className="text-red-600 text-xs">{cadeau.conditions}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <h3 className="text-gray-500 font-medium mb-3 uppercase text-[10px] tracking-wider">Détails de l'offre</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg shadow-sm">
                                            <span className="text-gray-600 text-xs flex items-center gap-2"><FaCoins className="text-yellow-500" /> Prix</span>
                                            <span className="font-bold text-base text-blue-600">{parseFloat(cadeau.prix_cagnotte).toFixed(2)} DT</span>
                                        </div>

                                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg shadow-sm">
                                            <span className="text-gray-600 text-xs flex items-center gap-2"><MdLocalOffer className="text-purple-500" /> Partenaire</span>
                                            <span className="font-semibold text-gray-800 text-xs">{cadeau.partenaire || 'TN360'}</span>
                                        </div>

                                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg shadow-sm">
                                            <span className="text-gray-600 text-xs flex items-center gap-2"><FaBox className="text-orange-500" /> Stock</span>
                                            <span className="font-semibold text-gray-800 text-xs">{cadeau.quantite_disponible} unités</span>
                                        </div>

                                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg shadow-sm">
                                            <span className="text-gray-600 text-xs flex items-center gap-2"><FaCalendarAlt className="text-blue-500" /> Validité</span>
                                            <span className="font-semibold text-gray-800 text-xs">
                                                {new Date(cadeau.date_fin_validite).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => navigate("/cadeaux")}
                                            className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-bold hover:bg-black transition-all shadow-md text-center block text-sm"
                                        >
                                            Retour au catalogue
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GiftDetailsPage;
