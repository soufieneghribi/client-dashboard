import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../store/slices/categorie";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { enrichProductListWithPromotions } from "../utils/promotionHelper";  // ⭐ AJOUTÉ

/**
 * Categories Component - Carousel Automatique
 *  Défilement automatique
 * 
 * ⭐ MODIFICATIONS POUR LES PROMOTIONS:
 * Ce composant affiche les catégories. Quand l'utilisateur clique sur une sous-catégorie,
 * il est redirigé vers la page /products avec les produits de cette sous-catégorie.
 * 
 * IMPORTANT: Les promotions sont gérées dans la page Products.jsx (pas ici).
 * Dans Products.jsx, vous devez utiliser enrichProductListWithPromotions()
 * pour enrichir les produits avec leurs promotions actives.
 * 
 * Exemple d'intégration dans Products.jsx:
 * 
 * import { enrichProductListWithPromotions } from '../utils/promotionHelper';
 * 
 * useEffect(() => {
 *   const loadProducts = async () => {
 *     // 1. Récupérer les produits
 *     const response = await axios.get(`/api/products/category/${subId}`);
 *     const rawProducts = response.data.products;
 *     
 *     // 2. Enrichir avec les promotions
 *     const clientId = userProfile?.ID_client || localStorage.getItem("client_id");
 *     const enriched = await enrichProductListWithPromotions(rawProducts, clientId);
 *     
 *     // 3. Utiliser les produits enrichis
 *     setProducts(enriched);
 *   };
 *   loadProducts();
 * }, [subId, clientId]);
 */
