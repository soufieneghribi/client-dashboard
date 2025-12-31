import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiTrash2, FiShoppingCart, FiHeart } from "react-icons/fi";
import { getImageUrl, handleImageError } from "../utils/imageHelper";
import { useNavigate } from "react-router-dom";
import {
  fetchWishlist,
  removeFromWishlist,
} from "../store/slices/wishlist";
import toast from "react-hot-toast";

const Favoris = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = (productId) => {
    dispatch(removeFromWishlist(productId));
    toast.success("Retiré des favoris");
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, { state: { subId: product.type_id } });
  };

  const addToCartHandler = (product) => {
    // Implement add to cart logic here if needed
    console.log("Add to cart:", product);
  };

  // Image URL Helper is now centralized
  const getProductImageUrl = (p) => getImageUrl(p, 'product');

  const calculateDiscount = (price, discountPrice) => {
    if (!discountPrice || discountPrice >= price) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Favoris</h1>
            <p className="mt-2 text-sm text-gray-600">
              {items?.length || 0} produit(s) dans votre liste de souhaits
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Continuer mes achats
          </button>
        </div>

        {!items || items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiHeart className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Votre liste est vide
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Vous n'avez pas encore ajouté de produits à vos favoris. Explorez
              notre catalogue pour trouver vos coups de cœur !
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              Découvrir les produits
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                {/* Product Image */}
                <div className="relative h-48 sm:h-56 bg-white flex items-center justify-center p-4">
                  <img
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                    onClick={() => handleProductClick(product)}
                    onError={handleImageError}
                  />

                  {/* Wishlist Button */}
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 shadow-sm hover:bg-red-50 transition-colors"
                    title="Retirer des favoris"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>

                  {/* Badge Promo if applicable */}
                  {product.isPromotion && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                      -{calculateDiscount(product.price, product.promoPrice)}%
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="mb-2">
                    <h3
                      className="text-gray-900 font-semibold text-sm sm:text-base line-clamp-2 min-h-[2.5rem] cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => handleProductClick(product)}
                    >
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1 truncate">
                      {product.brand || "Marque MG"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-gray-900">
                        {parseFloat(product.price).toFixed(3)} DT
                      </span>
                    </div>

                    <button
                      onClick={() => addToCartHandler(product)}
                      className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
                      title="Ajouter au panier"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoris;