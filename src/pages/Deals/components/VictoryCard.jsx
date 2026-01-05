import React, { useState } from "react";
import { getBrandColor, getBrandInitials, getHighestGain } from "../dealUtils";

const VictoryCard = ({ deal, isTransferred, isFullyCompleted, transferLoading, handleManualTransfer }) => {
    const [isTransferring, setIsTransferring] = useState(false);
    const highestGain = getHighestGain(deal);

    if (!isFullyCompleted) return null;

    const handleTransfer = async () => {
        if (isTransferred || isTransferring || !isFullyCompleted) return;
        setIsTransferring(true);
        await handleManualTransfer(deal);
        setIsTransferring(false);
    };

    return (
        <div className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="victory-card">
                <div style={{ fontSize: "4rem", textAlign: "center", marginBottom: "1rem" }}>🏆</div>
                <div className="text-center mb-4">
                    <h2 className="mb-1" style={{ fontSize: "1.25rem", fontWeight: "800", color: "#1e293b" }}>FÉLICITATIONS ! 🎉</h2>
                    <p className="text-muted small fw-600 mb-0">Objectifs atteints avec succès</p>
                </div>

                <div className="victory-card-gain">
                    <p className="text-muted small fw-bold text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>
                        {isTransferred ? "Gains Transférés" : "Montant à Récupérer"}
                    </p>
                    <div style={{ color: "#d97706", fontSize: "2.5rem", fontWeight: "900" }}>
                        {Number(highestGain).toFixed(1)} <span style={{ fontSize: '1rem' }}>DT</span>
                    </div>
                </div>

                <button
                    onClick={handleTransfer}
                    disabled={isTransferred || isTransferring || transferLoading}
                    className="victory-button"
                    style={{
                        backgroundColor: isTransferred ? "#22c55e" : "#fbbf24",
                        color: isTransferred ? "white" : "#78350f"
                    }}
                >
                    {isTransferring ? "🔄 Transfert..." : isTransferred ? "✅ Archivé" : `💰 Transférer vers Cagnotte`}
                </button>
            </div>
        </div>
    );
};

export default VictoryCard;
