import React, { useState } from "react";
import { getBrandColor, getBrandInitials, getDealProgress } from "../dealUtils";

const DealCard = ({ deal, isFullyCompleted }) => {
    const [imageError, setImageError] = useState(false);

    const getCurrentObjective = () => {
        if (deal.type === "frequence") {
            return {
                current: parseFloat(deal.compteur_frequence) || 0,
                target: parseFloat(deal.objectif_frequence) || 5,
                reward: parseFloat(deal.gain) || 5,
                objectives: null,
                maxReward: parseFloat(deal.gain) || 5,
            };
        }

        const objectives = [
            { value: parseFloat(deal.objectif_1) || 0, gain: parseFloat(deal.gain_objectif_1) || 0, level: 1 },
            { value: parseFloat(deal.objectif_2) || 0, gain: parseFloat(deal.gain_objectif_2) || 0, level: 2 },
            { value: parseFloat(deal.objectif_3) || 0, gain: parseFloat(deal.gain_objectif_3) || 0, level: 3 },
            { value: parseFloat(deal.objectif_4) || 0, gain: parseFloat(deal.gain_objectif_4) || 0, level: 4 },
            { value: parseFloat(deal.objectif_5) || 0, gain: parseFloat(deal.gain_objectif_5) || 0, level: 5 },
        ].filter((obj) => obj.value > 0);

        const progressData = getDealProgress(deal);
        const current = progressData.current;
        const activeObjective = objectives.find((o) => current < o.value) || objectives[objectives.length - 1];

        return {
            current,
            target: activeObjective?.value || 0,
            reward: activeObjective?.gain || 0,
            objectives,
            maxReward: objectives[objectives.length - 1]?.gain || 0,
        };
    };

    const objective = getCurrentObjective();
    const progress = objective.target > 0 ? Math.min((objective.current / objective.target) * 100, 100) : 0;

    const getBadgeName = () => {
        if (deal.type === "marque") return deal.marque_name || "Marque";
        if (deal.type === "depense") return "Dépense";
        if (deal.type === "frequence") return "Fréquence";
        if (deal.type === "anniversaire") return "Anniversaire";
        return deal.type;
    };

    if (isFullyCompleted) return null;

    const brandColor = deal.type === "marque" ? getBrandColor(deal.marque_name) : "#4F46E5";
    const progressData = getDealProgress(deal);

    return (
        <div className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="deal-card-wrapper">
                <div className="deal-card-inner">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <span className="deal-type-badge" style={{
                            backgroundColor: deal.type === "marque" ? `${brandColor}15` : "#6366f115",
                            color: deal.type === "marque" ? brandColor : "#6366f1"
                        }}>
                            {getBadgeName()}
                        </span>
                    </div>

                    <div className="d-flex align-items-center mb-4">
                        <div className="deal-card-logo" style={{
                            backgroundColor: deal.type === "marque" ? `${brandColor}10` : "#f1f5f9",
                            border: `1px solid ${deal.type === "marque" ? `${brandColor}20` : "#e2e8f0"}`
                        }}>
                            {deal.type === "marque" && deal.marque_name ? (
                                deal.marque_logo && !imageError ? (
                                    <img src={deal.marque_logo} alt={deal.marque_name} onError={() => setImageError(true)} style={{ width: "32px", height: "32px", objectFit: "contain" }} />
                                ) : (
                                    <span style={{ color: brandColor, fontWeight: 700 }}>{getBrandInitials(deal.marque_name)}</span>
                                )
                            ) : (
                                <span>{deal.type === "depense" ? "💰" : deal.type === "frequence" ? "🔄" : deal.type === "anniversaire" ? "🎂" : "🎁"}</span>
                            )}
                        </div>
                        <div className="ms-3">
                            <h3 className="deal-card-title">{deal.type === "marque" && deal.marque_name ? deal.marque_name : getBadgeName()}</h3>
                            <p className="mb-0 text-muted small fw-600">Offre Fidélité</p>
                        </div>
                    </div>

                    <p className="deal-card-desc">
                        {deal.type === "marque"
                            ? `Gagnez des récompenses en achetant des produits de la marque ${deal.marque_name}.`
                            : `Profitez de ce deal exclusif et boostez votre cagnotte !`}
                    </p>

                    {objective.objectives && objective.objectives.length > 0 && (
                        <div className="deal-objective-track mb-3">
                            {objective.objectives.map((obj, idx) => {
                                const isCompleted = objective.current >= obj.value;
                                return (
                                    <div key={idx} className={`deal-objective-step ${isCompleted ? 'completed' : ''}`}>
                                        <div className="small fw-600 opacity-75 mb-1" style={{ fontSize: '0.65rem' }}>{obj.level}ère</div>
                                        <div className="fw-bold mb-1" style={{ color: isCompleted ? "#db2777" : "#475569" }}>{obj.value} DT</div>
                                        <div className="small fw-600" style={{ color: isCompleted ? "#f472b6" : "#94a3b8" }}>+{obj.gain} DT</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="deal-progress-container">
                        <div className="deal-progress-label">
                            <span>Progression</span>
                            <span style={{ color: "#6366f1" }}>{Math.round(progress)}%</span>
                        </div>
                        <div className="deal-progress-bar">
                            <div className="deal-progress-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${brandColor}, ${brandColor}CC)` }} />
                        </div>
                        <div className="d-flex justify-content-between mt-2 font-mono" style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                            <span className="text-secondary">
                                {deal.type === "frequence" ? `${Math.floor(objective.current)} visite${Math.floor(objective.current) > 1 ? "s" : ""}` : `${Number(objective.current).toFixed(1)} DT`}
                            </span>
                            <span className="text-dark">
                                {deal.type === "frequence" ? `${objective.target} visite${objective.target > 1 ? "s" : ""}` : `${objective.target} DT`}
                            </span>
                        </div>
                    </div>

                    <div className="deal-reward-box">
                        <div className="d-flex align-items-center justify-content-center" style={{ backgroundColor: "#22c55e", width: "24px", height: "24px", borderRadius: "6px", color: "white" }}>
                            <span style={{ fontSize: '0.8rem' }}>🎁</span>
                        </div>
                        <div>
                            Gains potentiels: <span className="fw-800">{Number(objective.maxReward).toFixed(1)} DT</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DealCard;
