import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Spinner } from "react-bootstrap";
import { FiChevronLeft, FiMenu } from "react-icons/fi";
import { FaStar, FaWallet } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { fetchUserProfile } from "../../store/slices/user";
import { useClientDeals } from "../../hooks/useClientDeals";
import { isDealFullyCompleted } from "./dealUtils";
import DealCard from "./components/DealCard";
import VictoryCard from "./components/VictoryCard";
import "./Deals.css";

const DealsV2 = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoggedIn } = useSelector((state) => state.auth);
    const { Userprofile } = useSelector((state) => state.user);

    // Load user profile if not already loaded
    useEffect(() => {
        if (isLoggedIn && !Userprofile) {
            console.log('� Loading user profile...');
            dispatch(fetchUserProfile());
        }
    }, [isLoggedIn, Userprofile, dispatch]);

    console.log('�🔐 DealsV2 - Auth State:', { isLoggedIn, hasProfile: !!Userprofile, clientId: Userprofile?.ID_client });

    const { deals, loading, error, pendingRewards, transferDeal, refresh } = useClientDeals(Userprofile?.ID_client);

    console.log('📋 DealsV2 - Deals State:', {
        dealsObject: deals,
        loading,
        error,
        pendingRewards
    });

    const [transferring, setTransferring] = useState(null);

    // Flatten all deals for display
    const allDeals = [
        ...deals.spend || [],
        ...deals.brand || [],
        ...deals.frequency || [],
        ...deals.birthday || []
    ];

    const handleTransfer = async (deal) => {
        if (!deal.amount_earned || deal.amount_earned <= 0) {
            return;
        }

        setTransferring(deal.id);
        const result = await transferDeal(deal.id);
        setTransferring(null);

        if (result.success) {
            // Show success message or toast
            console.log('Transfer successful:', result.data);
        } else {
            // Show error message
            console.error('Transfer failed:', result.error);
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
                                <span className="label">Total à Gagner</span>
                                <h3 className="value">{parseFloat(pendingRewards || 0).toFixed(2)} <span>DT</span></h3>
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
                                // Check if deal is truly completed (not just has partial earnings)
                                const isCompleted = isDealFullyCompleted(deal);

                                return isCompleted ? (
                                    <VictoryCard
                                        key={deal.id || `deal-${index}`}
                                        deal={deal}
                                        isTransferred={false}
                                        isFullyCompleted={true}
                                        transferLoading={transferring === deal.id}
                                        handleManualTransfer={handleTransfer}
                                    />
                                ) : (
                                    <DealCard
                                        key={deal.id || `deal-${index}`}
                                        deal={deal}
                                        onTransfer={handleTransfer}
                                        isTransferring={transferring === deal.id}
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
        </div>
    );
};

export default DealsV2;
