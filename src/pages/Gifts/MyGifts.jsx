import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { FaSpinner, FaTimesCircle, FaClock, FaCheckCircle } from "react-icons/fa";

import { API_ENDPOINTS, getAuthHeaders, handleApiError } from "../../services/api";
import { fetchUserProfile } from "../../store/slices/user";
import { isExpired, formatDate, getQRCodeUrl, downloadQRCode } from "./giftUtils";

import GiftsHeader from "./components/GiftsHeader";
import GiftsStats from "./components/GiftsStats";
import GiftsFilterTabs from "./components/GiftsFilterTabs";
import GiftCard from "./components/GiftCard";
import GiftDetailModal from "./components/GiftDetailModal";

const Gifts = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { Userprofile, loading: userLoading } = useSelector((state) => state.user);
    const { isLoggedIn } = useSelector((state) => state.auth);

    const [acquisitions, setAcquisitions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState("all");
    const [selectedAcquisition, setSelectedAcquisition] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch, isLoggedIn]);

    useEffect(() => {
        fetchAcquisitions();
    }, [selectedTab]);

    const fetchAcquisitions = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            // 
            navigate("/login");
            return;
        }

        setLoading(true);
        try {
            let url = API_ENDPOINTS.CADEAUX.MY_ACQUISITIONS;
            if (selectedTab !== "all") url += `?statut=${selectedTab}`;

            const response = await fetch(url, {
                method: "GET",
                headers: getAuthHeaders(token)
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();

            if (result.success) setAcquisitions(result.data || []);
            else setAcquisitions([]);
        } catch (error) {

            // );
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            // 
        }).catch(() => {
            // 
        });
    };

    const openDetailModal = (acquisition) => {
        setSelectedAcquisition(acquisition);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setSelectedAcquisition(null);
        setShowDetailModal(false);
    };

    const getStatusBadge = (acquisition) => {
        if (acquisition.statut === "used") return <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-bold"><FaTimesCircle />Utilisé</span>;
        if (isExpired(acquisition.date_expiration)) return <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold"><FaClock />Expiré</span>;
        return <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold"><FaCheckCircle />Actif</span>;
    };

    const filteredAcquisitions = acquisitions.filter(acq => {
        if (selectedTab === "all") return true;
        if (selectedTab === "active") return acq.statut === "active" && !isExpired(acq.date_expiration);
        if (selectedTab === "used") return acq.statut === "used" || isExpired(acq.date_expiration);
        return true;
    });

    const counts = {
        all: acquisitions.length,
        active: acquisitions.filter(a => a.statut === "active" && !isExpired(a.date_expiration)).length,
        used: acquisitions.filter(a => a.statut === "used" || isExpired(a.date_expiration)).length,
        expired: acquisitions.filter(a => isExpired(a.date_expiration)).length
    };

    if (loading || userLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
                    <p className="text-xl text-gray-600">Chargement de vos cadeaux...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <GiftsHeader userCagnotte={parseFloat(Userprofile?.cagnotte_balance || 0)} />

            <div className="container mx-auto px-4 py-6">
                <GiftsStats
                    total={counts.all}
                    active={counts.active}
                    used={acquisitions.filter(a => a.statut === "used").length}
                    expired={counts.expired}
                />

                <GiftsFilterTabs
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                    counts={counts}
                />

                <div className="max-w-6xl mx-auto">
                    {filteredAcquisitions.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                            <div className="text-8xl mb-6">📦</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Aucun cadeau dans cette catégorie</h2>
                            <p className="text-gray-600 mb-6">
                                {selectedTab === "all" ? "Vous n'avez pas encore acquis de cadeaux." : selectedTab === "active" ? "Aucun cadeau actif pour le moment." : "Aucun cadeau utilisé ou expiré."}
                            </p>
                            <button
                                onClick={() => navigate("/cadeaux")}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                            >
                                Découvrir les cadeaux
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAcquisitions.map((acquisition) => (
                                <GiftCard
                                    key={acquisition.id}
                                    acquisition={acquisition}
                                    isExpired={isExpired}
                                    getStatusBadge={getStatusBadge}
                                    copyToClipboard={copyToClipboard}
                                    openDetailModal={openDetailModal}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showDetailModal && selectedAcquisition && (
                <GiftDetailModal
                    selectedAcquisition={selectedAcquisition}
                    onClose={closeDetailModal}
                    getStatusBadgeForModal={getStatusBadge}
                    getQRCodeUrl={getQRCodeUrl}
                    downloadQRCode={downloadQRCode}
                    copyToClipboard={copyToClipboard}
                    formatDate={formatDate}
                    isExpired={isExpired}
                />
            )}
        </div>
    );
};

export default Gifts;


