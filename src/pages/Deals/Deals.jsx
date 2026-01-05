import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Spinner } from "react-bootstrap";


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
        ...frequence.map((d) => ({ ...d, type: "frequence" })),
        ...anniversaire.map((d) => ({ ...d, type: "anniversaire" })),
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
        if (!isDealFullyCompleted(deal)) {
            // 
            return;
        }
        if (isDealTransferred(deal)) {
            // 
            return;
        }
        const highestGain = getHighestGain(deal);
        if (highestGain <= 0) {
            // 
            return;
        }
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
            // 
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
        <div className="deals-container">
            {/* Header */}
            <div className="deals-header">
                <div className="container">
                    <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                        <span style={{ fontSize: "2.5rem" }}>🎁</span>
                        <h1 className="mb-0">Mes Offres Fidélité</h1>
                    </div>
                    <p className="mb-0">
                        Vous avez {allDeals.length} {allDeals.length > 1 ? "offres exclusives" : "offre exclusive"} à découvrir
                    </p>
                </div>
            </div>

            <Container className="px-4">
                <DealsSummary
                    cagnotteBalance={Userprofile?.cagnotte_balance || 0}
                    totalEarned={totalEarned}
                    totalPending={totalPending}
                />

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Chargement des offres...</p>
                    </div>
                ) : allDeals.length > 0 ? (
                    <Row>
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
                    </Row>
                ) : (
                    <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                        <div style={{ fontSize: "60px", marginBottom: "16px" }}>🎁</div>
                        <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#1A202C" }}>Aucune offre active</h2>
                        <p className="text-muted">Revenez bientôt pour de nouvelles offres !</p>
                    </div>
                )}
            </Container>

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


