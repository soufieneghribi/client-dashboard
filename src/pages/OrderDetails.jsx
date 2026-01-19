import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaDownload,
  FaSpinner,
  FaBox,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCreditCard,
  FaTruck,
  FaStore,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChevronRight,
  FaHistory
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import axios from "axios";
import { API_ENDPOINTS, API_BASE_URL, getAuthHeaders, getAuthHeadersBinary } from "../services/api";
import PdfService from "../services/PdfService";


const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const confirmedTotalFromState = location.state?.confirmedTotal;
  const confirmedDeliveryFeeFromState = location.state?.confirmedDeliveryFee;
  const confirmedCagnotteFromState = location.state?.confirmedCagnotte;
  const confirmedItemsTotalFromState = location.state?.confirmedItemsTotal;

  // États
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  /**
   * ✅ Récupérer les détails de la commande
   */
  const fetchOrderDetails = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ Use the dedicated details API instead of filtering the list
      // This ensures we get the most accurate and fresh data for this specific order
      const response = await axios.get(
        API_ENDPOINTS.ORDERS.BY_ID(orderId),
        { headers: getAuthHeaders() }
      );

      const foundOrder = response.data?.data || response.data;

      if (!foundOrder || (typeof foundOrder === 'object' && Object.keys(foundOrder).length === 0)) {
        // Fallback to list if details API fails or returns empty
        const listResponse = await axios.get(
          API_ENDPOINTS.ORDERS.LIST,
          { headers: getAuthHeaders() }
        );
        const orders = listResponse.data?.data || listResponse.data || [];
        const orderFromList = Array.isArray(orders)
          ? orders.find(o => o.id === parseInt(orderId))
          : null;

        if (orderFromList) {
          setOrder(orderFromList);
        } else {
          setError("Commande introuvable");
        }
      } else {
        setOrder(foundOrder);
      }

    } catch (err) {
      console.error("❌ Error fetching order details:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Erreur de chargement des détails");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ Télécharger le PDF de la commande (Version Authentifiée avec Fallback et Détection d'Erreur)
   */
  const handleDownloadPDF = async () => {
    if (!order) {
      // 
      return;
    }

    // 

    try {
      // Calculer les montants cohérents avec la vue
      const itemsTotal = confirmedItemsTotalFromState !== undefined
        ? parseFloat(confirmedItemsTotalFromState)
        : order.details
          ? order.details.reduce((sum, item) => {
            const actualPrice = parseFloat(item.promo_price || item.price || 0);
            return sum + (actualPrice * parseInt(item.quantity));
          }, 0)
          : 0;

      const deliveryFee = confirmedDeliveryFeeFromState !== undefined
        ? parseFloat(confirmedDeliveryFeeFromState)
        : (parseFloat(order.delivery_fee) || 0);

      const cagnotte = confirmedCagnotteFromState !== undefined
        ? parseFloat(confirmedCagnotteFromState)
        : (parseFloat(order.cagnotte_deduction) || 0);

      const confirmedTotal = confirmedTotalFromState
        ? parseFloat(confirmedTotalFromState)
        : Math.max(0, itemsTotal + deliveryFee - cagnotte);

      // ✅ Génération locale (découplée du serveur)
      const fullOrderData = {
        ...order,
        details: order.details,
        client: order.client || {},
        // Forcer les montants pour la facture PDF
        order_amount: itemsTotal, // Le sous-total réel
        delivery_fee: deliveryFee,
        cagnotte_deduction: cagnotte,
        total_amount: confirmedTotal
      };

      PdfService.generateOrderPdf(fullOrderData);

      // 
    } catch (err) {

      // 
    }
  };

  const downloadBlob = (blob, filename) => {
    // S'assurer que le blob est traité correctement
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  /**
   * ✅ Annuler la commande
   */
  const handleCancelOrder = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) {
      return;
    }

    const token = localStorage.getItem("token");
    setCancelling(true);

    try {
      const response = await axios.put(
        `${API_ENDPOINTS.ORDERS.LIST.replace('/list', '/cancel')}`,
        { order_id: orderId },
        { headers: getAuthHeaders(token) }
      );

      // 

      // Recharger les détails
      await fetchOrderDetails();
    } catch (err) {


    } finally {
      setCancelling(false);
    }
  };

  /**
   * ✅ Obtenir les informations de statut avec timeline
   */
  const getStatusInfo = (status) => {
    const configs = {
      pending: {
        label: "En attente",
        color: "bg-yellow-100 text-yellow-700",
        progress: 1
      },
      confirmed: {
        label: "Confirmée",
        color: "bg-blue-100 text-blue-700",
        progress: 2
      },
      processing: {
        label: "En préparation",
        color: "bg-purple-100 text-purple-700",
        progress: 3
      },
      preparing: {
        label: "En préparation",
        color: "bg-purple-100 text-purple-700",
        progress: 3
      },
      out_for_delivery: {
        label: "En livraison",
        color: "bg-indigo-100 text-indigo-700",
        progress: 4
      },
      delivered: {
        label: "Livrée",
        color: "bg-green-100 text-green-700",
        progress: 5
      },
      canceled: {
        label: "Annulée",
        color: "bg-red-100 text-red-700",
        progress: 0
      },
      failed: {
        label: "Échouée",
        color: "bg-red-100 text-red-700",
        progress: 0
      },
    };
    return configs[status] || {
      label: status,
      color: "bg-gray-100 text-gray-700",
      progress: 0
    };
  };

  /**
   * ✅ Formater la date
   */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date invalide";
    }
  };

  /**
   * ✅ Obtenir le label de paiement
   */
  const getPaymentLabel = (method) => {
    const labels = {
      cash: "Espèces à la livraison",
      card: "Carte bancaire",
      smt_card: "Paiement SMT",
      d17: "Paiement D17",
      flouci: "Paiement Flouci",
      paymee: "Paiement PayMee",
      wallet: "Portefeuille",
      bank_transfer: "Virement bancaire",
    };
    return labels[method] || method;
  };

  /**
   * ✅ Obtenir le label du type de commande
   */
  const getOrderTypeLabel = (type) => {
    const labels = {
      delivery: "Livraison à domicile",
      pickup: "Retrait en magasin",
      relay_point: "Point relais",
    };
    return labels[type] || type;
  };

  /**
   * ✅ Vérifier si la commande peut être annulée
   */
  const canCancelOrder = () => {
    if (!order) return false;
    const cancelableStatuses = ['pending', 'confirmed'];
    return cancelableStatuses.includes(order.order_status);
  };

  /**
   * ✅ Timeline de statut
   */
  const OrderTimeline = ({ currentStatus }) => {
    const statusInfo = getStatusInfo(currentStatus);
    const steps = [
      { label: 'En attente', value: 1 },
      { label: 'Confirmée', value: 2 },
      { label: 'En préparation', value: 3 },
      { label: 'En livraison', value: 4 },
      { label: 'Livrée', value: 5 }
    ];

    if (currentStatus === 'canceled' || currentStatus === 'failed') {
      return (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3 text-red-700">
            <FaExclamationTriangle className="text-2xl" />
            <div>
              <p className="font-semibold">Commande {statusInfo.label}</p>
              <p className="text-sm">Cette commande n'est plus active</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Suivi de commande</h3>
        <div className="relative">
          {steps.map((step, index) => (
            <div key={step.value} className="flex items-center mb-4 last:mb-0">
              {/* Circle */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${step.value <= statusInfo.progress
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-500'
                }`}>
                {step.value <= statusInfo.progress ? (
                  <FaCheckCircle />
                ) : (
                  <span className="text-sm font-semibold">{step.value}</span>
                )}
              </div>

              {/* Line */}
              {index < steps.length - 1 && (
                <div className={`absolute left-5 w-0.5 h-12 ${step.value < statusInfo.progress
                  ? 'bg-green-500'
                  : 'bg-gray-200'
                  }`} style={{ top: `${index * 4 + 2.5}rem` }} />
              )}

              {/* Label */}
              <div className="ml-4">
                <p className={`font-semibold ${step.value <= statusInfo.progress
                  ? 'text-gray-800'
                  : 'text-gray-400'
                  }`}>
                  {step.label}
                </p>
                {step.value === statusInfo.progress && (
                  <p className="text-sm text-green-600">En cours</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ✅ État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  // ✅ État d'erreur
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Commande introuvable</h2>
          <p className="text-gray-600 mb-6">{error || "Cette commande n'existe pas"}</p>
          <button
            onClick={() => navigate("/Mes-Commandes")}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retour aux commandes
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.order_status);
  const deliveryInfo = order.delivery_address
    ? (typeof order.delivery_address === 'string'
      ? JSON.parse(order.delivery_address)
      : order.delivery_address)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* ✅ Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div>
            <button
              onClick={() => navigate("/Mes-Commandes")}
              className="group mb-6 flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold uppercase tracking-widest text-[10px] transition-all"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Retour à l'historique</span>
            </button>

            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Commande <span className="text-blue-600">#{order.id}</span>
              </h1>
              <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-slate-400 font-medium flex items-center gap-2">
              <FaCalendarAlt className="text-slate-300" />
              Générée le {formatDate(order.created_at)}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                Ref: #{order.id}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                Type: {getOrderTypeLabel(order.order_type)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadPDF}
              className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
            >
              <FaDownload className="text-base" />
              <span>Facture PDF</span>
            </motion.button>

            {canCancelOrder() && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex items-center gap-3 px-6 py-4 bg-red-50 text-red-600 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-red-100 transition-all disabled:opacity-50"
              >
                {cancelling ? <FaSpinner className="animate-spin" /> : <span>Annuler la commande</span>}
              </motion.button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-8">

            {/* 1. Suivi de commande */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <FaHistory size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Suivi de votre commande</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Progression en temps réel</p>
                  </div>
                </div>

                <div className="relative pt-2">
                  <OrderTimeline currentStatus={order.order_status} />
                </div>
              </div>
            </motion.div>

            {/* 2. Liste des Articles */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <FaBox size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">
                      Détails des articles
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {order.details_count || 0} produits sélectionnés
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.details?.map((item, index) => (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + (index * 0.05) }}
                      className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-[2rem] bg-slate-50/50 border border-transparent hover:border-slate-100 hover:bg-white transition-all"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-white rounded-2xl p-1 shadow-sm border border-slate-100 flex-shrink-0 overflow-hidden">
                        {item.article?.img ? (
                          <img
                            src={item.article.img.startsWith('http')
                              ? item.article.img
                              : `https://tn360-back-office-122923924979.europe-west1.run.app/${item.article.img}`}
                            alt={item.article?.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Produit'; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200 text-xl">
                            <FaBox />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-800 tracking-tight truncate group-hover:text-blue-600 transition-colors">
                          {item.article?.name || "Article sans nom"}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-slate-400 bg-white px-2 py-0.5 rounded-lg border border-slate-100 tracking-widest uppercase">
                            Qté: {item.quantity}
                          </span>
                          {(item.promo_id || item.is_promotion || item.isPromotion || item.has_promotion) && (
                            <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100 tracking-widest uppercase">
                              Promotion
                            </span>
                          )}
                          <span className="text-[10px] font-black text-slate-300">
                            Ref: #{item.article_id}
                          </span>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-end justify-between sm:flex-col sm:items-end gap-1">
                        {(() => {
                          const actualPrice = parseFloat(item.promo_price || item.price || 0);
                          const originalPrice = parseFloat(item.initial_price || item.Initialprice || (parseFloat(item.promo_price) && parseFloat(item.price) > parseFloat(item.promo_price) ? item.price : null) || actualPrice);
                          const hasPromo = (item.promo_id || item.is_promotion || item.isPromotion || item.has_promotion) || (originalPrice > actualPrice);

                          return (
                            <>
                              {hasPromo ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded mb-1 uppercase tracking-widest">
                                    Promo
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {originalPrice > actualPrice && (
                                      <p className="text-[10px] font-bold text-slate-300 line-through uppercase tracking-tighter">
                                        {originalPrice.toFixed(2)} DT
                                      </p>
                                    )}
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                      {actualPrice.toFixed(2)} DT / unité
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                  {actualPrice.toFixed(2)} DT / unité
                                </p>
                              )}
                              <p className="text-lg font-black text-slate-900 tracking-tight">
                                {(actualPrice * parseInt(item.quantity)).toFixed(2)} <span className="text-xs">DT</span>
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-8">

            {/* Résumé Financier */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/20"
            >
              <h2 className="text-lg font-black uppercase tracking-widest mb-8 text-slate-400">Résumé du règlement</h2>

              <div className="space-y-4 mb-8">
                {/* Manual Totals Calculation for absolute mathematical consistency */}
                {(() => {
                  const itemsTotal = confirmedItemsTotalFromState !== undefined
                    ? parseFloat(confirmedItemsTotalFromState)
                    : order.details
                      ? order.details.reduce((sum, item) => {
                        const actualPrice = parseFloat(item.promo_price || item.price || 0);
                        return sum + (actualPrice * parseInt(item.quantity));
                      }, 0)
                      : 0;

                  // Priority: Use the fee and deduction the user actually saw and confirmed
                  const deliveryFee = confirmedDeliveryFeeFromState !== undefined
                    ? parseFloat(confirmedDeliveryFeeFromState)
                    : (parseFloat(order.delivery_fee) || 0);

                  const cagnotte = confirmedCagnotteFromState !== undefined
                    ? parseFloat(confirmedCagnotteFromState)
                    : (parseFloat(order.cagnotte_deduction) || 0);

                  // Priority: If the serve total (order_amount) seems logical, we use it.
                  // Special Case: If we just came from checkout, we use the confirmedTotalFromState.
                  const calculatedTotal = Math.max(0, itemsTotal + deliveryFee - cagnotte);
                  const serverTotal = parseFloat(order.order_amount) || 0;

                  // Use confirmedTotalFromState if available (means we just placed the order)
                  // Regularization logic: 
                  // 1. If server total is exactly subtotal but there are deductions, server total is wrong.
                  // 2. If server total and calculated total differ significantly and we have deductions, trust calculated total.
                  const isServerTotalIncorrect = (Math.abs(serverTotal - itemsTotal) < 0.1 || Math.abs(serverTotal - calculatedTotal) > 0.1) && (deliveryFee > 0 || cagnotte > 0);

                  const finalTotal = confirmedTotalFromState !== undefined
                    ? parseFloat(confirmedTotalFromState)
                    : isServerTotalIncorrect
                      ? calculatedTotal
                      : serverTotal;

                  return (
                    <>
                      <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-tighter text-xs">
                        <span>Sous-total</span>
                        <span className="text-white">{itemsTotal.toFixed(2)} DT</span>
                      </div>

                      {deliveryFee > 0 && (
                        <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-tighter text-xs">
                          <span>Livraison</span>
                          <span className="text-blue-400">+{deliveryFee.toFixed(2)} DT</span>
                        </div>
                      )}

                      {cagnotte > 0 && (
                        <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-tighter text-xs">
                          <span>Déd. Cagnotte</span>
                          <span className="text-green-400">-{cagnotte.toFixed(2)} DT</span>
                        </div>
                      )}

                      <div className="pt-6 mt-6 border-t border-slate-800 flex justify-between items-center">
                        <span className="font-black uppercase tracking-[0.2em] text-[10px] text-slate-500">Total TTC</span>
                        <div className="text-right">
                          <span className="text-3xl font-black tracking-tighter">
                            {finalTotal.toFixed(2)} <span className="text-sm">DT</span>
                          </span>
                          {Math.abs(finalTotal - parseFloat(order.order_amount)) > 0.1 && !confirmedTotalFromState && (
                            <p className="text-[10px] text-slate-500 font-bold italic mt-1 opacity-50">
                              (Régularisé)
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className={`p-4 rounded-2xl flex items-center gap-3 ${order.payment_status === "paid" ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400"
                }`}>
                <FaCreditCard />
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest">{getPaymentLabel(order.payment_method)}</p>
                  <p className="font-bold text-xs">{order.payment_status === "paid" ? "Paiement validé" : "Règlement en attente"}</p>
                </div>
                {order.payment_status === "paid" && <FaCheckCircle />}
              </div>
            </motion.div>

            {/* Livraison & Contact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 space-y-8"
            >
              {/* Type Livraison */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${order.order_type === 'pickup' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                    {order.order_type === 'pickup' ? <FaStore size={16} /> : <FaTruck size={16} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 tracking-tight">Mode d'obtention</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{getOrderTypeLabel(order.order_type)}</p>
                  </div>
                </div>

                {/* Info spécifique type */}
                {order.order_type === "delivery" && deliveryInfo?.address ? (
                  <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 flex gap-3">
                    <FaMapMarkerAlt className="text-slate-300 mt-1 flex-shrink-0" />
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{deliveryInfo.address}</p>
                  </div>
                ) : order.order_type === "pickup" && order.store ? (
                  <div className="bg-emerald-50/50 p-5 rounded-[1.5rem] border border-emerald-100 flex gap-3">
                    <FaStore className="text-emerald-500 mt-1 flex-shrink-0" size={16} />
                    <div>
                      <p className="text-xs font-black text-slate-800 mb-1">{order.store.name || "Magasin sélectionné"}</p>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">{order.store.address}</p>
                    </div>
                  </div>
                ) : order.order_type === "relay_point" ? (
                  <div className="bg-amber-50/50 p-5 rounded-[1.5rem] border border-amber-100 flex gap-3">
                    <FaMapMarkerAlt className="text-amber-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-black text-slate-800 mb-1">Point Relais</p>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">{order.address || "Adresse point relais"}</p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Contact Client */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <FaUser size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 tracking-tight">Destinataire</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {order.contact_person_name && order.contact_person_name !== "N/A"
                        ? order.contact_person_name
                        : order.client?.nom_et_prenom && order.client.nom_et_prenom !== "N/A"
                          ? order.client.nom_et_prenom
                          : "Client de la commande"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-600 font-bold text-xs bg-slate-50 p-4 rounded-2xl w-fit">
                  <FaPhone className="text-indigo-400" />
                  <span>{order.contact_person_number && order.contact_person_number !== "N/A" ? order.contact_person_number : order.client?.tel || "N/A"}</span>
                </div>
              </div>

              {/* OTP Section for Pickup */}
              {order.otp && order.order_type === "pickup" && (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="mt-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white text-center shadow-lg shadow-blue-500/20"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 opacity-70">Code de retrait</p>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl py-4 border border-white/20">
                    <p className="text-4xl font-black tracking-[0.2em] font-mono leading-none">{order.otp}</p>
                  </div>
                  <p className="text-[9px] mt-4 font-bold text-blue-100 leading-tight">Présentez ce code exclusif au guichet pour retirer vos articles</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div >
    </div >
  );
};

export default OrderDetails;


