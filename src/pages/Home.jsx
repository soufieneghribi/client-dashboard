import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../store/slices/categorie";
import { fetchRecommendedProduct } from "../store/slices/recommended";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import FeaturedRecipes from "../components/FeaturedRecipes";
import Banners from "../components/Banners";
import Popular from "../components/Popular";
import { Row, Col } from "react-bootstrap";

// 🔹 Images
import mydealsImg from "../assets/mydealsImg.png";
import recommnededImg from "../assets/recommnededImg.png";
import recettesImg from "../assets/images/Recettes2050.png";

// 🔹 Marques - Mise à jour des imports
import deliceImg from "../assets/delice.jpg";
import lilasImg from "../assets/lilas.jpg";
import nejmaImg from "../assets/nejma.jpg";
import jadidaImg from "../assets/jadida.jpg";
import natilaitImg from "../assets/natilait.jpg";
import sicamImg from "../assets/sicam.jpg";
import signalImg from "../assets/signal.jpg";
import KolyoumImg from "../assets/images/Kolyoum.png";
import MGJaimeImg from "../assets/images/mgjaime.jpg";

const Home = () => {
  const {
    categories = [],
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state) => state.categorie);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());
  const [brandIndex, setBrandIndex] = useState(0);
  const [brandsPerSlide, setBrandsPerSlide] = useState(getBrandsPerSlide());
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchRecommendedProduct());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(getItemsPerSlide());
      setBrandsPerSlide(getBrandsPerSlide());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        slides.length ? (prev + 1) % slides.length : 0
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [categories, itemsPerSlide]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setBrandIndex((prev) =>
        brandSlides.length ? (prev + 1) % brandSlides.length : 0
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, brandsPerSlide]);

  function getItemsPerSlide() {
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 1024) return 3;
    return 5;
  }

  function getBrandsPerSlide() {
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 768) return 3;
    if (window.innerWidth < 1024) return 4;
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

  const prevSlide = () =>
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () =>
    setCurrentIndex((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );

  const handleCategoryClick = (id, title) => {
    navigate("/categories", {
      state: { preselectedCategoryId: id, categoryTitle: title },
    });
  };

  // 🔹 Marques Data - Mise à jour avec les nouvelles images
  const brands = [
    { id: 1, img: deliceImg, name: "Délice" },
    { id: 2, img: lilasImg, name: "Lilas" },
    { id: 3, img: nejmaImg, name: "Nejma" },
    { id: 4, img: jadidaImg, name: "Jadida" },
    { id: 5, img: natilaitImg, name: "Natilait" },
    { id: 7, img: signalImg, name: "Signal" },
    { id: 8, img: KolyoumImg, name: "Kolyoum" },
    { id: 9, img: MGJaimeImg, name: "MG Jaime" },
  ];

  const brandSlides = brands.reduce((acc, brand, i) => {
    const slideIndex = Math.floor(i / brandsPerSlide);
    if (!acc[slideIndex]) acc[slideIndex] = [];
    acc[slideIndex].push(brand);
    return acc;
  }, []);

  const prevBrandSlide = () => {
    setBrandIndex((prev) => (prev === 0 ? brandSlides.length - 1 : prev - 1));
  };

  const nextBrandSlide = () => {
    setBrandIndex((prev) => (prev === brandSlides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-16">
        
        {/* 🔹 Bannières */}
        <Banners />

        {/* 🔹 Catégories */}
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
              <p className="text-gray-500">
                Aucune catégorie disponible pour le moment
              </p>
            </div>
          ) : (
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
                        onClick={() =>
                          handleCategoryClick(category.id, category.title)
                        }
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300"></div>
                        <div className="absolute bottom-0 w-full bg-white/90 backdrop-blur-sm py-3 text-center group-hover:bg-white/95 transition-all duration-300">
                          <span className="text-sm md:text-base font-semibold text-gray-800 px-2">
                            {category.title.length > 14
                              ? category.title.slice(0, 14) + "..."
                              : category.title}
                          </span>
                        </div>
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

              {slides.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        {/* 🔹 Produits Populaires */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Vos Promotions Exclusives
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Économisez avec nos meilleures offres
            </p>
          </div>
          <Popular />
        </section>

        {/* 🔹 Mes Deals, Recettes & Catalogue */}
        <div className="mt-8">
          <Row className="px-2 g-3">
            <Col xs={12} md={4}>
              <div
                className="position-relative border rounded-3 shadow h-40 bg-cover bg-center overflow-hidden cursor-pointer hover-scale transition-transform"
                style={{ backgroundImage: `url(${mydealsImg})`, height: "160px" }}
                onClick={() => navigate("/MesDeals")}
              >
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                  <span
                    className="fs-5 fw-bold text-white"
                    style={{
                      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    Mes Deals
                  </span>
                </div>
              </div>
            </Col>

            <Col xs={12} md={4}>
              <div
                className="position-relative border rounded-3 shadow h-40 bg-cover bg-center overflow-hidden cursor-pointer hover-scale transition-transform"
                style={{ backgroundImage: `url(${recettesImg})`, height: "160px" }}
                onClick={() => navigate("/recipes")}
              ></div>
            </Col>

            <Col xs={12} md={4}>
              <div
                className="position-relative border rounded-3 shadow h-40 bg-cover bg-center overflow-hidden cursor-pointer hover-scale transition-transform"
                style={{
                  backgroundImage: `url(${recommnededImg})`,
                  height: "160px",
                }}
                onClick={() => navigate("/Catalogue")}
              >
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                  <span
                    className="fs-5 fw-bold text-white"
                    style={{
                      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    Catalogue
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* 🔹 Recettes en vedette */}
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

        {/* 🔹 Carousel des Marques - Version améliorée sans fond blanc */}
        <section className="pt-14 border-t border-gray-200">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Nos Marques Partenaires
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Retrouvez vos marques préférées et découvrez des produits de qualité
            </p>
          </div>

          <div 
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Conteneur principal sans fond */}
            <div className="overflow-hidden">
              {brandSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`flex justify-center gap-4 md:gap-6 transition-all duration-500 ease-in-out ${
                    index === brandIndex
                      ? "opacity-100 block"
                      : "opacity-0 hidden"
                  }`}
                >
                  {slide.map((brand) => (
                    <div
                      key={brand.id}
                      className="relative h-44 flex-1 min-w-0 rounded-xl shadow-lg overflow-hidden cursor-pointer group transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    >
                      {/* Conteneur d'image avec fond transparent */}
                      <div className="absolute inset-0 flex items-center justify-center p-4 bg-transparent">
                        <img
                          src={brand.img}
                          alt={brand.name}
                          className="w-full h-full object-contain max-h-32 transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150x100?text=" + brand.name;
                          }}
                        />
                      </div>
                      
                      {/* Overlay au hover avec effet de fond */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Nom de la marque - visible au hover */}
                      <div className="absolute bottom-0 w-full py-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-gradient-to-t from-black/80 to-transparent pt-6 pb-2">
                          <span className="text-sm font-semibold text-white px-2">
                            {brand.name}
                          </span>
                        </div>
                      </div>
                      
                      {/* Effet de brillance */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Flèches de navigation */}
            {brandSlides.length > 1 && (
              <>
                <button
                  onClick={prevBrandSlide}
                  className="absolute left-0 md:left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-xl transition-all duration-200 hover:scale-110 z-10"
                  aria-label="Marques précédentes"
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextBrandSlide}
                  className="absolute right-0 md:right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-xl transition-all duration-200 hover:scale-110 z-10"
                  aria-label="Marques suivantes"
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Indicateurs de slides */}
            {brandSlides.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {brandSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setBrandIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      brandIndex === idx
                        ? ""
                        : ""
                    }`}
                    aria-label={`Aller au slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 italic">
              Partenaires de confiance pour des produits de qualité exceptionnelle
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;