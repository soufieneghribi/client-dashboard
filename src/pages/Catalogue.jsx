import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, getAuthHeaders } from "../services/api";
import { toast } from "react-hot-toast";
import { FaSpinner, FaShoppingCart, FaCoins, FaHistory, FaGift } from "react-icons/fa";
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

  // Récupérer promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const clientId = storedUser?.ID_client;
      if (!token || !clientId) return;

      setLoadingPromotions(true);
      try {
        const response = await fetch(
          API_ENDPOINTS.PROMOTIONS.BY_CLIENT(clientId),
          { method: 'GET', headers: getAuthHeaders(token) }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
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

  // Récupérer cadeaux
  useEffect(() => {
    const fetchCadeaux = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingCadeaux(true);
      try {
        const response = await fetch(API_ENDPOINTS.CADEAUX.ALL, {
          method: "GET",
          headers: getAuthHeaders(token),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (result.success) {
          const available = (result.data || []).filter(c =>
            c.est_publie && c.quantite_disponible > 0 &&
            new Date(c.date_fin_validite) >= new Date()
          );
          setCadeaux(available);
        } else {
          setCadeaux([]);
        }
      } catch (error) {
        console.error("Erreur chargement cadeaux:", error);
      } finally {
        setLoadingCadeaux(false);
      }
    };
    fetchCadeaux();
  }, []);

  // Roue
  const spinWheel = () => {
    if (spinning) return;

    setSpinning(true);
    const prizes = [
      { label: "5% de réduction", value: 5, color: "#FFD6D6" },
      { label: "10% de réduction", value: 10, color: "#FFF4B3" },
      { label: "15% de réduction", value: 15, color: "#D4F8C4" },
      { label: "20% de réduction", value: 20, color: "#C3F0F8" },
      { label: "25% de réduction", value: 25, color: "#D3D4FF" },
      { label: "30% de réduction", value: 30, color: "#FFC3F8" },
      { label: "50% de réduction", value: 50, color: "#FFE2C3" }
    ];
    const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
    const newRotation = 3600 + prizes.indexOf(randomPrize) * (360 / prizes.length);
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setWheelResult(randomPrize);
      toast.success(`🎉 Félicitations ! Vous avez gagné ${randomPrize.label} !`);
    }, 5000);
  };

  const getTotalArticles = () => promotions.reduce((total, promo) => total + (promo.articles?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-lg">
              <div className="text-4xl">🎯</div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Catalogue des Offres
              </h1>
            </div>
          </div>
          {clientInfo && (
            <p className="text-gray-700 text-lg font-medium">
              Bonjour <span className="font-bold text-indigo-600">{clientInfo.nom_et_prenom}</span>,
              <span className="text-gray-600"> découvrez vos offres exclusives</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Promotions */}
          <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
            <div className="relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-6 text-white overflow-hidden">
              {/* Decoration circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-2xl backdrop-blur-sm">
                    <FaShoppingCart className="text-4xl" />
                  </div>
                  <div className="text-right">
                    <span className="bg-white text-indigo-600 px-4 py-1.5 rounded-full text-sm font-bold block mb-2 shadow-lg">
                      {promotions.length} {promotions.length > 1 ? 'offres' : 'offre'}
                    </span>
                    <span className="bg-white bg-opacity-25 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                      {getTotalArticles()} articles
                    </span>
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-2">Promotions</h2>
                <p className="text-indigo-100 font-medium">Offres personnalisées pour vous</p>
              </div>
            </div>
            
            <div className="p-6">
              {loadingPromotions ? (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin text-5xl text-indigo-500 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Chargement...</p>
                </div>
              ) : promotions.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {promotions.slice(0, 3).map(promo => (
                    <div key={promo.id} className="border-2 border-indigo-100 rounded-2xl p-4 hover:shadow-lg hover:border-indigo-300 transition-all bg-gradient-to-br from-blue-50 to-indigo-50">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
                          <div className="bg-indigo-500 p-1.5 rounded-lg">
                            <MdLocalOffer className="text-white text-sm" />
                          </div>
                          {promo.name}
                        </h4>
                        {promo.discount_value && (
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md">
                            -{promo.discount_value}%
                          </span>
                        )}
                      </div>
                      {promo.articles && promo.articles.length > 0 && (
                        <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                          {promo.articles.slice(0, 3).map(article => (
                            <div key={article.id} className="flex-shrink-0 w-20 bg-white rounded-xl p-2 border-2 border-indigo-100 shadow-sm">
                              <img src={article.img} alt={article.name} className="w-full h-16 object-contain rounded" />
                              <p className="text-[10px] text-center mt-1 text-indigo-600 font-bold truncate">{article.pivot.promo_price} DT</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {promotions.length > 3 && (
                    <p className="text-center text-gray-500 text-sm pt-2 border-t border-gray-200 font-medium">
                      +{promotions.length - 3} autres promotions
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-7xl mb-4">🏷️</div>
                  <p className="text-gray-500 font-medium">Aucune promotion disponible</p>
                </div>
              )}

              <button
                onClick={() => navigate('/promotions')}
                className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white py-3.5 rounded-2xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Voir toutes les promotions
              </button>
            </div>
          </div>

          {/* Cadeaux */}
          <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
            <div className="relative bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-6 text-white overflow-hidden">
              {/* Decoration elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-2xl backdrop-blur-sm">
                    <FaGift className="text-4xl" />
                  </div>
                  <span className="bg-white text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    {cadeaux.length} {cadeaux.length > 1 ? 'cadeaux' : 'cadeau'}
                  </span>
                </div>
                <h2 className="text-3xl font-bold mb-2">Boutique Cadeaux</h2>
                <p className="text-orange-100 font-medium">Échangez votre cagnotte</p>
              </div>
            </div>
            
            <div className="p-6">
              {loadingCadeaux ? (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin text-5xl text-orange-500 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Chargement...</p>
                </div>
              ) : cadeaux.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {cadeaux.slice(0, 3).map(cadeau => (
                    <div key={cadeau.id} className="border-2 border-orange-100 rounded-2xl p-3 hover:shadow-lg hover:border-orange-300 transition-all bg-gradient-to-br from-orange-50 to-red-50">
                      <div className="flex gap-3">
                        <div className="relative flex-shrink-0">
                          <img 
                            src={cadeau.image} 
                            alt={cadeau.titre} 
                            className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow-md"
                          />
                          <div className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">
                            🎁
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 text-sm truncate">{cadeau.titre}</h4>
                          <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">{cadeau.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1.5 text-orange-600 font-bold text-sm bg-orange-100 px-2.5 py-1 rounded-lg">
                              <FaCoins className="text-yellow-500" />
                              {parseFloat(cadeau.prix_cagnotte).toFixed(2)} DT
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                              {cadeau.quantite_disponible} dispo
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {cadeaux.length > 3 && (
                    <p className="text-center text-gray-500 text-sm font-medium">
                      +{cadeaux.length - 3} autres cadeaux
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-7xl mb-4">🎁</div>
                  <p className="text-gray-500 font-medium">Aucun cadeau disponible</p>
                </div>
              )}

              <div className="space-y-2.5">
                <button
                  onClick={() => navigate('/cadeaux')}
                  className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white py-3.5 rounded-2xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Découvrir tous les cadeaux
                </button>
                <button
                  onClick={() => navigate('/mes-cadeaux')}
                  className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-400"
                >
                  <FaHistory />
                  Mes Cadeaux Acquis
                </button>
              </div>
            </div>
          </div>

          {/* Roue de la Fortune */}
          <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
            <div className="relative bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-6 text-white overflow-hidden">
              {/* Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-2xl backdrop-blur-sm">
                    <GiPerspectiveDiceSixFacesRandom className="text-4xl" />
                  </div>
                  <span className="bg-white text-teal-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    Tentez !
                  </span>
                </div>
                <h2 className="text-3xl font-bold mb-2">Roue de la Fortune</h2>
                <p className="text-teal-100 font-medium">Tournez pour gagner</p>
              </div>
            </div>

            <div className="p-6 text-center">
              {wheelResult && (
                <div className="mb-6 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl shadow-lg animate-bounce">
                  <p className="text-emerald-600 font-bold text-xl mb-2">🎉 Félicitations !</p>
                  <p className="text-teal-800 text-lg font-bold bg-white px-4 py-2 rounded-xl inline-block">
                    {wheelResult.label}
                  </p>
                </div>
              )}

              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 mb-6 border-2 border-teal-100">
                <div className="text-6xl mb-3">🎰</div>
                <p className="text-gray-700 font-semibold mb-2">Tentez votre chance !</p>
                <p className="text-sm text-gray-600">Gagnez jusqu'à 50% de réduction</p>
              </div>

              <button
                onClick={() => setShowWheel(true)}
                className="w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 text-white py-3.5 rounded-2xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <GiPerspectiveDiceSixFacesRandom className="text-2xl" />
                Tourner la roue
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .group:hover .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Catalogue;