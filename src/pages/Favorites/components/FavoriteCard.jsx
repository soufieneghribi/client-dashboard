import React from "react";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { getImageUrl, handleImageError } from "../../../utils/imageHelper";

const FavoriteCard = ({ product, handleRemove, handleProductClick, addToCartHandler, calculateDiscount }) => {
    const getProductImageUrl = (p) => getImageUrl(p, "product");

    return (
        <div className="favorite-card">
            <div className="favorite-image-container">
                <button
                    onClick={() => handleRemove(product.id)}
                    className="favorite-remove-btn"
                    title="Retirer des favoris"
                >
                    <FiHeart className="w-5 h-5" />
                </button>

                <button
                    onClick={() => addToCartHandler(product)}
                    className="favorite-cart-btn"
                    title="Ajouter au panier"
                >
                    <FiShoppingCart className="w-5 h-5" />
                </button>

                <img
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    className="favorite-image cursor-pointer"
                    onClick={() => handleProductClick(product)}
                    onError={handleImageError}
                />

                {product.discount_price && (
                    <div className="favorite-promo-badge">
                        -{calculateDiscount(product.price, product.discount_price)}%
                    </div>
                )}
            </div>

            <div className="favorite-info">
                <h3
                    className="favorite-title cursor-pointer"
                    onClick={() => handleProductClick(product)}
                >
                    {product.name}
                </h3>

                <div className="favorite-price-container">
                    <span className="favorite-price">
                        Prix : {product.discount_price ? parseFloat(product.discount_price).toFixed(2) : parseFloat(product.price).toFixed(2)} dt
                    </span>
                    {product.discount_price && (
                        <div className="text-muted text-decoration-line-through x-small">
                            {parseFloat(product.price).toFixed(2)} dt
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FavoriteCard;
