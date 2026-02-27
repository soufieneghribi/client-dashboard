import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRecipeDetails,
  selectCurrentRecipe,
  selectRecipesLoading
} from "../store/slices/recipes";
import Cookies from "js-cookie";

import { getImageUrl, handleImageError } from "../utils/imageHelper";

/**
 * RecipeDetails Component - Bootstrap Responsive Version
 * DISPLAYS detailed information about a recipe including ingredients,
 * instructions, and allows adding all ingredients to cart with adjustable servings
 * 
 * 
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
  // Image URL Helper is now centralized
  const getRecipeImageUrl = (r) => getImageUrl(r, 'product');

  // ==================== FIXED UNIT CONVERSION SYSTEM ====================

  /**
   * Calculate articles needed based on recipe quantity and unit
   * FIXED VERSION: Proper unit conversion and quantity calculation
   */
  const calculateArticleQuantityNeeded = useCallback((adjustedRecipeQuantity, unit, article) => {
    // Normalize unit to lowercase
    const normalizedUnit = (unit || '').toLowerCase().trim();

    // ✅ FIXED: Use correct field name from API - quantity_per_unit
    if (article.quantity_per_unit && parseFloat(article.quantity_per_unit) > 0) {
      const quantityPerUnit = parseFloat(article.quantity_per_unit);

      // Calculate how many articles are needed
      const articlesNeeded = adjustedRecipeQuantity / quantityPerUnit;
      const result = Math.ceil(articlesNeeded);

      return result;
    }

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

  // handleImageError is now imported from imageHelper

  // ==================== Effects ====================

  // ✅ FIXED: Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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

    const result = calculateArticleQuantityNeeded(adjustedRecipeQuantity, unit, article);

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
      // 
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
      // ajouté(s) au panier !`);

      setTimeout(() => {
        setIsAdding(false);
        navigate("/cart-shopping");
      }, 1500);

    } catch (error) {

      // 
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
      <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '4rem', height: '4rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center">
        <p className="text-secondary fs-5">Recette non trouvée</p>
      </div>
    );
  }

  // ==================== Data Preparation ====================
  const recipeImageUrl = getRecipeImageUrl(recipe.recipe || recipe);
  const totalPrice = calculateTotalPrice;
  const recipeName = recipe.recipe?.name || recipe.name;
  const recipeDescription = recipe.recipe?.description || recipe.description;
  const recipePrepTime = recipe.recipe?.prep_time || recipe.prep_time;
  const recipeInstructions = recipe.recipe?.instructions || recipe.instructions;
  const recipeServings = recipe.recipe?.servings || recipe.servings;
  const recipeArticles = recipe.recipe?.articles || recipe.articles;

  // ==================== Render ====================
  return (
    <div className="container-fluid bg-light min-vh-100 py-3 py-md-4 py-lg-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <div className="card shadow-lg border-0 rounded-3">

              {/* Hero Image Section */}
              <div className="position-relative" style={{ height: '250px' }}>
                {recipeImageUrl && (
                  <img
                    src={recipeImageUrl}
                    alt={recipeName}
                    className="w-100 h-100 rounded-top-3"
                    onError={handleImageError}
                    style={{ objectFit: 'cover' }}
                  />
                )}

                <button
                  onClick={() => navigate(-1)}
                  className="btn btn-light rounded-circle position-absolute top-0 start-0 m-3 shadow"
                  style={{ width: '40px', height: '40px', padding: '0' }}
                  aria-label="Retour"
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="position-absolute bottom-0 start-0 m-3">
                  <span className="badge bg-primary rounded-pill fs-6 fw-bold px-4 py-2 shadow">
                    {totalPrice} DT
                  </span>
                </div>

                <div className="position-absolute bottom-0 end-0 m-3">
                  <span className="badge rounded-pill fs-6 fw-bold px-3 py-2 shadow d-flex align-items-center gap-2" style={{ backgroundColor: '#7c3aed' }}>
                    <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {servings} portions
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="card-body p-3 p-md-4 p-lg-5">

                <h1 className="display-5 fw-bold text-dark mb-3 mb-md-4">
                  {recipeName}
                </h1>

                <div className="d-flex flex-column flex-sm-row flex-wrap gap-3 mb-4 text-secondary">
                  <div className="d-flex align-items-center gap-2">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      <strong className="fw-semibold">Temps:</strong> {recipePrepTime} min
                    </span>
                  </div>
                </div>

                <p className="text-secondary mb-4 mb-md-5 lh-base">
                  {recipeDescription}
                </p>

                {/* Adjust Portions Section */}
                <div className="card border-0 mb-4 mb-md-5" style={{ background: 'linear-gradient(to right, #dbeafe, #f3e8ff)' }}>
                  <div className="card-body p-3 p-md-4">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <h2 className="h5 fw-bold text-dark mb-0">
                        <svg width="24" height="24" className="me-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Ajuster les portions
                      </h2>
                    </div>

                    <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
                      <p className="small text-secondary mb-0">Nombre de portions:</p>
                      <div className="d-flex align-items-center gap-3">
                        <button
                          onClick={() => adjustServings(false)}
                          disabled={servings <= 1}
                          className="btn btn-light rounded-circle shadow-sm"
                          style={{ width: '40px', height: '40px', padding: '0' }}
                        >
                          <span className="fs-4 fw-bold">−</span>
                        </button>
                        <span className="fs-3 fw-bold text-primary" style={{ minWidth: '3rem', textAlign: 'center' }}>
                          {servings}
                        </span>
                        <button
                          onClick={() => adjustServings(true)}
                          className="btn btn-light rounded-circle shadow-sm"
                          style={{ width: '40px', height: '40px', padding: '0' }}
                        >
                          <span className="fs-4 fw-bold">+</span>
                        </button>
                      </div>
                    </div>


                  </div>
                </div>

                {/* Ingrédients */}
                {recipeArticles && recipeArticles.length > 0 && (
                  <div className="mb-4 mb-md-5">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h2 className="h4 fw-bold text-dark mb-0">
                        <svg width="24" height="24" className="me-2 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Ingrédients
                      </h2>
                      <span className="badge bg-light border rounded-pill px-3 py-2" style={{ color: '#7c3aed' }}>
                        {recipeArticles.length} ingrédient(s)
                      </span>
                    </div>

                    <div className="card border-0 bg-light">
                      <div className="card-body p-3 p-md-4">
                        <div className="d-flex flex-column gap-3">
                          {recipeArticles.map((article, index) => {
                            const adjustedRecipeQuantity = getAdjustedRecipeQuantity(article);
                            const articlesNeeded = getArticlesNeeded(article);
                            const originalQuantity = parseFloat(article.pivot?.quantity || article.quantity || 0);
                            const recipeUnit = article.pivot?.unit || article.unit || "ml";
                            const articlePrice = parseFloat(article.price || 0);
                            const itemTotal = (articlePrice * articlesNeeded).toFixed(2);
                            const imageUrl = getImageUrl(article.img);

                            return (
                              <div key={index} className="card border-0 shadow-sm">
                                <div className="card-body p-2 p-sm-3">
                                  <div className="row align-items-center g-2">
                                    {/* Number Badge */}
                                    <div className="col-auto">
                                      <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                        <span className="text-primary fw-bold small">{index + 1}</span>
                                      </div>
                                    </div>

                                    {/* Image */}
                                    {imageUrl && (
                                      <div className="col-auto">
                                        <img
                                          src={getRecipeImageUrl(article)}
                                          alt={article.name}
                                          className="rounded"
                                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                          onError={handleImageError}
                                          loading="lazy"
                                        />
                                      </div>
                                    )}

                                    {/* Content - Takes remaining space */}
                                    <div className="col">
                                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start">
                                        <div className="mb-2 mb-sm-0" style={{ flex: 1 }}>
                                          <p className="fw-semibold text-dark mb-1 fs-6">
                                            {article.name}
                                          </p>
                                          <p className="text-secondary mb-1" style={{ fontSize: '0.85rem' }}>
                                            Recette: {formatQuantity(adjustedRecipeQuantity)} {recipeUnit}
                                          </p>
                                          <p className="text-primary fw-medium mb-1" style={{ fontSize: '0.85rem' }}>
                                            Articles: {articlesNeeded} unité(s)
                                          </p>
                                        </div>

                                        {/* Price - Right aligned on desktop, below on mobile */}
                                        <div className="text-end text-sm-end ms-sm-3">
                                          <p className="fw-bold text-primary mb-0 fs-5">
                                            {itemTotal} DT
                                          </p>
                                          {articlesNeeded > 1 && (
                                            <p className="small text-muted mb-0">
                                              {articlePrice.toFixed(2)} DT/u
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <div className="sticky-bottom bg-white pt-3 pb-2 border-top mt-4">
                  <button
                    onClick={addRecipeToCart}
                    disabled={isAdding || !recipeArticles || recipeArticles.length === 0}
                    className={`btn w-100 py-2 rounded-2 fw-semibold d-flex align-items-center justify-content-center gap-2 ${isAdding ? "btn-success" : "btn-primary"
                      }`}
                    style={!isAdding ? { background: 'linear-gradient(to right, #2563eb, #7c3aed)', border: 'none' } : {}}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {isAdding ? "Ajout en cours..." : `Ajouter au panier • ${totalPrice} DT`}
                  </button>
                </div>

                {/* Instructions */}
                {recipeInstructions && (
                  <div className="mb-4 mt-5">
                    <h2 className="h4 fw-bold text-dark mb-3">
                      <svg width="24" height="24" className="me-2 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Instructions
                    </h2>
                    <div className="card border-0" style={{ backgroundColor: '#fff7ed' }}>
                      <div className="card-body p-3 p-md-4">
                        <div className="text-secondary lh-base" style={{ whiteSpace: 'pre-line' }}>
                          {recipeInstructions}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;


