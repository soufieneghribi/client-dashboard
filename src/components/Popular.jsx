// Popular.jsx — UI Premium (Bleu + Orange + Carousel Automatique)
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPopularWithPromotions,
  selectPopularProducts,
  selectPopularLoading,
  selectHasPromotions,
  selectPopularCache, // 🚀 Nouveau
} from "../store/slices/Popular";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
} from "react-bootstrap";
import { FaTag, FaStar, FaShoppingCart, FaHeart, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import WishlistButton from "./WishlistButton";
import { getImageUrl, handleImageError } from "../utils/imageHelper";

const Popular = ({ selectedUniverse = null }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const products = useSelector(selectPopularProducts);
  const cache = useSelector(selectPopularCache); // 🚀 Accès au cache
  const loading = useSelector(selectPopularLoading);
  const hasPromotions = useSelector(selectHasPromotions);

  // 🚀 Déterminer les produits à afficher : cache spécifique ou liste globale
  const displayProducts = useMemo(() => {
    if (cache && cache[selectedUniverse]) {
      return cache[selectedUniverse];
    }
    return products;
  }, [cache, products, selectedUniverse]);

  // 🚀 Ne montrer le loading/skeleton QUE si on n'a absolument rien à afficher pour cet univers
  const showLoading = loading && (!cache || !cache[selectedUniverse]);

  const { categories = [] } = useSelector((state) => state.categorie);

  const userProfile = useSelector((state) => state.auth?.user);
  const clientId =
    userProfile?.ID_client ||
    userProfile?.id ||
    localStorage.getItem("client_id");

  // Image URL Helper is now centralized
  const getProductImageUrl = (p) => getImageUrl(p, 'product');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 🚀 OPTIMISATION CRITIQUE: Réduire le debounce à 50ms au lieu de 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchPopularWithPromotions({ clientId, universeId: selectedUniverse }));
      setIsInitialLoad(false);
    }, 50); // 50ms au lieu de 300ms pour un chargement quasi-instantané

    return () => clearTimeout(timer);
  }, [dispatch, clientId, selectedUniverse]);

  useEffect(() => {
    const handleResize = () => setItemsPerSlide(getItemsPerSlide());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        displayProducts && displayProducts.length
          ? (prev + 1) % Math.ceil(displayProducts.length / itemsPerSlide)
          : 0
      );
    }, 4000); // Change slide every 4 seconds
    return () => clearInterval(interval);
  }, [products, itemsPerSlide]);

  function getItemsPerSlide() {
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 1024) return 3;
    return 6;
  }

  const handleImageError = (e) => {
    e.target.style.display = "none";
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, {
      state: {
        isPromotion: product.isPromotion,
        pivot: product.pivot,
        promo_name: product.promo_name,
      },
    });
  };

  const formatPrice = (price) => parseFloat(price).toFixed(3);

  const addToCartHandler = (product) => {
    const quantity = 1;
    let price, finalPrice;

    if (product.isPromotion && product.pivot) {
      price = parseFloat(product.pivot.original_price) || 0;
      finalPrice = parseFloat(product.pivot.promo_price) || 0;
    } else {
      price = parseFloat(product.price) || 0;
      finalPrice = price;
    }

    const total = (finalPrice * quantity).toFixed(3);
    const cart = Cookies.get("cart") ? JSON.parse(Cookies.get("cart")) : [];

    const catId = product.category_id || product.id_type;
    const currentCat = categories.find(c => c.id === parseInt(catId));
    const isElectronic = currentCat?.universe_id === 2 || currentCat?.id === 144 || currentCat?.parent_id === 144;

    const newItem = {
      id: product.id,
      name: product.name,
      Initialprice: price.toFixed(3),
      price: finalPrice.toFixed(3),
      total,
      quantity,
      isPromotion: product.isPromotion,
      promo_name: product.isPromotion ? product.promo_name : null,
      category_id: catId,
      isElectronic: isElectronic
    };

    const existingItemIndex = cart.findIndex((el) => el.id === newItem.id);
    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += newItem.quantity;
      cart[existingItemIndex].total = (
        parseFloat(cart[existingItemIndex].total) + parseFloat(newItem.total)
      ).toFixed(3);
    } else {
      cart.push(newItem);
    }

    Cookies.set("cart", JSON.stringify(cart), { expires: 7 });
    toast.success(`${product.name} ajouté au panier !`);
  };

  const slides = displayProducts.reduce((acc, product, i) => {
    const slideIndex = Math.floor(i / itemsPerSlide);
    if (!acc[slideIndex]) acc[slideIndex] = [];
    acc[slideIndex].push(product);
    return acc;
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // 🚀 Optimisation: Afficher un skeleton loader au lieu d'un spinner bloquant
  if (showLoading && isInitialLoad) {
    return (
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="skeleton" style={{ width: '200px', height: '30px', borderRadius: '8px' }}></div>
          <div className="skeleton" style={{ width: '100px', height: '35px', borderRadius: '20px' }}></div>
        </div>
        <Row className="g-2 g-md-3">
          {[...Array(6)].map((_, i) => (
            <Col key={i} xs={6} sm={4} md={3} lg={2}>
              <div className="skeleton" style={{ height: '250px', borderRadius: '12px' }}></div>
            </Col>
          ))}
        </Row>
      </Container>
    );
  }

  if (!displayProducts || displayProducts.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center py-5 bg-light rounded">
          <p className="text-muted">Aucun produit disponible pour le moment</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header avec icône */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2 rounded-lg" style={{
            background: '#F0F4F8',
            color: (selectedUniverse === 2 || !hasPromotions) ? '#4F46E5' : '#ef4444'
          }}>
            {(selectedUniverse === 2 || !hasPromotions) ? <FaStar size={20} /> : <FaTag size={20} />}
          </div>
          <div>
            <h3 className="fw-bold mb-0" style={{ color: "#0A1E3C", fontSize: '1.25rem' }}>
              {(selectedUniverse === 2 || !hasPromotions) ? "Articles suggérés" : "Promotions"}
            </h3>
            <p className="text-muted small mb-0">
              {(selectedUniverse === 2 || !hasPromotions) ? "Sélection personnalisée pour vous" : "Découvrez nos offres spéciales"}
            </p>
          </div>
        </div>

        {/* Bouton ou Badge */}
        {(selectedUniverse === 2 || !hasPromotions) ? (
          <div
            className="py-2 px-3 rounded-pill font-semibold text-white shadow-sm"
            style={{
              background: "#32357C",
              fontSize: "0.85rem",
            }}
          >
            Suggérés
          </div>
        ) : (
          <Button
            onClick={() => navigate("/promotions")}
            className="py-2 px-3 rounded-pill font-semibold text-white shadow-sm transition-all duration-300 transform hover:scale-105 border-0"
            style={{
              background: "#32357C",
              fontSize: "0.85rem",
            }}
          >
            Voir tout &gt;
          </Button>
        )}

      </div>

      {/* Carousel Produits */}
      <div className="position-relative">
        <div className="overflow-hidden">
          {slides.map((slide, index) => (
            <Row
              key={index}
              className={`g-2 g-md-3 transition-all duration-500 ${index === currentIndex ? "d-flex" : "d-none"
                }`}
            >
              {slide.map((product) => {
                const imageUrl = getImageUrl(product);
                return (
                  <Col key={product.id} xs={6} sm={4} md={3} lg={2}>
                    <Card
                      className="h-100 shadow-sm border-0 product-card card-transition gpu-accelerated"
                      onClick={() => handleProductClick(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="position-relative">
                        {imageUrl && (
                          <Card.Img
                            variant="top"
                            src={getProductImageUrl(product)}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            width="280"
                            height="280"
                            style={{
                              height: "150px",
                              width: "100%",
                              objectFit: "contain",
                              padding: "10px",
                            }}
                            onError={handleImageError}
                          />
                        )}

                        {/* Wishlist Button (Top Right Floating) */}
                        <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 10 }}>
                          <div
                            className="transition-all duration-300 hover:scale-110 bg-white/80 backdrop-blur-md shadow-sm rounded-full p-1 border border-white/50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <WishlistButton productId={product.id} size="small" />
                          </div>
                        </div>

                        {/* Badge promo (Top Left) */}
                        {product.isPromotion && product.pivot ? (
                          <div className="position-absolute top-0 start-0 m-2" style={{ zIndex: 10 }}>
                            <Badge className="badge-red shadow-sm" style={{ borderRadius: '6px', padding: '4px 8px' }}>
                              -{parseFloat(product.pivot.discount_percent).toFixed(0)}%
                            </Badge>
                          </div>
                        ) : null}
                      </div>

                      <Card.Body className="d-flex flex-column p-2">
                        <Card.Title
                          className="text-truncate mb-1 font-semibold text-gray-800"
                          title={product.name}
                          style={{ minHeight: "35px", fontSize: "0.85rem" }}
                        >
                          {product.name}
                        </Card.Title>

                        {/* Prix Area */}
                        <div className="mt-auto mb-2">
                          {product.isPromotion && product.pivot ? (
                            <div className="d-flex flex-column">
                              <span className="text-muted text-decoration-line-through" style={{ fontSize: '0.75rem' }}>
                                {formatPrice(product.pivot.original_price)} DT
                              </span>
                              <span className="fw-bold" style={{ color: "#ef4444", fontSize: '1rem' }}>
                                {formatPrice(product.pivot.promo_price)} DT
                              </span>
                            </div>
                          ) : (
                            <div className="fw-bold" style={{ color: "#f97316", fontSize: '1rem' }}>
                              {formatPrice(product.price)} DT
                            </div>
                          )}
                        </div>

                        {/* Actions Area (Friendly IHM) */}
                        <div className="d-flex gap-2">
                          <Button
                            onClick={(e) => { e.stopPropagation(); handleProductClick(product); }}
                            className="flex-grow-1 border-0 shadow-sm transition-all duration-300 hover:brightness-110 text-white"
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              borderRadius: '8px',
                              background: 'linear-gradient(90deg, #4F46E5, #6366F1)',
                              padding: '8px 0',
                            }}
                          >
                            Détails
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCartHandler(product);
                            }}
                            className="flex-shrink-0 shadow-sm transition-all duration-300 hover:scale-110 d-flex align-items-center justify-content-center"
                            style={{
                              borderRadius: '8px',
                              background: '#ffffff',
                              border: '1.5px solid #4F46E5',
                              width: '28px',
                              height: '28px',
                              padding: '0',
                              color: '#4F46E5'
                            }}
                            title="Ajouter au panier"
                          >
                            <i className="fa fa-shopping-cart" style={{ fontSize: '12px' }}></i>
                          </Button>
                        </div>

                        {/* Simulation Crédit */}
                        {(() => {
                          const catId = product.category_id || product.id_type;
                          const currentCat = categories.find(c => c.id === parseInt(catId));
                          const isElec = currentCat?.universe_id === 2 || currentCat?.id === 144 || currentCat?.parent_id === 144;
                          const price = product.isPromotion && product.pivot ? parseFloat(product.pivot.promo_price) : parseFloat(product.price);

                          if (isElec && price > 300) {
                            return (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="w-full mt-2 py-1 transition-all duration-300 hover:bg-blue-50"
                                style={{
                                  fontSize: "0.65rem",
                                  borderStyle: 'dashed',
                                  borderRadius: '8px',
                                  fontWeight: '700',
                                  color: '#4F46E5',
                                  borderColor: '#4F46E5'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/credit/simulation', { state: { product } });
                                }}
                              >
                                💰 SIMULER CRÉDIT
                              </Button>
                            );
                          }
                          return null;
                        })()}
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ))}
        </div>

        {/* Flèches carousel */}
        {slides.length > 1 && (
          <>
            <Button
              onClick={prevSlide}
              className="position-absolute top-50 start-0 translate-middle-y rounded-circle p-1 d-flex align-items-center justify-content-center"
              style={{ background: "transparent", border: "none", color: "#000" }}
            >
              &#10094;
            </Button>
            <Button
              onClick={nextSlide}
              className="position-absolute top-50 end-0 translate-middle-y rounded-circle p-1 d-flex align-items-center justify-content-center"
              style={{ background: "transparent", border: "none", color: "#000" }}
            >
              &#10095;
            </Button>
          </>
        )}
      </div>

      {/* Styles */}
      <style jsx>{`
        .product-card {
          border-radius: 12px;
          /* Utiliser les classes de performance.css au lieu de transition: all */
        }
        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.12);
        }

        .badge-red {
          background-color: #FF3B30 !important;
          color: #fff;
          font-size: 0.7rem;
          padding: 3px 6px;
        }
      `}</style>
    </Container >
  );
};

export default Popular;


