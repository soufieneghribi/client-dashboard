import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import { toast } from "react-hot-toast";
import Modal from "react-modal";
import { useSelector, useDispatch } from "react-redux";
import axios from 'axios';
import { fetchUserProfile } from "../store/slices/user";
import { selectToken, logout, refreshAuth } from "../store/slices/authSlice";
import store from "../store";

// Fonction pour récupérer le token - MÊME ORDRE QUE authSlice.js
const getAuthToken = () => {
  try {
    console.log("🔍 Recherche du token d'authentification...");
    
    // MÊME ORDRE QUE authSlice.js :
    // PRIORITÉ 1: localStorage (stocké par Login.jsx)
    const localToken = localStorage.getItem("token");
    
    // PRIORITÉ 2: Redux store
    const state = store.getState();
    const reduxToken = state?.auth?.token;
    
    // PRIORITÉ 3: Cookies (backup)
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    const token = localToken || reduxToken || cookieToken;
    
    console.log("🔑 Token trouvé:", {
      localStorage: !!localToken,
      redux: !!reduxToken,
      cookie: !!cookieToken,
      final: !!token,
      token: token ? `${token.substring(0, 20)}...` : 'none'
    });
    
    if (!token) {
      console.error("❌ AUCUN TOKEN - Vérifiez que vous êtes connecté");
      console.log("État Redux auth:", state?.auth);
      console.log("localStorage token:", localToken);
    }
    
    return token;
  } catch (error) {
    console.error("❌ Erreur récupération token:", error);
    return null;
  }
};

