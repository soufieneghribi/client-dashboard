import React from "react";
import { Card } from "react-bootstrap";
import { FiGift, FiFlag, FiSmile, FiCreditCard, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const AdvantagesSection = ({ hasLoyaltyCard }) => {
    const navigate = useNavigate();

    const advantages = [
        {
            label: "Mes Cadeaux",
            desc: "Voir tous les cadeaux gagnés",
            icon: <FiGift />,
            path: "/mes-cadeaux",
            bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        },
        {
            label: "Codes Promo",
            desc: "Mes codes promotionnels gratuits",
            icon: <FiFlag />,
            path: "/code-promo",
            bg: "linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)",
        },
        {
            label: "Gratuités",
            desc: "Les offres 100% gratuites",
            icon: <FiSmile />,
            path: "/gratuite",
            bg: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
        },
    ];

    return (
        <Card className="actions-card">
            <Card.Body className="p-4">
                <h5 style={{ fontWeight: "700", marginBottom: "1.5rem", color: "#212529" }}>
                    Mes avantages
                </h5>

                {advantages.map((adv, index) => (
                    <button
                        key={index}
                        onClick={() => navigate(adv.path)}
                        className="action-button"
                        style={{
                            background: adv.bg,
                            color: "white",
                        }}
                    >
                        <div
                            className="action-icon"
                            style={{
                                background: "rgba(255, 255, 255, 0.2)",
                            }}
                        >
                            {adv.icon}
                        </div>
                        <div style={{ textAlign: "left", flex: 1 }}>
                            <div style={{ fontWeight: "700", fontSize: "0.98rem" }}>{adv.label}</div>
                            <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>
                                {adv.desc}
                            </div>
                        </div>
                        <FiChevronRight size={20} />
                    </button>
                ))}

                {hasLoyaltyCard && (
                    <button
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
                            <div style={{ fontWeight: "700" }}>Ma Carte Fidélité</div>
                            <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>Gérer ma carte</div>
                        </div>
                        <FiChevronRight size={20} />
                    </button>
                )}
            </Card.Body>
        </Card>
    );
};

export default AdvantagesSection;
