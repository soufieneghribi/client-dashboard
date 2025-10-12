import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchRecipeDetails, 
  selectCurrentRecipe, 
  selectRecipesLoading 
} from "../store/slices/recipes";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

/**
 * RecipeDetails Component
 * DISPLAYS detailed information about a recipe including ingredients,
 * instructions, and allows adding all ingredients to cart with adjustable servings
 * 
 * ✅ FIXED CALCULATION ISSUES
 * ✅ PROPER UNIT CONVERSION
 * ✅ CORRECT FIELD MAPPING
 */
const RecipeDetails = () => {
  // ==================== Hooks ====================
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // ==================== Redux State ====================
  const recipe = useSelector(selectCurrentRecipe);
  const loading = useSelector(selectRecipesLoading);
  
  // ==================== Local State ====================
  const [servings, setServings] = useState(6);
  const [isAdding, setIsAdding] = useState(false);

  // ==================== CONFIGURATION ====================
  const IMAGE_BASE_URL = "https://tn360-lqd25ixbvq-ew.a.run.app/uploads";

  // ==================== FIXED UNIT CONVERSION SYSTEM ====================
  
  /**
   * Calculate articles needed based on recipe quantity and unit
   * FIXED VERSION: Proper unit conversion and quantity calculation
   */
  const calculateArticleQuantityNeeded = useCallback((adjustedRecipeQuantity, unit, article) => {
    console.log('🔍 calculateArticleQuantityNeeded called:', {
      adjustedRecipeQuantity,
      unit,
      quantity_per_unit: article.quantity_per_unit,
      articleName: article.name
    });
    
    // Normalize unit to lowercase
    const normalizedUnit = (unit || '').toLowerCase().trim();
    
    // ✅ FIXED: Use correct field name from API - quantity_per_unit
    if (article.quantity_per_unit && parseFloat(article.quantity_per_unit) > 0) {
      const quantityPerUnit = parseFloat(article.quantity_per_unit);
      
      // Calculate how many articles are needed
      const articlesNeeded = adjustedRecipeQuantity / quantityPerUnit;
      const result = Math.ceil(articlesNeeded);
      
      console.log('✅ Using quantity_per_unit:', {
        calculation: `${adjustedRecipeQuantity} / ${quantityPerUnit} = ${articlesNeeded}`,
        rounded: result
      });
      
      return result;
    }
    
    console.log('⚠️ No quantity_per_unit, using fallback for unit:', normalizedUnit);
    
    // ✅ FIXED: Handle unit conversions properly
    switch (normalizedUnit) {
      case 'l':
      case 'litre':
      case 'litres':
        // Convert liters to ml
        return Math.ceil(adjustedRecipeQuantity * 1000);
        
      case 'kg':
      case 'kilogramme':
      case 'kilogrammes':
        // Convert kg to g
        return Math.ceil(adjustedRecipeQuantity * 1000);
        
      case 'ml':
      case 'millilitre':
      case 'millilitres':
      case 'g':
      case 'gramme':
      case 'grammes':
        // Direct quantity (already in base unit)
        return Math.ceil(adjustedRecipeQuantity);
        
      case 'piece':
      case 'pièce':
      case 'pièces':
      case 'unité':
      case 'unités':
      case 'unit':
      case 'units':
        // Already in units
        return Math.ceil(adjustedRecipeQuantity);
        
      default:
        // Default: round up the quantity
        return Math.ceil(adjustedRecipeQuantity);
    }
  }, []);

  /**
   * Format quantity for display
   */
  const formatQuantity = useCallback((quantity) => {
    if (quantity === 0) return "0";
    if (quantity < 1) return quantity.toFixed(2);
    if (quantity < 10) return quantity.toFixed(2);
    if (quantity < 100) return quantity.toFixed(1);
    return Math.round(quantity).toString();
  }, []);

  // ==================== IMAGE FUNCTIONS ====================
  
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    return `${IMAGE_BASE_URL}/${imageUrl}`;
  };

  const handleImageError = (e) => {
    console.log('❌ Image failed:', e.target.src);
    e.target.style.display = 'none';
  };

  // ==================== Effects ====================
  
  useEffect(() => {
    if (id) {
      dispatch(fetchRecipeDetails(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    const initialServings = recipe?.recipe?.servings || recipe?.servings;
    if (initialServings) {
      setServings(initialServings);
    }
  }, [recipe]);

  // ==================== FIXED CALCULATION FUNCTIONS ====================
  
  /**
   * Calculate adjusted recipe quantity based on selected servings
   */
  const getAdjustedRecipeQuantity = useCallback((article) => {
    const recipeServings = recipe?.recipe?.servings || recipe?.servings;
    if (!recipeServings) return 0;
    
    const adjustmentFactor = servings / recipeServings;
    // ✅ USE pivot.quantity (recipe quantity)
    const originalQuantity = parseFloat(article.pivot?.quantity || article.quantity || 0);
    
    return originalQuantity * adjustmentFactor;
  }, [recipe, servings]);

  /**
   * Calculate articles needed with unit conversion
   */
  const getArticlesNeeded = useCallback((article) => {
    const adjustedRecipeQuantity = getAdjustedRecipeQuantity(article);
    // ✅ USE pivot.unit for recipe unit
    const unit = article.pivot?.unit || article.unit;
    
    console.log('📦 getArticlesNeeded:', {
      articleName: article.name,
      adjustedRecipeQuantity,
      unit,
      quantity_per_unit: article.quantity_per_unit,
      pivot: article.pivot
    });
    
    const result = calculateArticleQuantityNeeded(adjustedRecipeQuantity, unit, article);
    
    console.log('📦 getArticlesNeeded result:', result);
    
    return result;
  }, [getAdjustedRecipeQuantity, calculateArticleQuantityNeeded]);

  /**
   * Calculate total price for all ingredients
   */
  const calculateTotalPrice = useMemo(() => {
    const articles = recipe?.recipe?.articles || recipe?.articles;
    if (!articles) return "0.00";
    
    const total = articles.reduce((sum, article) => {
      const articlesNeeded = getArticlesNeeded(article);
      const price = parseFloat(article.price || 0);
      return sum + (articlesNeeded * price);
    }, 0);
    
    return total.toFixed(2);
  }, [recipe, getArticlesNeeded]);

  // ==================== Handlers ====================
  
  const addRecipeToCart = useCallback(() => {
    const articles = recipe?.recipe?.articles || recipe?.articles;
    if (!articles?.length) {
      toast.error("Aucun ingrédient disponible pour cette recette");
      return;
    }

    setIsAdding(true);

    try {
      const cart = Cookies.get("cart") 
        ? JSON.parse(Cookies.get("cart")) 
        : [];
      
      let addedCount = 0;

      articles.forEach((article) => {
        const articlesNeeded = getArticlesNeeded(article);
        const price = parseFloat(article.price || 0);
        const total = (price * articlesNeeded).toFixed(2);

        const newItem = {
          id: article.id,
          name: article.name,
          img: article.img,
          initialPrice: price,
          price: price,
          total: parseFloat(total),
          quantity: articlesNeeded,
          fromRecipe: recipe.recipe?.name || recipe.name,
          recipeId: id
        };

        const existingItemIndex = cart.findIndex((item) => item.id === newItem.id);

        if (existingItemIndex !== -1) {
          cart[existingItemIndex].quantity += newItem.quantity;
          cart[existingItemIndex].total = parseFloat(
            (parseFloat(cart[existingItemIndex].total) + parseFloat(newItem.total)).toFixed(2)
          );
        } else {
          cart.push(newItem);
        }
        
        addedCount++;
      });

      Cookies.set("cart", JSON.stringify(cart), { expires: 7 });
      toast.success(`${addedCount} ingrédient(s) ajouté(s) au panier !`);
      
      setTimeout(() => {
        setIsAdding(false);
        navigate("/cart-shopping");
      }, 1500);

    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
      setIsAdding(false);
    }
  }, [recipe, getArticlesNeeded, id, navigate]);

  const adjustServings = useCallback((increment) => {
    setServings((prev) => {
      const newServings = increment ? prev + 1 : prev - 1;
      return Math.max(1, newServings);
    });
  }, []);

  // ==================== Rendering States ====================
  
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

  // ==================== Data Preparation ====================
  const recipeImageUrl = getImageUrl(recipe.img || recipe.recipe?.img);
  const totalPrice = calculateTotalPrice;
  const recipeName = recipe.recipe?.name || recipe.name;
  const recipeDescription = recipe.recipe?.description || recipe.description;
  const recipePrepTime = recipe.recipe?.prep_time || recipe.prep_time;
  const recipeInstructions = recipe.recipe?.instructions || recipe.instructions;
  const recipeServings = recipe.recipe?.servings || recipe.servings;
  const recipeArticles = recipe.recipe?.articles || recipe.articles;

  // ==================== Debug Info ====================
  console.log('🔍 RECIPE DEBUG:', {
    recipe,
    servings,
    recipeServings,
    totalPrice,
    articles: recipeArticles?.map(article => ({
      name: article.name,
      pivot: article.pivot,
      quantity_per_unit: article.quantity_per_unit,
      adjustedQuantity: getAdjustedRecipeQuantity(article),
      articlesNeeded: getArticlesNeeded(article)
    }))
  });

  // ==================== Render ====================
  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3 sm:py-6 sm:px-4 md:py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
        
        {/* Hero Image Section */}
        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96">
          {recipeImageUrl && (
            <img
              src={recipeImageUrl}
              alt={recipeName}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
          
          <button
            onClick={() => navigate(-1)}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white rounded-full p-1.5 sm:p-2 shadow-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Retour"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-blue-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
            {totalPrice} DT
          </div>

          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-purple-600 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {servings} portions
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-6">
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
            {recipeName}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6 text-gray-700">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm sm:text-base">
                <strong className="font-semibold">Temps:</strong> {recipePrepTime} min
              </span>
            </div>
          </div>

          <p className="text-gray-700 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
            {recipeDescription}
          </p>

          {/* Adjust Portions Section */}
          <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Ajuster les portions
              </h2>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <p className="text-sm text-gray-600">Nombre de portions:</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => adjustServings(false)}
                  disabled={servings <= 1}
                  className="w-10 h-10 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
                >
                  <span className="text-xl font-bold text-gray-700">−</span>
                </button>
                <span className="text-2xl font-bold text-blue-600 min-w-[3rem] text-center">
                  {servings}
                </span>
                <button
                  onClick={() => adjustServings(true)}
                  className="w-10 h-10 bg-white rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center shadow-md"
                >
                  <span className="text-xl font-bold text-gray-700">+</span>
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-100 p-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Les quantités et le prix seront ajustés automatiquement</span>
            </div>
          </div>

          {/* Ingrédients */}
          {recipeArticles && recipeArticles.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  <svg className="w-6 h-6 inline mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Ingrédients
                </h2>
                <div className="bg-purple-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-semibold text-purple-700">
                    {recipeArticles.length} ingrédient(s)
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
                <div className="space-y-3 sm:space-y-4">
                  {recipeArticles.map((article, index) => {
                    const adjustedRecipeQuantity = getAdjustedRecipeQuantity(article);
                    const articlesNeeded = getArticlesNeeded(article);
                    const originalQuantity = parseFloat(article.pivot?.quantity || article.quantity || 0);
                    const recipeUnit = article.pivot?.unit || article.unit || "ml";
                    const articlePrice = parseFloat(article.price || 0);
                    const itemTotal = (articlePrice * articlesNeeded).toFixed(2);
                    const imageUrl = getImageUrl(article.img);

                    return (
                      <div key={index} className="flex items-center gap-3 bg-white p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                        </div>
                        
                        {imageUrl && (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={imageUrl}
                              alt={article.name}
                              className="w-full h-full object-cover"
                              onError={handleImageError}
                              loading="lazy"
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                            {article.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Recette: {formatQuantity(adjustedRecipeQuantity)} {recipeUnit}
                            {servings !== recipeServings && (
                              <span className="text-xs text-gray-400 ml-1">
                                (original: {formatQuantity(originalQuantity)} {recipeUnit})
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-blue-600 font-medium">
                            Articles: {articlesNeeded} unité(s)
                          </p>
                          {/* Debug info */}
                          <p className="text-xs text-gray-400">
                            quantity_per_unit: {article.quantity_per_unit} | unit: {recipeUnit}
                          </p>
                        </div>

                        <div className="text-right ml-2 flex-shrink-0">
                          <p className="font-bold text-blue-600 text-sm sm:text-base whitespace-nowrap">
                            {itemTotal} DT
                          </p>
                          {articlesNeeded > 1 && (
                            <p className="text-xs text-gray-400">
                              {articlePrice.toFixed(2)} DT/u
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="sticky bottom-0 bg-white pt-4 pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 border-t">
            <button
              onClick={addRecipeToCart}
              disabled={isAdding || !recipeArticles || recipeArticles.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                isAdding
                  ? "bg-green-500 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl transform hover:scale-[1.02]"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {isAdding ? "Ajout en cours..." : `Ajouter au panier • ${totalPrice} DT`}
            </button>
          </div>

          {/* Instructions */}
          {(recipe.recipe?.instructions || recipe.instructions) && (
            <div className="mb-6 sm:mb-8 mt-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                <svg className="w-6 h-6 inline mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Instructions
              </h2>
              <div className="bg-orange-50 rounded-xl p-4 sm:p-5">
                <div className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {recipe.recipe?.instructions || recipe.instructions}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;