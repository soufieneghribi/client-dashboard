import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { API_ENDPOINTS, getAuthHeaders } from "../services/api";

import { fetchUserProfile } from "../store/slices/user";
import {
  FaSpinner,
  FaCoins,
  FaGift,
  FaUtensils,
  FaTag,
  FaChevronLeft,
  FaTicketAlt,
  FaArrowRight,
  FaWallet,
  FaCrown,
  FaStar,
  FaFire,
  FaGem,
  FaBox,
  FaHistory
} from "react-icons/fa";
import { MdLocalOffer, MdCardGiftcard, MdRedeem } from "react-icons/md";
import { GiPartyPopper } from "react-icons/gi";

const Catalogue = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { Userprofile, loading: userLoading } = useSelector((state) => state.user);
  const { isLoggedIn } = useSelector((state) => state.auth);

  const [promotions, setPromotions] = useState([]);
  const [cadeaux, setCadeaux] = useState([]);
  const [produitsGratuits, setProduitsGratuits] = useState([]);
  const [codesPromo, setCodesPromo] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [loadingCadeaux, setLoadingCadeaux] = useState(false);
  const [loadingGratuits, setLoadingGratuits] = useState(false);
  const [loadingCodesPromo, setLoadingCodesPromo] = useState(false);
  const [clientInfo, setClientInfo] = useState(null);

  // ✅ Récupérer le profil utilisateur au chargement pour avoir la cagnotte correcte
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isLoggedIn]);

  // Récupérer promotions et informations client
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
          // ✅ La cagnotte est maintenant récupérée depuis Redux (Userprofile.cagnotte_balance)
          setPromotions(result.data || []);
        } else {
          setPromotions([]);
        }
      } catch (error) {

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

      } finally {
        setLoadingCadeaux(false);
      }
    };
    fetchCadeaux();
  }, []);

  // Récupérer produits gratuits
  useEffect(() => {
    const fetchProduitsGratuits = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingGratuits(true);
      try {
        const response = await fetch(
          `${API_ENDPOINTS.FREE_PRODUCTS.ALL}?per_page=5`,
          {
            method: "GET",
            headers: getAuthHeaders(token),
          }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (result.success) {
          const available = (result.data || []).filter(p =>
            p.is_published &&
            p.remaining_quantity > 0 &&
            (!p.valid_until || new Date(p.valid_until) >= new Date())
          );
          setProduitsGratuits(available);
        } else {
          setProduitsGratuits([]);
        }
      } catch (error) {

      } finally {
        setLoadingGratuits(false);
      }
    };
    fetchProduitsGratuits();
  }, []);

  // Récupérer codes promo
  useEffect(() => {
    const fetchCodesPromo = async () => {
      try {
        setLoadingCodesPromo(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setLoadingCodesPromo(false);
          return;
        }

        const response = await fetch(
          `${API_ENDPOINTS.CODE_PROMO.ALL}?per_page=5`,
          {
            method: "GET",
            headers: getAuthHeaders(token),
          }
        );

        if (response.ok) {
          const result = await response.json();

          let codesData = [];

          if (result.success && result.data) {
            codesData = result.data;
          } else if (Array.isArray(result)) {
            codesData = result;
          } else if (Array.isArray(result.data)) {
            codesData = result.data;
          }

          if (codesData.length > 0) {
            const now = new Date();
            const availableCodes = codesData.filter((code) => {
              if (!code) return false;

              const isActive = code.is_active === true || code.is_active === 1;
              if (!isActive) return false;

              const notExpired = !code.valid_to || new Date(code.valid_to) >= now;
              if (!notExpired) return false;

              const notUpcoming = !code.valid_from || new Date(code.valid_from) <= now;
              if (!notUpcoming) return false;

              return true;
            });

            setCodesPromo(availableCodes);
          } else {
            setCodesPromo([]);
          }
        }
      } catch (error) {

        setCodesPromo([]);
      } finally {
        setLoadingCodesPromo(false);
      }
    };
    fetchCodesPromo();
  }, []);

  // Composant carte optimisée et claire
  const CategoryCard = ({ icon: Icon, title, subtitle, count, onClick, loading, gradient, iconBg }) => (
    <div
      onClick={loading ? null : onClick}
      className={`group relative bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      {/* Effet de fond au hover */}
      <div className={`absolute inset-0 ${gradient || 'from-blue-50/30 to-purple-50/30'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          {/* Icône */}
          <div className={`w-16 h-16 ${iconBg || 'bg-gradient-to-br from-blue-500 to-indigo-600'} rounded-2xl flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-md`}>
            <Icon className="text-3xl text-white" />
          </div>

          {/* Compteur */}
          {count !== undefined && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-sm">
              {count}
            </div>
          )}
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 text-base mb-6 leading-relaxed">
          {subtitle}
        </p>

        <div className="flex items-center text-blue-600 font-semibold">
          <span>Explorer</span>
          <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-3xl z-20">
          <FaSpinner className="animate-spin text-3xl text-blue-600" />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20">

      {/* En-tête avec dégradé moderne */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg relative overflow-hidden">
        {/* Effets de fond */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Barre supérieure réduite */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-all duration-200 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/20"
            >
              <FaChevronLeft className="text-sm" />
              <span className="font-medium text-xs">Retour</span>
            </button>


          </div>

          {/* Titres réduits */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/20 mb-3">
              <GiPartyPopper className="text-sm text-yellow-300" />
              <span className="text-white/90 text-xs font-medium">Avantages</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
              Catalogue
            </h1>
            <p className="text-sm text-white/80 max-w-xl mx-auto">
              Récompenses et avantages exclusifs
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">

        {/* Section statistiques compacte */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Votre activité
                </h2>
                <p className="text-gray-600 text-xs">
                  Résumé de vos avantages et récompenses
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <FaGem className="text-sm text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg p-3 border border-blue-100 group hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-md flex items-center justify-center">
                    <FaWallet className="text-sm text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Cagnotte</p>
                    <p className="text-lg font-bold text-gray-900">
                      {(parseFloat(Userprofile?.cagnotte_balance || 0)).toFixed(2)} TND
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg p-3 border border-emerald-100 group hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-md flex items-center justify-center">
                    <FaTag className="text-sm text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Remise</p>
                    <p className="text-lg font-bold text-gray-900">
                      {promotions.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg p-3 border border-purple-100 group hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-md flex items-center justify-center">
                    <FaGift className="text-sm text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Cadeaux</p>
                    <p className="text-lg font-bold text-gray-900">
                      {cadeaux.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-amber-50 rounded-lg p-3 border border-amber-100 group hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-md flex items-center justify-center">
                    <FaTicketAlt className="text-sm text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Codes</p>
                    <p className="text-lg font-bold text-gray-900">
                      {codesPromo.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* Grille des catégories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto mb-8">



          <CategoryCard
            icon={FaTag}
            title="Remises"
            subtitle="Réductions sur nos meilleurs produits"
            count={promotions.length}
            onClick={() => navigate('/promotions')}
            loading={loadingPromotions}
            gradient="from-red-50/30 to-pink-50/30"
            iconBg="bg-gradient-to-br from-red-500 to-pink-600"
          />

          <CategoryCard
            icon={MdCardGiftcard}
            title="Cadeaux"
            subtitle="Cadeaux premium et exclusifs"
            count={cadeaux.length}
            onClick={() => navigate('/cadeaux')}
            loading={loadingCadeaux}
            gradient="from-purple-50/30 to-indigo-50/30"
            iconBg="bg-gradient-to-br from-purple-500 to-indigo-600"
          />

          <CategoryCard
            icon={FaGift}
            title="Gratuit"
            subtitle="Produits 100% gratuits pour vous"
            count={produitsGratuits.length}
            onClick={() => navigate('/gratuite')}
            loading={loadingGratuits}
            gradient="from-amber-50/30 to-yellow-50/30"
            iconBg="bg-gradient-to-br from-amber-500 to-yellow-600"
          />

          <CategoryCard
            icon={MdLocalOffer}
            title="Codes Promo"
            subtitle="Avantages avec nos partenaires"
            count={codesPromo.length}
            onClick={() => navigate('/code-promo')}
            loading={loadingCodesPromo}
            gradient="from-blue-50/30 to-cyan-50/30"
            iconBg="bg-gradient-to-br from-blue-500 to-cyan-600"
          />


        </div>


      </div>
    </div>
  );
};

export default Catalogue;

