import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist, fetchWishlist, selectIsInWishlist } from "../store/slices/wishlist";
import { selectIsLoggedIn } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
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
            toast.info("Veuillez vous connecter pour gérer vos favoris");
            setTimeout(() => navigate("/login"), 1000);
            return;
        }

        if (isLoading) return; // Prevent double clicks

        setIsAnimating(true);
        setIsLoading(true);

        const wasInWishlist = isInWishlist;
        try {
            await dispatch(toggleWishlist(productId)).unwrap();
            const actionMessage = !wasInWishlist ? "ajouté aux" : "retiré des";
            toast.success(`Produit ${actionMessage} favoris !`);

            // Refetch wishlist to ensure we have the latest data
            await dispatch(fetchWishlist());
        } catch (error) {
            toast.error("Erreur lors de la mise à jour des favoris");
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
                fill="none"
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


