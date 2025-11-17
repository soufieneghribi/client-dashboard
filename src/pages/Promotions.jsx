import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { API_ENDPOINTS, getAuthHeaders, handleApiError } from "../services/api";
import { toast } from "react-hot-toast";
import { 
  FaArrowLeft, 
  FaSpinner, 
  FaShoppingCart, 
  FaCalendarAlt,
  FaTag,
  FaBoxOpen,
  FaGift
} from "react-icons/fa";
import { MdLocalOffer } from "react-icons/md";
import { 
  fetchPromotionsByClient,
  fetchGifts,
  exchangeGift,
  setSelectedGift,
  selectGifts,
  selectGiftsLoading,
  selectExchangeLoading,
  selectSelectedGift
} from "../store/slices/promotions";
import { fetchUserProfile } from "../store/slices/user";

const Promotions = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientInfo, setClientInfo] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showArticlesModal, setShowArticlesModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('promotions'); // 'promotions' ou 'gifts'

  // Redux selectors
  const gifts = useSelector(selectGifts);
  const giftsLoading = useSelector(selectGiftsLoading);
  const exchangeLoading = useSelector(selectExchangeLoading);
  const selectedGift = useSelector(selectSelectedGift);
  const { Userprofile } = useSelector((state) => state.user);

  // Récupérer les promotions du client
  useEffect(() => {
    const fetchPromotions = async () => {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const clientId = storedUser?.ID_client;

      if (!token || !clientId) {
        toast.error("Veuillez vous connecter pour voir vos promotions");
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
        console.error('Erreur chargement promotions:', error);
        const errorMessage = handleApiError(error);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
    
    // Charger le profil utilisateur et les cadeaux
    dispatch(fetchUserProfile());
    dispatch(fetchGifts());
  }, [navigate, dispatch]);

  // Ajouter un article au panier
  const addToCart = (article, promoPrice) => {
    const cartItem = {
      id: article.id,
      name: article.name,
      price: parseFloat(promoPrice),
      original_price: parseFloat(article.price),
      img: article.img,
      quantity: 1,
      is_promo: true
    };

    // Récupérer le panier existant
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Vérifier si l'article existe déjà
    const existingItemIndex = existingCart.findIndex(item => item.id === article.id);
    
    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += 1;
      toast.success(`Quantité mise à jour pour ${article.name}`);
    } else {
      existingCart.push(cartItem);
      toast.success(`${article.name} ajouté au panier !`);
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
  };

  // Afficher les détails d'une promotion
  const viewPromotionDetails = (promotion) => {
    setSelectedPromotion(promotion);
    setShowArticlesModal(true);
  };

  // Calculer le nombre total d'articles
  const getTotalArticles = () => {
    return promotions.reduce((total, promo) => {
      return total + (promo.articles?.length || 0);
    }, 0);
  };

  // Ouvrir le modal d'échange de cadeau
  const openExchangeModal = (gift) => {
    const cagnotteBalance = parseFloat(Userprofile?.cagnotte_balance || 0);
    const giftCost = parseFloat(gift.cagnotte_cost || 0);
    
    if (cagnotteBalance < giftCost) {
      toast.error('Solde de cagnotte insuffisant pour ce cadeau');
      return;
    }
    
    dispatch(setSelectedGift(gift));
    setShowExchangeModal(true);
  };

  // Confirmer l'échange de cadeau
  const handleExchangeGift = async () => {
    if (!selectedGift || !Userprofile?.ID_client) {
      toast.error("Erreur lors de l'échange");
      return;
    }

    try {
      await dispatch(exchangeGift({
        giftId: selectedGift.id,
        clientId: Userprofile.ID_client
      })).unwrap();
      
      // Fermer le modal et rafraîchir le profil
      setShowExchangeModal(false);
      dispatch(setSelectedGift(null));
      dispatch(fetchUserProfile());
      
    } catch (error) {
      console.error("Erreur échange cadeau:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-orange-500 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <FaArrowLeft className="text-xl" />
              <span className="font-semibold">Retour</span>
            </button>
            
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <MdLocalOffer className="text-orange-500 text-2xl" />
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                  Promotions & Cadeaux
                </h1>
              </div>
              {clientInfo && (
                <p className="text-gray-600">
                  Bienvenue <span className="font-semibold text-orange-600">{clientInfo.nom_et_prenom}</span>
                </p>
              )}
              {Userprofile && (
                <p className="text-sm text-purple-600 font-semibold mt-1">
                  💰 Cagnotte: {Userprofile.cagnotte_balance || 0} DT
                </p>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 mt-6 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('promotions')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                activeTab === 'promotions'
                  ? 'text-orange-600 border-b-4 border-orange-600 -mb-0.5'
                  : 'text-gray-500 hover:text-orange-500'
              }`}
            >
              <MdLocalOffer className="text-xl" />
              Mes Promotions
            </button>
            <button
              onClick={() => setActiveTab('gifts')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                activeTab === 'gifts'
                  ? 'text-purple-600 border-b-4 border-purple-600 -mb-0.5'
                  : 'text-gray-500 hover:text-purple-500'
              }`}
            >
              <FaGift className="text-xl" />
              Boutique Cadeaux
            </button>
          </div>
        </div>

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-6 rounded-xl shadow-lg">
                <p className="text-sm text-orange-800 font-semibold">Total Promotions</p>
                <p className="text-4xl font-bold text-orange-600 mt-2">{promotions.length}</p>
              </div>
              <div className="bg-gradient-to-r from-red-100 to-red-200 p-6 rounded-xl shadow-lg">
                <p className="text-sm text-red-800 font-semibold">Articles en Promo</p>
                <p className="text-4xl font-bold text-red-600 mt-2">{getTotalArticles()}</p>
              </div>
              <div className="bg-gradient-to-r from-pink-100 to-pink-200 p-6 rounded-xl shadow-lg">
                <p className="text-sm text-pink-800 font-semibold">Économies Potentielles</p>
                <p className="text-4xl font-bold text-pink-600 mt-2">
                  {promotions.reduce((total, promo) => {
                    return total + (promo.articles?.reduce((sum, art) => {
                      return sum + (parseFloat(art.pivot.original_price) - parseFloat(art.pivot.promo_price));
                    }, 0) || 0);
                  }, 0).toFixed(2)} DT
                </p>
              </div>
            </div>

            {/* Liste des Promotions */}
            {promotions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-8xl mb-6">📦</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Aucune promotion disponible
                </h2>
                <p className="text-gray-600 mb-6">
                  Revenez bientôt pour découvrir nos nouvelles offres !
                </p>
                <button
                  onClick={() => navigate('/catalogue')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
                >
                  Retour au Catalogue
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {promotions.map((promotion) => (
                  <div
                    key={promotion.id}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Header de la promotion */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <MdLocalOffer className="text-3xl" />
                            <h2 className="text-2xl font-bold">{promotion.name}</h2>
                          </div>
                          {promotion.description && (
                            <p className="text-orange-100 mt-2">{promotion.description}</p>
                          )}
                        </div>
                        {promotion.discount_value && (
                          <div className="bg-white text-red-600 px-4 py-2 rounded-full font-bold text-xl">
                            -{promotion.discount_value}%
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-4 text-sm text-orange-100">
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

                    {/* Articles de la promotion */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaShoppingCart className="text-orange-500" />
                        Articles en Promotion
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {promotion.articles && promotion.articles.map((article) => (
                          <div
                            key={article.id}
                            className="border-2 border-orange-200 rounded-xl p-4 hover:shadow-lg transition-all bg-gradient-to-br from-white to-orange-50 group"
                          >
                            {/* Image */}
                            <div className="relative mb-3">
                              <img
                                src={article.img}
                                alt={article.name}
                                className="w-full h-40 object-contain rounded-lg"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/200?text=Image';
                                }}
                              />
                              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                -{article.pivot.discount_percent}%
                              </div>
                            </div>

                            {/* Nom */}
                            <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">
                              {article.name}
                            </h4>

                            {/* Prix */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-500 text-sm line-through">
                                  {parseFloat(article.pivot.original_price).toFixed(2)} DT
                                </span>
                                <span className="text-green-600 text-xs font-semibold">
                                  Économie: {(parseFloat(article.pivot.original_price) - parseFloat(article.pivot.promo_price)).toFixed(2)} DT
                                </span>
                              </div>
                              <div className="text-2xl font-bold text-orange-600">
                                {parseFloat(article.pivot.promo_price).toFixed(2)} DT
                              </div>
                            </div>

                            {/* Bouton Ajouter au panier */}
                            <button
                              onClick={() => addToCart(article, article.pivot.promo_price)}
                              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                            >
                              <FaShoppingCart />
                              Ajouter au panier
                            </button>
                          </div>
                        ))}
                      </div>

                      {promotion.articles && promotion.articles.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <FaBoxOpen className="text-5xl mx-auto mb-3 text-gray-400" />
                          <p>Aucun article dans cette promotion</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Boutique Cadeaux Tab */}
        {activeTab === 'gifts' && (
          <div>
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-4">
                <FaGift className="text-5xl text-purple-600" />
                <div>
                  <h3 className="text-2xl font-bold text-purple-800 mb-2">
                    🎁 Échangez votre cagnotte contre des cadeaux !
                  </h3>
                  <p className="text-purple-700">
                    Utilisez vos points de cagnotte pour obtenir des cadeaux exclusifs et des réductions spéciales.
                  </p>
                  <p className="text-purple-600 font-semibold mt-2">
                    Votre solde actuel: {Userprofile?.cagnotte_balance || 0} DT
                  </p>
                </div>
              </div>
            </div>

            {/* Liste des cadeaux */}
            {giftsLoading ? (
              <div className="text-center py-20">
                <FaSpinner className="animate-spin text-6xl text-purple-500 mx-auto mb-4" />
                <p className="text-xl text-gray-600">Chargement des cadeaux...</p>
              </div>
            ) : gifts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <FaGift className="text-8xl mx-auto mb-6 text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Aucun cadeau disponible pour le moment
                </h2>
                <p className="text-gray-600">
                  Revenez bientôt pour découvrir nos nouveaux cadeaux !
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {gifts.map((gift) => {
                  const cagnotteBalance = parseFloat(Userprofile?.cagnotte_balance || 0);
                  const giftCost = parseFloat(gift.cagnotte_cost || 0);
                  const canAfford = cagnotteBalance >= giftCost;

                  return (
                    <div
                      key={gift.id}
                      className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
                        canAfford ? 'border-2 border-purple-300' : 'border-2 border-gray-200'
                      }`}
                    >
                      {/* Image du cadeau */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={gift.image_url || 'https://via.placeholder.com/300x200?text=Cadeau'}
                          alt={gift.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=Cadeau';
                          }}
                        />
                        {!canAfford && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            🔒 Insuffisant
                          </div>
                        )}
                        {canAfford && (
                          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            ✓ Disponible
                          </div>
                        )}
                      </div>

                      {/* Informations du cadeau */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 min-h-[3.5rem] line-clamp-2">
                          {gift.name}
                        </h3>
                        
                        {gift.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                            {gift.description}
                          </p>
                        )}

                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-800 font-semibold">💰 Prix</span>
                            <span className="text-2xl font-bold text-purple-600">
                              {giftCost} DT
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => openExchangeModal(gift)}
                          disabled={!canAfford}
                          className={`w-full py-3 rounded-xl font-bold transition-all ${
                            canAfford
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-lg'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? '🎁 Échanger' : '🔒 Cagnotte insuffisante'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmation d'échange */}
      {showExchangeModal && selectedGift && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">🎁 Confirmer l'échange</h2>
                <button
                  onClick={() => {
                    setShowExchangeModal(false);
                    dispatch(setSelectedGift(null));
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Image du cadeau */}
              <div className="text-center mb-6">
                <img
                  src={selectedGift.image_url || 'https://via.placeholder.com/200?text=Cadeau'}
                  alt={selectedGift.name}
                  className="w-40 h-40 object-cover rounded-2xl mx-auto shadow-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200?text=Cadeau';
                  }}
                />
              </div>

              <h3 className="text-xl font-bold text-gray-800 text-center mb-3">
                {selectedGift.name}
              </h3>

              {selectedGift.description && (
                <p className="text-sm text-gray-600 text-center mb-6">
                  {selectedGift.description}
                </p>
              )}

              {/* Détails de la transaction */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Votre cagnotte :</span>
                  <span className="font-bold text-gray-800">
                    {Userprofile?.cagnotte_balance || 0} DT
                  </span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Coût du cadeau :</span>
                  <span className="font-bold text-red-600">
                    -{selectedGift.cagnotte_cost} DT
                  </span>
                </div>
                <div className="border-t-2 border-gray-200 my-3"></div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">Nouveau solde :</span>
                  <span className="font-bold text-green-600 text-lg">
                    {(parseFloat(Userprofile?.cagnotte_balance || 0) - parseFloat(selectedGift.cagnotte_cost)).toFixed(2)} DT
                  </span>
                </div>
              </div>

              {/* Avertissement */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Information :</strong> Cette action est irréversible. Le montant sera déduit de votre cagnotte immédiatement.
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowExchangeModal(false);
                    dispatch(setSelectedGift(null));
                  }}
                  disabled={exchangeLoading}
                  className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  onClick={handleExchangeGift}
                  disabled={exchangeLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {exchangeLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Échange...
                    </>
                  ) : (
                    <>
                      🎁 Confirmer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;