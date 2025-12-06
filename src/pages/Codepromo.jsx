import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  FaSpinner,
  FaSearch,
  FaFilter,
  FaHistory,
  FaGift,
  FaStore,
  FaCalendarAlt,
  FaPercentage,
  FaLock,
  FaGlobe,
  FaChevronLeft,
} from "react-icons/fa";
import { MdLocalOffer } from "react-icons/md";
import {
  fetchCodePromos,
  setFilters,
  clearFilters,
  setSearch,
} from "../store/slices/CodePromo";

const CodePromo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    codePromos,
    isLoading,
    error,
    hasMore,
    filters,
    currentPage,
  } = useSelector((state) => state.codePromo);

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    console.log("Chargement initial des codes promo");
    dispatch(fetchCodePromos({ page: 1 }));
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Recherche:", searchQuery);
    dispatch(setSearch(searchQuery || null));
    dispatch(fetchCodePromos({ page: 1, filters: { ...filters, search: searchQuery || null } }));
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      console.log("Chargement page suivante:", currentPage + 1);
      dispatch(fetchCodePromos({ page: currentPage + 1, filters }));
    }
  };

  const handleFilterChange = (filterType, value) => {
    console.log("Filtre changé:", filterType, value);
    dispatch(setFilters({ [filterType]: value }));
    dispatch(fetchCodePromos({ page: 1, filters: { ...filters, [filterType]: value } }));
  };

  const handleClearFilters = () => {
    console.log("Réinitialisation des filtres");
    setSearchQuery("");
    dispatch(clearFilters());
    dispatch(fetchCodePromos({ page: 1 }));
  };

  const getOfferTypeLabel = (type) => {
    switch (type) {
      case "percentage":
        return "Pourcentage";
      case "fixed":
        return "Montant fixe";
      case "credit":
        return "Bon/Cadeau";
      case "free_shipping":
        return "Livraison gratuite";
      default:
        return type;
    }
  };

  const isExpired = (codePromo) => {
    if (!codePromo.valid_until) return false;
    return new Date(codePromo.valid_until) < new Date();
  };

  const isUpcoming = (codePromo) => {
    if (!codePromo.valid_from) return false;
    return new Date(codePromo.valid_from) > new Date();
  };

  const isStockDepleted = (codePromo) => {
    if (!codePromo.is_limited) return false;
    return codePromo.remaining_quantity <= 0;
  };

  const isAvailable = (codePromo) => {
    return !isExpired(codePromo) && !isUpcoming(codePromo) && !isStockDepleted(codePromo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* En-tête avec design moderne */}
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
              onClick={() => navigate("/mes-code-promo")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
            >
              <FaHistory className="text-sm" />
              <span className="font-medium">Mes Codes</span>
            </button>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
              <MdLocalOffer className="text-3xl text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Codes Promo Partenaires
            </h1>
            <p className="text-gray-600">
              Profitez d'avantages exclusifs chez nos partenaires
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Recherche */}
            <form onSubmit={handleSearch} className="flex-1 min-w-[250px]">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un code promo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </form>

            {/* Bouton Filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                showFilters
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaFilter />
              <span>Filtres</span>
            </button>

            {/* Effacer les filtres */}
            {(filters.search || filters.offerType || filters.codeType) && (
              <button
                onClick={handleClearFilters}
                className="px-5 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Panneau de filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Type d'offre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'offre
                  </label>
                  <select
                    value={filters.offerType || ""}
                    onChange={(e) =>
                      handleFilterChange("offerType", e.target.value || null)
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Tous les types</option>
                    <option value="percentage">Pourcentage</option>
                    <option value="fixed">Montant fixe</option>
                    <option value="credit">Bon/Cadeau</option>
                    <option value="free_shipping">Livraison gratuite</option>
                  </select>
                </div>

                {/* Type de code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de code
                  </label>
                  <select
                    value={filters.codeType || ""}
                    onChange={(e) =>
                      handleFilterChange("codeType", e.target.value || null)
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Tous les codes</option>
                    <option value="unique">Code unique</option>
                    <option value="generic">Code générique</option>
                  </select>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={filters.status || ""}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value || null)
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Tous</option>
                    <option value="active">Actifs</option>
                    <option value="upcoming">À venir</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Liste des codes promo */}
        {isLoading && codePromos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Chargement des codes promo...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => dispatch(fetchCodePromos({ page: 1 }))}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              Réessayer
            </button>
          </div>
        ) : codePromos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Aucun code promo disponible
            </h3>
            <p className="text-gray-600 mb-6">
              Revenez plus tard pour découvrir de nouvelles offres
            </p>
            {(filters.search || filters.offerType || filters.codeType) && (
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {codePromos.map((codePromo) => {
                const available = isAvailable(codePromo);
                const expired = isExpired(codePromo);
                const upcoming = isUpcoming(codePromo);
                const depleted = isStockDepleted(codePromo);

                return (
                  <div
                    key={codePromo.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                    onClick={() => navigate(`/code-promo/${codePromo.id}`)}
                  >
                    {/* Image/Banner */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600">
                      {codePromo.banner_url ? (
                        <img
                          src={codePromo.banner_url}
                          alt={codePromo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaGift className="text-white/30 text-7xl" />
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      {/* Badge statut */}
                      <div className="absolute top-4 right-4">
                        {expired ? (
                          <span className="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                            Expiré
                          </span>
                        ) : upcoming ? (
                          <span className="bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                            Bientôt
                          </span>
                        ) : depleted ? (
                          <span className="bg-gray-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                            Épuisé
                          </span>
                        ) : (
                          <span className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                            Disponible
                          </span>
                        )}
                      </div>

                      {/* Partenaire */}
                      {codePromo.partner?.name && (
                        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                          <FaStore className="text-indigo-600 text-xs" />
                          <span className="text-sm font-medium text-gray-800">
                            {codePromo.partner.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="p-5">
                      {/* Titre */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {codePromo.title}
                      </h3>

                      {/* Description */}
                      {codePromo.short_description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {codePromo.short_description}
                        </p>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700">
                          <FaPercentage className="text-xs" />
                          {getOfferTypeLabel(codePromo.offer_type)}
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                          {codePromo.code_type === "unique" ? (
                            <FaLock className="text-xs" />
                          ) : (
                            <FaGlobe className="text-xs" />
                          )}
                          {codePromo.code_type === "unique" ? "Unique" : "Générique"}
                        </span>

                        {codePromo.is_limited && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-50 text-orange-700">
                            {codePromo.remaining_quantity} / {codePromo.total_quantity}
                          </span>
                        )}
                      </div>

                      {/* Validité */}
                      {(codePromo.valid_from || codePromo.valid_until) && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                          <FaCalendarAlt />
                          <span>
                            {codePromo.valid_from &&
                              `Du ${new Date(codePromo.valid_from).toLocaleDateString("fr-FR")}`}
                            {codePromo.valid_from && codePromo.valid_until && " "}
                            {codePromo.valid_until &&
                              `au ${new Date(codePromo.valid_until).toLocaleDateString("fr-FR")}`}
                          </span>
                        </div>
                      )}

                      {/* Bouton d'action */}
                      <button
                        className={`w-full py-2.5 rounded-xl font-semibold transition-all ${
                          available
                            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!available}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (available) {
                            navigate(`/code-promo/${codePromo.id}`);
                          }
                        }}
                      >
                        {expired
                          ? "Expiré"
                          : upcoming
                          ? "Bientôt disponible"
                          : depleted
                          ? "Stock épuisé"
                          : "Obtenir mon code"}
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
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto font-medium"
                >
                  {isLoading ? (
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

export default CodePromo;