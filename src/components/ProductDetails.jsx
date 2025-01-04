import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { fetchProductById } from "../store/slices/product.js";

const ProductDetails = () => {
  const location = useLocation();
  const { product = [], loading, error } = useSelector((state) => state.product);
  const [quantity, setQuantity] = useState(0); // Quantité par défaut à 0
  const dispatch = useDispatch();
  const {id} = useParams();
  const {subId} = location.state ||{} ;
  useEffect(() => {
    dispatch(fetchProductById(id));
    
  }, [dispatch, id]);

  // Gestion des états de chargement et d'erreur
  if (loading) {
    return <p>Chargement des données...</p>;
  }

  if (error) {
    return <p>Erreur : {error}</p>;
  }
 // Si le produit n'est pas trouvé
  if (!product) {
    return <p>Produit introuvable.</p>;
  }
 
  // Gestion de l'incrémentation/décrémentation de la quantité
  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 0) setQuantity((prev) => prev - 1);
  };

  // Calcul des prix et gains
  const totalPrice = quantity === 0 ? product.price :product.price * quantity;
  const discountedPrice =
    subId=== 2 || subId === 3 
      ? (totalPrice * 0.9).toFixed(2)
      : totalPrice;
  const gains =
    (subId === 2 || subId=== 3) && quantity > 0
      ? (product.price * 0.1 * quantity).toFixed(2)
      : null;
  // function Add to Cart Shopping , navgate to cart Shopping
  const addToCartHandler=(id , subId)=>{
    navigate(`/cart-shopping`,{state : {subId : subId}});
  }

  // Affichage du produit
  return (
    <>
      <nav className="flex flex-row justify-between mx-4 my-8">
        <div className="text-blue-360 flex flex-row justify-around font-medium">
          <div>
            <p>
              Livraison standard <br />
              Gratuite sous 3 à 6 jours ouvrés
            </p>
          </div>
          <div>
            <p>
              Express delivery <br />
              TND 10,00 available
            </p>
          </div>
        </div>
      </nav>

      <section
        id="product"
        className="grid grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-8 mx-8"
      >
        {/* Image du produit */}
        <div className="flex justify-center">
          <img
            src={product.img || "https://via.placeholder.com/150"}
            alt={product.name}
            className="max-w-sm rounded shadow"
          />
        </div>

        {/* Détails du produit */}
        <div className="p-4">
          
          <h1 className="text-blue-360 text-2xl font-bold mb-4">{product.name}</h1>
          <h2 className="text-orange-360 font-bold text-xl">Prix</h2>
          <div className="flex flex-row mb-4 items-start">
            {subId=== 2 || subId === 3 ? (
              <>
                <p>
                   
                  <del className="text-lg">{totalPrice}DT</del>
                </p>
                <p className="px-2 text-lg font-bold">{discountedPrice} DT</p>
              </>
            ) : (
              <p className="text-lg">{totalPrice} DT</p>
            )}
          </div>

          <h2 className="text-orange-360 font-bold text-xl">Quantité</h2>
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={decrementQuantity}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              -
            </button>
            <span className="text-xl">{quantity}</span>
            <button
              onClick={incrementQuantity}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              +
            </button>
          </div>

          <button className="mt-4 px-6 py-3 bg-orange-360 text-white rounded w-full" onClick={()=>{addToCartHandler(product.id , discountedPrice)}}>
            J'achète
          </button>
          {gains && (
            <p className="text-green-600 mt-4">
              Total des gains : {gains} DT
            </p>
          )}
        </div>
      </section>
    </>
  );
};

export default ProductDetails;
