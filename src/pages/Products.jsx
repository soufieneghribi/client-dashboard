import { useEffect, useState } from "react";
import { ShoppingCart, Eye, Star, Flame, Package, Truck, Headphones, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProduct } from "../store/slices/product";

function Products() {
  const dispatch = useDispatch();
  const { product: products, loading, error } = useSelector((state) => state.product);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ==================== CONFIGURATION ====================
  const IMAGE_BASE_URL = "https://tn360-lqd25ixbvq-ew.a.run.app/uploads";

  // ==================== FONCTION DE NORMALISATION ====================
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // URL complète (Google Storage)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Chemin relatif
    return `${IMAGE_BASE_URL}/${imageUrl}`;
  };

  const handleImageError = (e) => {
    console.log('❌ Image failed:', e.target.src);
    e.target.style.display = 'none';
  };

  useEffect(() => {
    dispatch(fetchAllProduct());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Package className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucun produit disponible</h2>
          <p className="text-gray-600">Aucun produit n'a été trouvé pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center mb-4">
            <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500 animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Produits</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Découvrez notre sélection de produits de qualité
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-16">
          {products.map((product) => {
            const imageUrl = getImageUrl(product.img);
            
            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                {imageUrl && (
                  <div className="relative overflow-hidden bg-gray-100 aspect-square">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={handleImageError}
                      loading="lazy"
                    />

                    {product.type === "popular" && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        <span>Populaire</span>
                      </div>
                    )}

                    {product.discount && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        -{product.discount}%
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg transform hover:scale-110"
                        aria-label="Voir les détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-4 sm:p-5 flex flex-col flex-grow">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                    {product.name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                    {product.description || "Aucune description disponible"}
                  </p>

                  {product.rating && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      {product.reviewCount && (
                        <span className="text-xs text-gray-500">({product.reviewCount})</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl font-bold text-indigo-600">
                        {parseFloat(product.price).toFixed(2)} DT
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {parseFloat(product.originalPrice).toFixed(2)} DT
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => console.log('Ajouter au panier:', product.id)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      Ajouter au panier
                    </button>
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="w-full bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      Voir détails
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-10">
            Pourquoi nous choisir ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Haute Qualité</h3>
                <p className="text-sm sm:text-base text-gray-600">Produits testés et approuvés</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Truck className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Livraison Rapide</h3>
                <p className="text-sm sm:text-base text-gray-600">Expédition sous 24h en Tunisie</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:col-span-2 lg:col-span-1 justify-center">
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Headphones className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Support 24/7</h3>
                <p className="text-sm sm:text-base text-gray-600">Assistance dédiée et réactive</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {getImageUrl(selectedProduct.img) && (
              <div className="relative">
                <img
                  src={getImageUrl(selectedProduct.img)}
                  alt={selectedProduct.name}
                  className="w-full h-64 sm:h-80 object-cover"
                  onError={handleImageError}
                />
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-6 h-6 text-gray-900" />
                </button>
              </div>
            )}
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                {selectedProduct.name}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6">
                {selectedProduct.description || "Aucune description disponible"}
              </p>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-indigo-600">
                  {parseFloat(selectedProduct.price).toFixed(2)} DT
                </span>
                {selectedProduct.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    {parseFloat(selectedProduct.originalPrice).toFixed(2)} DT
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  console.log('Ajouter au panier:', selectedProduct.id);
                  setSelectedProduct(null);
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base sm:text-lg"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
























