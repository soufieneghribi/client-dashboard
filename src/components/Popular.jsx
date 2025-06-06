import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPopular } from '../store/slices/Popular';

const Popular = () => {
  const { popular = [], loading, error } = useSelector(state => state.popular);
  const products = popular.products || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();
console.log(popular)
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    dispatch(fetchPopular());
  }, [dispatch]);

  const productHandler = (id, type_id) => {
    navigate(`/product/${id}`, { state: { subId: type_id } });
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

  if (loading) return <p className="text-center text-gray-500">Loading popular products...</p>;
  if (error) return <p className="text-center text-red-500">Failed to load popular products. Please try again.</p>;

  return (
    <div className="w-full mx-auto px-2 py-1 ">
      <h1 className="text-center font-bold text-blue-360 mb-8 sm:text-lg md:text-xl lg:text-2xl">Populaire</h1>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-4 mb-8">
        {currentProducts?.map((product) => {
          const discountedPrice = (product.price * 0.9).toFixed(2); // Calculate discounted price

          return (
            <div key={product.id} className="transform hover:scale-105 transition duration-300 ease-in-out">
              <div className=" border rounded-xl p-1 shadow-xl hover:shadow-xl transition-all bg-white bg-opacity-60 hover:bg-opacity-100 ">
                {/* Image with fade-in effect */}
                <img
                  src={`https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${product.img}`}
                  alt={product.name}
                  className="w-auto mx-auto h-20 sm:h-20 md:h-20 object-contain rounded-t-xl mb-2 duration-500  "
                />
                <div className="text-center">
                  <h2 className="text-lg sm:text-base font-semibold text-gray-800">{product.name.length > 12 ?product.name.slice(0, 12) + "..." : product.name}</h2>
                  <p className="text-sm text-gray-500">Avec remise</p>
                </div>

                <div className="grid grid-cols-3 gap-2  mt-2">
                  <div className="flex flex-col justify-center items-center text-orange-360">
                    <i className="fa-regular fa-money-bill-1 px-1"></i>
                    <del className="font-normal sm:text-xs lg:text-base">{product.price}dt</del>
                  </div>

                  <div className="relative flex items-center justify-center top-0 left-0 bg-red-500 text-white text-xs rounded-full ">
                    -10%
                  </div>

                  <div className="flex flex-col justify-center items-center text-green-500 font-normal sm:text-xs lg:text-base">
                    <i className="fa-regular fa-money-bill-1 px-1"></i>
                    {discountedPrice}dt
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    className="w-full bg-blue-360 text-white py-2 rounded-lg hover:bg-blue-500 transition duration-200 transform hover:scale-105 shadow-md focus:outline-none sm:text-sm"
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
      <div className="flex justify-center space-x-4 mb-2">
        <button
          onClick={prevPage}
          className="px-3 py-2 sm:p-1 bg-blue-360 text-white text-xs sm:text-xs md:text-base  rounded-full hover:bg-blue-500 transition duration-300"
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
              className={`px-2 sm:px-3 sm:py-2  md:px-4 md:py-2  text-xs sm:text-xs md:text-base rounded-lg font-medium ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={nextPage}
          className="px-3 py-2 bg-blue-360 text-white text-xs sm:text-xs md:text-base  rounded-full hover:bg-blue-500 transition duration-300"
          disabled={currentPage === totalPages}
        >
          Next <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default Popular;
