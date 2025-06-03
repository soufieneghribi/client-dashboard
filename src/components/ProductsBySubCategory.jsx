import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchProduct } from '../store/slices/product';

const ProductsBySubCategory = () => {
  const location = useLocation();
  const { product = {}, loading, error } = useSelector((state) => state.product);
  const allProducts = product.products || [];
  const dispatch = useDispatch();
  const { subId, subTitle } = location.state || {};
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (subId) {
      dispatch(fetchProduct(subId));
    }
  }, [dispatch, subId]);

  // Pagination logic
  const totalPages = Math.ceil(allProducts.length / itemsPerPage);
  const currentProducts = allProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  // Navigate to product details page
  const handleDetails = (id , subId) => {
    navigate(`/product/${id}`,{state : {subId : subId}});
  };

  if (loading) {
    return <p>Chargement des données...</p>;
  }

  if (error) {
    return <p>Erreur : {error}</p>;
  }

  return (
    <div>
      <nav className="text-orange-360 text-xl font-serif p-2">
        <Link to="/">Accueil</Link>
        <i className="fa-solid fa-chevron-right p-1"></i>
        <Link to={`/categories`}>Categories</Link>
        <i className="fa-solid fa-chevron-right p-1"></i>
        <Link to={`/products`}>{subTitle}</Link>
      </nav>

      <div>
        <h1 className=" text-blue-360 font-bold text-3xl mb-2">{subTitle}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8 m-8">
          {currentProducts.map((product) => {
            const price = parseFloat(product.price) || 0;  // Ensure price is a valid number

            return (
              <div
                key={product.id}
                className="border rounded-xl p-2 shadow hover:shadow-lg transition grid grid-cols-1"
              >
                <div>
                  <img
                    src={`https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${product.img}`}
                    alt={product.name}
                    className="w-auto h-auto"
                  />
                  <h1 className="text-lg font-semibold">{product.name}</h1>
                </div>
                {subId === 2 || subId === 3 ? (
                  <div>
                    <div className='flex flex-row m-2 justify-around'>
                      <div className="text-orange-360 grid"> 
                        <i className="fa-regular fa-money-bill-1"></i>
                        <p className="top-1/2 -my-1 font-medium text-lg">
                          <del>{price.toFixed(2)} dt</del>
                        </p>
                      </div>
                      <div className='text-green-600 grid'>
                        <i className="fa-solid fa-tags text-green-600"></i>
                        <span className='top-1/2 -my-1 font-bold text-xl'>10%</span>
                      </div>
                      <div className="text-orange-360 grid"> 
                        <i className="fa-regular fa-money-bill-1"></i> 
                        <p className="top-1/2 -my-1 font-bold text-lg">
                          {(price * 0.9).toFixed(2)} dt
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-orange-360 flex justify-center"> 
                    <p className="font-bold text-lg">Prix : {price.toFixed(2)} dt</p>
                  </div>
                )}
                <button
                  className="bg-blue-360 text-white text-center px-2 py-2 rounded hover:bg-blue-700 w-1/2 mx-auto cursor-pointer"
                  onClick={() => handleDetails(product.id, subId)}
                >
                  Voir détails
                </button>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center my-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-1 rounded bg-blue-360 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Précédent
          </button>
          {[...Array(totalPages).keys()].map((page) => (
            <button
              key={page}
              onClick={() => handlePageClick(page + 1)}
              className={`px-4 py-2 mx-1 rounded ${
                currentPage === page + 1
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {page + 1}
            </button>
          ))}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 rounded bg-blue-360 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsBySubCategory;
