import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchFeaturedRecipes, selectFeaturedRecipes, selectRecipesLoading } from "../store/slices/recipes";

const FeaturedRecipes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const recipes = useSelector(selectFeaturedRecipes);
  const loading = useSelector(selectRecipesLoading);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    dispatch(fetchFeaturedRecipes());
  }, [dispatch]);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      return () => container.removeEventListener("scroll", checkScrollButtons);
    }
  }, [recipes]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    }
  };

  const getDifficultyLabel = (difficulty) => ({ easy: "Facile", medium: "Moyen", hard: "Difficile" }[difficulty] || "Facile");
  const getDifficultyColor = (difficulty) => ({ easy: "bg-green-500", medium: "bg-yellow-500", hard: "bg-red-500" }[difficulty] || "bg-green-500");
  const getImageUrl = (img) => img ? (img.startsWith("http") ? img : `https://storage.googleapis.com/tn360-asset/recipes/${img}`) : "https://via.placeholder.com/400x300?text=Recette";

  if (loading) return (
    <div className="py-12 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (!recipes || recipes.length === 0) return null;

  return (
    <div className="px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Recettes du jour</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors">
          <span className="text-xl">✕</span>
          <span className="font-medium">Chef</span>
        </button>
      </div>

      {/* Carousel */}
      <div className="relative">
        {canScrollLeft && (
          <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow hover:bg-gray-100">
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div ref={scrollRef} className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide">
          {recipes.map((recipe, index) => (
            <div
              key={recipe.id}
              onClick={() => navigate(`/recipe/${recipe.id}`)}
              className="flex-shrink-0 w-[85%] sm:w-[45%] md:w-[30%] lg:w-[25%] bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow cursor-pointer flex flex-col"
            >
              {/* Image & badges */}
              <div className="relative h-48 w-full">
                <img
                  src={getImageUrl(recipe.img)}
                  alt={recipe.name}
                  className="w-full h-full object-cover rounded-t-2xl"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=Recette"; }}
                />
                {/* Badge difficulté */}
                <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-white text-xs font-semibold ${getDifficultyColor(recipe.difficulty)}`}>
                  {getDifficultyLabel(recipe.difficulty)}
                </span>
                {/* Badge numéro */}
                <span className="absolute top-2 left-2 w-10 h-10 bg-indigo-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  #{index + 1}
                </span>
              </div>

              {/* Contenu */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 line-clamp-2 mb-1">{recipe.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{recipe.description || "Découvrez cette délicieuse recette"}</p>

                <div className="flex justify-between items-center text-gray-700 text-sm mb-3">
                  {/* Temps */}
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{recipe.prep_time || 45} min</span>
                  </div>
                  {/* Personnes */}
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{recipe.servings || 4}</span>
                  </div>
                </div>

                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                  Voir la recette
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow hover:bg-gray-100">
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
