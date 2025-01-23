import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaRegClock } from "react-icons/fa"; // Import icons

const Commandes = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const auth_token = localStorage.getItem("token");

  // Fetch orders on component mount
  useEffect(() => {
    if (!auth_token) {
      toast.error("Vous devez être connecté pour voir vos commandes.");
      navigate("/login"); // Redirect to login page if not authenticated
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "https://tn360-122923924979.europe-west1.run.app/api/v1/customer/order/list",
          {
            headers: {
              Authorization: `Bearer ${auth_token}`, // Include the token in the header
            },
          }
        );
        setOrders(response.data); // Assuming the response contains an 'orders' array
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des commandes.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [auth_token, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-xl text-blue-500" />
        <div className="ml-4 text-lg font-semibold">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div className="order-list p-8 bg-gradient-to-r from-indigo-100 to-indigo-50 min-h-screen">
      <h1 className="text-2xl font-extrabold mb-8 text-center text-gray-800">Liste des commandes</h1>

      {orders.length === 0 ? (
        <div className="text-center text-gray-600">
          <p className="text-xl">Vous n'avez pas de commandes passées.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className="order-card border p-6 rounded-2xl shadow-xl bg-white hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Commande #{order.id}</h2>
              <div className="mb-4">
                <p className="text-lg text-gray-600">
                  <strong>Montant Total:</strong> {orders.order_amount} DT
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="mb-6">
                <div className="flex items-center">
                  <OrderStatusBadge status={order.order_status} />
                  <p className="ml-2 text-sm font-medium text-gray-600">
                    <strong>Status:</strong> {order.order_status}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/order/${order.id}`)} // Redirect to order details page
                className="w-full px-6 py-3 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 transition-all"
              >
                Voir les détails
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// OrderStatusBadge component to style the order status
const OrderStatusBadge = ({ status }) => {
  switch (status) {
    case "Completed":
      return (
        <span className="px-4 py-1 text-sm font-semibold text-white bg-green-500 rounded-full flex items-center">
          <FaCheckCircle className="mr-2" />
          Terminé
        </span>
      );
    case "Pending":
      return (
        <span className="px-4 py-1 text-sm font-semibold text-white bg-yellow-400 rounded-full flex items-center">
          <FaRegClock className="mr-2" />
          En Attente
        </span>
      );
    case "Cancelled":
      return (
        <span className="px-4 py-1 text-sm font-semibold text-white bg-red-500 rounded-full flex items-center">
          <FaTimesCircle className="mr-2" />
          Annulé
        </span>
      );
    default:
      return (
        <span className="px-4 py-1 text-sm font-semibold text-white bg-gray-400 rounded-full flex items-center">
          <FaSpinner className="mr-2 animate-spin" />
          En Cours
        </span>
      );
  }
};

export default Commandes;
