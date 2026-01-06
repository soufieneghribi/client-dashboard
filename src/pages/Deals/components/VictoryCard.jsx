import React, { useState } from "react";
import { getHighestGain } from "../dealUtils";

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
        <div className="victory-card-mobile">
            <div className="victory-badge" style={{ backgroundColor: "#fbbf24" }}>
                Gagné
            </div>

            <div className="victory-trophy">🏆</div>

            <div className="victory-content">
                <h2>FÉLICITATIONS ! 🎉</h2>
                <p>Objectifs atteints avec succès</p>
            </div>

            <div className="victory-gain-section">
                <p className="gain-label">{isTransferred ? "Gains Transférés" : "Montant à Récupérer"}</p>
                <h3 className="gain-amount">
                    {Number(highestGain).toFixed(2)} <span>DT</span>
                </h3>
            </div>

            <button
                onClick={handleTransfer}
                disabled={isTransferred || isTransferring || transferLoading}
                className={`victory-action-btn ${isTransferred ? 'transferred' : ''}`}
            >
                {isTransferring ? "🔄 Transfert..." : isTransferred ? "✅ Archivé" : `💰 Transférer`}
            </button>
        </div>
    );
};

export default VictoryCard;
