import React from "react";
import Modal from "react-modal";

const CagnotteModal = ({
    isOpen,
    onClose,
    onConfirm,
    subtotal,
    cagnotteBalance,
    calculatedDeduction
}) => {
    const [manualAmount, setManualAmount] = React.useState(calculatedDeduction.toFixed(3));

    React.useEffect(() => {
        setManualAmount(calculatedDeduction.toFixed(3));
    }, [calculatedDeduction]);

    const handleAmountChange = (e) => {
        const val = e.target.value;
        // Allow numbers and one decimal point
        if (/^\d*\.?\d{0,3}$/.test(val)) {
            setManualAmount(val);
        }
    };

    const handleConfirm = () => {
        const amount = parseFloat(manualAmount);
        if (isNaN(amount) || amount <= 0) return;

        // Final validation before confirming
        const finalAmount = Math.min(amount, cagnotteBalance, subtotal);
        onConfirm(finalAmount);
    };

    const currentAmount = parseFloat(manualAmount) || 0;
    const isValid = currentAmount > 0 && currentAmount <= cagnotteBalance && currentAmount <= subtotal;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Confirmation de cagnotte"
            className="modal-content-premium p-0 mx-auto bg-white rounded-2xl shadow-2xl border-0 overflow-hidden"
            overlayClassName="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-3"
            style={{
                content: { maxWidth: '480px', width: '100%', border: 'none', inset: 'auto' },
                overlay: { backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1050, backdropFilter: 'blur(4px)' }
            }}
        >
            <div className="modal-header-gradient p-4 text-center text-white">
                <div className="modal-icon-container mb-3">
                    <span className="modal-icon-shine">💰</span>
                </div>
                <h2 className="h4 fw-black mb-1">Utiliser votre cagnotte</h2>
                <p className="text-white text-opacity-75 small mb-0">Choisissez le montant à déduire</p>
                <button onClick={onClose} className="btn-close-modal">✕</button>
            </div>

            <div className="p-4">
                <div className="instruction-box mb-4 p-3 rounded-xl d-flex gap-3">
                    <div className="text-blue-500 mt-1">✨</div>
                    <p className="small text-slate-600 mb-0">
                        Entrez le montant que vous souhaitez déduire de votre commande. Ce montant ne peut pas dépasser votre solde ni le total de votre panier.
                    </p>
                </div>

                <div className="summary-box p-4 rounded-2xl border-slate-100 border">
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-slate-500 small">Total panier</span>
                        <span className="text-slate-700 fw-bold">{subtotal.toFixed(3)} DT</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                        <span className="text-slate-500 small">Solde disponible</span>
                        <span className="text-emerald-600 fw-bold">{cagnotteBalance.toFixed(3)} DT</span>
                    </div>

                    <div className="deduction-input-container py-3 my-3 border-top border-bottom border-dashed">
                        <label className="d-block text-slate-800 fw-bold mb-2 small">Montant à déduire (DT)</label>
                        <div className="position-relative">
                            <input
                                type="text"
                                value={manualAmount}
                                onChange={handleAmountChange}
                                className={`form-control form-control-lg fw-bold ${!isValid && currentAmount > 0 ? 'is-invalid' : ''}`}
                                style={{
                                    borderRadius: '12px',
                                    paddingRight: '45px',
                                    color: '#059669',
                                    fontSize: '1.2rem'
                                }}
                            />
                            <div className="position-absolute end-0 top-50 translate-middle-y pe-3 text-slate-400">
                                DT
                            </div>
                        </div>
                        {!isValid && currentAmount > 0 && (
                            <div className="invalid-feedback d-block mt-2 x-small">
                                {currentAmount > cagnotteBalance ? 'Dépasse votre solde' : 'Dépasse le total panier'}
                            </div>
                        )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-2">
                        <span className="text-slate-800 fw-black">Nouveau total</span>
                        <span className="h4 mb-0 text-orange-500 fw-black">{Math.max(0, subtotal - currentAmount).toFixed(3)} DT</span>
                    </div>
                </div>

                <div className="d-flex gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="btn-modal-secondary flex-1"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!isValid || currentAmount <= 0}
                        className="btn-modal-primary flex-1"
                    >
                        Appliquer
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CagnotteModal;
