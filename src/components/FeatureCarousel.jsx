import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { FaLock, FaGift, FaStar } from 'react-icons/fa';
import { fetchClientDeals } from '../store/slices/deals';

// Asset Imports
import mydealsImg from "../assets/mydealsImg.png"; // Keeping for compatibility if needed
import gameImg from "../assets/images/game-recommanded.png";
import promoImg from "../assets/images/discount-recommanded.png";
import giftImg from "../assets/images/gift-recommanded.png";
import freeImg from "../assets/images/free-recommanded.jpg";

const FeatureCarousel = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoggedIn } = useSelector((state) => state.auth);
    const { Userprofile } = useSelector((state) => state.user);
    const {
        depense = [],
        marque = [],
        frequence = [],
        anniversaire = [],
        loading
    } = useSelector((state) => state.deals);

    const carouselRef = React.useRef(null);

    useEffect(() => {
        if (isLoggedIn && Userprofile?.ID_client) {
            dispatch(fetchClientDeals(Userprofile.ID_client));
        }
    }, [dispatch, isLoggedIn, Userprofile?.ID_client]);

    const allDeals = [
        ...depense,
        ...marque,
        ...frequence,
        ...anniversaire,
    ];

    const staticFeatures = [
        {
            id: 'catalogue',
            title: 'Catalogue personnalisés',
            subtitle: 'Remise Promotion',
            image: promoImg,
            path: '/promotions',
            color: 'from-orange-400 to-red-500',
            requiresAuth: false
        },
        {
            id: 'cadeaux',
            title: 'Cadeaux',
            subtitle: 'Produits cadeaux premium',
            image: giftImg,
            path: '/cadeaux',
            color: 'from-purple-500 to-indigo-600',
            requiresAuth: true
        },
        {
            id: 'gratuite',
            title: 'Gratuité',
            subtitle: 'Articles gratuits pour vous',
            image: freeImg,
            path: '/gratuite',
            color: 'from-green-400 to-teal-600',
            requiresAuth: true
        },
        {
            id: 'promo',
            title: 'Codes Promo',
            subtitle: 'Avantages partenaires',
            image: promoImg,
            path: '/code-promo',
            color: 'from-blue-400 to-blue-600',
            requiresAuth: true
        },
        {
            id: 'jeux',
            title: 'Jeux',
            subtitle: 'Gagnez des récompenses',
            image: gameImg,
            path: '/jeux',
            color: 'from-yellow-400 to-orange-500',
            requiresAuth: false
        }
    ];

    const handleNavigation = (path, id, requiresAuth) => {
        if (requiresAuth && !isLoggedIn) {
            navigate('/login');
            return;
        }
        if (id === 'jeux') return;
        navigate(path);
    };

    const scroll = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = 300;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="py-8 relative group">
            <style>
                {`
                .feature-carousel-container {
                    padding: 0 4px;
                }
                .feature-carousel {
                    display: flex;
                    gap: 16px;
                    overflow-x: auto;
                    padding: 10px 4px 20px;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    scroll-behavior: smooth;
                }
                .feature-carousel::-webkit-scrollbar {
                    display: none;
                }
                .feature-card {
                    flex: 0 0 280px;
                    height: 200px;
                    border-radius: 28px;
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                @media (max-width: 768px) {
                    .feature-card {
                        flex: 0 0 220px;
                        height: 160px;
                        border-radius: 20px;
                    }
                    .feature-card-content {
                        padding: 12px;
                    }
                    .feature-card-content h3 {
                        font-size: 1rem !important;
                    }
                    .feature-card-content p {
                        font-size: 0.75rem !important;
                    }
                    .feature-action-btn {
                        padding: 6px 12px;
                        font-size: 0.75rem;
                    }
                    .feature-glass-badge {
                        padding: 4px 8px;
                        font-size: 0.65rem;
                        top: 12px;
                        left: 12px;
                    }
                    .lock-icon-container {
                        width: 28px;
                        height: 28px;
                        top: 12px;
                        right: 12px;
                    }
                }
                .feature-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 20px 35px rgba(0,0,0,0.15);
                }
                .feature-card-content {
                    position: absolute;
                    inset: 0;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.85) 100%);
                }
                .feature-glass-badge {
                    position: absolute;
                    top: 16px;
                    left: 16px;
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    padding: 6px 12px;
                    border-radius: 12px;
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    z-index: 10;
                }
                .lock-icon-container {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(8px);
                    width: 36px;
                    height: 36px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    z-index: 10;
                }
                .feature-action-btn {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(4px);
                    color: #1a1a1a;
                    border: none;
                    padding: 8px 14px;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 0.8rem;
                    margin-top: 10px;
                    transition: all 0.3s ease;
                    text-align: center;
                }
                .feature-card:hover .feature-action-btn {
                    background: #6366f1;
                    color: white;
                    transform: scale(1.02);
                }
                .nav-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: white;
                    color: #1a1a1a;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    cursor: pointer;
                    z-index: 20;
                    opacity: 0;
                    transition: all 0.3s ease;
                    border: 1px solid #f1f1f1;
                }
                .nav-arrow:hover {
                    background: #6366f1;
                    color: white;
                    transform: translateY(-50%) scale(1.1);
                }
                .group:hover .nav-arrow {
                    opacity: 1;
                }
                .nav-arrow-left { left: -22px; }
                .nav-arrow-right { right: -22px; }
                `}
            </style>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-indigo-600 rounded-full shadow-sm"></div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Vos offres exclusives</h2>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 uppercase tracking-wider">
                    Premium
                </div>
            </div>

            <div className="feature-carousel-container">
                <div className="relative">
                    <button
                        className="nav-arrow nav-arrow-left hidden md:flex"
                        onClick={() => scroll('left')}
                        aria-label="Scroll left"
                    >
                        <span className="text-xl">❮</span>
                    </button>

                    <button
                        className="nav-arrow nav-arrow-right hidden md:flex"
                        onClick={() => scroll('right')}
                        aria-label="Scroll right"
                    >
                        <span className="text-xl">❯</span>
                    </button>

                    <div className="feature-carousel px-2" ref={carouselRef}>
                        {/* 1. 🔹 LOYALTY REWARDS (Récompenses et fidélité) */}
                        {!isLoggedIn ? (
                            <div
                                className="feature-card group"
                                onClick={() => navigate('/login')}
                                style={{
                                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                }}
                            >
                                <div className="absolute inset-0 bg-opacity-20 bg-black flex items-center justify-center">
                                    <div className="text-center p-6 flex flex-col items-center">
                                        <div className="text-white/10 text-9xl font-black absolute inset-0 flex items-center justify-center select-none">DEAL</div>
                                        <div className="feature-glass-badge" style={{ top: '12px', left: '12px' }}>
                                            <FaLock size={12} />
                                            <span>Premium</span>
                                        </div>
                                        <h3 className="text-white font-black text-2xl mb-1 relative z-10">Récompenses de fidélité</h3>
                                        <p className="text-white/90 text-sm mb-4 relative z-10">Points & avantages exclusifs</p>
                                        <button className="feature-action-btn w-full relative z-10">Se connecter pour débloquer</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="feature-card group"
                                onClick={() => navigate('/MesDeals')}
                                style={{
                                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                }}
                            >
                                <div className="feature-card-content">
                                    <div className="feature-glass-badge">
                                        <FaStar className="text-yellow-300" />
                                        <span>DEAL OF THE DAY</span>
                                    </div>
                                    <h3 className="text-white font-black text-2xl leading-tight mb-1">
                                        Récompenses de fidélité
                                    </h3>
                                    <p className="text-white/90 text-sm font-medium">
                                        Points & avantages exclusifs
                                    </p>
                                    <button className="feature-action-btn self-start w-full">
                                        Voir mes avantages
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 2-6. 🔹 STATIC FEATURES (Catalogue, Cadeaux, Gratuité, Promo, Jeux) */}
                        {staticFeatures.map((feature) => (
                            <div
                                key={feature.id}
                                className="feature-card group"
                                onClick={() => handleNavigation(feature.path, feature.id, feature.requiresAuth)}
                            >
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    loading="lazy"
                                    decoding="async"
                                    width="280"
                                    height="200"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="feature-card-content">
                                    <div className="feature-glass-badge">
                                        {feature.id === 'cadeaux' ? <FaGift /> : feature.id === 'promo' || feature.id === 'catalogue' ? <span className="text-lg">🏷️</span> : <span>✨</span>}
                                        <span>Disponible</span>
                                    </div>

                                    {feature.requiresAuth && !isLoggedIn && (
                                        <div className="lock-icon-container">
                                            <FaLock size={16} />
                                        </div>
                                    )}

                                    <h3 className="text-white font-black text-xl leading-tight mb-1">
                                        {feature.title}
                                    </h3>
                                    <p className="text-white/90 text-sm font-medium">
                                        {feature.subtitle}
                                    </p>
                                    <button className="feature-action-btn self-start w-full">
                                        Découvrir maintenant
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* 7. 🔹 DYNAMIC DEALS (Frequency & Birthday) */}
                        {isLoggedIn && [...frequence, ...anniversaire].map((deal, idx) => {
                            const isFrequence = frequence.includes(deal);
                            return (
                                <div
                                    key={`dynamic-${idx}`}
                                    className="feature-card group"
                                    onClick={() => navigate('/MesDeals')}
                                    style={{
                                        background: isFrequence
                                            ? 'linear-gradient(135deg, #059669, #10b981)'
                                            : 'linear-gradient(135deg, #db2777, #f472b6)',
                                    }}
                                >
                                    <div className="feature-card-content">
                                        <div className="feature-glass-badge">
                                            {isFrequence ? <FaStar className="text-yellow-400" /> : <FaGift className="text-pink-300" />}
                                            <span>{isFrequence ? 'DEAL FRÉQUENCE' : 'DEAL ANNIVERSAIRE'}</span>
                                        </div>
                                        <h3 className="text-white font-black text-xl leading-tight mb-1">
                                            {deal.titre || (isFrequence ? "Points de fidélité" : "Cadeau d'anniversaire")}
                                        </h3>
                                        <p className="text-white/90 text-sm font-medium">
                                            {isFrequence ? `Plus que ${deal.objectif_frequence - deal.compteur_frequence} visites !` : "Une surprise vous attend !"}
                                        </p>
                                        <button className="feature-action-btn self-start w-full">
                                            En profiter
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeatureCarousel;
