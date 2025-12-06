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
import apiConfig from "../services/api";

// ⭐ TOKEN GOOGLE MAPS INTÉGRÉ DIRECTEMENT POUR ÉVITER LES PROBLÈMES EN PRODUCTION
const GOOGLE_MAPS_API_KEY = "AIzaSyAFwGAsC3VUZYdxkEwB43DEf5tpSx4hAZg";

/**
 * OrderConfirmation Component
 * Handles the order confirmation process including:
 * - User authentication verification
 * - Order details display
 * - Geolocation for delivery
 * - Payment method selection
 * - Order submission to API
 * - Cagnotte deduction handling
 */

// ==================== CONSTANTS ====================
const API_BASE_URL = apiConfig.API_BASE_URL;
const DEFAULT_LOCATION = { lat: 36.8065, lng: 10.1815 }; // Tunis center
const DEFAULT_DELIVERY_FEE = 2.5; // ✅ Frais de livraison: 2.5 DT pour la livraison
const PICKUP_DELIVERY_FEE = 0; // ✅ Emporté: Gratuit (0 DT)

// ==================== HELPER FUNCTIONS ====================

/**
 * Retrieves authentication token from multiple sources
 * Priority: localStorage > Redux > Cookies
 * @returns {string|null} Authentication token
 */
const getAuthToken = () => {
  try {
    const localToken = localStorage.getItem("token");
    const state = store.getState();
    const reduxToken = state?.auth?.token;
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    return localToken || reduxToken || cookieToken || null;
  } catch (error) {
    return null;
  }
};

/**
 * Validates token by making API call
 * @param {string} token - Authentication token
 * @returns {Promise<{isValid: boolean, user: object|null}>}
 */
const testTokenValidity = async (token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/customer/info1`,
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
      return { isValid: true, user: response.data };
    } else {
      return { isValid: true, user: null };
    }
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return { isValid: false, user: null };
    }
    return { isValid: true, user: null };
  }
};

/**
 * Get address from coordinates using Google Geocoding API (Reverse Geocoding)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} Formatted address
 */
const getAddressFromCoordinates = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=fr`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      console.error('Geocoding error:', data.status);
      return '';
    }
  } catch (error) {
    console.error('Error fetching address:', error);
    return '';
  }
};

