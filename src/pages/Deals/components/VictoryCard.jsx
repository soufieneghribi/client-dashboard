import React, { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { MdAccountBalanceWallet } from "react-icons/md";
import { IoArrowForward } from "react-icons/io5";
import { FaBirthdayCake, FaShoppingBag, FaWalking, FaGift } from "react-icons/fa";

const VictoryCard = ({ deal, isTransferred, isFullyCompleted, transferLoading, handleManualTransfer }) => {
    const [isTransferring, setIsTransferring] = useState(false);

    // V2: Use amount_earned from backend calculation
    const amountEarned = deal.amount_earned || 0;

    if (!isFullyCompleted || amountEarned <= 0) return null;

    const handleTransfer = async () => {
        if (isTransferred || isTransferring || !isFullyCompleted) return;
        setIsTransferring(true);
        await handleManualTransfer(deal);
        setIsTransferring(false);
    };

    // Get gradient colors and badge text based on deal type
    const getDealTypeConfig = () => {
        switch (deal.dealType) {
            case 'birthday':
                return {
                    gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #c084fc 100%)',
                    badge: 'ANNIVERSAIRE',
                    icon: <FaBirthdayCake size={24} />
                };
            case 'brand':
                return {
                    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
                    badge: 'MARQUE',
                    icon: <FaShoppingBag size={24} />
                };
            case 'frequency':
                return {
                    gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
                    badge: 'FRÉQUENCE',
                    icon: <FaWalking size={24} />
                };
            case 'spend':
                return {
                    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)',
                    badge: 'DÉPENSE',
                    icon: <FaGift size={24} />
                };
            default:
                return {
                    gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a5b4fc 100%)',
                    badge: 'DEAL',
                    icon: <FaGift size={24} />
                };
        }
    };

    const config = getDealTypeConfig();

    return (
        <div
            className="victory-card-gradient"
            style={{ background: config.gradient }}
        >
            {/* Header Section */}
            <div className="victory-card-header">
                {/* Brand Logo */}
                <div className="victory-brand-logo">
                    {deal.marque?.image_url || deal.image_url ? (
                        <img
                            src={deal.marque?.image_url || deal.image_url}
                            alt={deal.marque?.nom_marque || deal.marque_name}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div
                        className="victory-logo-fallback"
                        style={{ display: (deal.marque?.image_url || deal.image_url) ? 'none' : 'flex' }}
                    >
                        {config.icon}
                    </div>
                </div>

                {/* Badge and Brand Name */}
                <div className="victory-header-info">
                    <div className="victory-type-badge">{config.badge}</div>
                    {(deal.marque?.nom_marque || deal.marque_name) && (
                        <div className="victory-brand-name-text">
                            {deal.marque?.nom_marque || deal.marque_name}
                        </div>
                    )}
                </div>

                {/* Success Check Icon */}
                <div className="victory-check-icon">
                    <FiCheck size={24} strokeWidth={3} />
                </div>
            </div>

            {/* Content Section - Glassmorphic */}
            <div className="victory-content-glass">
                <div className="victory-celebration">🎉 Félicitations</div>
                <div className="victory-message">Mission accomplie avec succès</div>

                <div className="victory-earned-text">Et vous avez gagné</div>

                <div className="victory-amount-display">
                    <span className="victory-amount-number">{Math.floor(amountEarned)}</span>
                    <span className="victory-amount-unit">DT</span>
                </div>
            </div>

            {/* Transfer Button */}
            {!isTransferred && (
                <button
                    onClick={handleTransfer}
                    disabled={isTransferring || transferLoading}
                    className="victory-transfer-button"
                >
                    <MdAccountBalanceWallet size={20} />
                    <span>Transférer vers cagnotte</span>
                    <IoArrowForward size={20} />
                </button>
            )}

            {isTransferred && (
                <div className="victory-transferred-badge">
                    <FiCheck size={16} />
                    <span>Transféré avec succès</span>
                </div>
            )}
        </div>
    );
};

export default VictoryCard;
