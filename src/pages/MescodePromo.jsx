import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  FaSpinner,
  FaArrowLeft,
  FaCopy,
  FaCalendarAlt,
  FaStore,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import { fetchMyCodePromos, setMyCodesStatusFilter } from "../store/slices/CodePromo";

const MesCodePromo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myCodes, isLoadingMyCodes, myCodesError, myCodesStatusFilter } = useSelector(
    (state) => state.codePromo
  );

  const statusFilters = [
    { value: "reserved", label: "Actifs" },
    { value: null, label: "Tous" },
    { value: "used", label: "Utilisés" },
    { value: "expired", label: "Expirés" },
  ];

  useEffect(() => {
    dispatch(fetchMyCodePromos({ status: myCodesStatusFilter }));
  }, [dispatch, myCodesStatusFilter]);

  const handleFilterChange = (status) => {
    dispatch(setMyCodesStatusFilter(status));
    dispatch(fetchMyCodePromos({ status }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // 
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "used":
        return {
          icon: <FaCheckCircle />,
          label: "Utilisé",
          color: "bg-green-100 text-green-700",
        };
      case "expired":
        return {
          icon: <FaTimesCircle />,
          label: "Expiré",
          color: "bg-red-100 text-red-700",
        };
      default:
        return {
          icon: <FaClock />,
          label: "Actif",
          color: "bg-orange-100 text-orange-700",
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/code-promo")}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Retour aux codes promo</span>
          </button>

          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            Mes Codes Partenaires
          </h1>
          <p className="text-gray-600 text-lg">
            Historique de vos codes réservés
          </p>
        </div>

        {/* Status Filters */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => {
              const isSelected = myCodesStatusFilter === filter.value;
              return (
                <button
                  key={filter.value || "all"}
                  onClick={() => handleFilterChange(filter.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isSelected
                      ? "bg-purple-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Codes List */}
        {isLoadingMyCodes && myCodes.length === 0 ? (
          <div className="text-center py-16">
            <FaSpinner className="animate-spin text-5xl text-purple-500 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Chargement de vos codes...</p>
          </div>
        ) : myCodesError ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <div className="text-7xl mb-6">❌</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-500 mb-6">{myCodesError}</p>
            <button
              onClick={() => dispatch(fetchMyCodePromos({ status: myCodesStatusFilter }))}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : myCodes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <div className="text-7xl mb-6">🎫</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Aucun code enregistré
            </h3>
            <p className="text-gray-500 mb-6">
              Obtenez un code partenaire pour le retrouver ici.
            </p>
            <button
              onClick={() => navigate("/code-promo")}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
            >
              Découvrir les codes promo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myCodes.map((usage) => {
              const statusBadge = getStatusBadge(usage.status);
              const codePromo = usage.code_promo;

              return (
                <div
                  key={usage.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    {/* Title & Partner */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {codePromo?.partner?.name || "Partenaire 360TN"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {codePromo?.title || "Avantage partenaire"}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusBadge.color}`}
                    >
                      {statusBadge.icon}
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Code Display */}
                  <div className="bg-gray-100 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 mb-1">Code promo</p>
                        <p className="text-xl font-bold text-gray-800 tracking-wider">
                          {usage.code_value}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(usage.code_value)}
                        className="p-3 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                        title="Copier le code"
                      >
                        <FaCopy className="text-purple-600" />
                      </button>
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="flex items-center justify-between text-sm">
                    {/* Expiry Date */}
                    {usage.expires_at && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaCalendarAlt />
                        <span>
                          Expire le{" "}
                          {new Date(usage.expires_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    )}

                    {/* View Details Button */}
                    {codePromo?.id && (
                      <button
                        onClick={() => navigate(`/code-promo/${codePromo.id}`)}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Voir détails →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading More */}
        {isLoadingMyCodes && myCodes.length > 0 && (
          <div className="text-center py-8">
            <FaSpinner className="animate-spin text-3xl text-purple-500 mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MesCodePromo;


