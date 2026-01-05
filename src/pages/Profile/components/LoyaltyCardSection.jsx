import React from "react";
import { Card, Button } from "react-bootstrap";
import { FiCreditCard, FiCheckCircle, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const LoyaltyCardSection = ({ loyaltyCard, Userprofile, formatLoyaltyCode, cagnotteBalance, hasLoyaltyCard }) => {
    const navigate = useNavigate();

    if (hasLoyaltyCard) {
        return (
            <Card
                className="loyalty-card"
                onClick={() => navigate("/loyalty-card")}
            >
                <div className="loyalty-card-header">
                    <div className="d-flex alignItems-center gap-2">
                        <FiCreditCard size={24} />
                        <div>
                            <h5 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "700" }}>
                                Ma Carte Fidélité
                            </h5>
                        </div>
                    </div>
                    <div className="loyalty-badge">
                        <FiCheckCircle size={14} />
                        Active
                    </div>
                </div>
                <Card.Body className="loyalty-card-body">
                    <div className="loyalty-info">
                        <div>
                            <p className="loyalty-label">Numéro de carte</p>
                            <p className="loyalty-value">{formatLoyaltyCode(loyaltyCard.loyalty_code)}</p>
                        </div>
                        <div>
                            <p className="loyalty-label">Solde Cagnotte</p>
                            <div className="loyalty-balance">
                                {parseFloat(cagnotteBalance).toFixed(2)} DT
                            </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mt-2">
                            <p className="loyalty-label" style={{ marginBottom: 0 }}>
                                Titulaire: {Userprofile?.nom_et_prenom}
                            </p>
                            <FiChevronRight size={20} color="#667eea" />
                        </div>
                    </div>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="actions-card">
            <Card.Body className="p-4">
                <h5 style={{ fontWeight: "700", marginBottom: "1.5rem", color: "#212529" }}>
                    Carte Fidélité
                </h5>
                <p style={{ fontSize: "0.875rem", color: "#6c757d", marginBottom: "1rem" }}>
                    Générez votre carte pour commencer à gagner des points
                </p>
                <Button
                    onClick={() => navigate("/loyalty-card")}
                    className="action-button"
                    style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                    }}
                >
                    <div
                        className="action-icon"
                        style={{
                            background: "rgba(255, 255, 255, 0.2)",
                        }}
                    >
                        <FiCreditCard />
                    </div>
                    <div style={{ textAlign: "left", flex: 1 }}>
                        <div style={{ fontWeight: "700" }}>Afficher ma carte</div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>Carte de fidélité</div>
                    </div>
                </Button>
            </Card.Body>
        </Card>
    );
};

export default LoyaltyCardSection;
