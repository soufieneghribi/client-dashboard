import { useEffect, useState } from "react";
import { ShoppingCart, Eye, Star, Flame, Package, Truck, Headphones, X } from "lucide-react";

// Simulation de l'API
const getPopularProducts = async () => {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      id: 1,
      name: "Casque Audio Premium",
      description: "Casque sans fil avec réduction de bruit active et autonomie de 30h",
      price: 149.99,
      originalPrice: 199.99,
      discount: 25,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      rating: 4.5,
      reviewCount: 128
    },
    {
      id: 2,
      name: "Montre Connectée Sport",
      description: "Suivi d'activité, GPS intégré et étanche jusqu'à 50m",
      price: 299.99,
      originalPrice: 399.99,
      discount: 25,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      rating: 4.8,
      reviewCount: 256
    },
    {
      id: 3,
      name: "Sac à Dos Design",
      description: "Sac à dos moderne avec compartiment laptop et port USB",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      rating: 4.3,
      reviewCount: 89
    },
    {
      id: 4,
      name: "Lunettes de Soleil",
      description: "Protection UV400 avec monture légère et design élégant",
      price: 59.99,
      originalPrice: 89.99,
      discount: 33,
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
      rating: 4.6,
      reviewCount: 174
    },
    {
      id: 5,
      name: "Chaussures Running",
      description: "Semelle amortissante et respirante pour performances optimales",
      price: 129.99,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      rating: 4.7,
      reviewCount: 203
    },
    {
      id: 6,
      name: "Bouteille Isotherme",
      description: "Maintient la température pendant 24h, acier inoxydable",
      price: 34.99,
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
      rating: 4.4,
      reviewCount: 67
    }
  ];
};

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await getPopularProducts();
        setProducts(data);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError("Erreur lors du chargement des produits");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

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

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Package className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucun produit disponible</h2>
          <p className="text-gray-600">Aucun produit populaire n'a été trouvé pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* En-tête */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center mb-4">
            <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500 animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Produits <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Populaires</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Découvrez notre sélection des produits les plus appréciés par nos clients
          </p>
        </div>

        {/* Grille des produits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-16">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Image avec badge */}
              <div className="relative overflow-hidden bg-gray-100 aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='48'%3E📦%3C/text%3E%3C/svg%3E";
                  }}
                />
                
                {/* Badge Populaire */}
                <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  <span>Populaire</span>
                </div>

                {/* Badge Réduction */}
                {product.discount && (
                  <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    -{product.discount}%
                  </div>
                )}

                {/* Overlay avec actions rapides */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg transform hover:scale-110"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-4 sm:p-5 flex flex-col flex-grow">
                {/* Titre */}
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                  {product.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                  {product.description || "Aucune description disponible"}
                </p>

                {/* Évaluation */}
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
                    <span className="text-xs text-gray-500">({product.reviewCount})</span>
                  </div>
                )}

                {/* Prix */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-indigo-600">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Boutons d'action */}
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
          ))}
        </div>

        {/* Section avantages */}
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
                <p className="text-sm sm:text-base text-gray-600">Produits testés et approuvés par nos clients</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Truck className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Livraison Rapide</h3>
                <p className="text-sm sm:text-base text-gray-600">Expédition sous 24h partout en France</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:col-span-2 lg:col-span-1 justify-center">
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Headphones className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Support 24/7</h3>
                <p className="text-sm sm:text-base text-gray-600">Assistance client dédiée et réactive</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Détails Produit */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-64 sm:h-80 object-cover"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-900" />
              </button>
            </div>
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                {selectedProduct.name}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6">
                {selectedProduct.description}
              </p>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-indigo-600">
                  ${selectedProduct.price}
                </span>
                {selectedProduct.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    ${selectedProduct.originalPrice}
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