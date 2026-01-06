import React, { useState, useEffect } from "react";
import { getBrandColor, getDealProgress } from "../dealUtils";
import { FiBarChart2, FiTag, FiCheckCircle, FiMessageSquare, FiClock } from "react-icons/fi";

const DealCard = ({ deal, isFullyCompleted }) => {
    const [imageError, setImageError] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const target = new Date(deal.date_fin).getTime();
            const diff = target - now;

            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((diff % (1000 * 60)) / 1000)
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [deal.date_fin]);

    const progress = getDealProgress(deal);

    const getHighestGain = (deal) => {
        let maxGain = 0;
        for (let i = 1; i <= 5; i++) {
            const val = parseFloat(deal[`gain_objectif_${i}`]);
            if (!isNaN(val) && val > maxGain) {
                maxGain = val;
            }
        }
        return maxGain;
    };

    const highestGain = getHighestGain(deal);
    const brandColor = getBrandColor(deal.marque_name);

    const getStepColor = (step) => {
        switch (step) {
            case 1: return "#facc15"; // Yellow
            case 2: return "#a3e635"; // Greenish
            case 3: return "#2dd4bf"; // Teal
            case 4: return "#818cf8"; // Indigo
            case 5: return "#f1f5f9"; // Light grey
            default: return "#e2e8f0";
        }
    };

    if (isFullyCompleted) return null;

    return (
        <div className="deal-card-mobile">
            {/* Local "Global Style" Timer Block */}
            <div className="local-countdown-section">
                <p className="local-countdown-label">TEMPS RESTANT</p>
                <div className="local-timer-grid">
                    <div className="local-timer-item">
                        <div className="local-timer-box">{(timeLeft.days || 0).toString().padStart(2, '0')}</div>
                        <span>JOURS</span>
                    </div>
                    <div className="local-timer-sep">:</div>
                    <div className="local-timer-item">
                        <div className="local-timer-box">{(timeLeft.hours || 0).toString().padStart(2, '0')}</div>
                        <span>HEURE</span>
                    </div>
                    <div className="local-timer-sep">:</div>
                    <div className="local-timer-item">
                        <div className="local-timer-box">{(timeLeft.minutes || 0).toString().padStart(2, '0')}</div>
                        <span>MIN</span>
                    </div>
                    <div className="local-timer-sep">:</div>
                    <div className="local-timer-item">
                        <div className="local-timer-box">{(timeLeft.seconds || 0).toString().padStart(2, '0')}</div>
                        <span>SEC</span>
                    </div>
                </div>
            </div>

            <div className="deal-card-header">
                <span className={`mobile-badge ${deal.type}`} style={{ backgroundColor: brandColor }}>
                    {deal.type === 'depense' ? 'Dépense' : 'Marque'}
                </span>
            </div>

            <div className="deal-icon-container">
                <div className="deal-icon-circle">
                    {deal.image_url || deal.marque_logo ? (
                        <img src={deal.image_url || deal.marque_logo} alt={deal.marque_name} onError={() => setImageError(true)} />
                    ) : (
                        deal.type === 'depense' ? <FiBarChart2 className="graph-icon" style={{ color: brandColor }} /> : <FiTag className="tag-icon" style={{ color: brandColor }} />
                    )}
                </div>
            </div>

            <div className="deal-gain-banner">
                <p>Gagné jusqu'à</p>
                <h3>{highestGain.toFixed(2)} <span>dt</span></h3>
                <p className="small">si vous atteignez l'objectif</p>
            </div>

            <div className="deal-title-section">
                <h2>Deal {deal.type === 'depense' ? 'Dépense' : `Marque ${deal.marque_name || ''}`}</h2>
                <p className="description-text">{deal.description || `Dépensez et gagnez jusqu'à ${highestGain} DT`}</p>
            </div>

            <div className="deal-meter-container">
                <div className="deal-meter-bar">
                    <div
                        className="deal-meter-fill"
                        style={{ width: `${Math.min(100, (progress.current / (parseFloat(deal.objectif_5) || 100)) * 100)}%` }}
                    ></div>
                </div>
            </div>

            <div className="deal-steps-grid">
                {[1, 2, 3, 4, 5].map((step) => {
                    const objVal = parseFloat(deal[`objectif_${step}`]);
                    const objGain = parseFloat(deal[`gain_objectif_${step}`]);
                    const isCompleted = progress.current >= objVal && objVal > 0;

                    if (!objVal || isNaN(objVal) || objVal === 0) return <div key={step} className="deal-step-box empty" />;

                    return (
                        <div
                            key={step}
                            className={`deal-step-box ${isCompleted ? 'completed' : ''}`}
                            style={{ backgroundColor: isCompleted ? getStepColor(step) : '#f8fafc' }}
                        >
                            <div className="step-label">
                                {step}{step === 1 ? 'ère' : 'ème'} {isCompleted && <FiCheckCircle className="step-check" />}
                            </div>
                            <div className="step-value">{objVal} DT</div>
                            <div className="step-gain">+{objGain} DT</div>
                        </div>
                    );
                })}
            </div>

            <div className="deal-card-footer-summary">
                <div className="purchase-stat-box">
                    <FiMessageSquare className="chat-icon" />
                    <span>Mes achats : {progress.current.toFixed(2)} DT</span>
                </div>
            </div>
        </div>
    );
};

export default DealCard;
