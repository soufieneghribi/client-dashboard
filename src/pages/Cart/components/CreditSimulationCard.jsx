import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCalculator, FaArrowRight, FaShoppingCart } from "react-icons/fa";

const CreditSimulationCard = ({ subtotal }) => {
    const navigate = useNavigate();
    const CREDIT_THRESHOLD = 300;

    if (subtotal < CREDIT_THRESHOLD) {
        return null;
    }

    const handleNavigateToCredit = () => {
        navigate('/credit/simulation', {
            state: {
                montantPanier: subtotal,
                fromCart: true
            }
        });
    };

    return (
        <div className="credit-simulation-card mb-4">
            <div className="credit-card-content p-3 rounded-xl" style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Header */}
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <div className="d-flex align-items-center justify-content-center" style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <FaShoppingCart className="text-white" size={18} />
                        </div>
                        <div className="flex-grow-1">
                            <h3 className="text-white fw-bold mb-0" style={{ fontSize: '0.95rem' }}>
                                💳 Crédit disponible !
                            </h3>
                            <p className="text-white mb-0" style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                Votre panier est éligible au crédit
                            </p>
                        </div>
                    </div>

                    {/* Amount Display */}
                    <div className="bg-white rounded-lg p-2 mb-2 shadow-sm" style={{
                        border: '1px solid rgba(255, 255, 255, 0.8)'
                    }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-slate-500 fw-medium" style={{ fontSize: '0.8rem' }}>
                                Montant du panier
                            </span>
                            <span className="text-black fw-bold d-flex align-items-center gap-2" style={{ fontSize: '1rem' }}>
                                <FaShoppingCart size={14} className="text-slate-400" />
                                {subtotal.toFixed(3)} DT
                            </span>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handleNavigateToCredit}
                        className="btn w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                        style={{
                            background: 'white',
                            color: '#1d4ed8',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        <FaCalculator size={14} />
                        <span>Simuler mon crédit</span>
                        <FaArrowRight size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreditSimulationCard;
