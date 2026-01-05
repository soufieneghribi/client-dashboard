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
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Confirmation de cagnotte"
            className="modal-content p-4 mx-auto bg-white rounded shadow-lg border-0"
            overlayClassName="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{
                content: { maxWidth: '500px', margin: '0 1rem' },
                overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }
            }}
        >
            <div className="text-center mb-4">
                <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle d-inline-block mb-3">
                    <span style={{ fontSize: '2rem' }}>💰</span>
                </div>
                <h2 className="h4 fw-bold">Utiliser Ma Cagnotte</h2>
            </div>

            <div className="alert alert-info" style={{ fontSize: '0.85rem' }}>
                💡 L&apos;utilisation de la cagnotte est optionnelle. La déduction sera effectuée uniquement lors de la confirmation finale de votre commande.
            </div>

            <div className="mt-4 p-3 bg-light rounded-3">
                <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Total du panier :</span>
                    <span className="fw-semibold">{subtotal.toFixed(3)} DT</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Cagnotte disponible :</span>
                    <span className="text-success fw-bold">{cagnotteBalance.toFixed(3)} DT</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-1">
                    <span className="fw-bold">Montant à déduire :</span>
                    <span className="fw-bold text-primary">-{calculatedDeduction.toFixed(3)} DT</span>
                </div>
                <div className="d-flex justify-content-between">
                    <span className="text-muted small">Montant restant à payer :</span>
                    <span className="fw-bold text-dark">{Math.max(0, subtotal - calculatedDeduction).toFixed(3)} DT</span>
                </div>
            </div>

            <div className="d-flex gap-3 mt-4">
                <button
                    onClick={onClose}
                    className="btn btn-light flex-fill py-2 fw-semibold"
                    style={{ borderRadius: '10px' }}
                >
                    Annuler
                </button>
                <button
                    onClick={onConfirm}
                    className="btn btn-success flex-fill py-2 fw-bold text-white shadow-sm"
                    style={{ borderRadius: '10px' }}
                >
                    Confirmer
                </button>
            </div>
        </Modal>
    );
};

export default CagnotteModal;
