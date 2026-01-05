import React from "react";
import { FiTrash2, FiShoppingCart } from "react-icons/fi";
import { getImageUrl, handleImageError } from "../../../utils/imageHelper";

const FavoriteCard = ({ product, handleRemove, handleProductClick, addToCartHandler, calculateDiscount }) => {
    const getProductImageUrl = (p) => getImageUrl(p, "product");

    return (
        <div className="favorite-card group">
            <div className="favorite-image-container">
                <img
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    className="favorite-image cursor-pointer"
                    onClick={() => handleProductClick(product)}
                    onError={handleImageError}
                />

                <button
                    onClick={() => handleRemove(product.id)}
                    className="favorite-remove-btn"
                    title="Retirer des favoris"
                >
                    <FiTrash2 className="w-5 h-5" />
                </button>

                {product.isPromotion && (
                    <div className="favorite-promo-badge">
                        -{calculateDiscount(product.price, product.promoPrice)}%
                    </div>
                )}
            </div>

            <div className="favorite-info">
                <h3
                    className="favorite-title cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleProductClick(product)}
                >
                    {product.name}
                </h3>
                <p className="text-gray-500 text-xs mt-1 truncate">
                    {product.brand || "Marque MG"}
                </p>

                <div className="d-flex align-items-center justify-content-between mt-4">
                    <span className="favorite-price">
                        {parseFloat(product.price).toFixed(3)} DT
                    </span>

                    <button
                        onClick={() => addToCartHandler(product)}
                        className="btn btn-primary d-flex align-items-center justify-content-center p-2 rounded-lg"
                        title="Ajouter au panier"
                        style={{ borderRadius: '10px' }}
                    >
                        <FiShoppingCart className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FavoriteCard;
