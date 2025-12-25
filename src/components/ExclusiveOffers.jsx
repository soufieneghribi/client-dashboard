import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectIsLoggedIn } from "../store/slices/authSlice";
import toast from "react-hot-toast";
import "../styles/ExclusiveOffers.css";

// Import images
import mydealsImg from "../assets/mydealsImg.png";
import recommnededImg from "../assets/recommnededImg.png";

const ExclusiveOffers = () => {
    const navigate = useNavigate();
    const isLoggedIn = useSelector(selectIsLoggedIn);

    const showLoginPrompt = () => {
        toast.error("Connectez-vous pour débloquer des avantages exclusifs", {
            duration: 3000,
            icon: "🔒",
        });
        setTimeout(() => {
            navigate("/login");
        }, 1000);
    };

    const handleLoyaltyClick = () => {
        if (isLoggedIn) {
            navigate("/Loyality");
        } else {
            showLoginPrompt();
        }
    };

    const handlePersonalizedClick = () => {
        if (isLoggedIn) {
            navigate("/Catalogue");
        } else {
            showLoginPrompt();
        }
    };

    return (
        <section className="exclusive-offers-section">
            <div className="exclusive-offers-header">
                <div className="header-accent"></div>
                <div className="header-content">
                    <h2 className="section-title">Vos offres exclusives</h2>
                    <span className="premium-badge">Premium</span>
                </div>
            </div>

            <div className="offers-container">
                {/* Loyalty Rewards Card */}
                <div className="offer-card" onClick={handleLoyaltyClick}>
                    <div className="card-image-wrapper">
                        <img src={mydealsImg} alt="Récompenses de fidélité" className="card-image" />
                        <div className="card-overlay"></div>
                    </div>

                    <div className="card-content">
                        <div className="card-badge">
                            {isLoggedIn ? "✨ Disponible" : "🔒 Premium"}
                        </div>

                        <h3 className="card-title">Récompenses de fidélité</h3>
                        <p className="card-subtitle">Points & avantages exclusifs</p>

                        <button className={`card-button ${isLoggedIn ? "unlocked" : "locked"}`}>
                            {isLoggedIn ? "Découvrir maintenant" : "Se connecter pour débloquer"}
                        </button>
                    </div>

                    {!isLoggedIn && (
                        <div className="lock-icon">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                    )}
                </div>

                {/* Personalized Deals Card */}
                <div className="offer-card" onClick={handlePersonalizedClick}>
                    <div className="card-image-wrapper">
                        <img src={recommnededImg} alt="Choix personnalisés" className="card-image" />
                        <div className="card-overlay"></div>
                    </div>

                    <div className="card-content">
                        <div className="card-badge">
                            {isLoggedIn ? "✨ Disponible" : "🔒 Premium"}
                        </div>

                        <h3 className="card-title">Choix personnalisés</h3>
                        <p className="card-subtitle">Sélection adaptée à vos goûts</p>

                        <button className={`card-button ${isLoggedIn ? "unlocked" : "locked"}`}>
                            {isLoggedIn ? "Découvrir maintenant" : "Se connecter pour débloquer"}
                        </button>
                    </div>

                    {!isLoggedIn && (
                        <div className="lock-icon">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ExclusiveOffers;
