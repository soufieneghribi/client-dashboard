import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecommendedProduct } from '../store/slices/recommended';
import { useNavigate } from 'react-router-dom';

const ProductRecommande = () => {
  const { recommended = [], loading, error } = useSelector((state) => state.recommended);
  const products = recommended.products || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    dispatch(fetchRecommendedProduct());
  }, [dispatch]);

  const productHandler = (id, type_id) => {
    setShow(!show);
    navigate(`/product/${id}`, {
      state: { subId: type_id },
    });
  };

  
  // Calculate total pages
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // Slice products for the current page
  const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handle pagination
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

  if (loading) return <p className="text-center text-gray-500">Loading recommended products...</p>;
  if (error) return <p className="text-center text-red-500">Failed to load recommended products. Please try again.</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-blue-360 mb-8 text-center">Recommandé</h1>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
        {currentProducts?.map((product) => {
          const discountedPrice = (product.price * 0.9).toFixed(2); // Calculate discounted price

          return (
            <div key={product.id} className="transform hover:scale-105 transition duration-300 ease-in-out">
              <div className="border rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all bg-white bg-opacity-60 hover:bg-opacity-100 backdrop-blur-lg">
                {/* Image with fade-in effect */}
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-t-xl mb-4 transition-opacity duration-500 opacity-100 hover:opacity-75"
                />
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
                  <p className="text-sm text-gray-500">Avec remise</p>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="text-orange-360">
                    <i className="fa-regular fa-money-bill-1"></i>
                    <del className="font-medium text-lg">{product.price} DT</del>
                  </div>

                    <div className="relative flex items-center justify-center top-0 left-0 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      -10%
                    </div>
                   

                  <div className="text-orange-360">
                    <i className="fa-regular fa-money-bill-1"></i>
                    <p className="font-bold text-lg">{discountedPrice} DT</p>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    className="w-full bg-blue-360 text-white py-2 rounded-lg hover:bg-blue-500 transition duration-200 transform hover:scale-105 shadow-md focus:outline-none"
                    onClick={() => productHandler(product.id, product.type_id)}
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={prevPage}
          className="px-6 py-2 bg-blue-360 text-white rounded-full hover:bg-blue-500 transition duration-300"
          disabled={currentPage === 1}
        >
          <i className="fa-solid fa-chevron-left"></i> Previous
        </button>

        {/* Page Numbers */}
        <div className="flex space-x-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index + 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={nextPage}
          className="px-6 py-2 bg-blue-360 text-white rounded-full hover:bg-blue-500 transition duration-300"
          disabled={currentPage === totalPages}
        >
          Next <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default ProductRecommande;
