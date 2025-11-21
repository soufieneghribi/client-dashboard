import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, getAuthHeaders } from "../services/api";
import { toast } from "react-hot-toast";
import { FaSpinner, FaShoppingCart, FaCoins } from "react-icons/fa";
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
            📦 Catalogue des Offres
          </h1>
          {clientInfo && (
            <p className="text-gray-600 text-lg">
              Bienvenue <span className="font-semibold text-indigo-600">{clientInfo.nom_et_prenom}</span> !
              Découvrez vos offres exclusives
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Promotions */}
          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-400 to-purple-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <FaShoppingCart className="text-5xl" />
                <div className="text-right">
                  <span className="bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-bold block mb-1">
                    {promotions.length} {promotions.length > 1 ? 'promotions' : 'promotion'}
                  </span>
                  <span className="bg-white bg-opacity-30 text-white px-2 py-1 rounded-full text-xs">
                    {getTotalArticles()} articles
                  </span>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2">Promotions</h2>
              <p className="text-indigo-100">Vos offres personnalisées</p>
            </div>
            <div className="p-6">
              {loadingPromotions ? (
                <div className="text-center py-8">
                  <FaSpinner className="animate-spin text-4xl text-indigo-500 mx-auto mb-3" />
                  <p className="text-gray-500">Chargement...</p>
                </div>
              ) : promotions.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {promotions.slice(0, 3).map(promo => (
                    <div key={promo.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all bg-gradient-to-r from-indigo-50 to-purple-50">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                          <MdLocalOffer className="text-indigo-500" />
                          {promo.name}
                        </h4>
                        {promo.discount_value && (
                          <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            -{promo.discount_value}%
                          </span>
                        )}
                      </div>
                      {promo.articles && promo.articles.length > 0 && (
                        <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                          {promo.articles.slice(0, 3).map(article => (
                            <div key={article.id} className="flex-shrink-0 w-20 bg-white rounded-lg p-2 border border-indigo-200">
                              <img src={article.img} alt={article.name} className="w-full h-16 object-contain rounded" />
                              <p className="text-[10px] text-center mt-1 text-gray-600 truncate">{article.pivot.promo_price} DT</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {promotions.length > 3 && (
                    <p className="text-center text-gray-500 text-sm pt-2 border-t border-gray-200">
                      +{promotions.length - 3} autres promotions
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
                className="w-full bg-gradient-to-r from-indigo-400 to-purple-500 text-white py-3 rounded-2xl font-semibold hover:from-indigo-500 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
              >
                Voir toutes les promotions
              </button>
            </div>
          </div>

          {/* Cadeaux */}
          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 overflow-hidden">
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
                  {cadeaux.slice(0, 3).map(cadeau => (
                    <div key={cadeau.id} className="border border-pink-200 rounded-xl p-3 hover:shadow-md transition-all bg-gradient-to-r from-pink-50 to-purple-50">
                      <div className="flex gap-3">
                        <img src={cadeau.image} alt={cadeau.titre} className="w-20 h-20 object-cover rounded-lg flex-shrink-0"/>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 text-sm truncate">{cadeau.titre}</h4>
                          <p className="text-xs text-gray-600 line-clamp-2 mt-1">{cadeau.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-pink-600 font-bold text-sm">
                              <FaCoins />
                              {parseFloat(cadeau.prix_cagnotte).toFixed(2)} DT
                            </div>
                            <span className="text-xs text-gray-500">{cadeau.quantite_disponible} dispo</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {cadeaux.length > 3 && (
                    <p className="text-center text-gray-500 text-sm">
                      +{cadeaux.length - 3} autres cadeaux
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎁</div>
                  <p className="text-gray-500 mb-4">Aucun cadeau disponible</p>
                </div>
              )}

              <button
                onClick={() => navigate('/cadeaux')}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white py-3 rounded-2xl font-semibold hover:from-pink-500 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
              >
                Découvrir tous les cadeaux
              </button>
            </div>
          </div>

          {/* Roue de la Fortune */}
          <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 overflow-hidden">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <GiPerspectiveDiceSixFacesRandom className="text-5xl" />
                <span className="bg-white text-green-500 px-3 py-1 rounded-full text-sm font-bold">Tentez !</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Roue de la Fortune</h2>
              <p className="text-green-100">Tournez pour gagner</p>
            </div>

            <div className="p-6 text-center">
              {wheelResult && (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-400 rounded-lg animate-bounce">
                  <p className="text-green-600 font-bold text-xl mb-1">🎉 Vous avez gagné !</p>
                  <p className="text-green-800 text-lg font-semibold">{wheelResult.label}</p>
                </div>
              )}

              <button
                onClick={() => setShowWheel(true)}
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 rounded-2xl font-semibold hover:from-green-500 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <GiPerspectiveDiceSixFacesRandom className="text-xl" />
                Tourner la roue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalogue;
