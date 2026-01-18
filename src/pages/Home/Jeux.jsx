import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { FaWallet, FaGift, FaRegFrown, FaMobileAlt, FaHotel, FaStar, FaChevronLeft, FaCoins } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { updateCagnotteInDB, fetchUserProfile } from '../../store/slices/user';
import { useNavigate } from 'react-router-dom';
import './Jeux.css'; // New styles

// Alternating colors based on the image description
const COLORS = ['#2D2D5F', '#FF5722']; // Dark Blue, Orange Red

const SECTIONS = [
    { label: '1 DT', icon: FaWallet, weight: 40, value: 1.0 },
    { label: 'Perdu', icon: FaRegFrown, weight: 60 },
    { label: 'Gagné', icon: FaGift, weight: 12 },
    { label: '1 DT', icon: FaWallet, weight: 40, value: 1.0 },
    { label: 'Recharge', icon: FaMobileAlt, weight: 15 },
    { label: 'Perdu', icon: FaRegFrown, weight: 60 },
    { label: 'Weekend', icon: FaHotel, weight: 5 },
    { label: '1 DT', icon: FaWallet, weight: 40, value: 1.0 },
];

const Jeux = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const controls = useAnimation();
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const { Userprofile } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(fetchUserProfile());
    }, [dispatch]);

    const spinWheel = async () => {
        if (isSpinning) return;
        setIsSpinning(true);

        const totalWeight = SECTIONS.reduce((sum, s) => sum + s.weight, 0);
        let random = Math.random() * totalWeight;
        let targetIndex = 0;
        for (let i = 0; i < SECTIONS.length; i++) {
            if (random < SECTIONS[i].weight) {
                targetIndex = i;
                break;
            }
            random -= SECTIONS[i].weight;
        }

        const sectionAngle = 360 / SECTIONS.length;
        const extraSpins = 5 + Math.floor(Math.random() * 5);

        // Use consistent rotation logic
        const finalRotation = rotation + (extraSpins * 360) + (targetIndex * sectionAngle);
        setRotation(finalRotation);

        await controls.start({
            rotate: finalRotation,
            transition: { duration: 4, ease: "circOut" }
        });

        setIsSpinning(false);
        const result = SECTIONS[targetIndex];

        // Logic for handling result (same as before)
        if (result.label !== 'Perdu') {
            if (result.value) {
                try {
                    await dispatch(updateCagnotteInDB(result.value)).unwrap();
                    toast.success(`🎉 +${result.value} DT !`, { duration: 4000 });
                } catch (error) {
                    console.error('Failed to update cagnotte:', error);
                }
            } else {
                toast.success(`🎉 Gagné : ${result.label}`, { duration: 4000 });
            }
        } else {
            toast.error("😢 Dommage !", { duration: 4000 });
        }
    };

    return (
        <div className="jeux-page-wrapper">
            {/* Header matching the design */}
            <div className="jeux-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <FaChevronLeft />
                    </button>
                    <div className="header-content">
                        <h1>Fortune Wheel</h1>
                        <p>Tentez votre chance et gagnez!</p>
                    </div>
                </div>

                <div className="header-balance">
                    <FaCoins color="#FFD700" />
                    <span>{Userprofile?.cagnotte_balance || 0} DT</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="jeux-content">
                <div className="wheel-container-wrapper">
                    {/* The pointer at the top */}
                    <div className="wheel-pointer" />

                    {/* Decorative dots around border */}
                    <div className="wheel-border-dots">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="dot"
                                style={{ transform: `rotate(${i * 45 + 22.5}deg) translateX(165px)` }} // Adjust 165px based on diameter
                            />
                        ))}
                    </div>

                    <motion.div
                        className="the-wheel"
                        animate={controls}
                        initial={{ rotate: 0 }}
                    >
                        {SECTIONS.map((section, i) => (
                            <div
                                key={i}
                                className="wheel-segment"
                                style={{
                                    backgroundColor: COLORS[i % COLORS.length],
                                    // Rotation logic: Each segment covers 45deg (360/8).
                                    // We rotate by i*45.
                                    // SkewY(90 - 45) = 45deg to make it a slice.
                                    transform: `rotate(${i * (360 / SECTIONS.length)}deg) skewY(${90 - (360 / SECTIONS.length)}deg)`,
                                }}
                            >
                                <div className="segment-content"
                                    style={{
                                        // Position calculation:
                                        // Segment Center (Flex): (80,80)
                                        // Wheel Center (Bottom-Right): (160,160)
                                        // Target Rim Spot: (100, 20) [From Step 316 which worked]
                                        // Target Visible Spot: (130, 90) [Closer to center]
                                        // Offset from Flex Center: (50, 10)
                                        transform: `skewY(-${90 - (360 / SECTIONS.length)}deg) rotate(${(360 / SECTIONS.length) / 2}deg) translate(50px, 10px) rotate(-45deg)`,
                                        position: 'absolute',
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'row-reverse', // Icon towards center
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '5px'
                                    }}>
                                    <section.icon size={18} style={{ transform: 'rotate(90deg)' }} />
                                    <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{section.label}</span>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    <div className="wheel-center">
                        <FaStar />
                    </div>
                </div>

                {/* Bottom Action Card */}
                <div className="bottom-action-card">
                    <h2 className="action-title">FAITES VOS JEUX</h2>
                    <button
                        className="spin-btn"
                        onClick={spinWheel}
                        disabled={isSpinning}
                    >
                        {isSpinning ? '...' : 'TOURNER LA ROUE'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Jeux;
