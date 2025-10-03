import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecipeDetails, selectCurrentRecipe, selectRecipesLoading } from "../store/slices/recipes";

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const recipe = useSelector(selectCurrentRecipe);
  const loading = useSelector(selectRecipesLoading);

  useEffect(() => {
    dispatch(fetchRecipeDetails(id));
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-360"></div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-600">Recette non trouvée</p>
      </div>
    );
  }

  // Récupérer l'URL de l'image depuis les données de la recette
  const recipeImageUrl = recipe.img || recipe.recipe?.img;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Image */}
        <div className="relative h-64 md:h-96">
          <img
            src={recipeImageUrl || "https://via.placeholder.com/800x400?text=Recette"}
            alt={recipe.recipe?.name || recipe.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/800x400?text=Recette";
            }}
          />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{recipe.recipe?.name || recipe.name}</h1>
          
          {/* Infos */}
          <div className="flex flex-wrap gap-6 mb-6 text-gray-700">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Temps:</strong> {recipe.recipe?.prep_time || recipe.prep_time} min</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span><strong>Personnes:</strong> {recipe.servings || recipe.recipe?.servings}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-8">{recipe.recipe?.description || recipe.description}</p>

          {/* Ingrédients */}
          {recipe.articles && recipe.articles.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ingrédients</h2>
              <ul className="space-y-2">
                {recipe.articles.map((article, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <span className="w-2 h-2 bg-blue-360 rounded-full"></span>
                    <span>
                      {article.adjusted_quantity} {article.unit || ""} {article.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions */}
          {(recipe.recipe?.instructions || recipe.instructions) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Instructions</h2>
              <div className="text-gray-700 whitespace-pre-line">
                {recipe.recipe?.instructions || recipe.instructions}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;