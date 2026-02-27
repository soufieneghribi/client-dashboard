import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaShoppingBag, 
  FaClock, 
  FaUser,
  FaPhone,
  FaCheckCircle,
  FaBox,
  FaMoneyBillWave,
  FaTruck,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import { fetchOrder } from "../store/slices/order";
import { fetchUserProfile } from "../store/slices/user";
import { useDispatch, useSelector } from "react-redux";


/**
 * Commandes Component - Simple, User-Friendly with Pagination
 */
const Commandes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth_token = localStorage.getItem("token");
  
  const { order = [], loading: orderLoading } = useSelector((state) => state.order);
  const { Userprofile, loading: userLoading } = useSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState("actuelle");
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 5;

  // Fonction de tri par date décroissante (les plus récentes en premier)
  const sortOrdersByDate = (orders) => {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA; // Ordre décroissant (plus récent en premier)
    });
  };

  // Séparer les commandes et les trier
  const currentOrders = sortOrdersByDate(
    order.filter((o) => 
      ["pending", "confirmed", "processing", "out_for_delivery"].includes(o.order_status)
    )
  );
  
  const historicalOrders = sortOrdersByDate(
    order.filter((o) => 
      ["delivered", "canceled", "failed", "returned"].includes(o.order_status)
    )
  );

  const displayOrders = activeTab === "actuelle" ? currentOrders : historicalOrders;

  // Calcul de la pagination
  const totalPages = Math.ceil(displayOrders.length / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = startIndex + ORDERS_PER_PAGE;
  const currentDisplayOrders = displayOrders.slice(startIndex, endIndex);

  // Réinitialiser la page quand on change d'onglet
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (!auth_token) {
      // 
      navigate("/login");
      return;
    }
    
    dispatch(fetchOrder(auth_token));
    dispatch(fetchUserProfile());
  }, [auth_token, navigate, dispatch]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  if (orderLoading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* En-tête simple avec infos utilisateur */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Titre et bienvenue */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              Mes commandes
            </h1>
            {Userprofile && (
              <p className="text-gray-600">
                Bonjour <span className="font-semibold text-gray-800">{Userprofile.nom_et_prenom || "Client"}</span> 👋
              </p>
            )}
          </div>

        
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-5xl mx-auto px-4">
        {/* Onglets simples */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-1 flex gap-2">
          <button
            onClick={() => setActiveTab("actuelle")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === "actuelle"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <FaShoppingBag />
              En cours
              {currentOrders.length > 0 && (
                <span className="bg-white text-blue-500 rounded-full px-2 py-0.5 text-xs font-bold">
                  {currentOrders.length}
                </span>
              )}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("historique")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === "historique"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <FaClock />
              Historique
              {historicalOrders.length > 0 && (
                <span className="bg-white text-blue-500 rounded-full px-2 py-0.5 text-xs font-bold">
                  {historicalOrders.length}
                </span>
              )}
            </span>
          </button>
        </div>

        {/* Liste des commandes */}
        {displayOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-300 mb-4">
              <FaShoppingBag className="text-6xl mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {activeTab === "actuelle" ? "Aucune commande en cours" : "Aucun historique"}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === "actuelle" 
                ? "Vos commandes en cours apparaîtront ici"
                : "Vos anciennes commandes apparaîtront ici"}
            </p>
            {activeTab === "actuelle" && (
              <button
                onClick={() => navigate("/")}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Commencer mes achats
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Cards des commandes */}
            <div className="space-y-4 mb-6">
              {currentDisplayOrders.map((order) => (
                <OrderCard key={order.id} order={order} navigate={navigate} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

/**
 * OrderCard - Card de commande simple et claire
 */
const OrderCard = ({ order, navigate }) => {
  const statusConfig = getStatusConfig(order.order_status);
  const orderDate = new Date(order.created_at);
  
  // Format de date avec heure pour les commandes récentes
  const formattedDate = orderDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  
  const formattedTime = orderDate.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  // Vérifier si la commande a moins de 24h
  const isNew = (Date.now() - orderDate.getTime()) < 24 * 60 * 60 * 1000;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      {/* En-tête de la commande */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-800">
                  Commande #{order.id}
                </h3>
                {isNew && (
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                    NOUVELLE
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {formattedDate} à {formattedTime}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.badgeClass}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Corps de la commande */}
      <div className="px-6 py-4">
        {/* Informations en grille */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Articles */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mb-2">
              <FaBox className="text-blue-500 text-lg" />
            </div>
            <p className="text-xl font-bold text-gray-800">{order.details_count || 0}</p>
            <p className="text-xs text-gray-500">Articles</p>
          </div>

          {/* Paiement */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-lg mb-2">
              <FaMoneyBillWave className="text-green-500 text-lg" />
            </div>
            <p className="text-sm font-semibold text-gray-800 capitalize">
              {order.payment_method === "cash" ? "Espèces" : 
               order.payment_method === "card" ? "Carte" : 
               order.payment_method}
            </p>
            <p className="text-xs text-gray-500">Paiement</p>
          </div>

          {/* Livraison */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-50 rounded-lg mb-2">
              <FaTruck className="text-orange-500 text-lg" />
            </div>
            <p className="text-sm font-semibold text-gray-800 capitalize">
              {order.order_type === "delivery" ? "Livraison" : "Retrait"}
            </p>
            <p className="text-xs text-gray-500">Type</p>
          </div>
        </div>

        {/* Bas de la card */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total</p>
            <p className="text-2xl font-bold text-blue-500">
              {parseFloat(order.order_amount || 0).toFixed(2)} DT
            </p>
          </div>
          <button
            onClick={() => navigate(`/order/${order.id}`)}
            className="bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm"
          >
            Voir détails
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Pagination Component - Simple et clair
 */
const Pagination = ({ currentPage, totalPages, onPageChange, onPrevious, onNext }) => {
  // Générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Afficher toutes les pages si moins de 5
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour afficher 5 pages avec ... si nécessaire
      if (currentPage <= 3) {
        // Au début
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // À la fin
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Au milieu
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Info */}
        <div className="text-sm text-gray-600">
          Page <span className="font-semibold text-gray-800">{currentPage}</span> sur{' '}
          <span className="font-semibold text-gray-800">{totalPages}</span>
        </div>

        {/* Boutons de pagination */}
        <div className="flex items-center gap-2">
          {/* Bouton Précédent */}
          <button
            onClick={onPrevious}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FaChevronLeft className="text-sm" />
            <span className="hidden sm:inline">Précédent</span>
          </button>

          {/* Numéros de page */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          {/* Bouton Suivant */}
          <button
            onClick={onNext}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="hidden sm:inline">Suivant</span>
            <FaChevronRight className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Configuration des statuts - Simple et clair
 */
const getStatusConfig = (status) => {
  const configs = {
    pending: {
      label: "En attente",
      badgeClass: "bg-yellow-100 text-yellow-700"
    },
    confirmed: {
      label: "Confirmée",
      badgeClass: "bg-blue-100 text-blue-700"
    },
    processing: {
      label: "En préparation",
      badgeClass: "bg-purple-100 text-purple-700"
    },
    out_for_delivery: {
      label: "En livraison",
      badgeClass: "bg-indigo-100 text-indigo-700"
    },
    delivered: {
      label: "Livrée",
      badgeClass: "bg-green-100 text-green-700"
    },
    canceled: {
      label: "Annulée",
      badgeClass: "bg-red-100 text-red-700"
    },
    failed: {
      label: "Échouée",
      badgeClass: "bg-red-100 text-red-700"
    },
    returned: {
      label: "Retournée",
      badgeClass: "bg-orange-100 text-orange-700"
    }
  };

  return configs[status] || configs.pending;
};

export default Commandes;


