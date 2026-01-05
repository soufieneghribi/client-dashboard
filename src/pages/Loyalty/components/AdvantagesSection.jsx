import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { FiGift } from "react-icons/fi";

const AdvantagesSection = () => {
    const advantages = [
        { icon: "🎁", title: "Gagnez des points", description: "À chaque achat, accumulez des points sur votre cagnotte" },
        { icon: "💰", title: "Réductions exclusives", description: "Profitez d'offres spéciales réservées aux membres" },
        { icon: "🎉", title: "Cadeaux d'anniversaire", description: "Recevez des surprises pour votre anniversaire" },
        { icon: "⚡", title: "Accès prioritaire", description: "Soyez le premier informé des nouveautés" }
    ];

    return (
        <Card className="rounded-4 border-0 shadow-sm mt-4 bg-white">
            <Card.Body className="p-4">
                <h4 style={{ fontWeight: "700", marginBottom: "1.5rem", color: "#212529" }}>
                    <FiGift className="me-2" />
                    Avantages de la carte fidélité
                </h4>
                <Row>
                    {advantages.map((adv, index) => (
                        <Col md={6} key={index} className="mb-3">
                            <div className="d-flex gap-3">
                                <div style={{ fontSize: "2rem" }}>{adv.icon}</div>
                                <div>
                                    <h6 style={{ fontWeight: "600", color: "#212529" }}>{adv.title}</h6>
                                    <p style={{ fontSize: "0.875rem", color: "#6c757d", marginBottom: 0 }}>
                                        {adv.description}
                                    </p>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Card.Body>
        </Card>
    );
};

export default AdvantagesSection;
