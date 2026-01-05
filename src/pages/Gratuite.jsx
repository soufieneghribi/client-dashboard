import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, getAuthHeaders } from "../services/api";

import {
  FaSpinner,
  FaGift,
  FaStore,
  FaTruck,
  FaMobileAlt,
  FaSearch,
  FaHistory,
  FaMapMarkerAlt,
  FaClock,
  FaChevronLeft
} from "react-icons/fa";
import { MdCategory } from "react-icons/md";

const Gratuite = () => {
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Charger les offres
  const fetchOffers = async (refresh = false) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (refresh) {
      setPage(1);
      setOffers([]);
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: refresh ? 1 : page,
        per_page: 20,
      });

      if (searchQuery) params.append("search", searchQuery);
      if (selectedType) params.append("type", selectedType);
      if (selectedMode) params.append("distribution_mode", selectedMode);

      const response = await fetch(
        `${API_ENDPOINTS.FREE_PRODUCTS.ALL}?${params.toString()}`,
        {
          method: "GET",
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();

      if (result.success) {
        const newOffers = result.data || [];
        setOffers(refresh ? newOffers : [...offers, ...newOffers]);

        const pagination = result.pagination;
        if (pagination) {
          setHasMore(pagination.current_page < pagination.last_page);
        }
      } else {
        // 
      }
    } catch (error) {

      // 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers(true);
  }, [searchQuery, selectedType, selectedMode]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(page + 1);
      fetchOffers();
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType(null);
    setSelectedMode(null);
  };

  const getDistributionIcon = (mode) => {
    switch (mode) {
      case "pickup":
        return <FaStore className="text-indigo-600" />;
      case "delivery":
        return <FaTruck className="text-indigo-600" />;
      case "digital":
        return <FaMobileAlt className="text-indigo-600" />;
      case "both":
        return (
          <div className="flex gap-1">
            <FaStore className="text-indigo-600 text-xs" />
            <FaTruck className="text-indigo-600 text-xs" />
          </div>
        );
      default:
        return <FaStore className="text-gray-500" />;
    }
  };

  const getDistributionLabel = (mode) => {
    switch (mode) {
      case "pickup":
        return "Retrait magasin";
      case "delivery":
        return "Livraison";
      case "digital":
        return "Digital";
      case "both":
        return "Retrait ou Livraison";
      default:
        return mode;
    }
  };

  const isOfferExpired = (offer) => {
    if (!offer.valid_until) return false;
    return new Date(offer.valid_until) < new Date();
  };

  const isOfferNotStarted = (offer) => {
    if (!offer.valid_from) return false;
    return new Date(offer.valid_from) > new Date();
  };

  const getOfferStatus = (offer) => {
    if (!offer.is_published) {
      return { text: "Non publié", color: "gray" };
    }
    if (offer.remaining_quantity <= 0) {
      return { text: "Épuisé", color: "red" };
    }
    if (isOfferExpired(offer)) {
      return { text: "Expiré", color: "red" };
    }
    if (isOfferNotStarted(offer)) {
      return { text: "Prochainement", color: "orange" };
    }
    return { text: "Disponible", color: "green" };
  };

  const formatValidityPeriod = (offer) => {
    if (offer.valid_from && offer.valid_until) {
      const from = new Date(offer.valid_from).toLocaleDateString("fr-FR");
      const to = new Date(offer.valid_until).toLocaleDateString("fr-FR");
      return `Du ${from} au ${to}`;
    } else if (offer.valid_from) {
      const from = new Date(offer.valid_from).toLocaleDateString("fr-FR");
      return `À partir du ${from}`;
    } else if (offer.valid_until) {
      const to = new Date(offer.valid_until).toLocaleDateString("fr-FR");
      return `Jusqu'au ${to}`;
    }
    return "Pas de limite de validité";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <FaChevronLeft />
              <span className="font-medium">Retour</span>
            </button>

            <button
              onClick={() => navigate("/mes-reservations")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
            >
              <FaHistory className="text-sm" />
              <span className="font-medium">Mes Réservations</span>
            </button>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
              <FaGift className="text-3xl text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Produits Gratuits
            </h1>
            <p className="text-gray-600">
              Découvrez et réservez vos produits gratuits
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Recherche */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Filtre Type */}
            <select
              value={selectedType || ""}
              onChange={(e) => setSelectedType(e.target.value || null)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tous les types</option>
              <option value="product">Produit</option>
              <option value="service">Service</option>
              <option value="voucher">Bon</option>
            </select>

            {/* Filtre Mode de distribution */}
            <select
              value={selectedMode || ""}
              onChange={(e) => setSelectedMode(e.target.value || null)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tous les modes</option>
              <option value="pickup">Retrait magasin</option>
              <option value="delivery">Livraison</option>
              <option value="digital">Digital</option>
              <option value="both">Les deux</option>
            </select>

            {/* Effacer les filtres */}
            {(searchQuery || selectedType || selectedMode) && (
              <button
                onClick={clearFilters}
                className="px-5 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Grille des offres */}
        {loading && offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Chargement des offres...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Aucun produit gratuit disponible
            </h3>
            <p className="text-gray-600 mb-6">
              Revenez plus tard pour découvrir de nouvelles offres
            </p>
            {(searchQuery || selectedType || selectedMode) && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => {
                const status = getOfferStatus(offer);
                const isAvailable = status.text === "Disponible";

                return (
                  <div
                    key={offer.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                    onClick={() =>
                      isAvailable && navigate(`/gratuite/${offer.id}`)
                    }
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600">
                      <img
                        src={offer.image || "https://via.placeholder.com/300x200?text=Gratuit"}
                        alt={offer.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Badge statut */}
                      <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${status.color === "green" ? "bg-green-500/90 text-white" :
                          status.color === "red" ? "bg-red-500/90 text-white" :
                            status.color === "orange" ? "bg-orange-500/90 text-white" :
                              "bg-gray-500/90 text-white"
                        }`}>
                        {status.text}
                      </div>

                      {/* Mode de distribution */}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                        {getDistributionIcon(offer.distribution_mode)}
                        <span className="text-xs font-medium text-gray-700">
                          {getDistributionLabel(offer.distribution_mode)}
                        </span>
                      </div>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>

                    {/* Contenu */}
                    <div className="p-5">
                      {/* Titre */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {offer.title}
                      </h3>

                      {/* Type & Partenaire */}
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                        {offer.type && (
                          <div className="flex items-center gap-1">
                            <MdCategory className="text-gray-500" />
                            <span>{offer.type}</span>
                          </div>
                        )}
                        {offer.partner_name && (
                          <>
                            {offer.type && <span>•</span>}
                            <div className="flex items-center gap-1">
                              <FaStore className="text-gray-500" />
                              <span>{offer.partner_name}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Infos stock */}
                      <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Stock disponible</p>
                          <p className="text-sm font-bold text-gray-900">
                            {offer.remaining_quantity} / {offer.total_quantity}
                          </p>
                        </div>
                        {offer.max_per_client && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Limite</p>
                            <p className="text-sm font-bold text-gray-900">
                              {offer.max_per_client} max
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Période de validité */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <FaClock />
                        <span>{formatValidityPeriod(offer)}</span>
                      </div>

                      {/* Magasins (si retrait) */}
                      {offer.stores && offer.stores.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                            <FaMapMarkerAlt />
                            <span className="font-medium">
                              {offer.stores.length} magasin(s) disponible(s)
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {offer.stores.slice(0, 3).map((store) => (
                              <span
                                key={store.id}
                                className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg"
                              >
                                {store.name}
                              </span>
                            ))}
                            {offer.stores.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                                +{offer.stores.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Bouton d'action */}
                      <button
                        className={`w-full py-2.5 rounded-xl font-semibold transition-all ${isAvailable
                            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        disabled={!isAvailable}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isAvailable) {
                            navigate(`/gratuite/${offer.id}`);
                          }
                        }}
                      >
                        {isAvailable ? "Réserver maintenant" : status.text}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charger plus */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto font-medium"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    "Charger plus"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Gratuite;


