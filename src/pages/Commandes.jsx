import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaRegClock } from "react-icons/fa"; // Import icons
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Items to display per page

  // Filter orders based on selected filters
  const filteredOrders = order.filter((orders) => {
    const matchesStatus = statusFilter ? orders.order_status === statusFilter : true;
    const matchesDate =
      (dateFrom ? new Date(orders.created_at) >= new Date(dateFrom) : true);
    return matchesStatus && matchesDate;
  });

  // Pagination logic: Slice the filtered orders
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentPageOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fetch orders on component mount
  useEffect(() => {
    if (!auth_token) {
      toast.error("Vous devez être connecté pour voir vos commandes.");
      navigate("/login"); // Redirect to login page if not authenticated
      return;
    }
    dispatch(fetchOrder(auth_token)); // Fetch orders if authenticated
  }, [auth_token, navigate, dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-3xl text-blue-360" />
        <div className="ml-4 text-lg font-medium text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-medium">
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div className="order-list p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-12 text-center text-blue-360">
        Vos commandes
      </h1>

      {/* Filter Section */}
      <div className="mb-8 bg-white p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          {/* Filter by status */}
          <div className="flex items-center space-x-4">
            <label htmlFor="status" className="text-gray-600 font-semibold">Filtrer par statut:</label>
            <select
              id="status"
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

          {/* Filter by Date */}
          <div className="flex items-center space-x-4">
            <label htmlFor="dateFrom" className="text-gray-600 font-semibold">Date :</label>
            <input
              type="date"
              id="dateFrom"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-360 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {currentPageOrders.length === 0 ? (
        <div className="text-center text-gray-600">
          <p className="text-xl font-medium">Aucune commande trouvée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {currentPageOrders.map((orders) => (
            <div
              key={orders.id}
              className="order-card bg-white border border-gray-300 p-6 rounded-xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Commande #{orders.id}
              </h2>
              <div className="mb-4">
                <p className="text-lg text-gray-600">
                  <strong>Montant Total:</strong> {orders.order_amount} DT
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Date:</strong> {new Date(orders.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="mb-6">
                <div className="flex items-center">
                  <OrderStatusBadge status={orders.order_status} />
                  <p className="ml-2 text-sm font-medium text-gray-600">
                    <strong>Status:</strong> {orders.order_status}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/order/${orders.id}`)} // Redirect to order details page
                className="w-full px-6 py-3 bg-blue-360 text-white font-semibold rounded-lg hover:bg-blue-360 transition-all duration-300"
              >
                Voir les détails
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center items-center space-x-4 mt-8">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-6 py-2 bg-blue-360 text-white font-semibold rounded-lg disabled:opacity-50"
        >
          Précédent
        </button>
        <span className="text-lg font-medium text-gray-700">
          Page {currentPage} sur {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-6 py-2 bg-blue-360 text-white font-semibold rounded-lg disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

// OrderStatusBadge component to style the order status
const OrderStatusBadge = ({ status }) => {
  switch (status) {
    case "success":
      return (
        <span className="px-4 py-1 text-sm font-semibold text-white bg-green-500 rounded-full flex items-center">
          <FaCheckCircle className="mr-2" />
          Terminé
        </span>
      );
    case "pending":
      return (
        <span className="px-4 py-1 text-sm font-semibold text-white bg-yellow-400 rounded-full flex items-center">
          <FaRegClock className="mr-2" />
          En Attente
        </span>
      );
    case "failed":
      return (
        <span className="px-4 py-1 text-sm font-semibold text-white bg-red-500 rounded-full flex items-center">
          <FaTimesCircle className="mr-2" />
          Annulé
        </span>
      );
    default:
      return (
        <span className="px-4 py-1 text-sm font-semibold text-white bg-blue-360 rounded-full flex items-center">
          <FaSpinner className="mr-2 animate-spin" />
          En Cours
        </span>
      );
  }
};

export default Commandes;
