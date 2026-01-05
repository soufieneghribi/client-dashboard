import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { fetchProductById } from "../store/slices/product";

import Cookies from "js-cookie";
import {
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import { Breadcrumb, Container } from 'react-bootstrap';
import { enrichProductWithPromotion } from "../utils/promotionHelper";
import { getImageUrl, handleImageError } from "../utils/imageHelper";

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { product = {}, loading, error } = useSelector((state) => state.product);
  const { categories = [] } = useSelector((state) => state.categorie);
  const userProfile = useSelector((state) => state.auth?.user);
  const clientId = userProfile?.ID_client || userProfile?.id || localStorage.getItem("client_id");

  const subId = location.state?.subId || product?.category_id;

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [enrichedProduct, setEnrichedProduct] = useState(null);
  const [promotionLoading, setPromotionLoading] = useState(true);

  // Image URL Helper is now centralized
  const getProductImageUrl = (p) => getImageUrl(p, 'product');

  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [dispatch, id]);

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
      } catch (err) {
        setEnrichedProduct(product);
      } finally {
        setPromotionLoading(false);
      }
    };
    loadPromotionData();
  }, [product, clientId]);

  const breadcrumbData = useMemo(() => {
    if (!product || !categories.length) return { parent: null, sub: null };
    const currentSub = categories.find(cat => cat.id === parseInt(subId || product.category_id));
    if (!currentSub) return { parent: null, sub: null };
    const parent = categories.find(cat => cat.id === currentSub.parent_id);
    return { parent, sub: currentSub };
  }, [product, categories, subId]);

  const displayProduct = enrichedProduct || product;
  const hasPromotion = displayProduct.isPromotion && displayProduct.pivot;
  const basePrice = hasPromotion ? parseFloat(displayProduct.pivot.original_price) : parseFloat(displayProduct.price || 0);
  const unitPrice = hasPromotion ? parseFloat(displayProduct.pivot.promo_price) : basePrice;
  const totalPrice = (unitPrice * quantity).toFixed(3);
  const savings = hasPromotion ? ((basePrice - unitPrice) * quantity).toFixed(3) : 0;
  const discountPercent = hasPromotion ? parseFloat(displayProduct.pivot.discount_percent).toFixed(0) : 0;

  const addToCartHandler = () => {
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
      };
      const existingIdx = cart.findIndex((item) => item.id === newItem.id);
      if (existingIdx !== -1) {
        cart[existingIdx].quantity += newItem.quantity;
        cart[existingIdx].total = (parseFloat(cart[existingIdx].total) + parseFloat(newItem.total)).toFixed(3);
      } else cart.push(newItem);
      Cookies.set("cart", JSON.stringify(cart), { expires: 7 });
      setIsAdded(true);
      // 
      setTimeout(() => navigate("/cart-shopping"), 1500);
    } catch (err) {
      // 
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // 
  };

  if (loading || promotionLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 mx-auto"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 border-b">
        <Container className="max-w-6xl py-3">
          <Breadcrumb className="mb-0">
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Accueil</Breadcrumb.Item>
            {breadcrumbData.parent && (
              <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/categories?categoryId=${breadcrumbData.parent.id}` }}>
                {breadcrumbData.parent.title}
              </Breadcrumb.Item>
            )}
            {breadcrumbData.sub && (
              <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/products", state: { subId: breadcrumbData.sub.id, subTitle: breadcrumbData.sub.title } }}>
                {breadcrumbData.sub.title}
              </Breadcrumb.Item>
            )}
            <Breadcrumb.Item active className="text-truncate" style={{ maxWidth: '200px' }}>
              {displayProduct.name}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Container>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="relative">
            {hasPromotion && <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded">-{discountPercent}%</div>}

            <button
              onClick={toggleFavorite}
              className="absolute top-0 right-0 p-2 hover:scale-110 transition-transform z-10"
            >
              {isFavorite ? (
                <FaHeart className="text-red-500 text-xl" />
              ) : (
                <FaRegHeart className="text-gray-400 text-xl" />
              )}
            </button>

            <div className="bg-gray-50 rounded-lg aspect-square flex items-center justify-center">
              <img src={getProductImageUrl(displayProduct)} alt={displayProduct.name} className="w-full h-full object-contain p-8" onError={handleImageError} />
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{displayProduct.name}</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">{displayProduct.description}</p>
            {hasPromotion && <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-medium mb-6 w-fit">🏷️ {displayProduct.promo_name}</div>}

            <div className="mb-8">
              {hasPromotion ? (
                <div>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-red-500">{unitPrice.toFixed(3)} DT</span>
                    <span className="text-xl text-gray-400 line-through">{basePrice.toFixed(3)} DT</span>
                  </div>
                </div>
              ) : <span className="text-4xl font-bold text-gray-900">{unitPrice.toFixed(3)} DT</span>}
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">Quantité</label>
              <div className="flex items-center gap-4">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 border rounded-lg flex items-center justify-center">-</button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 border rounded-lg flex items-center justify-center">+</button>
              </div>
            </div>

            <div className="border-t pt-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total</span>
                <span className="text-3xl font-bold">{totalPrice} DT</span>
              </div>
            </div>

            <button onClick={addToCartHandler} disabled={isAdded} className={`w-full py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 ${isAdded ? "bg-green-500 text-white" : "bg-blue-500 text-white hover:bg-blue-600"}`}>
              <FaShoppingCart /> {isAdded ? "Ajouté !" : "Ajouter au panier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;


