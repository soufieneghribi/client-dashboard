import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
  selectWishlistItems,
  selectWishlistLoading,
  selectWishlistCount,
} from "../store/slices/wishlist";
import { selectIsLoggedIn } from "../store/slices/authSlice";
import WishlistButton from "../components/WishlistButton";
import toast from "react-hot-toast";

const Favoris = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoggedIn = useSelector(selectIsLoggedIn);
  const wishlistItems = useSelector(selectWishlistItems);
  const loading = useSelector(selectWishlistLoading);
  const count = useSelector(selectWishlistCount);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Veuillez vous connecter pour voir vos favoris");
      navigate("/login");
      return;
    }

    dispatch(fetchWishlist());
  }, [dispatch, isLoggedIn, navigate]);

  const handleRemove = async (productId) => {
    await dispatch(removeFromWishlist(productId));
  };

  const handleClearAll = async () => {
    if (window.confirm("Voulez-vous vraiment vider tous vos favoris ?")) {
      await dispatch(clearWishlist());
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const handleAddToCart = (product) => {
    // TODO: Implémenter l'ajout au panier avec Redux
    // Pour l'instant, on affiche juste un message
    toast.success(`${product.name} sera ajouté au panier`);
    console.log("Add to cart:", product);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/300";
    if (imagePath.startsWith("http")) return imagePath;
    return `https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${imagePath}`;
  };

  const calculateDiscount = (price, discountPrice) => {
    if (!discountPrice || discountPrice >= price) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement de vos favoris...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Mes Favoris
              </h1>
              <p className="text-gray-600">
                {count} {count > 1 ? "produits" : "produit"} dans vos favoris
              </p>
            </div>

            {wishlistItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
              >
                Vider tout
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="w-24 h-24 mx-auto mb-6 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                ></path>
              </svg>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Aucun favori pour le moment
              </h2>
              <p className="text-gray-600 mb-6">
                Commencez à ajouter des produits à vos favoris en cliquant sur l'icône cœur
              </p>
              <button
                onClick={() => navigate("/categories")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Découvrir nos produits
              </button>
            </div>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => {
              const discount = calculateDiscount(product.price, product.discount_price);
              const finalPrice = product.discount_price || product.price;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(product.img)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                      onClick={() => handleProductClick(product)}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300";
                      }}
                    />

                    {/* Wishlist Button */}
                    <div className="absolute top-3 right-3">
                      <WishlistButton productId={product.id} size="medium" />
                    </div>

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{discount}%
                      </div>
                    )}

                    {/* Availability Badge */}
                    {!product.is_available && (
                      <div className="absolute bottom-3 left-3 bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Rupture de stock
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    {/* Category */}
                    {product.category_name && (
                      <p className="text-xs text-gray-500 mb-1">
                        {product.category_name}
                      </p>
                    )}

                    <h3
                      className="font-semibold text-gray-800 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => handleProductClick(product)}
                    >
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      {discount > 0 ? (
                        <>
                          <span className="text-xl font-bold text-red-600">
                            {finalPrice?.toFixed(2)} DT
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            {product.price?.toFixed(2)} DT
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-gray-800">
                          {product.price?.toFixed(2) || "N/A"} DT
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.is_available}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium text-sm ${product.is_available
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                      >
                        {product.is_available ? "Ajouter au panier" : "Indisponible"}
                      </button>
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Retirer"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoris;