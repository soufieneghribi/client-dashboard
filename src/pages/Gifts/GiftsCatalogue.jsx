import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { API_ENDPOINTS, getAuthHeaders, handleApiError } from "../../services/api";

import { fetchUserProfile } from "../../store/slices/user";

import GiftsHeader from "./components/GiftsHeader";
import GiftsStatsCatalogue from "./components/GiftsStatsCatalogue";
import GiftCatalogueCard from "./components/GiftCatalogueCard";
import ExchangeConfirmationModal from "./components/ExchangeConfirmationModal";

const GiftsCatalogue = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { Userprofile, loading: userLoading } = useSelector((state) => state.user);
    const { isLoggedIn } = useSelector((state) => state.auth);

    const [cadeaux, setCadeaux] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategorie, setSelectedCategorie] = useState("Tous");
    const [categories, setCategories] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedCadeau, setSelectedCadeau] = useState(null);
    const [exchangeLoading, setExchangeLoading] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch, isLoggedIn]);

    useEffect(() => {
        fetchCadeaux();
    }, [navigate]);

    const fetchCadeaux = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            // 
            navigate("/login");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                API_ENDPOINTS.CADEAUX?.ALL || `${API_ENDPOINTS.BASE_URL}/api/v1/cadeaux`,
                {
                    method: 'GET',
                    headers: getAuthHeaders(token)
                }
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();

            if (result.success) {
                const cadeauxData = result.data || [];
                setCadeaux(cadeauxData);
                const uniqueCategories = ["Tous", ...new Set(cadeauxData.map(c => c.categorie).filter(Boolean))];
                setCategories(uniqueCategories);
            } else {
                setCadeaux([]);
            }
        } catch (error) {

            // );
        } finally {
            setLoading(false);
        }
    };

    const canAfford = (prixCagnotte) => {
        const userCagnotte = parseFloat(Userprofile?.cagnotte_balance || 0);
        return userCagnotte >= parseFloat(prixCagnotte);
    };

    const openConfirmModal = (cadeau) => {
        if (!canAfford(cadeau.prix_cagnotte)) {
            // 
            return;
        }
        if (cadeau.quantite_disponible <= 0) {
            // 
            return;
        }
        if (new Date(cadeau.date_fin_validite) < new Date()) {
            // 
            return;
        }
        setSelectedCadeau(cadeau);
        setShowConfirmModal(true);
    };

    const closeModal = () => {
        setShowConfirmModal(false);
        setSelectedCadeau(null);
    };

    const echangerCadeau = async () => {
        if (!selectedCadeau) return;
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        setExchangeLoading(true);
        try {
            const response = await fetch(
                API_ENDPOINTS.CADEAUX.ACQUIRE(selectedCadeau.id),
                {
                    method: 'POST',
                    headers: getAuthHeaders(token),
                    body: JSON.stringify({})
                }
            );

            const result = await response.json();

            if (response.ok && result.success) {
                // 
                closeModal();
                await dispatch(fetchUserProfile({ force: true }));
                setCadeaux(prev => prev.map(c => c.id === selectedCadeau.id ? { ...c, quantite_disponible: Math.max(0, c.quantite_disponible - 1) } : c));
                setTimeout(() => navigate('/mes-cadeaux'), 2000);
            } else {
                // 
            }
        } catch (error) {

            // );
        } finally {
            setExchangeLoading(false);
        }
    };

    const userCagnotte = parseFloat(Userprofile?.cagnotte_balance || 0);
    const cadeauxFiltres = selectedCategorie === "Tous" ? cadeaux : cadeaux.filter(c => c.categorie === selectedCategorie);
    const availableCount = cadeaux.filter(c => c.quantite_disponible > 0 && new Date(c.date_fin_validite) >= new Date()).length;

    if (loading || userLoading) {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-4xl text-blue-600 mb-4">⌛</div>
                    <p className="text-gray-600">Chargement des cadeaux...</p>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <div className="text-6xl mb-4">🎁</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Connectez-vous pour accéder aux cadeaux</h2>
                    <button onClick={() => navigate("/login")} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold">Se connecter</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <GiftsHeader userCagnotte={userCagnotte} />

            <div className="container mx-auto px-4 py-6">
                <GiftsStatsCatalogue
                    total={cadeaux.length}
                    userCagnotte={userCagnotte}
                    availableCount={availableCount}
                />

                {categories.length > 1 && (
                    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-5 mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Catégories</h3>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategorie(cat)}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${selectedCategorie === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="max-w-6xl mx-auto">
                    {cadeauxFiltres.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                            <div className="text-6xl mb-6">🎁</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Aucun cadeau disponible</h2>
                            <button onClick={() => navigate('/catalogue')} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl">Retour</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {cadeauxFiltres.map((cadeau) => (
                                <GiftCatalogueCard
                                    key={cadeau.id}
                                    cadeau={cadeau}
                                    peutAcheter={canAfford(cadeau.prix_cagnotte)}
                                    estDisponible={cadeau.est_publie && cadeau.quantite_disponible > 0}
                                    estExpire={new Date(cadeau.date_fin_validite) < new Date()}
                                    openConfirmModal={openConfirmModal}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ExchangeConfirmationModal
                show={showConfirmModal}
                onClose={closeModal}
                selectedCadeau={selectedCadeau}
                userCagnotte={userCagnotte}
                exchangeLoading={exchangeLoading}
                echangerCadeau={echangerCadeau}
            />
        </div>
    );
};

export default GiftsCatalogue;


