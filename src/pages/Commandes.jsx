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
  const [itemsPerRow, setItemsPerRow] = useState(getItemsPerRow());
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 4;

  useEffect(() => {
    const handleResize = () => {
      setItemsPerRow(getItemsPerRow());
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function getItemsPerRow() {
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    if (window.innerWidth < 1280) return 3;
    return 4;
  }

  const filteredOrders = order.filter((orders) => {
    const matchesStatus = statusFilter ? orders.order_status === statusFilter : true;
    const matchesDateFrom = dateFrom ? new Date(orders.created_at) >= new Date(dateFrom) : true;
    const matchesDateTo = dateTo ? new Date(orders.created_at) <= new Date(dateTo) : true;
    return matchesStatus && matchesDateFrom && matchesDateTo;
  });

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
    <div className="order-list p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-extrabold mb-4 text-center text-blue-360">Vos commandes</h1>

      <div className="mb-2 bg-white p-2 rounded-lg shadow-xl max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <label className="text-gray-600 font-semibold">Filtrer par statut:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-360 focus:outline-none"
            >
              <option value="">Tous</option>
              <option value="success">Terminé</option>
              <option value="pending">En Attente</option>
              <option value="failed">Annulé</option>
              <option value="in progress">En Cours</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-gray-600 font-semibold">Date :</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md" />
            <span className="text-gray-600">-</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md" />
          </div>
        </div>
      </div>

      {currentOrders.length === 0 ? (
        <div className="text-center text-gray-600">
          <p className="text-lg font-medium">Aucune commande trouvée.</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${itemsPerRow} gap-8`}>
          {currentOrders.map((orders) => (
            <div
              key={orders.id}
              className="order-card bg-white border border-gray-300 p-6 rounded-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Commande #{orders.id}
              </h2>
              <div className="mb-4">
                <p className="text-lg text-gray-600 font-medium">
                  Montant Total: {orders.order_amount} DT
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  Date: {new Date(orders.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="mb-2">
                <div className="flex items-center flex-row justify-between">
                  <OrderStatusBadge status={orders.order_status} />
                  <button
                    onClick={() => navigate(`/order/${orders.id}`)}
                    className="px-2 py-1 bg-blue-360 text-white font-normal text-sm rounded-lg hover:bg-blue-360 transition-all duration-300"
                  >
                    Voir les détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg text-white ${
              currentPage === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-360 hover:bg-blue-500'
            }`}
          >
            Précédent
          </button>
          <span className="text-gray-600 font-semibold">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg text-white ${
              currentPage === totalPages ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-360 hover:bg-blue-500'
            }`}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

const OrderStatusBadge = ({ status }) => {
  switch (status) {
    case "success":
      return (
        <span className="px-4 py-1 text-sm font-semibold text-white bg-green-500 rounded-lg flex items-center">
          <FaCheckCircle className="mr-2" />
          Terminé
        </span>
      );
    case "pending":
      return (
        <span className="px-4 py-1 text-sm font-semibold text-white bg-yellow-400 rounded-lg flex items-center">
          <FaRegClock className="mr-2" />
          En Attente
        </span>
      );
    case "failed":
      return (
        <span className="px-4 py-1 text-sm font-semibold text-white bg-red-500 rounded-lg flex items-center">
          <FaTimesCircle className="mr-2" />
          Annulé
        </span>
      );
    default:
      return (
        <span className="px-4 py-1 text-sm font-semibold text-white bg-blue-360 rounded-lg flex items-center">
          <FaSpinner className="mr-2 animate-spin" />
          En Cours
        </span>
      );
  }
};

export default Commandes;
