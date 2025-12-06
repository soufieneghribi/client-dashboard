import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, getAuthHeaders } from "../services/api";
import { toast } from "react-hot-toast";
import {
  FaSpinner,
  FaQrcode,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaStore,
  FaTruck,
  FaMobileAlt,
  FaArrowLeft,
  FaCopy,
  FaCalendar,
} from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";

const MesReservations = () => {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, [filterStatus]);

  const fetchReservations = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: 1,
        per_page: 50,
      });

      if (filterStatus) {
        params.append("status", filterStatus);
      }

      const response = await fetch(
        `${API_ENDPOINTS.FREE_PRODUCTS.MY_RESERVATIONS}?${params.toString()}`,
        {
          method: "GET",
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();

      if (result.success) {
        const data = result.data?.data || result.data || [];
        setReservations(data);
      } else {
        toast.error(
          result.message || "Erreur lors du chargement des réservations"
        );
      }
    } catch (error) {
      console.error("Erreur chargement réservations:", error);
      toast.error("Erreur lors du chargement des réservations");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "En attente",
          icon: <FaHourglassHalf />,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
      case "ready":
        return {
          label: "Prêt",
          icon: <FaCheckCircle />,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "completed":
        return {
          label: "Retiré",
          icon: <FaCheckCircle />,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      case "cancelled":
        return {
          label: "Annulé",
          icon: <FaTimesCircle />,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      case "expired":
        return {
          label: "Expiré",
          icon: <FaClock />,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
      default:
        return {
          label: status,
          icon: <FaHourglassHalf />,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case "pickup":
        return <FaStore className="text-blue-500" />;
      case "delivery":
        return <FaTruck className="text-green-500" />;
      case "digital":
        return <FaMobileAlt className="text-purple-500" />;
      default:
        return <FaStore className="text-gray-500" />;
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

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copié dans le presse-papiers!");
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (reservation) => {
    if (!reservation.expires_at) return false;
    return new Date(reservation.expires_at) < new Date();
  };

  const filteredReservations = filterStatus
    ? reservations.filter((r) => r.status === filterStatus)
    : reservations;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/gratuite")}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Retour aux offres</span>
          </button>

          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-2 flex items-center gap-3">
            <FaQrcode className="text-green-600" />
            Mes Réservations
          </h1>
          <p className="text-gray-600 text-lg">
            Consultez et gérez vos réservations de produits gratuits
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === null
                  ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Toutes ({reservations.length})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === "pending"
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              En attente (
              {reservations.filter((r) => r.status === "pending").length})
            </button>
            <button
              onClick={() => setFilterStatus("ready")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === "ready"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Prêt ({reservations.filter((r) => r.status === "ready").length})
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === "completed"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Retiré (
              {reservations.filter((r) => r.status === "completed").length})
            </button>
          </div>
        </div>

        {/* Reservations List */}
        {loading ? (
          <div className="text-center py-16">
            <FaSpinner className="animate-spin text-5xl text-green-500 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Chargement des réservations...
            </p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <div className="text-7xl mb-6">📋</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Aucune réservation
            </h3>
            <p className="text-gray-500 mb-6">
              Vous n'avez pas encore de réservations de produits gratuits
            </p>
            <button
              onClick={() => navigate("/gratuite")}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
            >
              Découvrir les offres
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => {
              const statusInfo = getStatusInfo(reservation.status);
              const isExpiredReservation = isExpired(reservation);
              const isExpanded = expandedId === reservation.id;

              return (
                <div
                  key={reservation.id}
                  className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all hover:shadow-lg ${
                    statusInfo.borderColor
                  } border-2`}
                >
                  {/* Main Content */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => toggleExpand(reservation.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Product Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {reservation.offer?.image && (
                            <img
                              src={reservation.offer.image}
                              alt={reservation.offer?.title}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-1">
                              {reservation.offer?.title || "Produit gratuit"}
                            </h3>

                            <div className="flex flex-wrap gap-2 mb-2">
                              {/* Status Badge */}
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color} ${statusInfo.bgColor}`}
                              >
                                {statusInfo.icon}
                                {statusInfo.label}
                              </span>

                              {/* Mode Badge */}
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {getModeIcon(reservation.mode)}
                                {getModeLabel(reservation.mode)}
                              </span>

                              {/* Quantity */}
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                                Qté: {reservation.quantity}
                              </span>
                            </div>

                            {/* Store Info for Pickup */}
                            {reservation.mode === "pickup" &&
                              reservation.store && (
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                  <FaStore />
                                  {reservation.store.name}
                                  {reservation.store.city &&
                                    ` (${reservation.store.city})`}
                                </p>
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Code Preview */}
                      <div className="text-center">
                        <div className="bg-gray-50 p-3 rounded-lg mb-2">
                          <QRCodeSVG
                            value={reservation.pickup_code}
                            size={80}
                            level="M"
                          />
                        </div>
                        <p className="text-xs text-gray-600 font-mono">
                          {reservation.pickup_code}
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaCalendar />
                        <span>Réservé le: {formatDate(reservation.reserved_at)}</span>
                      </div>
                      {reservation.expires_at && (
                        <div
                          className={`flex items-center gap-2 ${
                            isExpiredReservation ? "text-red-600" : ""
                          }`}
                        >
                          <FaClock />
                          <span>
                            Expire le: {formatDate(reservation.expires_at)}
                          </span>
                          {isExpiredReservation && (
                            <span className="text-xs font-bold">(EXPIRÉ)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <div className="pt-4">
                        {/* Large QR Code */}
                        <div className="text-center mb-6">
                          <p className="text-sm text-gray-600 mb-3 font-medium">
                            Code de réservation
                          </p>
                          <div className="inline-block p-4 bg-white border-4 border-gray-200 rounded-2xl shadow-lg mb-3">
                            <QRCodeSVG
                              value={reservation.pickup_code}
                              size={200}
                              level="H"
                              includeMargin={true}
                            />
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <p className="text-2xl font-bold text-gray-800 tracking-wider font-mono">
                              {reservation.pickup_code}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(reservation.pickup_code);
                              }}
                              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              title="Copier le code"
                            >
                              <FaCopy className="text-gray-600" />
                            </button>
                          </div>
                        </div>

                        {/* Additional Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {reservation.ready_at && (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">
                                Prêt depuis
                              </p>
                              <p className="text-sm font-semibold text-gray-800">
                                {formatDate(reservation.ready_at)}
                              </p>
                            </div>
                          )}
                          {reservation.completed_at && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">
                                Retiré le
                              </p>
                              <p className="text-sm font-semibold text-gray-800">
                                {formatDate(reservation.completed_at)}
                              </p>
                            </div>
                          )}
                          {reservation.cancelled_at && (
                            <div className="bg-red-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">
                                Annulé le
                              </p>
                              <p className="text-sm font-semibold text-gray-800">
                                {formatDate(reservation.cancelled_at)}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {reservation.notes && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Notes</p>
                            <p className="text-sm text-gray-700">
                              {reservation.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesReservations;