import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist, fetchWishlist, selectIsInWishlist } from "../store/slices/wishlist";
import { selectIsLoggedIn } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

import "../styles/WishlistButton.css";

const WishlistButton = ({ productId, size = "medium", className = "" }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const isInWishlist = useSelector(selectIsInWishlist(productId));
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isLoggedIn) {
            // 
            setTimeout(() => navigate("/login"), 1000);
            return;
        }

        if (isLoading) return; // Prevent double clicks

        setIsAnimating(true);
        setIsLoading(true);

        try {
            await dispatch(toggleWishlist(productId)).unwrap();
            // Refetch wishlist to ensure we have the latest data
            // This is important when adding items to get full product details
            await dispatch(fetchWishlist());
        } catch (error) {

        } finally {
            setIsLoading(false);
            setTimeout(() => setIsAnimating(false), 600);
        }
    };

    const sizeClasses = {
        small: "wishlist-btn-small",
        medium: "wishlist-btn-medium",
        large: "wishlist-btn-large",
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`wishlist-button ${sizeClasses[size]} ${isInWishlist ? "active" : ""
                } ${isAnimating ? "animating" : ""} ${isLoading ? "loading" : ""} ${className}`}
            aria-label={isInWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
            title={isInWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
            <svg
                className="wishlist-icon"
                viewBox="0 0 24 24"
                fill={isInWishlist ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>

            {isAnimating && (
                <div className="wishlist-particles">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="particle" style={{ "--i": i }}></div>
                    ))}
                </div>
            )}
        </button>
    );
};

export default WishlistButton;


