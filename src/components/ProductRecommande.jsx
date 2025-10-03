import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecommendedProduct } from '../store/slices/recommended';
import { useNavigate } from 'react-router-dom';

const ProductRecommande = () => {
  const { recommended = [], loading, error } = useSelector((state) => state.recommended);
  const products = recommended.products || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    dispatch(fetchRecommendedProduct());
  }, [dispatch]);

  const productHandler = (id, type_id) => {
    navigate(`/product/${id}`, {
      state: { subId: type_id },
    });
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-360"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-8">
      <p className="text-red-500 bg-red-50 p-4 rounded-lg">Erreur de chargement des produits recommandés</p>
    </div>
  );

  return (
    <div className="w-full mx-auto px-4 py-6 bg-gray-50 rounded-2xl">
      {/* Header avec design moderne */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Produits Recommandés</h1>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-360 to-orange-360 mx-auto rounded-full"></div>
      </div>

      {/* Products Grid avec design carte */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {currentProducts?.map((product) => {
          const discountedPrice = (product.price * 0.9).toFixed(2);

          return (
            <div 
              key={product.id} 
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
            >
              {/* Badge promotion */}
              <div className="relative">
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                  -10%
                </div>
                <img
                  src={`https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${product.img}`}
                  alt={product.name}
                  className="w-full h-48 object-cover transition duration-500 hover:scale-105"
                  onError={(e) => {
                    e.target.src = "/default-image.jpg";
                  }}
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 h-14">
                  {product.name}
                </h2>
                
                {/* Prix */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 line-through">
                      {product.price} DT
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {discountedPrice} DT
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Économisez 10%
                  </div>
                </div>

                {/* Bouton */}
                <button
                  className="w-full bg-gradient-to-r from-blue-360 to-blue-500 text-white py-3 rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                  onClick={() => productHandler(product.id, product.type_id)}
                >
                  <i className="fa-solid fa-eye"></i>
                  Voir détails
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination améliorée */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-chevron-left text-sm"></i>
            Précédent
          </button>

          {/* Indicateur de page */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages}
            </span>
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            Suivant
            <i className="fa-solid fa-chevron-right text-sm"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductRecommande;