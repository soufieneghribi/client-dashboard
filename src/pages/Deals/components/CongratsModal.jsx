import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FiCheckCircle } from "react-icons/fi";

const CongratsModal = ({ show, onHide, congratsData }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Body className="text-center p-5">
                <div className="mb-4">
                    <FiCheckCircle size={80} color="#10B981" />
                </div>
                <h2 className="mb-3" style={{ fontWeight: "800", color: "#111827" }}>Félicitations ! 🎉</h2>
                <p className="mb-4" style={{ color: "#4B5563", fontSize: "1.1rem" }}>
                    Vous avez transféré avec succès <strong>{Number(congratsData?.amount).toFixed(1)} DT</strong> vers votre cagnotte !
                </p>
                <Button
                    onClick={onHide}
                    style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        borderRadius: "12px",
                        padding: "12px 32px",
                        fontWeight: "700"
                    }}
                >
                    Super, merci !
                </Button>
            </Modal.Body>
        </Modal>
    );
};

export default CongratsModal;
