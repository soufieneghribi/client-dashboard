import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProduct } from "../store/slices/product.js";
import { useNavigate } from "react-router-dom";

const Catalogue = () => {
  const { product = {}, loading, error } = useSelector((state) => state.product);
  const allProducts = product.products || [];
  const [showWheel, setShowWheel] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAllProduct());
  }, [dispatch]);

  const spinWheel = () => {
    if (spinning) return;

    setSpinning(true);
    const discounts = [5, 10, 15, 20, 25, 30, 50];
    const randomDiscount = discounts[Math.floor(Math.random() * discounts.length)];
    const randomIndex = discounts.indexOf(randomDiscount);
    const newRotation = 3600 + randomIndex * (360 / discounts.length);

    setRotation(newRotation);
    setTimeout(() => {
      setSpinning(false);
      setResult(randomDiscount);
      setShowWheel(false);
    }, 5000);
  };

  const totalPages = Math.ceil(allProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = allProducts.slice(startIndex, startIndex + productsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (loading) return <p>Chargement des produits...</p>;
  if (error) return <p>Erreur lors du chargement: {error}</p>;

  return (
    <div className="catalogue">
      <h1 className="text-blue-500 font-bold text-3xl m-10">Catalogue</h1>

      <div className="flex justify-end m-4">
        <button
          onClick={() => setShowWheel(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Joue pour une remise !
        </button>
      </div>

      {showWheel && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Tourne la roue pour gagner !</h2>
            <div
              className="relative border-4 border-gray-300 rounded-full"
              style={{
                width: "300px",
                height: "300px",
                background: `conic-gradient(
                  #ff9999 0 51.4deg,
                  #ffff99 51.4deg 102.8deg,
                  #99ff99 102.8deg 154.2deg,
                  #99ffff 154.2deg 205.6deg,
                  #9999ff 205.6deg 257deg,
                  #ff99ff 257deg 308.4deg,
                  #ffcc99 308.4deg 360deg
                )`,
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? "transform 5s cubic-bezier(0.33, 1, 0.68, 1)" : "none",
              }}
            >
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-8 border-b-red-600"></div>
              </div>
            </div>
            <button
              onClick={spinWheel}
              className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-700"
              disabled={spinning}
            >
              {spinning ? "En cours..." : "Tourner la roue"}
            </button>
            <button
              onClick={() => setShowWheel(false)}
              className="block mt-4 text-red-500 underline"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-4 text-xl text-green-600 font-bold text-center">
          🎉 Vous avez gagné : <span className="text-red-500">{result}% de réduction !</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-8">
        {currentProducts.map((product) => (
          <div
            key={product.id}
            className="border rounded-xl p-4 shadow hover:shadow-lg transition"
          >
            <img
              src={`https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${product.img}`}
              alt={product.name}
              className="w-full h-40 object-cover rounded-md"
            />
            <h3 className="text-center text-lg sm:text-base font-semibold text-gray-800 ">{product.name.length > 12 ?product.name.slice(0, 12) + "..." : product.name}</h3>
            {result ? (
              <p className="text-gray-600">
                Prix: <span className="font-normal center">${product.price}</span>
                <span className="text-red-500 ml-2">
                  ${(product.price * (1 - result / 100)).toFixed(2)}
                </span>
              </p>
            ) : (
              <p className="text-gray-600 font-medium text-center">Prix: ${product.price}</p>
            )}
            <button
              onClick={() => navigate(`/produit/${product.id}`)}
              className="bg-orange-360 text-white text-center px-2 py-2 rounded hover:bg-orange-500 w-full mx-auto cursor-pointer"
            >
              Voir Détails
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center space-x-4 mt-6">
        <button
          onClick={handlePrevPage}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={currentPage === 1}
        >
          Précédent
        </button>
        <span className="text-lg">
          Page {currentPage} sur {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 ${
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={currentPage === totalPages}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default Catalogue;