// ==================== MAIN COMPONENT ====================

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const auth = useSelector((state) => state.auth);
  const { Userprofile } = useSelector((state) => state.user);

  // Get order details from navigation state
  const { 
    orderDetails, 
    subtotal, 
    totalTTC: receivedTotal,
    deliveryFee: receivedDeliveryFee,
    cagnotteDeduction: receivedCagnotteDeduction
  } = location.state || {
    orderDetails: [],
    subtotal: 0,
    totalTTC: 0,
    deliveryFee: DEFAULT_DELIVERY_FEE,
    cagnotteDeduction: 0
  };

  const totalTTC = parseFloat(receivedTotal) || 0;

  // ✅ CORRECTION: Déterminer le type de commande initial basé sur les frais de livraison
  const initialOrderType = (parseFloat(receivedDeliveryFee) === 0 || receivedDeliveryFee === 0) ? "pickup" : "delivery";
  
  const [formData, setFormData] = useState({
    contact_person_name: "",
    contact_person_number: "",
    address: "",
    longitude: "",
    latitude: "",
    cart: orderDetails,
    order_type: initialOrderType, // ✅ "delivery" ou "pickup" basé sur les frais
    payment_method: "cash",
    delivery_fee: parseFloat(receivedDeliveryFee) || DEFAULT_DELIVERY_FEE,
    cagnotte_deduction: parseFloat(receivedCagnotteDeduction) || 0,
  });

  const [mapError, setMapError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [geolocationStatus, setGeolocationStatus] = useState('loading');
  const [manualLocation, setManualLocation] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = getAuthToken();
      
      if (!token) {
        toast.error("Vous devez être connecté pour passer une commande.");
        navigate("/login");
        return;
      }

      const { isValid, user } = await testTokenValidity(token);
      setTokenValid(isValid);

      if (!isValid) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        dispatch(logout());
        navigate("/login");
        return;
      }

      dispatch(refreshAuth());
      
      try {
        await dispatch(fetchUserProfile()).unwrap();
        setAuthChecked(true);
      } catch (error) {
        toast.error("Erreur lors du chargement du profil.");
        setAuthChecked(true);
      }
    };

    const timer = setTimeout(() => {
      checkAuthentication();
    }, 100);

    return () => clearTimeout(timer);
  }, [auth.isLoggedIn, dispatch, navigate]);

  useEffect(() => {
    if (!orderDetails || orderDetails.length === 0) {
      toast.error("Votre panier est vide.");
      navigate("/cart");
    }
  }, [orderDetails, navigate]);

  useEffect(() => {
    if (Userprofile && authChecked) {
      setFormData(prev => ({
        ...prev,
        contact_person_name: Userprofile.nom_et_prenom || "",
        contact_person_number: Userprofile.tel || "",
      }));
    }
  }, [Userprofile, authChecked]);

  useEffect(() => {
    if (!authChecked) return;

    const getGeolocation = () => {
      if (!navigator.geolocation) {
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
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          setAddressLoading(true);
          const address = await getAddressFromCoordinates(latitude, longitude);
          setAddressLoading(false);
          
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            address: address || prev.address,
          }));
          setGeolocationStatus('success');
          
          if (address) {
            toast.success("📍 Position et adresse détectées automatiquement");
          } else {
            toast.success("Position détectée automatiquement");
          }
        },
        (error) => {
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
        latitude: DEFAULT_LOCATION.lat.toString(),
        longitude: DEFAULT_LOCATION.lng.toString(),
      }));
      setManualLocation(true);
    };

    // ✅ CORRECTION: Ne pas lancer la géolocalisation si c'est un retrait en magasin
    if (formData.order_type === 'delivery') {
      getGeolocation();
    } else {
      setGeolocationStatus('not_needed');
    }
  }, [authChecked, formData.order_type]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // ✅ Mettre à jour delivery_fee automatiquement selon order_type
    if (name === "order_type") {
      const newDeliveryFee = value === "pickup" ? PICKUP_DELIVERY_FEE : DEFAULT_DELIVERY_FEE;
      setFormData((prevData) => ({ 
        ...prevData, 
        [name]: value,
        delivery_fee: newDeliveryFee,
        // Réinitialiser la localisation si on passe de delivery à pickup
        ...(value === "pickup" && {
          latitude: "",
          longitude: "",
          address: ""
        })
      }));
      
      // Si on passe à delivery et qu'on n'a pas encore de géolocalisation, lancer la détection
      if (value === "delivery" && (!prevData.latitude || !prevData.longitude)) {
        setGeolocationStatus('loading');
        setTimeout(() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                const address = await getAddressFromCoordinates(latitude, longitude);
                setFormData(prev => ({
                  ...prev,
                  latitude: latitude.toString(),
                  longitude: longitude.toString(),
                  address: address || prev.address,
                }));
                setGeolocationStatus('success');
                toast.success("📍 Position détectée automatiquement");
              },
              () => {
                setGeolocationStatus('error');
                toast.error("Impossible de détecter votre position. Sélectionnez-la manuellement sur la carte.");
              }
            );
          } else {
            setGeolocationStatus('error');
          }
        }, 100);
      }
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleMapClick = async ({ lat, lng }) => {
    setAddressLoading(true);
    const address = await getAddressFromCoordinates(lat, lng);
    setAddressLoading(false);
    
    setFormData((prev) => ({ 
      ...prev, 
      latitude: lat.toString(), 
      longitude: lng.toString(),
      address: address || prev.address,
    }));
    setMapError(null);
    setManualLocation(true);
    setGeolocationStatus('success');
    
    if (address) {
      toast.success("📍 Position et adresse sélectionnées sur la carte");
    } else {
      toast.success("Position sélectionnée manuellement");
    }
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
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setAddressLoading(true);
        const address = await getAddressFromCoordinates(latitude, longitude);
        setAddressLoading(false);
        
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          address: address || prev.address,
        }));
        setGeolocationStatus('success');
        
        if (address) {
          toast.success("📍 Position et adresse détectées avec succès!");
        } else {
          toast.success("Position détectée avec succès!");
        }
      },
      (error) => {
        toast.error("Échec de la géolocalisation. Utilisez la carte.");
        setGeolocationStatus('error');
      },
      {
        timeout: 8000,
        enableHighAccuracy: false
      }
    );
  };

  const calculateOrderAmount = () => {
    // ✅ Calculer le sous-total des articles
    const calculatedSubtotal = orderDetails.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
    
    // ✅ CORRECTION: Utiliser directement les constantes
    const deliveryFee = formData.order_type === 'pickup' 
      ? PICKUP_DELIVERY_FEE  // 0 DT
      : DEFAULT_DELIVERY_FEE; // 2.5 DT
    
    // ✅ Récupérer la déduction de cagnotte
    const cagnotteDeduction = parseFloat(formData.cagnotte_deduction) || 0;
    
    // ✅ Calculer le total final : Sous-total + Frais de livraison - Cagnotte
    const calculatedAmount = calculatedSubtotal + deliveryFee - cagnotteDeduction;
    
    if (isNaN(calculatedAmount) || !isFinite(calculatedAmount)) {
      return 0;
    }
    
    return Math.max(0, calculatedAmount); // Ne jamais retourner un montant négatif
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    const { contact_person_name, contact_person_number, address, payment_method, latitude, longitude } = formData;

    const validations = [
      { condition: !contact_person_name?.trim(), message: "Veuillez saisir votre nom complet." },
      { condition: !contact_person_number?.trim(), message: "Veuillez saisir votre numéro de téléphone." },
      { condition: formData.order_type === 'delivery' && !address?.trim(), message: "Veuillez saisir votre adresse de livraison." },
      { condition: !payment_method, message: "Veuillez sélectionner un mode de paiement." },
      { condition: formData.order_type === 'delivery' && (!latitude || !longitude), message: "Veuillez sélectionner votre localisation sur la carte." },
    ];

    for (const validation of validations) {
      if (validation.condition) {
        toast.error(validation.message);
        setIsSubmitting(false);
        return;
      }
    }

    const auth_token = getAuthToken();
    
    if (!auth_token) {
      toast.error("Session expirée. Veuillez vous reconnecter.");
      navigate("/login");
      setIsSubmitting(false);
      return;
    }

    const calculatedOrderAmount = calculateOrderAmount();

    if (calculatedOrderAmount <= 0 || isNaN(calculatedOrderAmount)) {
      toast.error("Erreur de calcul du montant. Vérifiez votre panier.");
      setIsSubmitting(false);
      return;
    }
    
    const finalOrderAmount = parseFloat(calculatedOrderAmount.toFixed(2));
    
    // ✅ CORRECTION: Utiliser les constantes directement
    const deliveryFee = formData.order_type === 'pickup' 
      ? PICKUP_DELIVERY_FEE  // 0 DT
      : DEFAULT_DELIVERY_FEE; // 2.5 DT
      
    const cagnotteDeduction = parseFloat(formData.cagnotte_deduction) || 0;
    
    const orderData = {
      order_amount: finalOrderAmount,
      cagnotte_deduction: cagnotteDeduction,
      delivery_fee: deliveryFee, // ✅ 0 pour pickup, 2.5 pour delivery
      contact_person_name: contact_person_name.trim(),
      contact_person_number: contact_person_number.trim(),
      address: formData.order_type === 'delivery' ? address.trim() : 'Emporté en magasin',
      latitude: formData.order_type === 'delivery' ? parseFloat(latitude) : null,
      longitude: formData.order_type === 'delivery' ? parseFloat(longitude) : null,
      order_type: formData.order_type || "delivery",
      payment_method: formData.payment_method || "cash",
      cart: formData.cart.map(item => {
        const cartItem = {
          id: parseInt(item.id),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price || 0)
        };
        
        if (item.isPromotion === true && item.promo_id) {
          cartItem.promo_id = parseInt(item.promo_id);
        }
        
        return cartItem;
      })
    };

    // ✅ Validation finale avant envoi
    if (!orderData.order_amount || isNaN(orderData.order_amount)) {
      toast.error("Erreur de calcul du montant final.");
      setIsSubmitting(false);
      return;
    }

    if (!orderData.delivery_fee && orderData.delivery_fee !== 0) {
      toast.error("Frais de livraison manquants.");
      setIsSubmitting(false);
      return;
    }

    // 📊 LOG DE DEBUGGING DÉTAILLÉ
    console.log("📦 Données de commande envoyées:", {
      order_amount: orderData.order_amount,
      delivery_fee: orderData.delivery_fee,
      cagnotte_deduction: orderData.cagnotte_deduction,
      order_type: orderData.order_type,
      cart_items: orderData.cart,
      has_promotions: orderData.cart.some(item => item.promo_id),
    });
    
    console.log("🧮 Détail du calcul:", {
      items: orderDetails.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        isPromotion: item.isPromotion || false,
        promo_id: item.promo_id || null,
        subtotal: (parseFloat(item.price) * parseInt(item.quantity)).toFixed(3)
      })),
      subtotal_calculated: orderDetails.reduce((total, item) => 
        total + (parseFloat(item.price) * parseInt(item.quantity)), 0
      ).toFixed(3),
      delivery_fee: orderData.delivery_fee,
      cagnotte_deduction: orderData.cagnotte_deduction,
      total_calculated: calculateOrderAmount().toFixed(3),
      total_sent: orderData.order_amount.toFixed(3),
      match: calculateOrderAmount().toFixed(3) === orderData.order_amount.toFixed(3) ? "✅" : "❌"
    });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/customer/order/place`, 
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

      if (response.data.message || response.status === 200 || response.status === 201) {
        toast.success("Commande passée avec succès!");
        setModalIsOpen(true);
        
        localStorage.removeItem("cart");
        sessionStorage.removeItem("cart");
        localStorage.removeItem('cagnotte_deduction');
      } else {
        toast.error(`Erreur : ${response.data.message || "Une erreur est survenue."}`);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la commande:", error);
      console.error("Détails de la requête:", orderData);
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        console.error("Status:", status);
        console.error("Error Data:", errorData);
        
        if (status === 400) {
          const errorMsg = errorData.message || errorData.error || JSON.stringify(errorData);
          
          if (errorData.errors && typeof errorData.errors === 'object') {
            const errorDetails = Object.entries(errorData.errors)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`)
              .join(" | ");
            toast.error(`Erreur de validation: ${errorDetails}`);
          } else if (errorMsg.includes("Amount should be") || errorMsg.includes("subtotal + delivery_fee - cagnotte_deduction")) {
            toast.error("Erreur de calcul du montant. Veuillez réessayer ou contacter le support.");
          } else {
            toast.error(`Erreur 400: ${errorMsg}`);
          }
        } else if (status === 403 || status === 401) {
          toast.error("Session expirée. Veuillez vous reconnecter.");
          setTimeout(() => navigate("/login"), 2000);
        } else if (status === 422) {
          const errors = errorData.errors || {};
          const errorMessages = Object.entries(errors).map(([field, msgs]) => 
            `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`
          );
          toast.error(`Validation: ${errorMessages.join(" | ") || errorData.message || "Données invalides"}`);
        } else if (status === 500) {
          toast.error("Erreur serveur. Veuillez réessayer plus tard.");
        } else {
          toast.error(`Erreur ${status}: ${errorData.message || JSON.stringify(errorData)}`);
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("Erreur de connexion réseau. Vérifiez votre connexion.");
      } else {
        console.error("Error message:", error.message);
        toast.error("Une erreur inattendue est survenue.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    navigate("/Mes-Commandes");
  };

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
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Informations personnelles</h2>
          <form className="space-y-4">
            {/* ✅ Type de commande */}
            <div>
              <label className="block font-medium mb-2">Type de commande *</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'order_type', value: 'delivery' } })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.order_type === 'delivery'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🚚</div>
                    <div className="font-semibold">Livraison</div>
                    <div className="text-sm mt-1">2.5 DT</div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'order_type', value: 'pickup' } })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.order_type === 'pickup'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🏪</div>
                    <div className="font-semibold">Emporté</div>
                    <div className="text-sm mt-1 text-green-600 font-semibold">GRATUIT</div>
                  </div>
                </button>
              </div>
            </div>

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
            
            {/* ✅ Adresse conditionnelle (seulement pour delivery) */}
            {formData.order_type === 'delivery' && (
              <div>
                <label className="block font-medium mb-2">
                  Adresse complète *
                  {addressLoading && (
                    <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded animate-pulse">
                      ⏳ Récupération de l'adresse...
                    </span>
                  )}
                  {!addressLoading && formData.address && (
                    <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      ✅ Adresse détectée automatiquement
                    </span>
                  )}
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Votre adresse de livraison complète (sera remplie automatiquement depuis la carte)"
                  required
                  disabled={addressLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 L'adresse se remplit automatiquement quand vous sélectionnez votre position sur la carte
                </p>
              </div>
            )}
            
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

        {/* ✅ Carte conditionnelle (seulement pour delivery) */}
        {formData.order_type === 'delivery' ? (
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
                key: GOOGLE_MAPS_API_KEY,
                libraries: ['places']
              }}
              center={{ 
                lat: parseFloat(formData.latitude) || DEFAULT_LOCATION.lat, 
                lng: parseFloat(formData.longitude) || DEFAULT_LOCATION.lng 
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
              <li>📍 Cliquez sur la carte pour sélectionner votre position exacte</li>
              <li>🏠 L'adresse se remplit automatiquement depuis la carte</li>
              <li>🔄 Utilisez le bouton "Réessayer" si la détection automatique échoue</li>
              <li>🔍 Zoomez pour une sélection plus précise</li>
            </ul>
          </div>
        </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏪</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Emporté sélectionné</h3>
              <p className="text-gray-600 mb-4">
                Votre commande sera prête pour le retrait en magasin
              </p>
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 inline-block">
                <p className="text-green-700 font-semibold text-lg">
                  ✅ Frais de livraison : GRATUIT
                </p>
              </div>
              <div className="mt-6 text-left bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-700 mb-2">📍 Adresse du magasin :</p>
                <p className="text-gray-600">
                  [Votre adresse de magasin ici]<br/>
                  Tunis, Tunisie
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Horaires : Lun-Sam 9h-19h
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">Récapitulatif de la commande</h2>
        <div className="space-y-2">
          {orderDetails.map((item, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <span>{item.name} x {item.quantity}</span>
                {item.isPromotion && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                    🏷️ PROMO
                  </span>
                )}
              </div>
              <div className="text-right">
                {item.isPromotion && item.Initialprice && parseFloat(item.Initialprice) > parseFloat(item.price) && (
                  <div className="text-xs text-gray-400 line-through">
                    {(item.Initialprice * item.quantity).toFixed(2)} DT
                  </div>
                )}
                <span className={item.isPromotion ? "text-red-600 font-semibold" : ""}>
                  {(item.price * item.quantity).toFixed(2)} DT
                </span>
              </div>
            </div>
          ))}
          
          <div className="flex justify-between items-center pt-2 text-gray-700">
            <span>Sous-total</span>
            <span>{orderDetails.reduce((total, item) => total + (parseFloat(item.price) * parseInt(item.quantity)), 0).toFixed(2)} DT</span>
          </div>
          
          <div className="flex justify-between items-center text-gray-700">
            <span>Frais de livraison</span>
            <span className={formData.order_type === 'pickup' ? 'text-green-600 font-semibold' : ''}>
              {formData.order_type === 'pickup' ? 'GRATUIT' : `${DEFAULT_DELIVERY_FEE.toFixed(2)} DT`}
            </span>
          </div>
          
          {formData.cagnotte_deduction > 0 && (
            <div className="flex justify-between items-center text-green-600 font-semibold">
              <span>💰 Réduction cagnotte</span>
              <span>-{parseFloat(formData.cagnotte_deduction).toFixed(2)} DT</span>
            </div>
          )}
          
          <div className="flex justify-between items-center font-bold text-lg pt-2 border-t-2 border-gray-300 mt-2">
            <span>Total à payer</span>
            <span className="text-blue-600">{calculateOrderAmount().toFixed(2)} DT</span>
          </div>
          
          {orderDetails.some(item => item.isPromotion && item.Initialprice) && (
            <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-sm text-red-700 font-medium">
                🎉 Vous économisez <strong>
                  {orderDetails.reduce((total, item) => {
                    if (item.isPromotion && item.Initialprice) {
                      const savings = (parseFloat(item.Initialprice) - parseFloat(item.price)) * parseInt(item.quantity);
                      return total + savings;
                    }
                    return total;
                  }, 0).toFixed(2)} DT
                </strong> grâce aux promotions !
              </p>
            </div>
          )}
          
          {formData.cagnotte_deduction > 0 && (
            <div className="mt-3 p-3 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="text-sm text-green-700 font-medium">
                🎉 Vous économisez <strong>{parseFloat(formData.cagnotte_deduction).toFixed(2)} DT</strong> grâce à votre cagnotte !
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !tokenValid}
        className={`w-full py-4 text-white rounded-lg transition-colors text-lg font-semibold shadow-lg ${
          isSubmitting || !tokenValid
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
        }`}
      >
        {isSubmitting ? 'Traitement en cours...' : '✓ Confirmer la commande'}
      </button>

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
            {formData.cagnotte_deduction > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                Cagnotte utilisée: {formData.cagnotte_deduction.toFixed(2)} DT
              </p>
            )}
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