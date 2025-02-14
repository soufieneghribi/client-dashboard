import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import { toast } from "react-hot-toast";
import Modal from "react-modal";
import { useSelector } from "react-redux";
import axios from 'axios';
import { fetchUserProfile } from "../store/slices/user";
import { useDispatch } from "react-redux";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth_token = localStorage.getItem("token");
  const { UserProfile } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Retrieve data passed from the cart page
  const { orderDetails, subtotal, totalTTC } = location.state || {
    orderDetails: [],
    subtotal: 0,
    totalTTC: 0,
  };

  const auth = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    order_amount: parseFloat(totalTTC) || 0,  // Ensure it's a valid number
    contact_person_name: "",
    contact_person_number: "",
    address: "",
    longitude: "",
    latitude: "",
    cart: orderDetails,
    order_type: "delivery",
    payment_method: "paypal",
  });

  const [mapError, setMapError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // Fetch the user's profile
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Redirect to the cart page if orderDetails is empty
  useEffect(() => {
    if (!orderDetails.length) {
      toast.error("Votre panier est vide.");
      navigate("/cart");
    }
  }, [orderDetails, navigate]);

  // Fetch the user's current location and set it in formData
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prevData) => ({
            ...prevData,
            latitude,
            longitude,
          }));
        },
        (error) => {
          toast.error("Erreur de géolocalisation");
        }
      );
    } else {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleMapClick = ({ lat, lng }) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    setMapError(null);
  };

  const handleSubmit = async () => {

    const { contact_person_name, contact_person_number, address, payment_method, order_type, latitude, longitude } = formData;

    // Validation
    if (!contact_person_name || !contact_person_number || !address || !payment_method) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    if (!latitude || !longitude) {
      setMapError("Veuillez sélectionner votre localisation sur la carte.");
      toast.error("Localisation manquante.");
      return;
    }
    if (auth.isLoggedIn ) {

    // Send order details including geolocation to the backend
    try {
      const response = await axios.post(
        'https://tn360-lqd25ixbvq-ew.a.run.app/api/v1/customer/order/place', 
        formData,
        { headers: { Authorization: `Bearer ${auth_token}` }}
      );

      // Handle response (e.g., show success or error)
      if (response.data.message) {
        toast.success("Commande passée avec succès!");
        setModalIsOpen(true);
      } else {
         toast.error(`Erreur : ${response.data.message || "Une erreur est survenue."}`);
      }
    } catch (error) {
      const errorMessage = error.response 
        ? error.response.data.message || "Erreur inconnue" 
        : "Erreur de connexion réseau.";
      toast.error(`Erreur : ${errorMessage}`);
    }
   }else {
    navigate("/login")
   }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    navigate("/"); // Redirect to home after closing the modal
  };

  return (
    <div className="order-confirmation p-8">
      <h1 className="text-2xl font-bold mb-4">Confirmation de commande</h1>
      {orderDetails.length === 0 ? (
        <div className="text-center">
          <p>Votre panier est vide.</p>
          <button
            onClick={() => navigate("/cart")}
            className="mt-6 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retour au panier
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Informations personnelles</h2>
            <form className="space-y-4">
              <div>
                <label className="block font-medium">Nom et Prénom</label>
                <input
                  type="text"
                  name="contact_person_name"
                  value={formData.contact_person_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-medium">Adresse complète</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-medium">Téléphone</label>
                <input
                  type="text"
                  name="contact_person_number"
                  defaultValue={auth.nom_et_prenom}       
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-medium">Mode de paiement</label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="paypal">PayPal</option>
                  <option value="delivery">Paiement à la livraison</option>
                </select>
              </div>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Localisation</h2>
            <div className="h-64 border rounded">
              
              <GoogleMapReact
                bootstrapURLKeys={{ key: "AIzaSyAFwGAsC3VUZYdxkEwB43DEf5tpSx4hAZg" }}
                defaultCenter={{ lat: formData.latitude || 36.8065, lng: formData.longitude || 10.1815 }}
                defaultZoom={12}
                onClick={handleMapClick}
                yesIWantToUseGoogleMapApiInternals
              />
            </div>
            {mapError && <p className="text-red-500 text-sm mt-2">{mapError}</p>}
            {formData.latitude && formData.longitude && (
              <p className="mt-2 text-sm text-green-500">
                Localisation sélectionnée : {formData.latitude}, {formData.longitude}
              </p>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="mt-8 w-full px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Confirmer la commande
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Confirmation de commande"
        className="modal-content p-8 max-w-lg mx-auto bg-white rounded-lg shadow-lg"
        overlayClassName="modal-overlay fixed inset-0 flex justify-center items-center bg-black bg-opacity-50"
      >
        <h2 className="text-2xl font-bold mb-4">Résumé de la commande</h2>
        <div className="mt-4 font-bold">
          <p>Montant total : {totalTTC} DT</p>
          <p>
            Mode de paiement :{" "}
            {formData.payment_method === "paypal" ? "PayPal" : "Paiement à la livraison"}
          </p>
        </div>
        <button
          onClick={closeModal}
          className="mt-6 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Fermer
        </button>
      </Modal>
    </div>
  );
};

export default OrderConfirmation;
