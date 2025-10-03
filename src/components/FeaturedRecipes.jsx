import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchFeaturedRecipes, selectFeaturedRecipes, selectRecipesLoading } from "../store/slices/recipes";

const FeaturedRecipes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const recipes = useSelector(selectFeaturedRecipes);
  const loading = useSelector(selectRecipesLoading);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    dispatch(fetchFeaturedRecipes());
  }, [dispatch]);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      return () => container.removeEventListener("scroll", checkScrollButtons);
    }
  }, [recipes]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      easy: "Facile",
      medium: "Moyen",
      hard: "Difficile"
    };
    return labels[difficulty] || "Facile";
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "bg-green-500",
      medium: "bg-yellow-500",
      hard: "bg-red-500"
    };
    return colors[difficulty] || "bg-green-500";
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/400x300?text=Recette";
    if (imagePath.startsWith('http')) return imagePath;
    return `https://storage.googleapis.com/tn360-asset/recipes/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Nos recettes du jour</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-360"></div>
        </div>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-8">
      {/* Header avec filtre Chef */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Nos recettes du jour</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors">
          <span className="text-xl">✕</span>
          <span className="font-medium">Chef</span>
        </button>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all"
            aria-label="Précédent"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {recipes.map((recipe, index) => (
            <div
              key={recipe.id}
              className="flex-shrink-0 w-[85%] md:w-[45%] lg:w-[30%] bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => navigate(`/recipe/${recipe.id}`)}
            >
              {/* Image avec badges */}
              <div className="relative h-48 bg-gray-200">
                <img
                  src={getImageUrl(recipe.img)}
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x300?text=Recette";
                  }}
                />
                
                {/* Badge numéro */}
                <div className="absolute top-4 left-4 w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  #{index + 1}
                </div>

                {/* Badge difficulté */}
                <div className={`absolute top-4 right-4 ${getDifficultyColor(recipe.difficulty)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                  {getDifficultyLabel(recipe.difficulty)}
                </div>
              </div>

              {/* Contenu */}
              <div className="p-4">
                {/* Titre */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                  {recipe.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {recipe.description || "Découvrez cette délicieuse recette"}
                </p>

                {/* Infos (temps et personnes) */}
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{recipe.prep_time || 45}min</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-medium">{recipe.servings || 4}</span>
                  </div>
                </div>

                {/* Bouton */}
                <button className="w-full bg-indigo-900 text-white py-3 rounded-xl font-semibold hover:bg-indigo-800 transition-colors flex items-center justify-center gap-2">
                  <span>Voir la recette</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-all"
            aria-label="Suivant"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default FeaturedRecipes;