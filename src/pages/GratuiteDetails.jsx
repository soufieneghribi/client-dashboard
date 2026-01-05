import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_ENDPOINTS, getAuthHeaders } from "../services/api";

import {
  FaSpinner,
  FaStore,
  FaTruck,
  FaMobileAlt,
  FaCalendar,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import { MdCategory } from "react-icons/md";

const GratuiteDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [myReservations, setMyReservations] = useState([]);

  useEffect(() => {
    fetchOfferDetails();
    fetchMyReservations();
  }, [id]);

  const fetchOfferDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.FREE_PRODUCTS.BY_ID(id), {
        method: "GET",
        headers: getAuthHeaders(token),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();

      if (result.success) {
        const offerData = result.data;
        setOffer(offerData);

        // Initialize selections
        const modes = getAvailableModes(offerData.distribution_mode);
        if (modes.length > 0) {
          setSelectedMode(modes[0]);
          if (modes[0] === "pickup" && offerData.stores?.length > 0) {
            setSelectedStoreId(offerData.stores[0].id);
          }
        }
      } else {
        // 
        navigate("/gratuite");
      }
    } catch (error) {

      // 
      navigate("/gratuite");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReservations = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.FREE_PRODUCTS.MY_RESERVATIONS}?per_page=50`,
        {
          method: "GET",
          headers: getAuthHeaders(token),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMyReservations(result.data || []);
        }
      }
    } catch (error) {

    }
  };

  const getClientUsedQuantity = () => {
    if (!offer) return 0;
    return myReservations
      .filter(
        (res) =>
          res.free_product_offer_id === offer.id &&
          res.status !== "cancelled"
      )
      .reduce((total, res) => total + res.quantity, 0);
  };

  const hasReachedLimit = () => {
    if (!offer || !offer.max_per_client || offer.max_per_client === 0) {
      return false;
    }
    return getClientUsedQuantity() >= offer.max_per_client;
  };

  const getAvailableModes = (distributionMode) => {
    switch (distributionMode) {
      case "pickup":
        return ["pickup"];
      case "delivery":
        return ["delivery"];
      case "digital":
        return ["digital"];
      case "both":
        return ["pickup", "delivery"];
      default:
        return ["pickup"];
    }
  };

  const getModeLabel = (mode) => {
    switch (mode) {
      case "pickup":
        return "Retrait magasin";
      case "delivery":
        return "Livraison";
      case "digital":
        return "Digital";
      default:
        return mode;
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case "pickup":
        return <FaStore />;
      case "delivery":
        return <FaTruck />;
      case "digital":
        return <FaMobileAlt />;
      default:
        return <FaStore />;
    }
  };

  const getModeHelpText = (mode) => {
    switch (mode) {
      case "pickup":
        return "Vous recevrez un code à présenter en caisse dans le magasin sélectionné avant la date d'expiration.";
      case "delivery":
        return "Conservez ce code, il pourra vous être demandé lors de la livraison de votre commande.";
      case "digital":
        return "Ce code vous permet de profiter de votre avantage digital. Gardez-le précieusement.";
      default:
        return "Vous recevrez un code pour profiter de ce produit gratuit selon le mode choisi.";
    }
  };

  const handleReserve = async () => {
    if (!offer || !selectedMode) return;

    if (selectedMode === "pickup" && !selectedStoreId) {
      // 
      return;
    }

    setReserving(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(API_ENDPOINTS.FREE_PRODUCTS.RESERVE(id), {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          mode: selectedMode,
          store_id: selectedMode === "pickup" ? selectedStoreId : null,
          quantity: quantity,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();

      if (result.success) {
        const pickupCode = result.data?.pickup_code;


        // Navigate to success page
        navigate("/gratuite/success", {
          state: {
            offer: offer,
            pickupCode: pickupCode,
            mode: selectedMode,
            storeName:
              selectedMode === "pickup"
                ? offer.stores.find((s) => s.id === selectedStoreId)?.name
                : null,
          },
        });
      } else {

      }
    } catch (error) {

      // 
    } finally {
      setReserving(false);
    }
  };

  const formatValidityPeriod = (offer) => {
    if (!offer) return "";
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

  const isOfferAvailable = () => {
    if (!offer) return false;
    if (!offer.is_published) return false;
    if (offer.remaining_quantity <= 0) return false;

    const now = new Date();
    if (offer.valid_from && now < new Date(offer.valid_from)) return false;
    if (offer.valid_until && now > new Date(offer.valid_until)) return false;

    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-green-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            Chargement des détails de l'offre...
          </p>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Offre introuvable
          </h2>
          <button
            onClick={() => navigate("/gratuite")}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Retour aux offres
          </button>
        </div>
      </div>
    );
  }

  const usedQuantity = getClientUsedQuantity();
  const reachedLimit = hasReachedLimit();
  const available = isOfferAvailable();
  const canReserve =
    available &&
    !reachedLimit &&
    selectedMode &&
    (selectedMode !== "pickup" || selectedStoreId);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/gratuite")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
        >
          <FaArrowLeft />
          <span>Retour aux offres</span>
        </button>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Image Header */}
          <div className="relative h-96">
            <img
              src={
                offer.image ||
                "https://via.placeholder.com/800x400?text=Produit+Gratuit"
              }
              alt={offer.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h1 className="text-4xl font-bold mb-2">{offer.title}</h1>
              <div className="flex items-center gap-4 text-sm">
                {offer.type && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <MdCategory />
                    <span>{offer.type}</span>
                  </div>
                )}
                {offer.partner_name && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <FaStore />
                    <span>{offer.partner_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Stock & Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Stock disponible</p>
                <p className="text-2xl font-bold text-gray-800">
                  {offer.remaining_quantity} / {offer.total_quantity}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Limite par client</p>
                <p className="text-2xl font-bold text-gray-800">
                  {offer.max_per_client
                    ? `${offer.max_per_client} produit(s)`
                    : "Aucune limite"}
                </p>
              </div>
            </div>

            {/* User Usage Info */}
            {offer.max_per_client && offer.max_per_client > 0 && (
              <div
                className={`mb-6 p-4 rounded-xl ${reachedLimit
                    ? "bg-red-50 border border-red-200"
                    : "bg-blue-50 border border-blue-200"
                  }`}
              >
                <p className="text-sm text-gray-700">
                  {reachedLimit ? (
                    <span className="text-red-700 font-semibold">
                      Vous avez déjà atteint la limite pour cette offre (
                      {usedQuantity}/{offer.max_per_client})
                    </span>
                  ) : (
                    <span>
                      Vous avez déjà réservé{" "}
                      <strong>
                        {usedQuantity} / {offer.max_per_client}
                      </strong>{" "}
                      produit(s) gratuit(s)
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Description */}
            {offer.description && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-3">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {offer.description}
                </p>
              </div>
            )}

            {/* Conditions */}
            {offer.conditions_text && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="text-orange-600 text-xl flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">
                      Conditions
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {offer.conditions_text}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Validity Period */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl flex items-center gap-3">
              <FaCalendar className="text-blue-600 text-xl" />
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Période de validité
                </p>
                <p className="font-semibold text-gray-800">
                  {formatValidityPeriod(offer)}
                </p>
              </div>
            </div>

            {/* Distribution Mode Selection */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Mode de réception
              </h2>
              <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                <FaInfoCircle />
                Choisissez comment vous souhaitez récupérer ce produit gratuit
              </p>

              <div className="flex flex-wrap gap-3 mb-4">
                {getAvailableModes(offer.distribution_mode).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setSelectedMode(mode);
                      if (mode === "pickup" && offer.stores?.length > 0) {
                        setSelectedStoreId(offer.stores[0].id);
                      } else {
                        setSelectedStoreId(null);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${selectedMode === mode
                        ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {getModeIcon(mode)}
                    <span className="font-medium">{getModeLabel(mode)}</span>
                  </button>
                ))}
              </div>

              {selectedMode && (
                <div className="p-3 bg-gray-50 rounded-lg flex items-start gap-2 text-sm text-gray-700">
                  {getModeIcon(selectedMode)}
                  <p>{getModeHelpText(selectedMode)}</p>
                </div>
              )}
            </div>

            {/* Store Selection for Pickup */}
            {selectedMode === "pickup" && offer.stores && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-green-600" />
                  Magasin de retrait
                </h3>
                {offer.stores.length === 0 ? (
                  <p className="text-red-600 text-sm">
                    Aucun magasin configuré pour cette offre
                  </p>
                ) : (
                  <select
                    value={selectedStoreId || ""}
                    onChange={(e) =>
                      setSelectedStoreId(parseInt(e.target.value))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {offer.stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                        {store.city ? ` (${store.city})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Reserve Button */}
            <button
              onClick={handleReserve}
              disabled={!canReserve || reserving}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${canReserve
                  ? "bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              {reserving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Réservation en cours...
                </>
              ) : !available ? (
                "Produit non disponible"
              ) : reachedLimit ? (
                "Limite atteinte"
              ) : (
                <>
                  <FaCheckCircle />
                  Réserver ce produit gratuit
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GratuiteDetails;


