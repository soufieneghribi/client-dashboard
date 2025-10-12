import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaRegClock,
} from "react-icons/fa";
import { fetchOrder } from "../store/slices/order";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

const Commandes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth_token = localStorage.getItem("token");
  const { order = [], loading, error } = useSelector((state) => state.order);

  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 8;

  // Filtrer les commandes selon les critères
  const filteredOrders = order.filter((orders) => {
    const matchesStatus = statusFilter ? orders.order_status === statusFilter : true;
    const matchesDateFrom = dateFrom ? new Date(orders.created_at) >= new Date(dateFrom) : true;
    const matchesDateTo = dateTo ? new Date(orders.created_at) <= new Date(dateTo) : true;
    return matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  useEffect(() => {
    if (!auth_token) {
      toast.error("Vous devez être connecté pour voir vos commandes.");
      navigate("/login");
      return;
    }
    dispatch(fetchOrder(auth_token));
  }, [auth_token, navigate, dispatch]);

  return (
    <div className="order-list p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-extrabold mb-4 sm:mb-6 text-center text-blue-360">
        Vos commandes
      </h1>

      {/* Section Filtres */}
      <div className="mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded-lg shadow-xl max-w-6xl mx-auto">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row justify-between items-start sm:items-center">
          {/* Filtre par statut */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <label className="text-sm sm:text-base text-gray-600 font-semibold whitespace-nowrap">
              Filtrer par statut:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-360 focus:outline-none text-sm sm:text-base"
            >
              <option value="">Tous</option>
              <option value="success">Terminé</option>
              <option value="pending">En Attente</option>
              <option value="failed">Annulé</option>
              <option value="in progress">En Cours</option>
            </select>
          </div>

          {/* Filtre par date */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <label className="text-sm sm:text-base text-gray-600 font-semibold whitespace-nowrap">
              Date :
            </label>
            <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2 w-full sm:w-auto">
              <input 
                type="date" 
                value={dateFrom} 
                onChange={(e) => setDateFrom(e.target.value)} 
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base" 
              />
              <span className="text-gray-600 hidden xs:inline-flex items-center">-</span>
              <input 
                type="date" 
                value={dateTo} 
                onChange={(e) => setDateTo(e.target.value)} 
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      {currentOrders.length === 0 ? (
        <div className="text-center text-gray-600 py-8">
          <p className="text-base sm:text-lg font-medium">Aucune commande trouvée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {currentOrders.map((orders) => (
            <div
              key={orders.id}
              className="order-card bg-white border border-gray-300 p-4 sm:p-6 rounded-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                Commande #{orders.id}
              </h2>
              <div className="mb-3 sm:mb-4">
                <p className="text-base sm:text-lg text-gray-600 font-medium">
                  Montant Total: {orders.order_amount} DT
                </p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                  Date: {new Date(orders.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="mb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex justify-center sm:justify-start">
                    <OrderStatusBadge status={orders.order_status} />
                  </div>
                  <button
                    onClick={() => navigate(`/order/${orders.id}`)}
                    className="px-3 py-2 bg-blue-360 text-white font-normal text-xs sm:text-sm rounded-lg hover:bg-blue-500 transition-all duration-300 w-full sm:w-auto text-center"
                  >
                    Voir les détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg text-white text-sm sm:text-base w-full sm:w-auto ${
              currentPage === 1 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-360 hover:bg-blue-500'
            }`}
          >
            Précédent
          </button>
          <span className="text-gray-600 font-semibold text-sm sm:text-base">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg text-white text-sm sm:text-base w-full sm:w-auto ${
              currentPage === totalPages 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-360 hover:bg-blue-500'
            }`}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

// Composant badge de statut de commande
const OrderStatusBadge = ({ status }) => {
  const baseClasses = "px-3 py-1 text-xs sm:text-sm font-semibold text-white rounded-lg flex items-center justify-center sm:justify-start";
  
  switch (status) {
    case "success":
      return (
        <span className={`${baseClasses} bg-green-500`}>
          <FaCheckCircle className="mr-1 sm:mr-2" />
          Terminé
        </span>
      );
    case "pending":
      return (
        <span className={`${baseClasses} bg-yellow-400`}>
          <FaRegClock className="mr-1 sm:mr-2" />
          En Attente
        </span>
      );
    case "failed":
      return (
        <span className={`${baseClasses} bg-red-500`}>
          <FaTimesCircle className="mr-1 sm:mr-2" />
          Annulé
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-blue-360`}>
          <FaSpinner className="mr-1 sm:mr-2 animate-spin" />
          En Cours
        </span>
      );
  }
};

export default Commandes;