import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchProductById } from "../store/slices/product";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { 
  FaPlus, 
  FaMinus, 
  FaStar, 
  FaShoppingCart, 
  FaShareAlt, 
  FaFacebook, 
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
  FaHeart,
  FaRegHeart,
  FaTruck,
  FaShieldAlt,
  FaUndo
} from "react-icons/fa";

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const { subId } = location.state || {};
  const { product = {}, loading, error } = useSelector((state) => state.product);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const IMAGE_BASE_URL = "https://tn360-lqd25ixbvq-ew.a.run.app/uploads";

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `${IMAGE_BASE_URL}/${imageUrl}`;
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  const totalPrice = ((product.price || 0) * quantity).toFixed(2);
  const isEligibleForDiscount = [2, 3].includes(Number(subId));
  const discountedPrice = isEligibleForDiscount
    ? (totalPrice * 0.9).toFixed(2)
    : totalPrice;
  const savings = isEligibleForDiscount 
    ? (totalPrice - discountedPrice).toFixed(2) 
    : 0;

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const addToCartHandler = () => {
    if (quantity <= 0) {
      toast.error("Veuillez ajouter une quantité valide.");
      return;
    }

    try {
      const cart = Cookies.get("cart") ? JSON.parse(Cookies.get("cart")) : [];
      
      const price = isEligibleForDiscount 
        ? (product.price * 0.9).toFixed(2) 
        : product.price;

      const newItem = {
        id: product?.id,
        name: product?.name,
        img: product?.img,
        initialPrice: product?.price,
        price: parseFloat(price),
        total: parseFloat(discountedPrice),
        quantity,
      };

      const existingItemIndex = cart.findIndex((item) => item.id === newItem.id);

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
      
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
      
      setTimeout(() => {
        navigate("/cart-shopping");
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Retiré des favoris" : "Ajouté aux favoris");
  };

  const shareOnSocialMedia = (platform) => {
    const productUrl = window.location.href;
    const productName = encodeURIComponent(product.name || "");
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${productUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${productUrl}&text=${productName}`,
      whatsapp: `https://wa.me/?text=${productName}%20${productUrl}`,
      instagram: productUrl
    };

    if (platform === "instagram") {
      toast.info("Copiez le lien pour le partager sur Instagram");
      navigator.clipboard.writeText(productUrl);
    } else {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
    
    setShowShareMenu(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-semibold text-lg">
            Erreur : {error}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!product || !product.id) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600 font-medium text-lg">
            Produit introuvable.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
        >
          <span>&larr;</span>
          <span>Retour</span>
        </button>

        <div className="relative mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-6 rounded-2xl shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
              {product.name}
            </h1>
            <p className="text-sm sm:text-base opacity-90">
              {product.description}
            </p>
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          <div className="relative bg-gray-50 rounded-xl overflow-hidden">
            {getImageUrl(product.img) && (
              <img
                src={getImageUrl(product.img)}
                alt={product.name}
                className="w-full h-64 sm:h-80 lg:h-96 object-contain"
                onError={handleImageError}
              />
            )}
            
            <button
              onClick={toggleFavorite}
              className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              {isFavorite ? (
                <FaHeart className="text-red-500 text-xl" />
              ) : (
                <FaRegHeart className="text-gray-600 text-xl" />
              )}
            </button>

            {isEligibleForDiscount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                -10% OFF
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Prix</h2>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-bold text-blue-600">
                  {discountedPrice} DT
                </span>
                {isEligibleForDiscount && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      {totalPrice} DT
                    </span>
                    <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      Économisez {savings} DT
                    </span>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Quantité
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="w-12 h-12 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <FaMinus className="text-gray-700" />
                </button>
                <span className="text-2xl font-bold text-gray-800 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={incrementQuantity}
                  className="w-12 h-12 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <FaPlus className="text-gray-700" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={addToCartHandler}
                disabled={isAdded}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                  isAdded
                    ? "bg-green-500 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl transform hover:scale-[1.02]"
                }`}
              >
                <FaShoppingCart className="text-xl" />
                {isAdded ? "Produit ajouté !" : "Ajouter au Panier"}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <FaShareAlt />
                  Partager ce produit
                </button>

                {showShareMenu && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl border-2 border-gray-100 p-4 z-10">
                    <div className="grid grid-cols-4 gap-3">
                      <button
                        onClick={() => shareOnSocialMedia("facebook")}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <FaFacebook className="text-white text-xl" />
                        </div>
                        <span className="text-xs font-medium">Facebook</span>
                      </button>
                      <button
                        onClick={() => shareOnSocialMedia("twitter")}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center">
                          <FaTwitter className="text-white text-xl" />
                        </div>
                        <span className="text-xs font-medium">Twitter</span>
                      </button>
                      <button
                        onClick={() => shareOnSocialMedia("instagram")}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-pink-50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <FaInstagram className="text-white text-xl" />
                        </div>
                        <span className="text-xs font-medium">Instagram</span>
                      </button>
                      <button
                        onClick={() => shareOnSocialMedia("whatsapp")}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <FaWhatsapp className="text-white text-xl" />
                        </div>
                        <span className="text-xs font-medium">WhatsApp</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetails;
























