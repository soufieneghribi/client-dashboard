// Home.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../store/slices/categorie";
import { fetchRecommendedProduct } from "../store/slices/recommended";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import FeaturedRecipes from "../components/FeaturedRecipes";
import Banners from "../components/Banners";
import Popular from "../components/Popular";
import { Row, Col } from 'react-bootstrap';
import mydealsImg from '../assets/mydealsImg.png';
import recommnededImg from '../assets/recommnededImg.png';
import recettesImg from '../assets/images/recettes.jpg';

const Home = () => {
  const { categories = [], loading: categoriesLoading, error: categoriesError } = useSelector(
    (state) => state.categorie
  );
  
  // Add recommended products state - avec valeur par défaut de tableau
  const { recommended = [], loading: recommendedLoading, error: recommendedError } = useSelector(
    (state) => state.recommended || {}
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchRecommendedProduct());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => setItemsPerSlide(getItemsPerSlide());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function getItemsPerSlide() {
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 1024) return 3;
    return 5;
  }

  const filteredCategories = categories.filter(
    (category) => category.parent_id === 0 && category.id !== 1
  );

  const slides = filteredCategories.reduce((acc, cat, i) => {
    const slideIndex = Math.floor(i / itemsPerSlide);
    if (!acc[slideIndex]) acc[slideIndex] = [];
    acc[slideIndex].push(cat);
    return acc;
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleCategoryClick = (id, title) => {
    navigate('/categories', { 
      state: { 
        preselectedCategoryId: id,
        categoryTitle: title 
      } 
    });
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // S'assurer que recommended est toujours un tableau avant d'utiliser slice
  const safeRecommended = Array.isArray(recommended) ? recommended : [];
  const displayRecommended = safeRecommended.slice(0, 12);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-16">
        
        {/* 🔹 Section Bannières */}
        <Banners />

        {/* 🔹 Section Catégories */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Nos Catégories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez notre large sélection de produits organisés par catégories
            </p>
          </div>

          {categoriesLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : categoriesError ? (
            <div className="text-center py-8">
              <p className="text-red-500 bg-red-50 inline-block px-4 py-2 rounded-lg">
                Erreur lors du chargement des catégories
              </p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune catégorie disponible pour le moment</p>
            </div>
          ) : (
            <>
              {/* Carousel Container */}
              <div className="relative">
                <div className="overflow-hidden rounded-2xl">
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      className={`flex justify-center gap-4 transition-all duration-500 ease-in-out ${
                        index === currentIndex 
                          ? "opacity-100 block" 
                          : "opacity-0 hidden"
                      }`}
                    >
                      {slide.map((category) => (
                        <div
                          key={category.id}
                          className="relative h-36 sm:h-40 lg:h-44 flex-1 min-w-0 rounded-xl shadow-md overflow-hidden cursor-pointer group transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                          style={{
                            backgroundImage: `url(https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${category.picture})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                          onClick={() => handleCategoryClick(category.id, category.title)}
                        >
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300"></div>
                          
                          {/* Category title */}
                          <div className="absolute bottom-0 w-full bg-white/90 backdrop-blur-sm py-3 text-center group-hover:bg-white/95 transition-all duration-300">
                            <span className="text-sm md:text-base font-semibold text-gray-800 px-2">
                              {category.title.length > 14
                                ? category.title.slice(0, 14) + "..."
                                : category.title}
                            </span>
                          </div>

                          {/* Hover effect */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              Voir les produits
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                {slides.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                      aria-label="Slide précédent"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                      aria-label="Slide suivant"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Dots */}
              {slides.length > 1 && (
                <div className="flex justify-center mt-6 space-x-3">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                        currentIndex === idx 
                          ? "bg-blue-600 scale-125" 
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Aller au slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* 🔹 Mes Deals, Recettes & Catalogue - 3 CARTES */}
        <div>
          <Row className="mt-4 px-2 g-3">
            {/* Carte Mes Deals */}
            <Col xs={12} md={4}>
              <div
                className="position-relative border rounded-3 shadow h-40 bg-cover bg-center overflow-hidden cursor-pointer hover-scale transition-transform"
                style={{ backgroundImage: `url(${mydealsImg})`, height: '160px' }}
                onClick={() => navigate("/MesDeals")}
              >
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                  <span className="fs-5 fw-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>Mes Deals</span>
                </div>
              </div>
            </Col>

           <Col xs={12} md={4}>
  <div
    className="position-relative border rounded-3 shadow h-40 bg-cover bg-center overflow-hidden cursor-pointer hover-scale transition-transform"
    style={{ 
      backgroundImage: `url(${recettesImg})`,  // ← ICI utiliser l'image importée
      height: '160px' 
    }}
    onClick={() => navigate("/recipes")}
  >
    {/* Overlay sombre pour meilleure lisibilité */}
    <div className="position-absolute top-0 start-0 w-100 h-100 bg-black/30 hover:bg-black/20 transition-all duration-300"></div>
    
    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
      <span className="fs-5 fw-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
      </span>
    </div>
  </div>
</Col>

            {/* Carte Catalogue */}
            <Col xs={12} md={4}>
              <div
                className="position-relative border rounded-3 shadow h-40 bg-cover bg-center overflow-hidden cursor-pointer hover-scale transition-transform"
                style={{ backgroundImage: `url(${recommnededImg})`, height: '160px' }}
                onClick={() => navigate("/Catalogue")}
              >
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                  <span className="fs-5 fw-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>Catalogue</span>
                </div>
              </div>
            </Col>
          </Row>
        </div>


         {/* 🔹 Section Recettes en vedette */}
        <section className="pt-8 border-t border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Recettes en Vedette
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez nos délicieuses recettes et inspirations culinaires
            </p>
          </div>
          <FeaturedRecipes />
        </section>

        {/* 🔹 Section Articles Suggerés */}
        <section className="pt-8 border-t border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Articles Suggerés
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez nos sélections spéciales faites pour vous
            </p>
          </div>

          {recommendedLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : recommendedError ? (
            <div className="text-center py-8">
              <p className="text-red-500 bg-red-50 inline-block px-4 py-2 rounded-lg">
                Erreur lors du chargement des articles suggérés
              </p>
            </div>
          ) : displayRecommended.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun article suggéré disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayRecommended.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div 
                    className="h-32 bg-cover bg-center relative"
                    style={{
                      backgroundImage: `url(https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${product.picture})`
                    }}
                  >
                    {/* Badge promotionnel */}
                    {product.discount_price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        PROMO
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-800 text-sm mb-2 line-clamp-2 h-10">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-bold text-sm">
                        {product.price} TND
                      </span>
                      {product.discount_price && product.discount_price !== product.price && (
                        <span className="text-xs text-red-500 line-through">
                          {product.discount_price} TND
                        </span>
                      )}
                    </div>
                    {/* Bouton d'action */}
                    <button 
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product.id);
                      }}
                    >
                      Voir détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 🔹 Section Produits Populaires */}
        <section className="pt-8 border-t border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Produits Populaires
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Les produits les plus appréciés par nos clients
            </p>
          </div>
          <Popular />
        </section>

       

      </div>
    </div>
  );
};

export default Home;