// Test de validité du token - VERSION PLUS TOLÉRANTE
const testTokenValidity = async (token) => {
  try {
    const response = await axios.get(
      'https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/customer/info1',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );
    
    if (response.data) {
      console.log("✅ Token valide - Utilisateur:", response.data.nom_et_prenom || response.data.email);
      return { isValid: true, user: response.data };
    } else {
      console.log("⚠️ Token peut-être valide mais réponse incomplète");
      return { isValid: true, user: null };
    }
  } catch (error) {
    console.error("🔴 Échec validation token:", {
      status: error.response?.status,
      message: error.message
    });
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("⚠️ Token peut-être expiré, mais on continue");
      return { isValid: false, user: null };
    }
    
    console.warn("⚠️ Erreur réseau/timeout, on continue quand même");
    return { isValid: true, user: null };
  }
};

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const auth = useSelector((state) => state.auth);
  const { Userprofile } = useSelector((state) => state.user);

  // Récupérer les données du panier
  const { orderDetails, subtotal, totalTTC: receivedTotal } = location.state || {
    orderDetails: [],
    subtotal: 0,
    totalTTC: 0,
  };

  // Convertir totalTTC en nombre pour éviter l'erreur .toFixed
  const totalTTC = parseFloat(receivedTotal) || 0;

  const [formData, setFormData] = useState({
    contact_person_name: "",
    contact_person_number: "",
    address: "",
    longitude: "",
    latitude: "",
    cart: orderDetails,
    order_type: "delivery",
    payment_method: "cash",
    delivery_fee: 3.5,
    cagnotte_deduction: 0,
  });

  const [mapError, setMapError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [geolocationStatus, setGeolocationStatus] = useState('loading');
  const [manualLocation, setManualLocation] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Debug des données du panier
  useEffect(() => {
    console.log("🛒 DONNÉES PANIER:", {
      orderDetails,
      subtotal,
      totalTTC,
      formDataCart: formData.cart
    });
    
    if (orderDetails && orderDetails.length > 0) {
      orderDetails.forEach((item, index) => {
        console.log(`📦 Produit ${index + 1}:`, {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          priceType: typeof item.price,
          quantityType: typeof item.quantity
        });
      });
    }
  }, [orderDetails, formData.cart]);

  // Debug de l'authentification
  useEffect(() => {
    console.log("🐛 DEBUG AUTH OrderConfirmation:");
    console.log("- localStorage token:", localStorage.getItem("token"));
    console.log("- Redux auth state:", auth);
    console.log("- User profile:", Userprofile);
    console.log("- Auth checked:", authChecked);
    console.log("- Token valid:", tokenValid);
  }, [auth, Userprofile, authChecked, tokenValid]);

  // Vérification d'authentification
  useEffect(() => {
    const checkAuthentication = async () => {
      console.log("🔍 Vérification de l'authentification...");
      
      const token = getAuthToken();
      
      if (!token) {
        console.log("❌ Aucun token trouvé, redirection vers login");
        toast.error("Vous devez être connecté pour passer une commande.");
        navigate("/login");
        return;
      }

      console.log("🔍 Token trouvé, test de validité...");
      const { isValid, user } = await testTokenValidity(token);
      setTokenValid(isValid);

      if (!isValid) {
        console.log("❌ Token invalide, déconnexion et redirection");
        toast.error("Session expirée. Veuillez vous reconnecter.");
        dispatch(logout());
        navigate("/login");
        return;
      }

      dispatch(refreshAuth());
      
      try {
        await dispatch(fetchUserProfile()).unwrap();
        console.log("✅ Profil utilisateur chargé avec succès");
        setAuthChecked(true);
      } catch (error) {
        console.error("❌ Erreur chargement profil:", error);
        toast.error("Erreur lors du chargement du profil.");
        setAuthChecked(true);
      }
    };

    const timer = setTimeout(() => {
      checkAuthentication();
    }, 100);

    return () => clearTimeout(timer);
  }, [auth.isLoggedIn, dispatch, navigate]);

  // Redirection si panier vide
  useEffect(() => {
    if (!orderDetails || orderDetails.length === 0) {
      toast.error("Votre panier est vide.");
      navigate("/cart");
    }
  }, [orderDetails, navigate]);

  // Mettre à jour les données utilisateur
  useEffect(() => {
    if (Userprofile && authChecked) {
      console.log("👤 Profil utilisateur chargé:", Userprofile);
      setFormData(prev => ({
        ...prev,
        contact_person_name: Userprofile.nom_et_prenom || "",
        contact_person_number: Userprofile.tel || "",
      }));
    }
  }, [Userprofile, authChecked]);

  // Géolocalisation
  useEffect(() => {
    if (!authChecked) return;

    const getGeolocation = () => {
      if (!navigator.geolocation) {
        console.warn("⚠️ La géolocalisation n'est pas supportée");
        setGeolocationStatus('error');
        setDefaultLocation();
        return;
      }

      setGeolocationStatus('loading');

      const geolocationOptions = {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("✅ Géolocalisation réussie:", latitude, longitude);
          
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));
          setGeolocationStatus('success');
          toast.success("Position détectée automatiquement");
        },
        (error) => {
          console.error("❌ Erreur géolocalisation:", error);
          
          let errorMessage = "Géolocalisation échouée";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Permission de géolocalisation refusée. Veuillez sélectionner manuellement votre position sur la carte.";
              setGeolocationStatus('denied');
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Position indisponible. Veuillez sélectionner manuellement votre position sur la carte.";
              setGeolocationStatus('error');
              break;
            case error.TIMEOUT:
              errorMessage = "Délai de géolocalisation dépassé. Veuillez sélectionner manuellement votre position sur la carte.";
              setGeolocationStatus('error');
              break;
            default:
              errorMessage = "Erreur de géolocalisation. Veuillez sélectionner manuellement votre position sur la carte.";
              setGeolocationStatus('error');
              break;
          }
          
          toast.error(errorMessage);
          setDefaultLocation();
        },
        geolocationOptions
      );
    };

    const setDefaultLocation = () => {
      setFormData(prev => ({
        ...prev,
        latitude: "36.8065",
        longitude: "10.1815",
      }));
      setManualLocation(true);
    };

    getGeolocation();
  }, [authChecked]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleMapClick = ({ lat, lng }) => {
    console.log("📍 Carte cliquée:", lat, lng);
    setFormData((prev) => ({ 
      ...prev, 
      latitude: lat.toString(), 
      longitude: lng.toString() 
    }));
    setMapError(null);
    setManualLocation(true);
    setGeolocationStatus('success');
    toast.success("Position sélectionnée manuellement");
  };

  const retryGeolocation = () => {
    setGeolocationStatus('loading');
    toast.loading("Nouvelle tentative de géolocalisation...");
    
    if (!navigator.geolocation) {
      toast.error("Géolocalisation non supportée");
      setGeolocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));
        setGeolocationStatus('success');
        toast.success("Position détectée avec succès!");
      },
      (error) => {
        console.error("❌ Nouvelle tentative échouée:", error);
        toast.error("Échec de la géolocalisation. Utilisez la carte.");
        setGeolocationStatus('error');
      },
      {
        timeout: 8000,
        enableHighAccuracy: false
      }
    );
  };

  // ✅ CORRECTION COMPLÈTE : Fonction pour calculer le montant exact
  const calculateOrderAmount = () => {
    // S'assurer que orderDetails existe et a des éléments
    if (!orderDetails || orderDetails.length === 0) {
      console.error("❌ Aucun détail de commande trouvé");
      return 0;
    }

    // Calculer le sous-total en s'assurant que les prix et quantités sont des nombres
    const subtotal = orderDetails.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      const itemTotal = price * quantity;
      
      console.log(`📊 Calcul item: ${price} * ${quantity} = ${itemTotal}`);
      
      return total + itemTotal;
    }, 0);
    
    const deliveryFee = parseFloat(formData.delivery_fee) || 3.5;
    const cagnotteDeduction = parseFloat(formData.cagnotte_deduction) || 0;
    
    const calculatedAmount = subtotal + deliveryFee - cagnotteDeduction;
    
    console.log("🧮 Calcul du montant FINAL:", {
      subtotal,
      deliveryFee,
      cagnotteDeduction,
      calculatedAmount
    });
    
    // S'assurer que le montant est un nombre valide
    if (isNaN(calculatedAmount) || !isFinite(calculatedAmount)) {
      console.error("❌ Montant calculé invalide:", calculatedAmount);
      return 0;
    }
    
    return calculatedAmount;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    const { contact_person_name, contact_person_number, address, payment_method, latitude, longitude } = formData;

    // Validation
    const validations = [
      { condition: !contact_person_name?.trim(), message: "Veuillez saisir votre nom complet." },
      { condition: !contact_person_number?.trim(), message: "Veuillez saisir votre numéro de téléphone." },
      { condition: !address?.trim(), message: "Veuillez saisir votre adresse de livraison." },
      { condition: !payment_method, message: "Veuillez sélectionner un mode de paiement." },
      { condition: !latitude || !longitude, message: "Veuillez sélectionner votre localisation sur la carte." },
    ];

    for (const validation of validations) {
      if (validation.condition) {
        toast.error(validation.message);
        setIsSubmitting(false);
        return;
      }
    }

    // Re-vérifier l'authentification AVANT d'envoyer
    const auth_token = getAuthToken();
    console.log("🔐 Token utilisé pour la commande:", auth_token ? `${auth_token.substring(0, 50)}...` : 'NULL');
    
    if (!auth_token) {
      toast.error("Session expirée. Veuillez vous reconnecter.");
      navigate("/login");
      setIsSubmitting(false);
      return;
    }

    // ✅ CORRECTION : Calculer le montant exact selon la formule de l'API
    const calculatedOrderAmount = calculateOrderAmount();

    // Vérifier que le montant est valide
    if (calculatedOrderAmount <= 0 || isNaN(calculatedOrderAmount)) {
      console.error("❌ Montant invalide:", calculatedOrderAmount);
      toast.error("Erreur de calcul du montant. Vérifiez votre panier.");
      setIsSubmitting(false);
      return;
    }

    console.log("🛒 Panier envoyé à l'API:", formData.cart);
    
    // Structure CORRIGÉE avec le bon calcul du montant
    const finalOrderAmount = parseFloat(calculatedOrderAmount.toFixed(2));
    
    const orderData = {
      order_amount: finalOrderAmount, // ✅ MONTANT CALCULÉ CORRECTEMENT
      cagnotte_deduction: parseFloat(formData.cagnotte_deduction || 0),
      delivery_fee: parseFloat(formData.delivery_fee || 3.5),
      address: address.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      order_type: formData.order_type || "delivery",
      payment_method: formData.payment_method || "cash",
      cart: formData.cart.map(item => ({
        id: parseInt(item.id),
        quantity: parseInt(item.quantity)
      }))
    };

    console.log("📦 Données FINALES envoyées à l'API:");
    console.log("Montant calculé:", finalOrderAmount);
    console.log("Type de order_amount:", typeof orderData.order_amount);
    console.log("Données complètes:", JSON.stringify(orderData, null, 2));

    // Vérifier une dernière fois que order_amount est valide
    if (!orderData.order_amount || isNaN(orderData.order_amount)) {
      console.error("❌ order_amount invalide avant envoi:", orderData.order_amount);
      toast.error("Erreur de calcul du montant final.");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("🚀 Envoi de la commande à l'API...");
      
      const response = await axios.post(
        'https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/customer/order/place', 
        orderData,
        { 
          headers: { 
            'Authorization': `Bearer ${auth_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log("✅ Réponse commande:", response.data);

      if (response.data.message || response.status === 200 || response.status === 201) {
        toast.success("Commande passée avec succès!");
        setModalIsOpen(true);
        
        // Vider le panier
        localStorage.removeItem("cart");
        sessionStorage.removeItem("cart");
      } else {
        toast.error(`Erreur : ${response.data.message || "Une erreur est survenue."}`);
      }
    } catch (error) {
      console.error("❌ ERREUR COMPLÈTE:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      console.error("Headers envoyés:", error.config?.headers);
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        console.error("🔻 Réponse d'erreur complète:", JSON.stringify(errorData, null, 2));
        
        if (status === 400) {
          const errorMsg = errorData.message || errorData.error || JSON.stringify(errorData);
          console.error("🔴 Erreur 400 - Détails:", errorMsg);
          
          if (errorMsg.includes("Amount should be") || errorMsg.includes("subtotal + delivery_fee - cagnotte_deduction")) {
            toast.error("Erreur de calcul du montant. Veuillez réessayer ou contacter le support.");
          } else {
            toast.error(`Erreur 400: ${errorMsg}`);
          }
        } else if (status === 403 || status === 401) {
          console.warn("⚠️ Erreur d'authentification API");
          toast.error("Problème d'authentification avec le serveur. Vérifiez votre connexion.");
        } else if (status === 422) {
          const errors = errorData.errors || {};
          const errorMessages = Object.entries(errors).map(([field, msgs]) => 
            `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`
          );
          console.error("⚠️ Erreurs validation:", errors);
          toast.error(`Validation: ${errorMessages.join(" | ") || errorData.message || "Données invalides"}`);
        } else if (status === 500) {
          toast.error("Erreur serveur. Veuillez réessayer plus tard.");
        } else {
          toast.error(`Erreur ${status}: ${errorData.message || JSON.stringify(errorData)}`);
        }
      } else if (error.request) {
        console.error("📡 Erreur réseau - Pas de réponse du serveur");
        toast.error("Erreur de connexion réseau. Vérifiez votre connexion.");
      } else {
        console.error("💥 Erreur inconnue:", error.message);
        toast.error("Une erreur inattendue est survenue.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    navigate("/orders");
  };

  // Si l'authentification n'est pas encore vérifiée
  if (!authChecked) {
    return (
      <div className="order-confirmation p-8 text-center">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
        <p className="mt-4 text-lg">Vérification de l'authentification...</p>
      </div>
    );
  }

  // Si panier vide
  if (!orderDetails || orderDetails.length === 0) {
    return (
      <div className="order-confirmation p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Confirmation de commande</h1>
        <p className="text-lg mb-4">Votre panier est vide.</p>
        <button
          onClick={() => navigate("/cart")}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retour au panier
        </button>
      </div>
    );
  }

  return (
    <div className="order-confirmation p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Confirmation de commande</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Informations personnelles */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Informations personnelles</h2>
          <form className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Nom et Prénom *</label>
              <input
                type="text"
                name="contact_person_name"
                value={formData.contact_person_name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Votre nom complet"
                required
              />
            </div>
            
            <div>
              <label className="block font-medium mb-2">Adresse complète *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Votre adresse de livraison complète"
                required
              />
            </div>
            
            <div>
              <label className="block font-medium mb-2">Téléphone *</label>
              <input
                type="tel"
                name="contact_person_number"
                value={formData.contact_person_number}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Votre numéro de téléphone"
                required
              />
            </div>
            
            <div>
              <label className="block font-medium mb-2">Mode de paiement *</label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="cash">Paiement à la livraison</option>
                <option value="paypal">PayPal</option>
                <option value="card">Carte bancaire</option>
              </select>
            </div>
          </form>
        </div>

        {/* Localisation */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Localisation</h2>
            <div className="flex items-center space-x-2">
              {geolocationStatus === 'loading' && (
                <span className="text-sm text-blue-600">Détection en cours...</span>
              )}
              {geolocationStatus === 'success' && (
                <span className="text-sm text-green-600">Position détectée</span>
              )}
              {(geolocationStatus === 'error' || geolocationStatus === 'denied') && (
                <button
                  onClick={retryGeolocation}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Réessayer
                </button>
              )}
            </div>
          </div>

          <div className="h-80 border border-gray-300 rounded mb-4 relative">
            {geolocationStatus === 'loading' && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-gray-600">Détection de votre position...</p>
                </div>
              </div>
            )}
            
            <GoogleMapReact
              bootstrapURLKeys={{ 
                key: "AIzaSyAFwGAsC3VUZYdxkEwB43DEf5tpSx4hAZg",
                libraries: ['places']
              }}
              center={{ 
                lat: parseFloat(formData.latitude) || 36.8065, 
                lng: parseFloat(formData.longitude) || 10.1815 
              }}
              zoom={15}
              onClick={handleMapClick}
              yesIWantToUseGoogleMapApiInternals
            >
              {formData.latitude && formData.longitude && (
                <div
                  lat={parseFloat(formData.latitude)}
                  lng={parseFloat(formData.longitude)}
                  style={{
                    color: 'red',
                    fontSize: '24px',
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  📍
                </div>
              )}
            </GoogleMapReact>
          </div>

          {mapError && <p className="text-red-500 text-sm mt-2">{mapError}</p>}
          
          {formData.latitude && formData.longitude && (
            <div className="mt-2 p-3 bg-gray-50 rounded">
              <p className="text-sm text-green-600 font-medium">
                Position sélectionnée
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Lat: {formData.latitude}, Lng: {formData.longitude}
                {manualLocation && " (sélection manuelle)"}
              </p>
            </div>
          )}

          <div className="mt-3 text-sm text-gray-600">
            <p><strong>Instructions :</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Cliquez sur la carte pour sélectionner votre position exacte</li>
              <li>Utilisez le bouton "Réessayer" si la détection automatique échoue</li>
              <li>Zoomez pour une sélection plus précise</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Récapitulatif de la commande */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">Récapitulatif de la commande</h2>
        <div className="space-y-2">
          {orderDetails.map((item, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-2">
              <span>{item.name} x {item.quantity}</span>
              <span>{(item.price * item.quantity).toFixed(2)} DT</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2">
            <span>Frais de livraison</span>
            <span>{formData.delivery_fee.toFixed(2)} DT</span>
          </div>
          {formData.cagnotte_deduction > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span>Réduction cagnotte</span>
              <span>-{parseFloat(formData.cagnotte_deduction).toFixed(2)} DT</span>
            </div>
          )}
          <div className="flex justify-between items-center font-bold text-lg pt-2 border-t">
            <span>Total estimé</span>
           <span>{calculateOrderAmount().toFixed(2)} DT</span>

          </div>
          <p className="text-xs text-gray-500 italic">
            * Le montant final sera calculé avec les prix actuels en base de données
          </p>
        </div>
      </div>

      {/* Bouton de confirmation */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !tokenValid}
        className={`w-full py-4 text-white rounded transition-colors text-lg font-semibold ${
          isSubmitting || !tokenValid
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        {isSubmitting ? 'Traitement en cours...' : 'Confirmer la commande'}
      </button>

      {/* Modal de confirmation */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Confirmation de commande"
        className="modal-content p-8 max-w-lg mx-auto bg-white rounded-lg shadow-lg"
        overlayClassName="modal-overlay fixed inset-0 flex justify-center items-center bg-black bg-opacity-50"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Commande confirmée!</h2>
          <div className="mt-4 space-y-2">
            <p className="font-bold">
              Mode de paiement :{" "}
              {formData.payment_method === "cash" 
                ? "Paiement à la livraison" 
                : formData.payment_method === "paypal" 
                ? "PayPal" 
                : "Carte bancaire"}
            </p>
            <p className="mt-4 text-green-600 font-semibold">
              Votre commande a été passée avec succès. 
              Vous recevrez un email de confirmation.
            </p>
          </div>
          <button
            onClick={closeModal}
            className="mt-6 px-8 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
          >
            Voir mes commandes
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default OrderConfirmation;