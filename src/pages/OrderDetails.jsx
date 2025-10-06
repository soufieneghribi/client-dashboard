import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  FaShoppingCart,
  FaMapMarkerAlt,
  FaCreditCard,
  FaCalendar,
  FaBoxOpen,
  FaSpinner,
  FaEdit,
  FaPlus,
  FaMinus,
  FaTrash,
} from "react-icons/fa";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const auth_token = localStorage.getItem("token");

  const { currentOrderDetails, detailsLoading, detailsError } = useSelector(
    (state) => state.order
  );

  const [isEditMode, setIsEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState([]);
  const [orderType, setOrderType] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!auth_token) {
      toast.error("Vous devez être connecté");
      navigate("/login");
      return;
    }


    // Check if coming from reorder button
    if (location.state?.reorder) {
      setIsEditMode(true);
    }
  }, [orderId, auth_token, dispatch, location.state]);

  useEffect(() => {
    if (currentOrderDetails && !editedItems.length) {
      // Initialize edited items from order details
      const items = currentOrderDetails.details?.map((detail) => ({
        id: detail.article_id,
        name: detail.article?.name || `Article supprimé (ID: ${detail.article_id})`,
        quantity: detail.quantity,
        price: detail.article?.price || detail.price,
        available: !!detail.article,
      })) || [];
      setEditedItems(items);

      // Set initial values
      setOrderType(currentOrderDetails.order_type || "delivery");
      setPaymentMethod(currentOrderDetails.payment_method || "cash");

      const deliveryAddress = currentOrderDetails.delivery_address
        ? typeof currentOrderDetails.delivery_address === "string"
          ? JSON.parse(currentOrderDetails.delivery_address)
          : currentOrderDetails.delivery_address
        : null;
      setAddress(deliveryAddress?.address || "");
    }
  }, [currentOrderDetails]);

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const updated = [...editedItems];
    updated[index].quantity = newQuantity;
    setEditedItems(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = editedItems.filter((_, i) => i !== index);
    setEditedItems(updated);
  };

  const calculateSubtotal = () => {
    return editedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleConfirmReorder = () => {
    if (editedItems.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    if (orderType === "delivery" && !address.trim()) {
      toast.error("Veuillez saisir une adresse de livraison");
      return;
    }

    // Check for unavailable items
    const unavailableItems = editedItems.filter((item) => !item.available);
    if (unavailableItems.length > 0) {
      toast.error("Certains articles ne sont plus disponibles");
      return;
    }

    // Prepare cart data
    const cart = editedItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    }));

    const subtotal = calculateSubtotal();
    const deliveryFee = orderType === "delivery" ? 7.0 : 0.0;
    const totalAmount = subtotal + deliveryFee;

    const orderData = {
      cart,
      order_amount: totalAmount,
      delivery_fee: deliveryFee,
      order_type: orderType,
      payment_method: paymentMethod,
      address: orderType === "delivery" ? address : undefined,
    };

    // Store reorder data in Redux
    dispatch(setReorderData(orderData));

    // Navigate to checkout
    navigate("/checkout", { state: { reorderData: orderData } });
  };

  if (detailsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-360 text-6xl mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (detailsError || !currentOrderDetails) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 text-lg mb-4">
            {detailsError || "Commande introuvable"}
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="px-6 py-2 bg-blue-360 text-white rounded-lg hover:bg-blue-500"
          >
            Retour aux commandes
          </button>
        </div>
      </div>
    );
  }

  const deliveryAddress = currentOrderDetails.delivery_address
    ? typeof currentOrderDetails.delivery_address === "string"
      ? JSON.parse(currentOrderDetails.delivery_address)
      : currentOrderDetails.delivery_address
    : null;

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {isEditMode ? "Modifier la commande" : `Commande #${currentOrderDetails.id}`}
              </h1>
              <div className="flex items-center text-gray-600 mt-2">
                <FaCalendar className="mr-2" />
                <span>
                  {new Date(currentOrderDetails.created_at).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="mt-4 md:mt-0 px-6 py-2 bg-blue-360 text-white rounded-lg hover:bg-blue-500 transition flex items-center"
              >
                <FaEdit className="mr-2" />
                Modifier et commander
              </button>
            )}
          </div>

          {!isEditMode && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center">
                <FaShoppingCart className="text-blue-360 mr-3 text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Type de commande</p>
                  <p className="font-semibold">
                    {currentOrderDetails.order_type === "delivery"
                      ? "Livraison"
                      : "À emporter"}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <FaCreditCard className="text-blue-360 mr-3 text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Mode de paiement</p>
                  <p className="font-semibold">
                    {currentOrderDetails.payment_method === "cash"
                      ? "Espèces"
                      : currentOrderDetails.payment_method === "card"
                      ? "Carte"
                      : "Portefeuille"}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-blue-360 mr-3 text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Adresse</p>
                  <p className="font-semibold text-sm">
                    {deliveryAddress?.address || "Non spécifiée"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Mode Settings */}
        {isEditMode && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Options de commande
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de commande
                </label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-360 focus:outline-none"
                >
                  <option value="delivery">Livraison</option>
                  <option value="pickup">À emporter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-360 focus:outline-none"
                >
                  <option value="cash">Espèces</option>
                  <option value="card">Carte bancaire</option>
                  <option value="wallet">Portefeuille</option>
                </select>
              </div>
            </div>
            {orderType === "delivery" && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse de livraison
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Entrez votre adresse"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-360 focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FaBoxOpen className="mr-3 text-blue-360" />
            Articles {isEditMode ? "à commander" : "commandés"}
          </h2>
          <div className="space-y-4">
            {editedItems && editedItems.length > 0 ? (
              editedItems.map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg transition ${
                    item.available
                      ? "bg-gray-50 hover:bg-gray-100"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex-1 mb-3 md:mb-0">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {item.name}
                    </h3>
                    {!item.available && (
                      <p className="text-sm text-red-600 mt-1">
                        Article non disponible
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      Prix unitaire: {item.price.toFixed(2)} DT
                    </p>
                  </div>
                  
                  {isEditMode ? (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(index, item.quantity - 1)}
                          disabled={!item.available}
                          className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaMinus className="text-gray-600" />
                        </button>
                        <span className="font-semibold text-lg w-12 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(index, item.quantity + 1)}
                          disabled={!item.available}
                          className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaPlus className="text-gray-600" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        <FaTrash />
                      </button>
                      <div className="text-right min-w-[100px]">
                        <p className="text-xl font-bold text-blue-360">
                          {(item.quantity * item.price).toFixed(2)} DT
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">
                        Quantité: {item.quantity}
                      </p>
                      <p className="text-xl font-bold text-blue-360">
                        {(item.quantity * item.price).toFixed(2)} DT
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-4">Aucun article trouvé</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Résumé</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Sous-total</span>
              <span className="font-semibold">
                {isEditMode
                  ? calculateSubtotal().toFixed(2)
                  : currentOrderDetails.order_amount.toFixed(2)}{" "}
                DT
              </span>
            </div>
            {(isEditMode ? orderType === "delivery" : currentOrderDetails.delivery_fee > 0) && (
              <div className="flex justify-between text-gray-700">
                <span>Frais de livraison</span>
                <span className="font-semibold">
                  {isEditMode
                    ? orderType === "delivery"
                      ? "7.00"
                      : "0.00"
                    : currentOrderDetails.delivery_fee.toFixed(2)}{" "}
                  DT
                </span>
              </div>
            )}
            {!isEditMode && currentOrderDetails.cagnotte_deduction > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Cagnotte déduite</span>
                <span className="font-semibold">
                  -{currentOrderDetails.cagnotte_deduction.toFixed(2)} DT
                </span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
              <span>Total</span>
              <span className="text-blue-360">
                {isEditMode
                  ? (
                      calculateSubtotal() +
                      (orderType === "delivery" ? 7.0 : 0.0)
                    ).toFixed(2)
                  : currentOrderDetails.total_amount.toFixed(2)}{" "}
                DT
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => {
              if (isEditMode) {
                setIsEditMode(false);
                // Reset to original values
                const items = currentOrderDetails.details?.map((detail) => ({
                  id: detail.article_id,
                  name: detail.article?.name || `Article supprimé (ID: ${detail.article_id})`,
                  quantity: detail.quantity,
                  price: detail.article?.price || detail.price,
                  available: !!detail.article,
                })) || [];
                setEditedItems(items);
              } else {
                navigate("/orders");
              }
            }}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            {isEditMode ? "Annuler" : "Retour aux commandes"}
          </button>
          {isEditMode && (
            <button
              onClick={handleConfirmReorder}
              className="flex-1 px-6 py-3 bg-blue-360 text-white rounded-lg hover:bg-blue-500 transition font-semibold flex items-center justify-center"
            >
              <FaShoppingCart className="mr-2" />
              Confirmer la commande
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;