const Categories = () => {
  const { categories = [], loading } = useSelector((state) => state.categorie);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // États Carousel Catégories
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());
  const [isPaused, setIsPaused] = useState(false);

  const getCategoryImageUrl = (picture) => {
    if (!picture) return "https://placehold.co/300x200?text=Catégorie";
    if (picture.startsWith('http')) return picture;
    return `https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${picture}`;
  };

  function getItemsPerSlide() {
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 1024) return 3;
    return 5;
  }

  // Charger les catégories
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Gérer le resize
  useEffect(() => {
    const handleResize = () => setItemsPerSlide(getItemsPerSlide());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. Déterminer la catégorie cible (URL > State)
  const targetCategoryId = useMemo(() => {
    const urlId = searchParams.get('categoryId');
    if (urlId) return parseInt(urlId);
    return location.state?.preselectedCategoryId || null;
  }, [searchParams, location.state]);

  // 2. Trouver la catégorie sélectionnée
  const selectedCategory = useMemo(() => {
    if (categories.length === 0) return null;
    if (targetCategoryId) {
      const found = categories.find(cat => cat.id === targetCategoryId);
      if (found) return found;
    }
    // Fallback: Si on vient de la home Electronique (via state.universe_id par exemple) 
    // ou si on détecte qu'on est dans une zone électronique
    const topLevel = categories.filter(cat => cat.parent_id === 0 && cat.id !== 1);
    return topLevel[0] || categories[0];
  }, [categories, targetCategoryId]);

  // 3. Déterminer les catégories à afficher dans le carousel (Isolation Univers)
  const carouselCategories = useMemo(() => {
    if (categories.length === 0 || !selectedCategory) return [];

    // Détecter l'univers (1: Epicerie, 2: Electronique)
    // Note: Dans votre DB, 144 est le root de l'électronique
    const isElectronic = selectedCategory.universe_id === 2 ||
      selectedCategory.id === 144 ||
      selectedCategory.parent_id === 144 ||
      (selectedCategory.parent_id !== 0 && categories.find(c => c.id === selectedCategory.parent_id)?.universe_id === 2);

    if (isElectronic) {
      // Pour l'électronique, on affiche toujours les catégories de niveau 2 (enfants de 144)
      // sauf si on est déjà dans un niveau plus profond
      if (selectedCategory.parent_id === 144 || selectedCategory.id === 144) {
        return categories.filter(cat => cat.parent_id === 144);
      }
      // Sinon, rester au niveau actuel
      return categories.filter(cat => cat.parent_id === selectedCategory.parent_id);
    }

    // Pour l'Épicerie (et autres)
    const siblings = categories.filter(cat =>
      cat.parent_id === selectedCategory.parent_id &&
      cat.universe_id === selectedCategory.universe_id
    );

    // Nettoyage IDs techniques si nécessaire
    return siblings.filter(cat => cat.id !== 1);
  }, [categories, selectedCategory]);

  // 4. Catégories affichées dans la grille inférieure (Enfants)
  const subCategories = useMemo(() => {
    if (!selectedCategory || categories.length === 0) return [];
    return categories.filter((cat) =>
      cat.id_parent === selectedCategory.id || cat.parent_id === selectedCategory.id
    );
  }, [categories, selectedCategory]);

  // 5. Calculer les slides pour le carousel
  const slides = useMemo(() => {
    if (carouselCategories.length === 0) return [];
    return carouselCategories.reduce((acc, cat, i) => {
      const slideIndex = Math.floor(i / itemsPerSlide);
      if (!acc[slideIndex]) acc[slideIndex] = [];
      acc[slideIndex].push(cat);
      return acc;
    }, []);
  }, [carouselCategories, itemsPerSlide]);

  // 🔥 Navigation manuelle
  const goToPrevSlide = (e) => {
    if (e) e.stopPropagation();
    setCurrentSlide((prev) => (prev <= 0 ? slides.length - 1 : prev - 1));
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  };

  const goToNextSlide = (e) => {
    if (e) e.stopPropagation();
    setCurrentSlide((prev) => (prev >= slides.length - 1 ? 0 : prev + 1));
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  };

  // 🔥 Synchroniser le slide initial seulement quand la sélection CHANGE
  useEffect(() => {
    if (selectedCategory && slides.length > 0) {
      const slideIndex = slides.findIndex(slide =>
        slide.some(cat => cat.id === selectedCategory.id)
      );
      if (slideIndex !== -1) {
        // On ne saute vers le slide que si la catégorie n'est pas déjà visible
        // Cela permet de naviguer manuellement sans être "ramené" en arrière
        const isCurrentlyVisible = slides[currentSlide]?.some(cat => cat.id === selectedCategory.id);
        if (!isCurrentlyVisible) {
          setCurrentSlide(slideIndex);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory?.id, slides.length]);
  // IMPORTANT: On ne dépend PAS de currentSlide ici pour éviter le blocage

  // 🔥 AUTO-PLAY CAROUSEL
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev >= slides.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  // 🔥 Gérer la sélection (Update URL)
  const handleCategorySelect = (category) => {
    setSearchParams({ categoryId: category.id.toString() }, { replace: true });
  };

  // 🔥 Navigation vers la page produits séparée
  const handleSubCategoryClick = (subCategory) => {
    navigate('/products', {
      state: {
        subId: subCategory.id,
        subTitle: subCategory.title
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Header - Simple Background */}
      <div className="bg-blue-600 text-white py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            🛍️ Découvrez Nos Produits
          </h1>
          <p className="text-blue-100">
            Explorez notre catalogue complet par catégories
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Section 1: Catégories (Carousel Automatique) */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                📦 Catégories Principales
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {carouselCategories.length} catégories disponibles
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Slide {currentSlide + 1} sur {slides.length}
            </div>
          </div>

          {/* Carousel - Pause au hover avec flèches de navigation */}
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Flèche Gauche */}
            {slides.length > 1 && (
              <button
                onClick={goToPrevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 -ml-4"
                aria-label="Slide précédent"
              >
                <FaChevronLeft className="text-xl" />
              </button>
            )}

            <div className="overflow-hidden rounded-xl">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`flex justify-center gap-4 transition-all duration-700 ease-in-out ${index === currentSlide
                    ? "opacity-100 transform translate-x-0"
                    : "opacity-0 transform translate-x-full absolute"
                    }`}
                >
                  {slide.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      className={`relative h-44 flex-1 rounded-2xl shadow-lg overflow-hidden cursor-pointer group transition-all duration-500 ease-out ${selectedCategory?.id === category.id
                        ? "ring-4 ring-blue-500 scale-105 shadow-2xl"
                        : "hover:scale-105 hover:shadow-xl"
                        }`}
                      style={{
                        backgroundImage: `url(${getCategoryImageUrl(category.picture)})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-300"></div>

                      {/* Badge de sélection */}
                      {selectedCategory?.id === category.id && (
                        <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-2.5 shadow-xl animate-pulse">
                          <FaCheckCircle className="text-xl" />
                        </div>
                      )}

                      {/* Nom de la catégorie */}
                      <div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-sm py-4 text-center group-hover:bg-white transition-all duration-300">
                        <span className="text-base font-bold text-gray-800 px-2">
                          {category.title}
                        </span>
                      </div>

                      {/* Overlay au hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                        <div className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          Sélectionner
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Flèche Droite */}
            {slides.length > 1 && (
              <button
                onClick={goToNextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 -mr-4"
                aria-label="Slide suivant"
              >
                <FaChevronRight className="text-xl" />
              </button>
            )}

            {/* Indicateurs de slides (points) */}
            {slides.length > 1 && (
              <div className="flex justify-center mt-6 space-x-3">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    className={`h-3 rounded-full transition-all duration-500 cursor-pointer ${currentSlide === idx
                      ? "bg-blue-600 w-8"
                      : "bg-gray-300 w-3 hover:bg-gray-400 hover:w-4"
                      }`}
                    onClick={() => setCurrentSlide(idx)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Sous-catégories - Navigation vers page produits */}
        {selectedCategory && subCategories.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  🏷️ {selectedCategory.title}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Cliquez sur une catégorie pour voir les produits
                </p>
              </div>
              <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                {subCategories.length} sous-catégories
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {subCategories.map((subCat) => (
                <div
                  key={subCat.id}
                  onClick={() => handleSubCategoryClick(subCat)}
                  className="group relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={getCategoryImageUrl(subCat.picture)}
                      alt={subCat.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/300x200?text=Image";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                    {/* Badge "Voir les produits" au hover */}
                    <div className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-3xl mb-2">🛒</div>
                        <p className="font-bold text-lg">Voir les produits</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 text-center">
                    <p className="font-bold text-sm text-gray-800 line-clamp-2">
                      {subCat.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message encourageant */}
        {selectedCategory && subCategories.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-gray-300 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Aucune sous-catégorie
            </h3>
            <p className="text-gray-500">
              Cette catégorie n'a pas de sous-catégories pour le moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;