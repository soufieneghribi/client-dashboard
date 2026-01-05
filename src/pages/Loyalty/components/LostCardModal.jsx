import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FiAlertCircle } from "react-icons/fi";

const LostCardModal = ({ show, onHide, handleConfirmLostDeclaration }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton style={{ border: "none" }}>
                <Modal.Title style={{ fontWeight: "700", color: "#212529" }}>
                    <FiAlertCircle className="me-2" style={{ color: "#ffc107" }} />
                    Déclarer une carte perdue
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <p style={{ color: "#212529" }}>
                    Vous êtes sur le point de déclarer votre carte comme perdue.
                    Après confirmation, vous devrez générer une nouvelle carte.
                </p>
                <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: "12px", padding: "1rem", marginTop: "1rem" }}>
                    <p style={{ marginBottom: 0, fontSize: "0.875rem", color: "#856404" }}>
                        <strong>⚠️ Attention:</strong> Cette action marquera votre carte comme perdue.
                        Vous devrez ensuite générer une nouvelle carte pour continuer à utiliser le service.
                    </p>
                </div>
            </Modal.Body>
            <Modal.Footer style={{ border: "none", padding: "1rem 1.5rem" }}>
                <Button
                    variant="light"
                    onClick={onHide}
                    className="loyalty-button"
                    style={{ background: "#f8f9fa", color: "#6c757d" }}
                >
                    Annuler
                </Button>
                <Button
                    onClick={handleConfirmLostDeclaration}
                    className="loyalty-button"
                    style={{ background: "#ffc107", color: "white", border: "none" }}
                >
                    Confirmer la déclaration
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default LostCardModal;
