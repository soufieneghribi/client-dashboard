import React, { useState, useEffect } from "react";
import { getBrandColor, getDealProgress } from "../dealUtils";
import { FiBarChart2, FiTag, FiCheckCircle, FiMessageSquare, FiClock } from "react-icons/fi";
import { FaGift, FaStar } from "react-icons/fa";
import { Spinner } from "react-bootstrap";
import frequencesImg from "../../../assets/images/frequencesImg.png";

const DealCard = ({ deal, onTransfer, isTransferring }) => {
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

    // V2 Progress Calculation
    const getProgress = () => {
        if (deal.dealType === 'frequency') {
            return {
                current: deal.compteur_frequence || 0,
                target: deal.objectif_frequence || 0
            };
        } else {
            // spend, brand, birthday
            return {
                current: deal.compteur_objectif || 0,
                target: deal.objectif_5 || deal.objectif_4 || deal.objectif_3 || deal.objectif_2 || deal.objectif_1 || 0
            };
        }
    };

    const progress = getProgress();
    const amountEarned = deal.amount_earned || 0;
    const isCompleted = amountEarned > 0;

    const getHighestGain = (deal) => {
        if (deal.dealType === 'frequency') {
            return deal.gain || 0;
        }
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
    const brandColor = getBrandColor(deal.marque?.nom_marque || deal.marque_name);

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

    const frequencyStepColors = [
        'linear-gradient(135deg, #facc15 0%, #eab308 100%)', // Yellow
        'linear-gradient(135deg, #a3e635 0%, #65a30d 100%)', // Lime
        'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', // Cyan
        '#f3f4f6',
        '#f3f4f6'
    ];


    // -------------------------------------------
    // FREQUENCY CARD DESIGN
    // -------------------------------------------
    if (deal.dealType === 'frequency') {
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
                    <span className="mobile-badge frequency" style={{ backgroundColor: "#8b5cf6" }}>
                        Fréquence
                    </span>
                </div>

                <div className="deal-icon-container">
                    <div className="deal-icon-circle">
                        <img
                            src={frequencesImg}
                            alt="Deal Fréquence"
                            style={{ filter: 'drop-shadow(0 4px 10px rgba(139, 92, 246, 0.3))' }}
                        />
                    </div>
                </div>

                <div className="deal-gain-banner">
                    <p>{isCompleted ? 'Gagné' : 'À Gagner'}</p>
                    <h3 style={{ color: "#ef4444" }}>
                        {isCompleted ? amountEarned.toFixed(2) : (deal.gain || 0).toFixed(2)} <span>dt</span>
                    </h3>
                    <p className="small">
                        {isCompleted ? 'Transférez vers votre cagnotte' : 'si vous atteignez l\'objectif'}
                    </p>
                </div>

                <div className="deal-title-section">
                    <h2>Deal Fréquence</h2>
                    <p className="description-text">
                        Commande régulièrement et gagnez jusqu'à {deal.gain || 0} DT
                    </p>
                </div>

                <div className="deal-meter-container">
                    <div className="deal-meter-bar">
                        <div
                            className="deal-meter-fill"
                            style={{
                                width: `${Math.min(100, (progress.current / progress.target) * 100)}%`,
                                background: 'linear-gradient(90deg, #8b5cf6, #d946ef)'
                            }}
                        ></div>
                    </div>
                </div>

                <div className="deal-steps-grid">
                    {[1, 2, 3, 4, 5].map((step, idx) => {
                        const isStepCompleted = progress.current >= step;
                        const bgStyle = frequencyStepColors[idx % frequencyStepColors.length];
                        const stepGain = ((deal.gain || 0) / 5).toFixed(1);

                        return (
                            <div
                                key={step}
                                className={`deal-step-box ${isStepCompleted ? 'completed' : ''}`}
                                style={{
                                    background: isStepCompleted ? bgStyle : '#f8fafc',
                                    color: isStepCompleted ? 'white' : '#94a3b8'
                                }}
                            >
                                <div className="step-label">
                                    {step}{step === 1 ? 'ère' : 'ème'} {isStepCompleted && <FiCheckCircle className="step-check" />}
                                </div>
                                <div className="step-value" style={{ fontSize: '10px' }}>{stepGain} DT</div>
                                <div className="step-gain">Objectif {step}</div>
                            </div>
                        );
                    })}
                </div>

                <div className="deal-card-footer-summary">
                    <div className="purchase-stat-box" style={{ background: '#f5f3ff', borderColor: '#ddd6fe', color: '#8b5cf6' }}>
                        <FaGift className="chat-icon" />
                        <span>Mes visites : {progress.current} / {progress.target}</span>
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------
    // DEFAULT / OTHER CARDS DESIGN
    // -------------------------------------------
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
                <span className={`mobile-badge ${deal.dealType}`} style={{ backgroundColor: brandColor }}>
                    {deal.dealType === 'spend' ? 'Dépense' :
                        deal.dealType === 'brand' ? 'Marque' : 'Anniversaire'}
                </span>
            </div>

            <div className="deal-icon-container">
                <div className="deal-icon-circle">
                    {deal.marque?.image_url || deal.image_url ? (
                        <img
                            src={deal.marque?.image_url || deal.image_url}
                            alt={deal.marque?.nom_marque || deal.marque_name}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        deal.dealType === 'spend' ? <FiBarChart2 className="graph-icon" style={{ color: brandColor }} /> :
                            deal.dealType === 'birthday' ? <FaGift className="tag-icon" style={{ color: brandColor }} /> :
                                <FiTag className="tag-icon" style={{ color: brandColor }} />
                    )}
                </div>
            </div>

            <div className="deal-gain-banner">
                <p>{isCompleted ? 'Gagné' : 'Gagné jusqu\'à'}</p>
                <h3>{isCompleted ? amountEarned.toFixed(2) : highestGain.toFixed(2)} <span>dt</span></h3>
                <p className="small">{isCompleted ? 'Transférez vers votre cagnotte' : 'si vous atteignez l\'objectif'}</p>
            </div>

            <div className="deal-title-section">
                <h2>
                    {deal.dealType === 'spend' ? 'Deal Dépense' :
                        deal.dealType === 'birthday' ? 'Deal Anniversaire' :
                            `Marque ${deal.marque?.nom_marque || deal.marque_name || ''}`}
                </h2>
                <p className="description-text">
                    {deal.description || (
                        deal.dealType === 'birthday' ? "C'est votre anniversaire ! Profitez de ce deal spécial." :
                            `Dépensez et gagnez jusqu'à ${highestGain} DT`
                    )}
                </p>
            </div>

            <div className="deal-meter-container">
                <div className="deal-meter-bar">
                    <div
                        className="deal-meter-fill"
                        style={{
                            width: `${Math.min(100, (progress.current / (parseFloat(deal.objectif_5) || 100)) * 100)}%`
                        }}
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
