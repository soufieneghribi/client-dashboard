import React from "react";
import { Button, Spinner } from "react-bootstrap";
import { FiAlertCircle, FiCreditCard, FiCheckCircle, FiCopy, FiUser } from "react-icons/fi";

const LoyaltyCardSection = ({
    cardDeclaredLost,
    hasCard,
    loyaltyCard,
    userName,
    displayCode,
    cagnotteBalance,
    isGenerating,
    handleGenerateNewCard,
    copyToClipboard,
    setShowQRModal,
    setShowLostCardModal,
    handleGenerateCard
}) => {
    if (cardDeclaredLost) {
        return (
            <div className="loyalty-card-lost">
                <div className="loyalty-card-pattern"></div>
                <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                    <div style={{
                        width: "100px",
                        height: "100px",
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1.5rem",
                        backdropFilter: "blur(10px)"
                    }}>
                        <FiAlertCircle size={50} />
                    </div>
                    <h2 className="mb-3" style={{ fontSize: "1.75rem", fontWeight: "700" }}>
                        Carte Déclarée Perdue
                    </h2>
                    <p className="mb-4" style={{ fontSize: "1.1rem", opacity: 0.95, maxWidth: "500px", margin: "0 auto 2rem" }}>
                        Votre ancienne carte a été déclarée comme perdue.
                        Cliquez sur le bouton ci-dessous pour générer une nouvelle carte.
                    </p>
                    <Button
                        onClick={handleGenerateNewCard}
                        disabled={isGenerating}
                        className="loyalty-button loyalty-button-lost"
                    >
                        {isGenerating ? (
                            <>
                                <Spinner animation="border" size="sm" style={{ color: "#dc3545" }} />
                                <span style={{ color: "#dc3545", marginLeft: "0.5rem" }}>Génération en cours...</span>
                            </>
                        ) : (
                            <>
                                <FiCreditCard size={24} />
                                Générer ma nouvelle carte
                            </>
                        )}
                    </Button>
                    <p className="mt-3" style={{ fontSize: "0.875rem", opacity: 0.8 }}>
                        Une nouvelle carte sera créée et votre ancienne carte sera définitivement désactivée.
                    </p>
                </div>
            </div>
        );
    }

    if (hasCard) {
        return (
            <div className="loyalty-card-active">
                <div className="loyalty-card-pattern"></div>
                <div style={{ position: "relative", zIndex: 1 }}>
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <p className="mb-1" style={{ opacity: 0.9, fontSize: "0.875rem", fontWeight: "500" }}>
                                CARTE FIDÉLITÉ
                            </p>
                            <h2 className="mb-0" style={{ fontSize: "1.75rem", fontWeight: "700", letterSpacing: "-0.5px" }}>
                                TN360
                            </h2>
                        </div>
                        <div className="text-end">
                            <div className="loyalty-badge-active">
                                <FiCheckCircle size={16} />
                                <span>{loyaltyCard?.is_active ? "Active" : "Inactive"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="mb-2" style={{ opacity: 0.9, fontSize: "0.75rem", fontWeight: "600", letterSpacing: "1px" }}>
                            NUMÉRO DE CARTE
                        </p>
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                            <h3 className="mb-0" style={{ fontSize: "1.5rem", fontWeight: "700", fontFamily: "monospace", letterSpacing: "2px" }}>
                                {displayCode}
                            </h3>
                            <Button
                                onClick={() => copyToClipboard(loyaltyCard.code)}
                                style={{
                                    background: "rgba(255,255,255,0.2)",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "0.5rem",
                                    color: "white",
                                    backdropFilter: "blur(10px)",
                                    cursor: "pointer"
                                }}
                                title="Copier le code"
                            >
                                <FiCopy size={18} />
                            </Button>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
                        <div>
                            <p className="mb-1" style={{ opacity: 0.9, fontSize: "0.75rem", fontWeight: "600", letterSpacing: "1px" }}>
                                TITULAIRE
                            </p>
                            <p className="mb-0" style={{ fontSize: "1.125rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <FiUser size={16} />
                                {userName}
                            </p>
                        </div>
                        <div className="text-end">
                            <p className="mb-1" style={{ opacity: 0.9, fontSize: "0.75rem", fontWeight: "600", letterSpacing: "1px" }}>
                                SOLDE CAGNOTTE
                            </p>
                            <p className="mb-0" style={{ fontSize: "1.5rem", fontWeight: "700" }}>
                                {parseFloat(cagnotteBalance).toFixed(2)} DT
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 d-flex gap-2 flex-wrap">
                        <Button
                            onClick={() => setShowQRModal(true)}
                            className="loyalty-button loyalty-button-white"
                            style={{ flex: "1 1 auto" }}
                        >
                            Afficher QR Code
                        </Button>
                        <Button
                            onClick={() => setShowLostCardModal(true)}
                            className="loyalty-button loyalty-button-outline"
                            style={{ flex: "0 1 auto" }}
                        >
                            <FiAlertCircle size={18} />
                            Carte perdue
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-4 border-0 shadow-sm p-5 text-center">
            <div className="mb-4">
                <div style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)"
                }}>
                    <FiCreditCard size={50} color="white" />
                </div>
            </div>
            <h3 style={{ fontWeight: "700", marginBottom: "1rem", color: "#212529" }}>
                Vous n'avez pas encore de carte fidélité
            </h3>
            <p style={{ color: "#6c757d", marginBottom: "2rem" }}>
                Générez votre carte pour commencer à accumuler des points et profiter d'avantages exclusifs
            </p>
            <Button
                onClick={handleGenerateCard}
                disabled={isGenerating}
                className="loyalty-button loyalty-button-primary"
            >
                {isGenerating ? (
                    <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Génération...
                    </>
                ) : (
                    <>
                        <FiCreditCard size={20} />
                        Générer ma carte
                    </>
                )}
            </Button>
        </div>
    );
};

export default LoyaltyCardSection;
