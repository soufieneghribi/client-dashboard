import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllRecipes, selectAllRecipes, selectRecipesLoading, selectRecipesError } from "../store/slices/recipes";

const Recipes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const recipesData = useSelector(selectAllRecipes);
  const loading = useSelector(selectRecipesLoading);
  const error = useSelector(selectRecipesError);

  // 🔥 SÉCURITÉ: Gérer tous les cas possibles de retour API
  const recipes = React.useMemo(() => {
    // Si c'est déjà un tableau, l'utiliser
    if (Array.isArray(recipesData)) {
      return recipesData;
    }
    // Si c'est un objet avec une propriété data (structure commune)
    if (recipesData && typeof recipesData === 'object' && Array.isArray(recipesData.data)) {
      return recipesData.data;
    }
    // Si c'est un objet avec une propriété recipes
    if (recipesData && typeof recipesData === 'object' && Array.isArray(recipesData.recipes)) {
      return recipesData.recipes;
    }
    // Sinon, tableau vide par défaut
    return [];
  }, [recipesData]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const recipesPerPage = 12;

  useEffect(() => {
    dispatch(fetchAllRecipes());
  }, [dispatch]);

  // Debug: Afficher la structure des données
  useEffect(() => {
    if (recipes.length > 0) {




    }
  }, [recipes]);

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

  // Fonction améliorée pour récupérer l'URL de l'image
  const getImageUrl = (recipe) => {
    const imagePath = recipe.img || recipe.image || recipe.picture || recipe.thumbnail || recipe.photo;

    if (!imagePath) return "https://via.placeholder.com/400x300?text=Recette";
    if (imagePath.startsWith('http')) return imagePath;

    return `https://storage.googleapis.com/tn360-asset/recipes/${imagePath}`;
  };

  // Filtrage des recettes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || recipe.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
  const startIndex = (currentPage - 1) * recipesPerPage;
  const currentRecipes = filteredRecipes.slice(startIndex, startIndex + recipesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des recettes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchAllRecipes())}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <span className="text-6xl">👨‍🍳</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Recettes</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez notre collection de recettes délicieuses et faciles à réaliser
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Barre de recherche */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une recette..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filtre par difficulté */}
            <select
              value={difficultyFilter}
              onChange={(e) => {
                setDifficultyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="all">Toutes les difficultés</option>
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
            </select>
          </div>

          {/* Compteur de résultats */}
          <div className="mt-4 text-center text-gray-600">
            <span className="font-semibold">{filteredRecipes.length}</span> recette{filteredRecipes.length !== 1 ? 's' : ''} trouvée{filteredRecipes.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Grille de recettes */}
        {currentRecipes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Aucune recette trouvée
            </h3>
            <p className="text-gray-500">
              {recipes.length === 0
                ? "Aucune recette n'est disponible pour le moment"
                : "Essayez de modifier vos critères de recherche"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {currentRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={getImageUrl(recipe)}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x300?text=Recette";
                      }}
                      onLoad={() => {

                      }}
                    />

                    {/* Badge difficulté */}
                    <div className={`absolute top-3 right-3 ${getDifficultyColor(recipe.difficulty)} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                      {getDifficultyLabel(recipe.difficulty)}
                    </div>

                    {/* Image avec overlay */}
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      {/* Image principale */}
                      <img
                        src={getImageUrl(recipe)}
                        alt={recipe.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x300?text=Recette";
                        }}
                      />

                      {/* Badge difficulté */}
                      <div className={`absolute top-3 right-3 ${getDifficultyColor(recipe.difficulty)} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10`}>
                        {getDifficultyLabel(recipe.difficulty)}
                      </div>

                      {/* Overlay semi-transparent + bouton */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                          <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold">
                            Voir la recette
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                      {recipe.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {recipe.description || "Découvrez cette délicieuse recette"}
                    </p>

                    {/* Infos */}
                    <div className="flex items-center justify-between text-sm text-gray-700 border-t pt-3">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{recipe.prep_time || 45}min</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-medium">{recipe.servings || 4} pers.</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-md'
                    }`}
                >
                  Précédent
                </button>

                <div className="flex space-x-2">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                            }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-md'
                    }`}
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Recipes;
