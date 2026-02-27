import React from "react";
import { Card, Button } from "react-bootstrap";
import { FiCreditCard, FiRefreshCw } from "react-icons/fi";

const LoyaltyHeader = ({ hasCard, cardDeclaredLost, handleRefresh, isRefreshing, loading }) => {
    return (
        <Card className="loyalty-header-card">
            <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <div className="mb-3 mb-md-0">
                        <h1 className="mb-1" style={{ fontSize: "2rem", fontWeight: "700" }}>
                            <FiCreditCard className="me-2" />
                            Ma Carte Fidélité
                        </h1>
                        <p className="mb-0" style={{ opacity: 0.9 }}>
                            Gérez votre fidélité et gagnez des points
                        </p>
                    </div>
                    {hasCard && !cardDeclaredLost && (
                        <Button
                            onClick={handleRefresh}
                            className="loyalty-button loyalty-button-white"
                            disabled={isRefreshing || loading}
                        >
                            <FiRefreshCw size={18} className={isRefreshing ? "spin" : ""} />
                            {isRefreshing ? "Actualisation..." : "Actualiser"}
                        </Button>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

export default LoyaltyHeader;
