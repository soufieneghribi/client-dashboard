import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { FiAlertCircle } from "react-icons/fi";


import {
    getLoyaltyCard,
    generateLoyaltyCard,
    reportLostCard,
    getLoyaltyCardHistory
} from "../../store/slices/loyaltyCardSlice";

import LoyaltyHeader from "./components/LoyaltyHeader";
import LoyaltyCardSection from "./components/LoyaltyCardSection";
import AdvantagesSection from "./components/AdvantagesSection";
import QRCodeModal from "./components/QRCodeModal";
import LostCardModal from "./components/LostCardModal";
import "./Loyalty.css";

const Loyalty = () => {
    const dispatch = useDispatch();
    const { loyaltyCard, loading, isGenerating, error } = useSelector((state) => state.loyaltyCard);
    const { Userprofile } = useSelector((state) => state.user);

    const [showLostCardModal, setShowLostCardModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [cardDeclaredLost, setCardDeclaredLost] = useState(false);
    const [lostReason, setLostReason] = useState("");
    const [shouldRefreshPage, setShouldRefreshPage] = useState(false);

    // Initial data fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    dispatch(getLoyaltyCard()).unwrap(),
                    dispatch(getLoyaltyCardHistory()).unwrap()
                ]);
            } catch (err) {

            }
        };
        fetchData();
    }, [dispatch]);

    // Refresh page after card generation
    useEffect(() => {
        if (shouldRefreshPage) {
            const timer = setTimeout(() => {
                window.location.reload();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [shouldRefreshPage]);

    const handleConfirmLostDeclaration = useCallback(() => {
        setCardDeclaredLost(true);
        setLostReason("Carte perdue");
        setShowLostCardModal(false);
        // 
    }, []);

    const handleGenerateNewCard = useCallback(async () => {
        try {
            await dispatch(reportLostCard(lostReason)).unwrap();
            setCardDeclaredLost(false);
            setLostReason("");
            await dispatch(getLoyaltyCardHistory()).unwrap();
            setShouldRefreshPage(true);
        } catch (err) {

        }
    }, [dispatch, lostReason]);

    const handleGenerateCard = useCallback(async () => {
        try {
            await dispatch(generateLoyaltyCard()).unwrap();
            await dispatch(getLoyaltyCardHistory()).unwrap();
        } catch (err) {

        }
    }, [dispatch]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                dispatch(getLoyaltyCard()).unwrap(),
                dispatch(getLoyaltyCardHistory()).unwrap()
            ]);
            // 
        } catch (err) {

            // 
        } finally {
            setIsRefreshing(false);
        }
    }, [dispatch]);

    const copyToClipboard = useCallback((text) => {
        navigator.clipboard.writeText(text).catch(() => { });
    }, []);

    const downloadQRCode = useCallback(() => {
        const svg = document.getElementById("loyalty-qr-code");
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");

            const downloadLink = document.createElement("a");
            downloadLink.download = `carte-fidelite-${loyaltyCard?.code}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();

            // 
        };

        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    }, [loyaltyCard]);

    const hasCard = loyaltyCard && loyaltyCard.code;
    const userName = loyaltyCard?.client_name || Userprofile?.nom_et_prenom || "Client";
    const cagnotteBalance = loyaltyCard?.balance || Userprofile?.cagnotte_balance || 0;
    const displayCode = loyaltyCard?.formatted_code || "";

    if (loading && !loyaltyCard) {
        return (
            <div className="loyalty-page-container d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-primary fw-bold">Chargement de votre carte...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="loyalty-page-container">
            <Container>
                {error && (
                    <Alert variant="danger" dismissible onClose={() => dispatch({ type: "loyaltyCard/clearError" })}>
                        <FiAlertCircle className="me-2" />
                        {error}
                    </Alert>
                )}

                <LoyaltyHeader
                    hasCard={hasCard}
                    cardDeclaredLost={cardDeclaredLost}
                    handleRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                    loading={loading}
                />

                <Row>
                    <Col lg={8} className="mx-auto">
                        <LoyaltyCardSection
                            cardDeclaredLost={cardDeclaredLost}
                            hasCard={hasCard}
                            loyaltyCard={loyaltyCard}
                            userName={userName}
                            displayCode={displayCode}
                            cagnotteBalance={cagnotteBalance}
                            isGenerating={isGenerating}
                            handleGenerateNewCard={handleGenerateNewCard}
                            copyToClipboard={copyToClipboard}
                            setShowQRModal={setShowQRModal}
                            setShowLostCardModal={setShowLostCardModal}
                            handleGenerateCard={handleGenerateCard}
                        />

                        {hasCard && !cardDeclaredLost && <AdvantagesSection />}
                    </Col>
                </Row>

                <QRCodeModal
                    show={showQRModal}
                    onHide={() => setShowQRModal(false)}
                    loyaltyCard={loyaltyCard}
                    displayCode={displayCode}
                    downloadQRCode={downloadQRCode}
                    copyToClipboard={copyToClipboard}
                />

                <LostCardModal
                    show={showLostCardModal}
                    onHide={() => setShowLostCardModal(false)}
                    handleConfirmLostDeclaration={handleConfirmLostDeclaration}
                />
            </Container>
        </div>
    );
};

export default Loyalty;


