import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  FaSpinner,
  FaArrowLeft,
  FaGift,
  FaStore,
  FaCalendarAlt,
  FaPercentage,
  FaLock,
  FaGlobe,
  FaInfoCircle,
  FaCheckCircle,
  FaCopy,
  FaUsers,
} from "react-icons/fa";
import {
  fetchCodePromoDetails,
  reserveCodePromo,
  clearReservation,
  clearSelectedCodePromo,
} from "../store/slices/CodePromo";

const CodePromoDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const {
    selectedCodePromo,
    isLoadingDetails,
    detailsError,
    isReserving,
    lastReservation,
    reservationError,
  } = useSelector((state) => state.codePromo);

  const [showCodeModal, setShowCodeModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchCodePromoDetails(id));
    }

    return () => {
      dispatch(clearSelectedCodePromo());
      dispatch(clearReservation());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (lastReservation) {
      setShowCodeModal(true);
      toast.success("Code obtenu avec succès !");
    }
  }, [lastReservation]);

  useEffect(() => {
    if (reservationError) {
      toast.error(reservationError);
    }
  }, [reservationError]);

  const handleReserve = async () => {
    if (!selectedCodePromo) return;

    const result = await dispatch(reserveCodePromo(selectedCodePromo.id));
    if (result.type === reserveCodePromo.fulfilled.type) {
      // Success handled by useEffect
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copié dans le presse-papiers !");
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

  const isExpired = () => {
    if (!selectedCodePromo?.valid_until) return false;
    return new Date(selectedCodePromo.valid_until) < new Date();
  };

  const isUpcoming = () => {
    if (!selectedCodePromo?.valid_from) return false;
    return new Date(selectedCodePromo.valid_from) > new Date();
  };

  const isStockDepleted = () => {
    if (!selectedCodePromo?.is_limited) return false;
    return selectedCodePromo.remaining_quantity <= 0;
  };

  const isDisabled = () => {
    return isExpired() || isUpcoming() || isStockDepleted();
  };

  const getValidityText = () => {
    const codePromo = selectedCodePromo;
    if (!codePromo) return "";

    if (codePromo.valid_from && codePromo.valid_until) {
      return `Du ${new Date(codePromo.valid_from).toLocaleDateString("fr-FR")} au ${new Date(
        codePromo.valid_until
      ).toLocaleDateString("fr-FR")}`;
    } else if (codePromo.valid_from) {
      return `À partir du ${new Date(codePromo.valid_from).toLocaleDateString("fr-FR")}`;
    } else if (codePromo.valid_until) {
      return `Jusqu'au ${new Date(codePromo.valid_until).toLocaleDateString("fr-FR")}`;
    }
    return "Pas de limite de validité";
  };

  if (isLoadingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (detailsError || !selectedCodePromo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Code promo introuvable
          </h2>
          <p className="text-gray-600 mb-6">{detailsError || "Une erreur est survenue"}</p>
          <button
            onClick={() => navigate("/code-promo")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            Retour aux codes promo
          </button>
        </div>
      </div>
    );
  }

  const codePromo = selectedCodePromo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate("/code-promo")}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <FaArrowLeft />
            <span className="font-medium">Retour aux codes promo</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Image/Banner */}
          <div className="relative h-64 bg-gradient-to-br from-indigo-500 to-indigo-600">
            {codePromo.banner_url ? (
              <img
                src={codePromo.banner_url}
                alt={codePromo.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaGift className="text-white/30 text-8xl" />
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Titre & Description */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{codePromo.title}</h1>
              {codePromo.short_description && (
                <p className="text-white/90 text-lg">{codePromo.short_description}</p>
              )}
            </div>
          </div>

          {/* Contenu */}
          <div className="p-8">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-medium">
                <FaPercentage />
                {getOfferTypeLabel(codePromo.offer_type)}
              </span>

              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium">
                {codePromo.code_type === "unique" ? <FaLock /> : <FaGlobe />}
                {codePromo.code_type === "unique" ? "Code unique" : "Code générique"}
              </span>

              {codePromo.is_limited && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 text-orange-700 font-medium">
                  {codePromo.remaining_quantity} / {codePromo.total_quantity}
                </span>
              )}
            </div>

            {/* Carte de détails */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6 space-y-6">
              {/* Validité */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <FaCalendarAlt className="text-indigo-600 text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Validité</h3>
                  <p className="text-gray-600">{getValidityText()}</p>
                </div>
              </div>

              {/* Description longue */}
              {codePromo.long_description && (
                <>
                  <div className="border-t border-gray-200" />
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-100 rounded-xl">
                      <FaInfoCircle className="text-indigo-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Description</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {codePromo.long_description}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Segments */}
              <div className="border-t border-gray-200" />
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <FaUsers className="text-indigo-600 text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Segments éligibles
                  </h3>
                  <p className="text-gray-600">
                    {codePromo.segments && codePromo.segments.length > 0
                      ? codePromo.segments.join(", ")
                      : "Tous les membres"}
                  </p>
                </div>
              </div>
            </div>

            {/* Conditions */}
            {codePromo.conditions && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="text-orange-600 text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Conditions</h3>
                    <p className="text-gray-700 leading-relaxed">{codePromo.conditions}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Statut */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Statut</h3>
              <p className="text-gray-700">
                {isExpired()
                  ? "⛔ Offre expirée"
                  : isUpcoming()
                  ? "🕐 Disponible bientôt"
                  : "✅ Offre active"}
              </p>
            </div>

            {/* Infos partenaire */}
            {codePromo.partner && (
              <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl mb-6">
                <FaStore className="text-indigo-600 text-2xl" />
                <div>
                  <p className="text-sm text-gray-600">Partenaire</p>
                  <p className="font-semibold text-gray-900">{codePromo.partner.name}</p>
                </div>
              </div>
            )}

            {/* Bouton de réservation */}
            <button
              onClick={handleReserve}
              disabled={isDisabled() || isReserving}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                isDisabled() || isReserving
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              }`}
            >
              {isReserving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Réservation en cours...
                </>
              ) : isExpired() ? (
                "Offre expirée"
              ) : isUpcoming() ? (
                "Disponible bientôt"
              ) : isStockDepleted() ? (
                "Stock épuisé"
              ) : (
                <>
                  <FaCheckCircle />
                  Obtenir mon code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal de code */}
        {showCodeModal && lastReservation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <FaCheckCircle className="text-green-600 text-4xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Ton code est prêt !
                </h2>
                <p className="text-gray-600">{codePromo.title}</p>
              </div>

              {/* Affichage du code */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">Code promo</p>
                    <p className="text-2xl font-bold text-gray-900 tracking-wider">
                      {lastReservation.code_value}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(lastReservation.code_value)}
                    className="p-3 bg-indigo-100 hover:bg-indigo-200 rounded-xl transition-colors"
                  >
                    <FaCopy className="text-indigo-600 text-xl" />
                  </button>
                </div>
              </div>

              {/* Expiration */}
              {lastReservation.expires_at && (
                <p className="text-sm text-gray-600 text-center mb-6">
                  Valable jusqu'au{" "}
                  {new Date(lastReservation.expires_at).toLocaleDateString("fr-FR")}, selon
                  les conditions du partenaire.
                </p>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowCodeModal(false);
                    navigate("/mes-code-promo");
                  }}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
                >
                  Voir mes codes
                </button>
                <button
                  onClick={() => {
                    setShowCodeModal(false);
                    dispatch(clearReservation());
                  }}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePromoDetails;