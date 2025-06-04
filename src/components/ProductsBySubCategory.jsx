import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchProduct } from '../store/slices/product';
import toast from "react-hot-toast";
import Cookies from "js-cookie";

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

  const handleDetails = (id, subId) => {
    navigate(`/product/${id}`, { state: { subId } });
  };

  const addToCartHandler = (product) => {
    const quantity = 1;
    const price = parseFloat(product.price) || 0;

    const discounted = [2, 3].includes(Number(subId));
    const finalPrice = discounted ? (price * 0.9).toFixed(2) : price.toFixed(2);
    const total = (finalPrice * quantity).toFixed(2);

    const cart = Cookies.get("cart") ? JSON.parse(Cookies.get("cart")) : [];

    const newItem = {
      id: product.id,
      name: product.name,
      Initialprice: price.toFixed(2),
      price: finalPrice,
      total,
      quantity,
    };

    const existingItemIndex = cart.findIndex((el) => el.id === newItem.id);

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += newItem.quantity;
      cart[existingItemIndex].total = (
        parseFloat(cart[existingItemIndex].total) + parseFloat(newItem.total)
      ).toFixed(2);
    } else {
      cart.push(newItem);
    }

    Cookies.set("cart", JSON.stringify(cart), { expires: 7 });
    toast.success("Produit ajouté au panier !");
    navigate("/cart-shopping");
  };

  if (loading) return <p>Chargement des données...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div>
      <nav className="text-orange-360 text-base hover:font-semibold p-2">
        <Link to="/">Accueil</Link>
        <i className=" fa-solid fa-chevron-right p-1"></i>
        <Link to={`/categories`}>Catégories</Link>
        <i className="fa-solid fa-chevron-right p-1"></i>
        <Link to={`/products`}>{subTitle}</Link>
      </nav>

      <div>
        <h1 className="text-blue-360 font-bold text-3xl mb-2">{subTitle}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-8 m-8">
          {currentProducts.map((product) => {
            const price = parseFloat(product.price) || 0;

            return (
              <div key={product.id} className="border rounded-xl p-1 shadow-xl hover:shadow-xl transition-all bg-white bg-opacity-60 hover:bg-opacity-100">
                <div className="flex justify-end">
                  <button onClick={() => addToCartHandler(product)} className='p-2 bg-green-100 hover:bg-green-200 rounded-full transition'>
                  <i className="fa fa-cart-plus text-xl text-green-600" aria-hidden="true"></i>
                  </button>
                </div>

                <img
                  src={`https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${product.img}`}
                  alt={product.name}
                  className="w-auto mx-auto h-20 sm:h-20 md:h-20 object-contain rounded-t-xl mb-2 duration-500"
                />
                <h1 className="text-center text-lg sm:text-base font-semibold text-gray-800">{product.name.length > 12 ?product.name.slice(0, 12) + "..." : product.name}</h1>

                {Number(subId) === 2 || Number(subId) === 3 ? (
                  <div className="flex flex-row m-2 justify-around">
                    <div className="text-orange-360 grid">
                      <i className="fa-regular fa-money-bill-1"></i>
                      <p className="font-base"><del>{price.toFixed(2)} dt</del></p>
                    </div>
                    <div className="text-green-600 grid">
                      <i className="fa-solid fa-tags"></i>
                      <span className="font-bold text-xl">10%</span>
                    </div>
                    <div className="text-orange-360 grid">
                      <i className="fa-regular fa-money-bill-1"></i>
                      <p className="font-bold text-lg">{(price * 0.9).toFixed(2)} dt</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-orange-360 flex justify-center">
                    <p className="text-base font-medium">Prix : {price.toFixed(2)} dt</p>
                  </div>
                )}

                <button
                  className="bg-blue-360 text-white text-center px-2 py-2 rounded hover:bg-blue-700 w-full mx-auto cursor-pointer"
                  onClick={() => handleDetails(product.id, subId)}
                >
                  Voir détails
                </button>
              </div>
            );
          })}
        </div>
        {product.length>0 && totalPages >1 ?(
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
        ) :("")}
      </div>
    </div>
  );
};

export default ProductsBySubCategory;
