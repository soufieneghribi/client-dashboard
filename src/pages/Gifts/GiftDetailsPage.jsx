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
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate("/cadeaux")}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 font-medium transition-colors"
                >
                    <FaArrowLeft /> Retour au catalogue
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="relative h-64 md:h-96 w-full">
                        <img
                            src={cadeau.image}
                            alt={cadeau.titre}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/800x600?text=Cadeau'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                            <span className="inline-block bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg mb-3 w-max">
                                {cadeau.categorie || 'Cadeau'}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{cadeau.titre}</h1>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-6">
                                <div className="bg-blue-50 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FaInfoCircle className="text-blue-600" />
                                        Description
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed text-lg">
                                        {cadeau.description || "Aucune description disponible pour ce cadeau."}
                                    </p>
                                </div>

                                {cadeau.conditions && (
                                    <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                                        <h4 className="font-bold text-red-700 mb-2">Conditions d'utilisation</h4>
                                        <p className="text-red-600 text-sm">{cadeau.conditions}</p>
                                    </div>
                                )}
                            </div>

                            <div className="md:w-80 space-y-6">
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <h3 className="text-gray-500 font-medium mb-4 uppercase text-sm tracking-wider">Détails de l'offre</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                                            <span className="text-gray-600 flex items-center gap-2"><FaCoins className="text-yellow-500" /> Prix</span>
                                            <span className="font-bold text-xl text-blue-600">{parseFloat(cadeau.prix_cagnotte).toFixed(2)} DT</span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                                            <span className="text-gray-600 flex items-center gap-2"><MdLocalOffer className="text-purple-500" /> Partenaire</span>
                                            <span className="font-semibold text-gray-800">{cadeau.partenaire || 'TN360'}</span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                                            <span className="text-gray-600 flex items-center gap-2"><FaBox className="text-orange-500" /> Stock</span>
                                            <span className="font-semibold text-gray-800">{cadeau.quantite_disponible} unités</span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                                            <span className="text-gray-600 flex items-center gap-2"><FaCalendarAlt className="text-blue-500" /> Validité</span>
                                            <span className="font-semibold text-gray-800 text-sm">
                                                {new Date(cadeau.date_fin_validite).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={() => navigate("/cadeaux")}
                                            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg text-center block"
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
