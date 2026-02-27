import React from "react";
import CreditSimulationCard from "./CreditSimulationCard";

const CartSummary = ({
    subtotal,
    totalTTC,
    cagnotteDeduction,
    useCagnotte,
    handleCheckout,
    handleShowCagnotte,
    cancelCagnotteUse,
    canUseCagnotte,
    threshold,
    subtotalMetThreshold,
    cagnotteBalance
}) => {
    return (
        <div className="cart-summary-card position-sticky" style={{ top: '20px' }}>
            <h2 className="h5 fw-bold mb-3 mb-md-4 text-slate-800">Résumé de la commande</h2>

            <div className="space-y-2 space-y-md-3 mb-3 mb-md-4">
                <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Sous-total</span>
                    <span className="fw-semibold text-slate-700">{subtotal.toFixed(3)} DT</span>
                </div>

                {useCagnotte && cagnotteDeduction > 0 && (
                    <div className="cagnotte-active-row d-flex justify-content-between align-items-center p-3 rounded-xl mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <span className="cagnotte-icon">💰</span>
                            <div>
                                <div className="fw-bold text-emerald-700" style={{ fontSize: '0.9rem' }}>Réduction cagnotte</div>
                                <div className="text-emerald-600 x-small">Déduit de votre solde</div>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <span className="fw-bold text-emerald-700">-{cagnotteDeduction.toFixed(3)} DT</span>
                            <button
                                onClick={cancelCagnotteUse}
                                className="remove-cagnotte-btn"
                                title="Retirer la réduction"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="alert alert-soft-blue py-3 px-3 mb-4 d-flex align-items-start gap-2">
                <i className="fas fa-truck mt-1 text-blue-500"></i>
                <span className="small text-slate-600">
                    Les frais de livraison seront calculés à l'étape suivante.
                </span>
            </div>

            {/* Cagnotte Section */}
            <div className="cagnotte-section mb-4">
                {cagnotteBalance > 0 ? (
                    <div className={`cagnotte-unlocked p-3 rounded-xl ${useCagnotte ? 'active' : ''}`}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center gap-2">
                                <div className="cagnotte-pulse-icon">✨</div>
                                <div>
                                    <div className="fw-bold text-slate-800 small">Cagnotte disponible !</div>
                                    <div className="text-slate-500 x-small">Solde: {cagnotteBalance.toFixed(3)} DT</div>
                                </div>
                            </div>
                            <div className="form-check form-switch m-0">
                                <input
                                    className="form-check-input custom-switch"
                                    type="checkbox"
                                    checked={useCagnotte}
                                    onChange={useCagnotte ? cancelCagnotteUse : handleShowCagnotte}
                                />
                            </div>
                        </div>
                        {!useCagnotte && (
                            <button
                                onClick={handleShowCagnotte}
                                className="btn btn-emerald-soft w-100 btn-sm fw-bold"
                            >
                                Activer ma réduction
                            </button>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Credit Simulation Card - Only if eligible */}
            <CreditSimulationCard subtotal={subtotal} />

            {/* Total Section */}
            <div className="border-t pt-3 mt-3">
                <div className="d-flex justify-content-between mb-4 mt-2">
                    <span className="h5 fw-bold text-slate-700">Total TTC</span>
                    <span className="h4 fw-black text-orange-500">{parseFloat(totalTTC).toFixed(3)} DT</span>
                </div>
            </div>

            <button
                onClick={handleCheckout}
                className="btn-checkout w-100"
            >
                <span>Passer à la caisse</span>
                <i className="fas fa-arrow-right ms-2 mt-1"></i>
            </button>
        </div>
    );
};

export default CartSummary;
