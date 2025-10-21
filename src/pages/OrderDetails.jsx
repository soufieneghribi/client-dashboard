import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaDownload, 
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaShoppingBag,
  FaCheckCircle
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/slices/user";

/**
 * OrderDetails - Design simple et convivial
 */
const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const { Userprofile } = useSelector((state) => state.user);
  const API_BASE_URL = "https://tn360-back-office-122923924979.europe-west1.run.app/api/v1";

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Veuillez vous connecter");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/customer/order/order_details/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );
        setOrder(response.data);

        if (!Userprofile) {
          dispatch(fetchUserProfile());
        }
      } catch (error) {
        toast.error("Erreur de chargement");
        navigate("/Mes-Commandes");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, navigate, dispatch, Userprofile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Commande introuvable</p>
          <button
            onClick={() => navigate("/Mes-Commandes")}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.created_at);
  const formattedDate = orderDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const userInfo = order.client || Userprofile || {};

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* En-tête simple */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/Mes-Commandes")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft className="text-gray-600 text-lg" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Commande #{order.id}
                </h1>
                <p className="text-sm text-gray-500">{formattedDate}</p>
              </div>
            </div>
            <button
              onClick={() => {
                toast.success("Téléchargement...");
                window.open(`${API_BASE_URL}/orders/orderpdf/${orderId}`, '_blank');
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Télécharger PDF"
            >
              <FaDownload className="text-gray-600 text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Statut */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut</p>
              <p className="text-lg font-semibold text-gray-800">Confirmée</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <FaCalendarAlt className="text-blue-500" />
              <span className="text-sm">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Informations client */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
            <FaUser className="text-blue-500 text-lg" />
            <h2 className="text-lg font-bold text-gray-800">
              Informations client
            </h2>
          </div>

          <div className="space-y-3">
            {/* Nom */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <FaUser className="text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Nom</p>
                <p className="font-medium text-gray-800">
                  {userInfo.nom_et_prenom || userInfo.name || "Non spécifié"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <FaEnvelope className="text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-800 break-words">
                  {userInfo.email || "Non spécifié"}
                </p>
              </div>
            </div>

            {/* Téléphone */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <FaPhone className="text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                <p className="font-medium text-gray-800">
                  {userInfo.tel || userInfo.phone || "Non spécifié"}
                </p>
              </div>
            </div>

            {/* ID Client */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <FaIdCard className="text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">ID Client</p>
                <p className="font-medium text-gray-800">
                  #{order.ID_client || userInfo.ID_client || userInfo.id || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Articles commandés */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
            <FaShoppingBag className="text-purple-500 text-lg" />
            <h2 className="text-lg font-bold text-gray-800">
              Articles commandés
            </h2>
          </div>

          <div className="space-y-3">
            {order.details && order.details.length > 0 ? (
              order.details.map((detail, index) => {
                const article = detail.article;
                const itemTotal = article 
                  ? (parseFloat(article.price) * parseInt(detail.quantity)).toFixed(2)
                  : (parseFloat(detail.price) * parseInt(detail.quantity)).toFixed(2);

                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-2">
                          {article?.name || `Article supprimé (ID: ${detail.article_id})`}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <span>
                            Qté: <span className="font-semibold text-gray-800">{detail.quantity}</span>
                          </span>
                          <span>•</span>
                          <span>
                            Prix: <span className="font-semibold text-green-600">
                              {article ? parseFloat(article.price).toFixed(2) : parseFloat(detail.price).toFixed(2)} DT
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-500">
                          {itemTotal} DT
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8">Aucun article</p>
            )}
          </div>

          {/* Total */}
          {order.details && order.details.length > 0 && (
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-gray-700">
                  Total général
                </p>
                <p className="text-3xl font-bold text-blue-500">
                  {parseFloat(order.order_amount || 0).toFixed(2)} DT
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bouton retour */}
        <div className="text-center">
          <button
            onClick={() => navigate("/Mes-Commandes")}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Retour à mes commandes
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;