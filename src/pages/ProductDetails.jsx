import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchProductById } from "../store/slices/product";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { 
  FaPlus, 
  FaMinus, 
  FaShoppingCart, 
  FaHeart,
  FaRegHeart,
  FaArrowLeft
} from "react-icons/fa";
import { enrichProductWithPromotion } from "../utils/promotionHelper";

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const { product = {}, loading, error } = useSelector((state) => state.product);
  const userProfile = useSelector((state) => state.auth?.user);
  const clientId = userProfile?.ID_client || userProfile?.id || localStorage.getItem("client_id");
  
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // État pour les données de promotion enrichies
  const [enrichedProduct, setEnrichedProduct] = useState(null);
  const [promotionLoading, setPromotionLoading] = useState(true);

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

  // ⭐ Nouveau: Enrichir automatiquement le produit avec les promotions
  useEffect(() => {
    const loadPromotionData = async () => {
      if (!product || !product.id) {
        setPromotionLoading(false);
        return;
      }

      try {
        setPromotionLoading(true);
        const enriched = await enrichProductWithPromotion(product, clientId);
        setEnrichedProduct(enriched);
      } catch (error) {
        console.error("Erreur lors du chargement des promotions:", error);
        setEnrichedProduct(product);
      } finally {
        setPromotionLoading(false);
      }
    };

    loadPromotionData();
  }, [product, clientId]);

  // Utiliser le produit enrichi ou le produit original
  const displayProduct = enrichedProduct || product;
  const hasPromotion = displayProduct.isPromotion && displayProduct.pivot;
  
  const basePrice = hasPromotion 
    ? parseFloat(displayProduct.pivot.original_price) 
    : parseFloat(displayProduct.price || 0);
  
  const unitPrice = hasPromotion 
    ? parseFloat(displayProduct.pivot.promo_price) 
    : basePrice;
  
  const totalPrice = (unitPrice * quantity).toFixed(3);
  
  const savings = hasPromotion 
    ? ((basePrice - unitPrice) * quantity).toFixed(3)
    : 0;
  
  const discountPercent = hasPromotion && displayProduct.pivot.discount_percent
    ? parseFloat(displayProduct.pivot.discount_percent).toFixed(0)
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

     const newItem = {
  id: displayProduct?.id,
  name: displayProduct?.name,
  img: displayProduct?.img,
  Initialprice: basePrice.toFixed(3),
  price: unitPrice.toFixed(3),
  total: totalPrice,
  quantity,
  isPromotion: hasPromotion,
  promo_name: hasPromotion ? displayProduct.promo_name : null,
  promo_id: hasPromotion ? displayProduct.promo_id : null  // ✅ S'assurer que c'est bien transmis
};

      const existingItemIndex = cart.findIndex((item) => item.id === newItem.id);

      if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += newItem.quantity;
        cart[existingItemIndex].total = (
          parseFloat(cart[existingItemIndex].total) + parseFloat(newItem.total)
        ).toFixed(3);
      } else {
        cart.push(newItem);
      }

      Cookies.set("cart", JSON.stringify(cart), { expires: 7 });
      setIsAdded(true);
      
      toast.success(hasPromotion 
        ? `Produit ajouté ! Économie : ${((basePrice - unitPrice) * quantity).toFixed(3)} DT`
        : "Produit ajouté au panier !");
      
      setTimeout(() => setIsAdded(false), 2000);
      setTimeout(() => navigate("/cart-shopping"), 1500);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'ajout au panier");
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Retiré des favoris" : "Ajouté aux favoris");
  };

  if (loading || promotionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-600">
            {loading ? "Chargement du produit..." : "Vérification des promotions..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !displayProduct || !displayProduct.id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">
            {error || "Produit introuvable"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 hover:text-blue-600"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header minimal */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="text-sm" />
            <span className="text-sm font-medium">Retour</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* IMAGE */}
          <div className="relative">
            {hasPromotion && (
              <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded">
                -{discountPercent}%
              </div>
            )}
            
            <button
              onClick={toggleFavorite}
              className="absolute top-0 right-0 p-2 hover:scale-110 transition-transform"
            >
              {isFavorite ? (
                <FaHeart className="text-red-500 text-xl" />
              ) : (
                <FaRegHeart className="text-gray-400 text-xl" />
              )}
            </button>

            <div className="bg-gray-50 rounded-lg aspect-square flex items-center justify-center">
              {getImageUrl(displayProduct.img) ? (
                <img
                  src={getImageUrl(displayProduct.img)}
                  alt={displayProduct.name}
                  className="w-full h-full object-contain p-8"
                  onError={handleImageError}
                />
              ) : (
                <span className="text-gray-300 text-4xl">📦</span>
              )}
            </div>
          </div>

          {/* INFOS */}
          <div className="flex flex-col">
            {/* Nom */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {displayProduct.name}
            </h1>

            {/* Description */}
            {displayProduct.description && (
              <p className="text-gray-600 mb-6 leading-relaxed">
                {displayProduct.description}
              </p>
            )}

            {/* Badge promo */}
            {hasPromotion && displayProduct.promo_name && (
              <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-medium mb-6 w-fit">
                <span>🏷️</span>
                <span>{displayProduct.promo_name}</span>
              </div>
            )}

            {/* Prix */}
            <div className="mb-8">
              {hasPromotion ? (
                <div>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-red-500">
                      {unitPrice.toFixed(3)} DT
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      {basePrice.toFixed(3)} DT
                    </span>
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    Économisez {(basePrice - unitPrice).toFixed(3)} DT
                  </p>
                </div>
              ) : (
                <span className="text-4xl font-bold text-gray-900">
                  {unitPrice.toFixed(3)} DT
                </span>
              )}
            </div>

            {/* Quantité */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quantité
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <FaMinus className="text-sm" />
                </button>
                <span className="text-xl font-semibold text-gray-900 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={incrementQuantity}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
                >
                  <FaPlus className="text-sm" />
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700">Total</span>
                <span className="text-3xl font-bold text-gray-900">
                  {totalPrice} DT
                </span>
              </div>
              {hasPromotion && savings > 0 && (
                <p className="text-sm text-green-600 font-medium mt-2 text-right">
                  Économie totale : {savings} DT
                </p>
              )}
            </div>

            {/* Bouton */}
            <button
              onClick={addToCartHandler}
              disabled={isAdded}
              className={`w-full py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
                isAdded
                  ? "bg-green-500 text-white cursor-not-allowed"
                  : hasPromotion
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              <FaShoppingCart />
              {isAdded ? "Ajouté !" : "Ajouter au panier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;