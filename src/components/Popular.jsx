// Popular.jsx — UI Premium (Bleu + Orange + Carousel Automatique)
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPopularWithPromotions,
  selectPopularProducts,
  selectPopularLoading,
  selectHasPromotions,
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
import { FaTag, FaStar, FaShoppingCart, FaHeart } from "react-icons/fa";

import Cookies from "js-cookie";
import WishlistButton from "./WishlistButton";
import { getImageUrl, handleImageError } from "../utils/imageHelper";

const Popular = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const products = useSelector(selectPopularProducts);
  const loading = useSelector(selectPopularLoading);
  const hasPromotions = useSelector(selectHasPromotions);

  const userProfile = useSelector((state) => state.auth?.user);
  const clientId =
    userProfile?.ID_client ||
    userProfile?.id ||
    localStorage.getItem("client_id");

  // Image URL Helper is now centralized
  const getProductImageUrl = (p) => getImageUrl(p, 'product');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());

  useEffect(() => {
    dispatch(fetchPopularWithPromotions(clientId));
  }, [dispatch, clientId]);

  useEffect(() => {
    const handleResize = () => setItemsPerSlide(getItemsPerSlide());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        products && products.length
          ? (prev + 1) % Math.ceil(products.length / itemsPerSlide)
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

    const newItem = {
      id: product.id,
      name: product.name,
      Initialprice: price.toFixed(3),
      price: finalPrice.toFixed(3),
      total,
      quantity,
      isPromotion: product.isPromotion,
      promo_name: product.isPromotion ? product.promo_name : null,
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
  };

  const slides = products.reduce((acc, product, i) => {
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

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!products || products.length === 0) {
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
          {hasPromotions ? (
            <>

            </>
          ) : (
            <>
              <FaStar className="fs-2" style={{ color: "#FF9500" }} />
              <div>
                <h3 className="fw-bold mb-0" style={{ color: "#0A1E3C" }}>
                  Produits Populaires
                </h3>
                <p className="text-muted small mb-0">
                  Tendances & meilleures ventes
                </p>
              </div>
            </>
          )}
        </div>

        {/* Bouton Voir Plus */}
        <Button
          onClick={() => navigate("/promotions")}
          className="py-2 px-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          style={{
            background: "linear-gradient(90deg, #4F46E5, #6366F1)", // Indigo dégradé
            border: "none",
            fontSize: "0.9rem",
          }}
        >
          Voir Plus
        </Button>

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
                    <Card className="h-100 shadow-sm border-0 product-card">
                      <div className="position-relative">
                        {imageUrl && (
                          <Card.Img
                            variant="top"
                            src={getProductImageUrl(product)}
                            alt={product.name}
                            style={{
                              height: "150px",
                              objectFit: "contain",
                              padding: "10px",
                            }}
                            onError={handleImageError}
                          />
                        )}

                        {/* Wishlist & Cart Buttons */}
                        <div className="position-absolute top-0 end-0 m-1 d-flex gap-1">
                          <div style={{ transform: "scale(0.8)" }}>
                            <WishlistButton productId={product.id} size="small" />
                          </div>
                          <Button
                            variant=""
                            size="sm"
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            onClick={() => addToCartHandler(product)}
                            title="Ajouter au panier"
                            style={{
                              width: "28px",
                              height: "28px",
                              background: "#1E90FF",
                              color: "white",
                              border: "none",
                            }}
                          >
                            <FaShoppingCart size={14} />
                          </Button>
                        </div>

                        {/* Badge promo */}
                        {product.isPromotion && product.pivot ? (
                          <Badge className="position-absolute top-0 start-0 m-1 badge-red">
                            -{parseFloat(product.pivot.discount_percent).toFixed(0)}%
                          </Badge>


                        ) : (
                          <Badge
                            className="position-absolute top-0 start-0 m-1"
                            style={{
                              background: "#FF9500",
                              fontSize: "0.7rem",
                              padding: "3px 6px",
                            }}
                          >
                            <FaStar className="me-1" size={10} />
                            Top
                          </Badge>
                        )}
                      </div>

                      <Card.Body className="d-flex flex-column">
                        <Card.Title
                          className="text-truncate mb-1"
                          title={product.name}
                          style={{ minHeight: "35px", fontSize: "0.875rem" }}
                        >
                          {product.name}
                        </Card.Title>

                        {/* Prix */}
                        <div className="mt-auto text-center" style={{ fontSize: "0.875rem" }}>
                          {product.isPromotion && product.pivot ? (
                            <>
                              <div className="text-muted text-decoration-line-through small">
                                {formatPrice(product.pivot.original_price)} DT
                              </div>
                              <div className="fw-bold" style={{ color: "#FF3B30" }}>
                                {formatPrice(product.pivot.promo_price)} DT
                              </div>
                            </>
                          ) : (
                            <div className="fw-bold" style={{ color: "#FF9500" }}>
                              {formatPrice(product.price)} DT
                            </div>
                          )}
                        </div>

                        {/* Bouton Voir Détails */}
                        <Button
                          onClick={() => handleProductClick(product)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1 rounded-lg font-medium transition-colors mt-1"
                          style={{ border: "none", fontSize: "0.875rem" }}
                        >
                          Voir détails
                        </Button>
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
          transition: 0.25s ease;
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
    </Container>
  );
};

export default Popular;


