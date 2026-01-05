import React from "react";

const CartSummary = ({
    subtotal,
    totalTTC,
    cagnotteDeduction,
    useCagnotte,
    handleCheckout,
    handleShowCagnotte,
    cancelCagnotteUse,
    canUseCagnotte
}) => {
    return (
        <div className="cart-summary-card">
            <h2 className="h5 fw-bold mb-4 text-primary">Résumé de la commande</h2>

            <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Sous-total</span>
                <span className="fw-semibold">{subtotal.toFixed(3)} DT</span>
            </div>

            <div className="alert alert-info py-2 px-3 mt-3 mb-3" style={{ fontSize: '0.8rem' }}>
                <i className="bi bi-info-circle me-1"></i>
                Les frais de livraison seront calculés à l'étape suivante
            </div>

            {useCagnotte && cagnotteDeduction > 0 && (
                <div className="d-flex justify-content-between mb-3 align-items-center p-2 bg-success bg-opacity-10 rounded">
                    <span className="text-success fw-bold">💰 Réduction cagnotte</span>
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-success fw-bold">-{cagnotteDeduction.toFixed(3)} DT</span>
                        <button
                            onClick={cancelCagnotteUse}
                            className="btn btn-sm btn-link text-danger p-0"
                            title="Désactiver"
                        >✕</button>
                    </div>
                </div>
            )}

            <hr />

            <div className="d-flex justify-content-between mb-4 mt-2 h4 fw-bold">
                <span>Total TTC</span>
                <span className="text-primary">{parseFloat(totalTTC).toFixed(3)} DT</span>
            </div>

            <div className="d-flex flex-column gap-2">
                <button
                    onClick={handleCheckout}
                    className="btn btn-lg w-100 py-3 text-white fw-bold shadow-sm"
                    style={{ backgroundColor: '#f97316', borderRadius: '12px' }}
                >
                    Commander
                </button>

                <button
                    onClick={handleShowCagnotte}
                    className={`btn w-100 py-2 fw-medium ${useCagnotte ? 'btn-success' : 'btn-outline-success'}`}
                    disabled={!canUseCagnotte || useCagnotte}
                    style={{ borderRadius: '12px' }}
                >
                    {useCagnotte ? '✓ Cagnotte Activée' : 'Utiliser ma cagnotte'}
                </button>
            </div>
        </div>
    );
};

export default CartSummary;
