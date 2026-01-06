import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Spinner } from "react-bootstrap";
import { FiChevronLeft, FiMenu, FiClock } from "react-icons/fi";
import { FaStar, FaWallet, FaShoppingBag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import {
    fetchClientDeals,
    transferDealToCagnotte,
    isDealFullyCompleted,
} from "../../store/slices/deals";
import { fetchUserProfile } from "../../store/slices/user";

import DealsSummary from "./components/DealsSummary";
import VictoryCard from "./components/VictoryCard";
import DealCard from "./components/DealCard";
import CongratsModal from "./components/CongratsModal";
import { getHighestGain } from "./dealUtils";
import "./Deals.css";

const Deals = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoggedIn } = useSelector((state) => state.auth);
    const { Userprofile } = useSelector((state) => state.user);
    const {
        depense = [],
        marque = [],
        frequence = [],
        anniversaire = [],
        loading,
        transferLoading,
        transferredDeals = [],
        totalEarned,
        totalPending,
    } = useSelector((state) => state.deals);

    const [showCongrats, setShowCongrats] = useState(false);
    const [congratsData, setCongratsData] = useState(null);
    const [localTransferredDeals, setLocalTransferredDeals] = useState([]);

    const allDeals = [
        ...depense.map((d) => ({ ...d, type: "depense" })),
        ...marque.map((d) => ({ ...d, type: "marque" })),
    ];

    useEffect(() => {
        setLocalTransferredDeals(transferredDeals);
    }, [transferredDeals]);

    useEffect(() => {
        if (isLoggedIn && !Userprofile) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch, isLoggedIn, Userprofile]);

    useEffect(() => {
        if (Userprofile?.ID_client) {
            dispatch(fetchClientDeals(Userprofile.ID_client));
        }
    }, [dispatch, Userprofile?.ID_client]);


    const isDealTransferred = (deal) => {
        const dealKey = `${deal.type}_${deal.ID}`;
        return localTransferredDeals.includes(dealKey);
    };

    const handleManualTransfer = async (deal) => {
        if (!isDealFullyCompleted(deal)) return;
        if (isDealTransferred(deal)) return;
        const highestGain = getHighestGain(deal);
        if (highestGain <= 0) return;
        try {
            setLocalTransferredDeals((prev) => [...prev, `${deal.type}_${deal.ID}`]);
            await dispatch(
                transferDealToCagnotte({
                    dealType: deal.type,
                    dealId: deal.ID,
                    amount: highestGain,
                })
            ).unwrap();
            setCongratsData({ amount: highestGain, type: deal.type });
            setShowCongrats(true);
        } catch (error) {
            setLocalTransferredDeals((prev) =>
                prev.filter((id) => id !== `${deal.type}_${deal.ID}`)
            );
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="deals-container d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div style={{ fontSize: "60px", marginBottom: "16px" }}>🎁</div>
                    <h2 style={{ color: "#1A202C", fontSize: "20px", marginBottom: "8px" }}>Connectez-vous</h2>
                    <p style={{ color: "#718096", fontSize: "14px" }}>pour voir vos offres fidélité</p>
                </div>
            </div>
        );
    }

    return (
        <div className="deals-page-mobile">
            {/* Dark Header matching mobile */}
            <div className="mobile-header">
                <button className="header-btn" onClick={() => navigate(-1)}>
                    <FiChevronLeft size={24} />
                </button>
                <div className="header-title">
                    <h1>Offres Fidélité</h1>
                    <p>{allDeals.length} offres disponibles</p>
                </div>
                <button className="header-btn">
                    <FiMenu size={24} />
                </button>
            </div>

            <div className="deals-content-scrollable">
                <Container fluid className="px-4">
                    {/* Summary Cards Section */}
                    <div className="deals-header-summary-grid">
                        <div className="summary-card gains">
                            <div className="card-icon"><FaStar /></div>
                            <div className="card-info">
                                <span className="label">Total Gagné</span>
                                <h3 className="value">{parseFloat(totalEarned || 0).toFixed(2)} <span>DT</span></h3>
                            </div>
                        </div>
                        <div className="summary-card balance">
                            <div className="card-icon"><FaWallet /></div>
                            <div className="card-info">
                                <span className="label">Solde Cagnotte</span>
                                <h3 className="value">{parseFloat(Userprofile?.cagnotte_balance || 0).toFixed(2)} <span>DT</span></h3>
                            </div>
                        </div>
                    </div>


                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">Chargement des offres...</p>
                        </div>
                    ) : allDeals.length > 0 ? (
                        <div className="deals-list">
                            {allDeals.map((deal, index) => {
                                const isFullyCompletedFlag = isDealFullyCompleted(deal);
                                return isFullyCompletedFlag ? (
                                    <VictoryCard
                                        key={`${deal.type}_${deal.ID || index}`}
                                        deal={deal}
                                        isTransferred={isDealTransferred(deal)}
                                        isFullyCompleted={isFullyCompletedFlag}
                                        transferLoading={transferLoading}
                                        handleManualTransfer={handleManualTransfer}
                                    />
                                ) : (
                                    <DealCard
                                        key={`${deal.type}_${deal.ID || index}`}
                                        deal={deal}
                                        isFullyCompleted={isFullyCompletedFlag}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <div style={{ fontSize: "60px", marginBottom: "16px" }}>🎁</div>
                            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#1A202C" }}>Aucune offre active</h2>
                            <p className="text-muted">Revenez bientôt pour de nouvelles offres !</p>
                        </div>
                    )}
                </Container>
            </div>

            {showCongrats && (
                <CongratsModal
                    show={showCongrats}
                    onHide={() => setShowCongrats(false)}
                    congratsData={congratsData}
                />
            )}
        </div>
    );
};

export default Deals;



