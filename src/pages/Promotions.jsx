import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { API_ENDPOINTS, getAuthHeaders, handleApiError } from "../services/api";

import {
  FaArrowLeft,
  FaSpinner,
  FaEye,
  FaCalendarAlt,
  FaTag,
  FaBoxOpen,
  FaShoppingCart
} from "react-icons/fa";
import { MdLocalOffer } from "react-icons/md";
import { fetchUserProfile } from "../store/slices/user";
import Cookies from "js-cookie";

const Promotions = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientInfo, setClientInfo] = useState(null);
  const [addingToCart, setAddingToCart] = useState({}); // Gestion des états de chargement par article
  const { Userprofile } = useSelector((state) => state.user);

  // Récupérer les promotions du client
  useEffect(() => {
    const fetchPromotions = async () => {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const clientId = storedUser?.ID_client;

      if (!token || !clientId) {
        // 
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          API_ENDPOINTS.PROMOTIONS.BY_CLIENT(clientId),
          {
            method: 'GET',
            headers: getAuthHeaders(token)
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setClientInfo(result.client);
          setPromotions(result.data || []);
        } else {
          setPromotions([]);
        }
      } catch (error) {
        const errorMessage = handleApiError(error);
        // 
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
    dispatch(fetchUserProfile());
  }, [navigate, dispatch]);

  // Fonction pour ajouter un article au panier
  const addToCart = (article, promotion) => {
    const token = localStorage.getItem("token");
    if (!token) {
      // 
      navigate("/login");
      return;
    }

    // Définir l'état de chargement pour cet article
    setAddingToCart(prev => ({ ...prev, [article.id]: true }));

    // Récupérer le panier actuel depuis les cookies
    const currentCart = Cookies.get("cart") ? JSON.parse(Cookies.get("cart")) : [];

    // Vérifier si l'article est déjà dans le panier
    const existingItemIndex = currentCart.findIndex(item => item.id === article.id);

    if (existingItemIndex !== -1) {
      // Article déjà dans le panier, augmenter la quantité
      currentCart[existingItemIndex].quantity += 1;
      currentCart[existingItemIndex].total = (
        parseFloat(currentCart[existingItemIndex].price === 0 ?
          currentCart[existingItemIndex].Initialprice :
          currentCart[existingItemIndex].price) *
        currentCart[existingItemIndex].quantity
      ).toFixed(2);

      // 
    } else {
      // Nouvel article à ajouter
      const cartItem = {
        id: article.id,
        name: article.name,
        price: parseFloat(article.pivot.promo_price),
        Initialprice: parseFloat(article.pivot.original_price),
        quantity: 1,
        total: parseFloat(article.pivot.promo_price).toFixed(2),
        img: article.img || "/default-product.png",
        isPromotion: true,
        promo_id: promotion.id,
        promo_name: promotion.name,
        discount_percent: article.pivot.discount_percent
      };

      currentCart.push(cartItem);
      // 
    }

    // Sauvegarder le panier mis à jour
    Cookies.set("cart", JSON.stringify(currentCart), { expires: 7 });

    // Simuler un délai pour l'effet visuel
    setTimeout(() => {
      setAddingToCart(prev => ({ ...prev, [article.id]: false }));

      // Afficher une notification de confirmation avec une coche
      const event = new CustomEvent('cartUpdated', {
        detail: { itemCount: currentCart.length }
      });
      window.dispatchEvent(event);
    }, 500);
  };

  const viewArticleDetails = (article, promotion) => {
    navigate(`/product/${article.id}`, {
      state: {
        isPromotion: true,
        pivot: {
          original_price: article.pivot.original_price,
          promo_price: article.pivot.promo_price,
          discount_percent: article.pivot.discount_percent
        },
        promo_name: promotion.name
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-500 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 px-2 sm:py-8 sm:px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-3 sm:mb-0"
            >
              <FaArrowLeft className="text-xl" />
              <span className="font-semibold">Retour</span>
            </button>

            {clientInfo && (
              <div className="text-right">
                <p className="text-xs sm:text-sm text-gray-600">Bienvenue,</p>
                <p className="text-base sm:text-lg font-bold text-gray-800">{clientInfo.nom_et_prenom}</p>
              </div>
            )}
          </div>

          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">🔥 Mes Promotions Exclusives</h1>
              <p className="text-sm text-gray-600">Profitez de vos offres personnalisées</p>
            </div>

            {Userprofile && (
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-xl w-full sm:w-auto text-center sm:text-right">
                <p className="text-xs text-blue-800 font-semibold">💰 Votre Cagnotte</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {parseFloat(Userprofile.cagnotte_balance || 0).toFixed(2)} DT
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Promotions */}
        {promotions.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <div className="text-6xl sm:text-8xl mb-6">📦</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Aucune promotion disponible
            </h2>
            <p className="text-gray-600 mb-6">
              Revenez bientôt pour découvrir nos nouvelles offres !
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl text-sm"
            >
              Retour à l'accueil
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {promotions.map((promotion) => (
              <div
                key={promotion.id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all border border-blue-100"
              >
                {/* Header Promotion */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 sm:p-5 text-white">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <MdLocalOffer className="text-xl sm:text-2xl" />
                        <h2 className="text-lg sm:text-xl font-bold">{promotion.name}</h2>
                      </div>
                      {promotion.description && (
                        <p className="text-blue-100 text-xs sm:text-sm">{promotion.description}</p>
                      )}
                    </div>

                    {promotion.discount_value && (
                      <div className="bg-white text-blue-600 px-3 py-1 rounded-full font-bold text-base shadow-lg">
                        -{promotion.discount_value}%
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-xs sm:text-sm text-blue-100 flex-wrap">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt />
                      <span>
                        Du {new Date(promotion.start_date).toLocaleDateString('fr-FR')}
                        {' '}au {new Date(promotion.end_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaBoxOpen />
                      <span>{promotion.articles?.length || 0} article{promotion.articles?.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Articles */}
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaTag className="text-blue-500" />
                    Articles en Promotion
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {promotion.articles && promotion.articles.map((article) => (
                      <div
                        key={article.id}
                        className="border border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all bg-white relative group"
                      >
                        {/* Bouton Ajouter au panier en haut à gauche - VERT */}
                        <div className="absolute top-2 left-2 z-10">
                          <button
                            onClick={() => addToCart(article, promotion)}
                            disabled={addingToCart[article.id]}
                            className={`flex items-center justify-center w-10 h-10 rounded-full text-xs font-semibold shadow-lg transition-all ${addingToCart[article.id]
                              ? 'bg-blue-400 text-white cursor-not-allowed'
                              : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white'
                              }`}
                            title="Ajouter au panier"
                          >
                            {addingToCart[article.id] ? (
                              <FaSpinner className="animate-spin text-sm" />
                            ) : (
                              <FaShoppingCart className="text-base" />
                            )}
                          </button>
                        </div>

                        <div className="relative mb-3">
                          <img
                            src={article.img}
                            alt={article.name}
                            className="w-full h-40 object-contain rounded-lg"
                          />
                          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                            -{article.pivot.discount_percent}%
                          </div>
                        </div>

                        <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base line-clamp-2 min-h-[3rem]">
                          {article.name}
                        </h4>

                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1 text-xs sm:text-sm">
                            <span className="text-gray-500 line-through">
                              {parseFloat(article.pivot.original_price).toFixed(2)} DT
                            </span>
                            <span className="text-green-600 font-semibold">
                              Économie: {(parseFloat(article.pivot.original_price) - parseFloat(article.pivot.promo_price)).toFixed(2)} DT
                            </span>
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-blue-600">
                            {parseFloat(article.pivot.promo_price).toFixed(2)} DT
                          </div>
                        </div>

                        <button
                          onClick={() => viewArticleDetails(article, promotion)}
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center justify-center gap-2"
                        >
                          <FaEye />
                          Voir détails
                        </button>
                      </div>
                    ))}
                  </div>

                  {promotion.articles && promotion.articles.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FaBoxOpen className="text-4xl sm:text-5xl mx-auto mb-3 text-gray-400" />
                      <p>Aucun article dans cette promotion</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Promotions;


