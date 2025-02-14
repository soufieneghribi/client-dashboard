import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchProductById } from "../store/slices/product";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { FaPlus, FaMinus, FaStar, FaShoppingCart, FaShareAlt, FaClock } from "react-icons/fa";  // Import FaClock here
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { subId } = location.state || {};

  const { product = {}, loading, error } = useSelector((state) => state.product);
  const [quantity, setQuantity] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [flashSaleTimeLeft, setFlashSaleTimeLeft] = useState(3600);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (flashSaleTimeLeft > 0) {
      const timer = setInterval(() => setFlashSaleTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [flashSaleTimeLeft]);

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 0) setQuantity((prev) => prev - 1);
  };

  const totalPrice = quantity === 0 ? product.price || 0 : ((product.price ) * quantity).toFixed(2);
  const isEligibleForDiscount = [2, 3].includes(Number(subId));
  const discountedPrice = isEligibleForDiscount
    ? (totalPrice * 0.9).toFixed(2)
    : totalPrice;

  const addToCartHandler = () => {
    if (quantity <= 0) {
      toast.error("Veuillez ajouter une quantité valide.");
      return;
    }

    const cart = Cookies.get("cart") ? JSON.parse(Cookies.get("cart")) : [];
    const price =
      subId === 2 || subId === 3 ? (product.price * 0.9).toFixed(2) : 0;
    const newItem = {
      id: product?.id,
      name: product?.name,
      Initialprice: product?.price,
      price:price,
      total: discountedPrice,
      quantity,
    };
console.log(newItem)
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
    setIsAdded(true);
    toast.success("Produit ajouté au panier !");
    navigate("/cart-shopping");
  };

 

  if (error) {
    return <p className="text-red-600 text-center">Erreur : {error}</p>;
  }

  if (!product) {
    return <p className="text-center text-gray-500">Produit introuvable.</p>;
  }

  return (
    <div className="container mx-auto my-8 px-4 py-8">
      {/* Hero Section with Gradient Background */}
      <div className="relative my-10 mb-4 bg-gradient-to-r from-blue-500 to-green-500 text-white py-12 px-6 rounded-lg shadow-xl">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
          <p className="text-lg">{product.description}</p>
        </div>
      </div>

      {/* Flash Sale Timer */}
      {flashSaleTimeLeft > 0 && (
        <div className="bg-red-500 text-white text-center py-3 rounded-md mb-6">
          <h2 className="text-xl font-semibold">Flash Sale! Hurry Up!</h2>
          <div className="flex justify-center items-center gap-2">
            <FaClock />
            <p className="font-bold">
              {Math.floor(flashSaleTimeLeft / 3600)}h :{" "}
              {Math.floor((flashSaleTimeLeft % 3600) / 60)}m :{" "}
              {flashSaleTimeLeft % 60}s
            </p>
          </div>
        </div>
      )}

      {/* Product Details Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Image Carousel */}
        <div className="flex justify-center">
         
              <div >
                <img
                  src={`https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${product.img}` }
                  alt={`${product.name}`}
                  className="max-w-full h-auto rounded-lg shadow-lg transition-transform transform hover:scale-105"
                />
              </div>
           
          
        </div>

        {/* Product Information */}
        <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="relative">
            {product.isNew && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                New
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-800 mb-4">Prix</h2>
            <div className="flex items-center gap-4 mb-4">
              {isEligibleForDiscount ? (
                <>
                  <p className="line-through text-gray-500">{totalPrice} DT</p>
                  <p className="text-xl font-bold text-blue-600">{discountedPrice} DT</p>
                </>
              ) : (
                <p className="text-xl font-bold text-blue-600">{totalPrice} DT</p>
              )}
            </div>

            {/* Quantity Selector */}
            <h3 className="text-lg text-orange-500 font-semibold mb-2">Quantité</h3>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={decrementQuantity}
                className="p-3 bg-gray-300 rounded-full hover:bg-gray-400 transition-transform"
              >
                <FaMinus />
              </button>
              <span className="text-lg font-semibold">{quantity}</span>
              <button
                onClick={incrementQuantity}
                className="p-3 bg-gray-300 rounded-full hover:bg-gray-400 transition-transform"
              >
                <FaPlus />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={addToCartHandler}
              className={`w-full bg-green-500 text-white py-3 rounded-md text-lg hover:bg-green-600 transition duration-300 ${isAdded && "bg-gray-500"}`}
              disabled={isAdded}
            >
              {isAdded ? (
                <>
                  <FaShoppingCart className="mr-2" />
                  Produit ajouté
                </>
              ) : (
                <>
                  <FaShoppingCart className="mr-2" />
                  Ajouter au Panier
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <div className="my-8 bg-gray-100 p-8 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Avis des clients</h2>
        <div className="flex gap-2 items-center mb-4">
          <div className="flex gap-1">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={`text-yellow-500 ${index < 4 ? "fill-current" : "text-gray-400"}`}
              />
            ))}
          </div>
          <span className="text-gray-500">4.0 (200 avis)</span>
        </div>
        <p className="text-gray-700">
          "Un produit incroyable! Je suis très satisfait de cet achat. La qualité est excellente!"
        </p>
      </div>

      {/* Share on Social Media */}
      <div className="flex gap-6 items-center justify-center mt-6">
        <button
          className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600"
          onClick={() => alert("Partager sur Facebook")}
        >
          <FaShareAlt />
        </button>
        <button
          className="bg-pink-500 text-white p-3 rounded-full hover:bg-pink-600"
          onClick={() => alert("Partager sur Instagram")}
        >
          <FaShareAlt />
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
