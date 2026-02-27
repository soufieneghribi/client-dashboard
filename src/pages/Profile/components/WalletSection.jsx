import React from "react";
import { Card } from "react-bootstrap";
import { FiArchive } from "react-icons/fi";

const WalletSection = ({ cagnotteBalance }) => {
    return (
        <Card className="actions-card">
            <Card.Body className="p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 style={{ fontWeight: "700", color: "#212529", marginBottom: 0 }}>
                        Portefeuille
                    </h5>
                    <FiArchive size={22} color="#667eea" />
                </div>
                <div className="text-center py-3">
                    <p
                        className="mb-2"
                        style={{
                            fontSize: "0.85rem",
                            color: "#6c757d",
                            fontWeight: "600",
                        }}
                    >
                        Solde de cagnotte
                    </p>
                    <h2 className="wallet-balance-value">
                        {parseFloat(cagnotteBalance).toFixed(2)} DT
                    </h2>
                    <p
                        style={{
                            fontSize: "0.9rem",
                            color: "#6c757d",
                            marginTop: "0.5rem",
                        }}
                    >
                        Utilisable sur vos prochains achats
                    </p>
                </div>
            </Card.Body>
        </Card>
    );
};

export default WalletSection;
