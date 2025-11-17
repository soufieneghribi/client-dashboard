import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, getAuthHeaders, handleApiError } from "../services/api";
import { toast } from "react-hot-toast";
import { FaGift, FaSpinner, FaShoppingCart, FaCoins } from "react-icons/fa";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { MdLocalOffer, MdCardGiftcard } from "react-icons/md";

const Catalogue = () => {
  const navigate = useNavigate();
  
  const [promotions, setPromotions] = useState([]);
  const [cadeaux, setCadeaux] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [loadingCadeaux, setLoadingCadeaux] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wheelResult, setWheelResult] = useState(null);
  const [clientInfo, setClientInfo] = useState(null);

  // Récupérer les promotions du client
  useEffect(() => {
    const fetchPromotions = async () => {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const clientId = storedUser?.ID_client;

      if (!token || !clientId) {
        return;
      }

      setLoadingPromotions(true);
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
      } finally {
        setLoadingPromotions(false);
      }
    };

    fetchPromotions();
  }, []);

  // Récupérer les cadeaux disponibles
  useEffect(() => {
    const fetchCadeaux = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      setLoadingCadeaux(true);
      try {
        const response = await fetch(
          API_ENDPOINTS.CADEAUX.ALL,
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
          // Filtrer uniquement les cadeaux publiés et disponibles
          const cadeauxDisponibles = (result.data || []).filter(cadeau => 
            cadeau.est_publie && 
            cadeau.quantite_disponible > 0 &&
            new Date(cadeau.date_fin_validite) >= new Date()
          );
          setCadeaux(cadeauxDisponibles);
        } else {
          setCadeaux([]);
        }
      } catch (error) {
        console.error('Erreur chargement cadeaux:', error);
      } finally {
        setLoadingCadeaux(false);
      }
    };

    fetchCadeaux();
  }, []);

  // Fonction pour tourner la roue
  const spinWheel = () => {
    if (spinning) return;

    setSpinning(true);
    const prizes = [
      { label: "5% de réduction", value: 5, color: "#ff9999" },
      { label: "10% de réduction", value: 10, color: "#ffff99" },
      { label: "15% de réduction", value: 15, color: "#99ff99" },
      { label: "20% de réduction", value: 20, color: "#99ffff" },
      { label: "25% de réduction", value: 25, color: "#9999ff" },
      { label: "30% de réduction", value: 30, color: "#ff99ff" },
      { label: "50% de réduction", value: 50, color: "#ffcc99" }
    ];
    
    const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
    const randomIndex = prizes.indexOf(randomPrize);
    const newRotation = 3600 + randomIndex * (360 / prizes.length);

    setRotation(newRotation);
    
    setTimeout(() => {
      setSpinning(false);
      setWheelResult(randomPrize);
      toast.success(`🎉 Félicitations ! Vous avez gagné ${randomPrize.label} !`);
    }, 5000);
  };

  // Calculer le nombre total d'articles en promotion
  const getTotalArticles = () => {
    return promotions.reduce((total, promo) => {
      return total + (promo.articles?.length || 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            🎁 Catalogue des Offres
          </h1>
          {clientInfo && (
            <p className="text-gray-600 text-lg">
              Bienvenue <span className="font-semibold text-purple-600">{clientInfo.nom_et_prenom}</span> ! 
              Découvrez vos offres exclusives
            </p>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Promotions */}
          <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <FaGift className="text-5xl" />
                <div className="text-right">
                  <span className="bg-white text-red-500 px-3 py-1 rounded-full text-sm font-bold block mb-1">
                    {promotions.length} {promotions.length > 1 ? 'promotions' : 'promotion'}
                  </span>
                  <span className="bg-white bg-opacity-30 text-white px-2 py-1 rounded-full text-xs">
                    {getTotalArticles()} articles
                  </span>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2">Promotions</h2>
              <p className="text-orange-100">Vos offres personnalisées</p>
            </div>
            
            <div className="p-6">
              {loadingPromotions ? (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin text-4xl text-orange-500 mx-auto mb-3" />
                  <p className="text-gray-500">Chargement...</p>
                </div>
              ) : promotions.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {promotions.slice(0, 2).map((promo) => (
                    <div 
                      key={promo.id} 
                      className="border-2 border-orange-200 rounded-xl p-4 bg-gradient-to-r from-orange-50 to-red-50 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                            <MdLocalOffer className="text-orange-500" />
                            {promo.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Du {new Date(promo.start_date).toLocaleDateString()} au {new Date(promo.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        {promo.discount_value && (
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            -{promo.discount_value}%
                          </span>
                        )}
                      </div>
                      
                      {promo.articles && promo.articles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                            <FaShoppingCart className="text-orange-500" />
                            {promo.articles.length} article{promo.articles.length > 1 ? 's' : ''} en promo
                          </p>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {promo.articles.slice(0, 3).map((article) => (
                              <div 
                                key={article.id}
                                className="flex-shrink-0 w-20 bg-white rounded-lg p-2 border border-orange-200"
                                title={article.name}
                              >
                                <img 
                                  src={article.img} 
                                  alt={article.name}
                                  className="w-full h-16 object-contain rounded"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/100?text=Image';
                                  }}
                                />
                                <p className="text-[10px] text-center mt-1 text-gray-600 truncate">
                                  {article.pivot.promo_price} DT
                                </p>
                              </div>
                            ))}
                            {promo.articles.length > 3 && (
                              <div className="flex-shrink-0 w-20 flex items-center justify-center bg-orange-100 rounded-lg border-2 border-dashed border-orange-300">
                                <p className="text-orange-600 font-bold text-xs">
                                  +{promo.articles.length - 3}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {promotions.length > 2 && (
                    <p className="text-center text-gray-500 text-sm pt-2 border-t border-gray-200">
                      +{promotions.length - 2} autre{promotions.length - 2 > 1 ? 's' : ''} promotion{promotions.length - 2 > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-gray-500 mb-4">Aucune promotion disponible</p>
                </div>
              )}
              
              <button
                onClick={() => navigate('/promotions')}
                className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Voir toutes les promotions
              </button>
            </div>
          </div>

          {/* Card 2: Cadeaux - Boutique Cagnotte */}
          <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-400 to-purple-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <MdCardGiftcard className="text-5xl" />
                <span className="bg-white text-pink-500 px-3 py-1 rounded-full text-sm font-bold">
                  {cadeaux.length} {cadeaux.length > 1 ? 'cadeaux' : 'cadeau'}
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Boutique Cadeaux</h2>
              <p className="text-pink-100">Échangez votre cagnotte</p>
            </div>
            
            <div className="p-6">
              {loadingCadeaux ? (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin text-4xl text-pink-500 mx-auto mb-3" />
                  <p className="text-gray-500">Chargement...</p>
                </div>
              ) : cadeaux.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {cadeaux.slice(0, 3).map((cadeau) => (
                    <div 
                      key={cadeau.id}
                      className="border-2 border-pink-200 rounded-xl p-3 bg-gradient-to-r from-pink-50 to-purple-50 hover:shadow-md transition-all"
                    >
                      <div className="flex gap-3">
                        <img 
                          src={cadeau.image} 
                          alt={cadeau.titre}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100?text=Cadeau';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 text-sm truncate">
                            {cadeau.titre}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                            {cadeau.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-pink-600 font-bold text-sm">
                              <FaCoins />
                              {parseFloat(cadeau.prix_cagnotte).toFixed(2)} DT
                            </div>
                            <span className="text-xs text-gray-500">
                              {cadeau.quantite_disponible} dispo
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {cadeaux.length > 3 && (
                    <p className="text-center text-gray-500 text-sm">
                      +{cadeaux.length - 3} autre{cadeaux.length - 3 > 1 ? 's' : ''} cadeau{cadeaux.length - 3 > 1 ? 'x' : ''}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎁</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Boutique Cadeaux
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Aucun cadeau disponible pour le moment
                  </p>
                </div>
              )}
              
              <button
                onClick={() => navigate('/cadeaux')}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-pink-500 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Découvrir tous les cadeaux
              </button>
            </div>
          </div>

          {/* Card 3: Roue de la Fortune */}
          <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <GiPerspectiveDiceSixFacesRandom className="text-5xl" />
                <span className="bg-white text-green-500 px-3 py-1 rounded-full text-sm font-bold">
                  Tentez !
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Roue de la Fortune</h2>
              <p className="text-green-100">Tournez pour gagner</p>
            </div>
            
            <div className="p-6">
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="text-6xl mb-4">🎰</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Tentez votre chance !
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Gagnez jusqu'à 50% de réduction
                  </p>
                </div>
                
                {wheelResult && (
                  <div className="mb-6 p-4 bg-green-50 border-2 border-green-400 rounded-lg animate-bounce">
                    <p className="text-green-600 font-bold text-xl mb-1">
                      🎉 Vous avez gagné !
                    </p>
                    <p className="text-green-800 text-lg font-semibold">
                      {wheelResult.label}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2 mb-6 text-sm text-gray-600">
                  <p>🎁 Cadeaux garantis</p>
                  <p>⭐ Jusqu'à 50% de réduction</p>
                  <p>🔄 Tournez autant que vous voulez</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowWheel(true)}
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-green-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <GiPerspectiveDiceSixFacesRandom className="text-xl" />
                Tourner la roue
              </button>
            </div>
          </div>
        </div>

        {/* Modal de la Roue */}
        {showWheel && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={() => setShowWheel(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
              
              <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                🎰 Roue de la Fortune
              </h2>
              
              <div className="flex justify-center items-center mb-6">
                <div
                  className="relative border-8 border-gray-300 rounded-full shadow-2xl"
                  style={{
                    width: "280px",
                    height: "280px",
                    background: `conic-gradient(
                      #ff9999 0 51.4deg,
                      #ffff99 51.4deg 102.8deg,
                      #99ff99 102.8deg 154.2deg,
                      #99ffff 154.2deg 205.6deg,
                      #9999ff 205.6deg 257deg,
                      #ff99ff 257deg 308.4deg,
                      #ffcc99 308.4deg 360deg
                    )`,
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning ? "transform 5s cubic-bezier(0.33, 1, 0.68, 1)" : "none",
                  }}
                >
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6">
                    <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-12 border-t-red-600"></div>
                  </div>
                  
                  <div className="absolute inset-0 flex justify-center items-center">
                    <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                      <GiPerspectiveDiceSixFacesRandom className="text-3xl text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
              
              {wheelResult && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl border-2 border-green-400 text-center">
                  <p className="text-2xl font-bold text-green-600 mb-1">
                    🎉 Félicitations !
                  </p>
                  <p className="text-xl text-green-800 font-semibold">
                    {wheelResult.label}
                  </p>
                </div>
              )}
              
              <button
                onClick={spinWheel}
                disabled={spinning}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  spinning
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl"
                }`}
              >
                {spinning ? (
                  <span className="flex items-center justify-center gap-2">
                    <FaSpinner className="animate-spin" />
                    En cours...
                  </span>
                ) : (
                  "🎲 Tourner la roue"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogue;