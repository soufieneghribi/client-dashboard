import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GoogleMapReact from "google-map-react";
import { toast } from "react-hot-toast";
import Modal from "react-modal";
import { useSelector, useDispatch } from "react-redux";
import axios from 'axios';
import { fetchUserProfile } from "../store/slices/user";
import { selectToken, logout, refreshAuth } from "../store/slices/authSlice";
import {
  fetchAvailableModes,
  calculateDeliveryFee,
  setSelectedMode,
  selectDeliveryModes,
  selectSelectedMode,
  selectCalculatedFee,
  selectDeliveryCalculating,
} from "../store/slices/delivery";
import RelayPointSelector from "../components/RelayPointSelector";
import StorePickupSelector from "../components/StorePickupSelector";
import store from "../store";
import apiConfig from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser, FaPhone, FaMapMarkerAlt, FaTruck, FaStore,
  FaChevronRight, FaCheckCircle, FaWallet, FaCreditCard,
  FaMoneyBillWave, FaBoxOpen, FaInfoCircle, FaSyncAlt
} from "react-icons/fa";

// ⭐ TOKEN GOOGLE MAPS
const GOOGLE_MAPS_API_KEY = "AIzaSyAFwGAsC3VUZYdxkEwB43DEf5tpSx4hAZg";

/**
 * OrderConfirmation Component - CORRIGÉ POUR ERREUR 400
 * 
 * Corrections principales:
 * 1. ✅ Validation stricte des coordonnées GPS avant envoi
 * 2. ✅ Conversion en nombres (pas de strings)
 * 3. ✅ Ne pas envoyer latitude/longitude pour pickup
 * 4. ✅ Logs détaillés pour debugging
 */

// ==================== CONSTANTS ====================
const API_BASE_URL = apiConfig.API_BASE_URL;
const DEFAULT_LOCATION = { lat: 36.8065, lng: 10.1815 };
const DEFAULT_DELIVERY_FEE = 0; // Valeur par défaut avant calcul
const PICKUP_DELIVERY_FEE = 0;

// ==================== HELPER FUNCTIONS ====================

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

/**
 * ✅ FONCTION CRITIQUE: Valider les coordonnées GPS
 */
const validateCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  // Vérifier que ce sont des nombres valides
  if (isNaN(latitude) || isNaN(longitude)) {
    return false;
  }

  // Vérifier les plages
  if (latitude < -90 || latitude > 90) {
    return false;
  }

  if (longitude < -180 || longitude > 180) {
    return false;
  }

  // Éviter les coordonnées nulles
  if (latitude === 0 && longitude === 0) {
    return false;
  }

  return true;
};

// ==================== MAIN COMPONENT ====================

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const auth = useSelector((state) => state.auth);
  const { Userprofile } = useSelector((state) => state.user);

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
  const initialOrderType = (parseFloat(receivedDeliveryFee) === 0 || receivedDeliveryFee === 0) ? "pickup" : "delivery";

  // Delivery state from Redux
  const deliveryModes = useSelector(selectDeliveryModes);
  const selectedMode = useSelector(selectSelectedMode);
  const calculatedFee = useSelector(selectCalculatedFee);
  const isCalculatingFee = useSelector(selectDeliveryCalculating);

  const [formData, setFormData] = useState({
    contact_person_name: "",
    contact_person_number: "",
    // Structured address fields
    rue: "",
    ville: "",
    gouvernorat: "",
    code_postal: "",
    // Legacy address field (for display)
    address: "",
    longitude: "",
    latitude: "",
    cart: orderDetails,
    order_type: initialOrderType,
    payment_method: "cash",
    delivery_fee: parseFloat(receivedDeliveryFee) || DEFAULT_DELIVERY_FEE,
    cagnotte_deduction: parseFloat(receivedCagnotteDeduction) || 0,
  });

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [geolocationStatus, setGeolocationStatus] = useState('idle');
  const [manualLocation, setManualLocation] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Store selection state
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedStoreFee, setSelectedStoreFee] = useState(null);

  // Relay point selection state
  const [selectedRelayPoint, setSelectedRelayPoint] = useState(null);
  const [relayPointFee, setRelayPointFee] = useState(0);

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

  // Fetch delivery modes on mount
  useEffect(() => {
    if (authChecked) {
      dispatch(fetchAvailableModes());
    }
  }, [authChecked, dispatch]);

  // Calculate delivery fee when relevant fields change
  useEffect(() => {
    const shouldCalculateFee =
      (formData.order_type === 'delivery' && selectedMode && formData.rue && formData.ville && formData.gouvernorat) ||
      (formData.order_type === 'relay_point' && selectedRelayPoint);

    if (shouldCalculateFee && orderDetails.length > 0) {
      const cartTotal = orderDetails.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        return total + (price * quantity);
      }, 0);

      let deliveryAddress = {};
      let modeId = selectedMode;
      let storeId = null;

      if (formData.order_type === 'delivery') {
        deliveryAddress = {
          rue: formData.rue,
          ville: formData.ville,
          gouvernorat: formData.gouvernorat,
          code_postal: formData.code_postal || "",
        };
      } else if (formData.order_type === 'relay_point' && selectedRelayPoint) {
        deliveryAddress = {
          rue: selectedRelayPoint.address || '',
          ville: selectedRelayPoint.city || '',
          gouvernorat: selectedRelayPoint.gouvernorat || '',
          code_postal: selectedRelayPoint.code_postal || '',
        };
        // TODO: Vérifier l'ID correct pour Point Relais côté backend
        // Pour l'instant on suppose que c'est un mode spécifique ou géré par store_id
        // D'après la capture : "Point Relais" est un mode. 
        // On va essayer de trouver le mode "Point Relais" dans deliveryModes ou utiliser une constante si connue.
        // Si deliveryModes contient un mode nommé "Point Relais", on l'utilise.
        const relayMode = deliveryModes.find(m => m.nom === 'Point Relais' || m.code === 'POINT_RELAIS');
        modeId = relayMode ? relayMode.mode_livraison_id : 'POINT_RELAIS';
        storeId = selectedRelayPoint.id;
      }

      const cartItems = orderDetails.map(item => ({
        article_id: parseInt(item.id),
        quantity: parseInt(item.quantity),
      }));

      console.log("🚚 Calculating delivery fee...");
      dispatch(calculateDeliveryFee({
        delivery_address: deliveryAddress,
        cart_total: cartTotal,
        mode_livraison_id: modeId,
        store_id: storeId,
        cart_items: cartItems,
        // ✅ Ajout des coordonnées pour le calcul de distance
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      }));
    }
  }, [formData.rue, formData.ville, formData.gouvernorat, formData.code_postal, formData.order_type, selectedMode, orderDetails, dispatch]);

  // Update delivery fee in formData when calculated
  useEffect(() => {
    if (calculatedFee !== null && (formData.order_type === 'delivery' || formData.order_type === 'relay_point')) {
      setFormData(prev => ({
        ...prev,
        delivery_fee: calculatedFee,
      }));
      console.log("✅ Delivery fee updated:", calculatedFee);
    } else if (formData.order_type === 'pickup' || formData.order_type === 'store_pickup') {
      // ✅ CORRECTION: Ne pas mettre 0 pour relay_point
      setFormData(prev => ({
        ...prev,
        delivery_fee: PICKUP_DELIVERY_FEE,
      }));
    }
  }, [calculatedFee, formData.order_type]);

  useEffect(() => {
    if (!authChecked) return;
    if (formData.order_type !== 'delivery') {
      setGeolocationStatus('not_needed');
      return;
    }

    const getGeolocation = () => {
      if (!navigator.geolocation) {
        setGeolocationStatus('error');
        toast.error("Géolocalisation non supportée par votre navigateur");
        setDefaultLocation();
        return;
      }

      setGeolocationStatus('loading');
      console.log("🔍 Tentative de géolocalisation...");

      const geolocationOptions = {
        timeout: 5000, // Réduit à 5 secondes pour une réponse plus rapide
        enableHighAccuracy: false, // Désactivé pour une réponse plus rapide
        maximumAge: 30000 // Accepte une position récente (30 secondes)
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          console.log("✅ Position détectée:", { latitude, longitude });

          if (!validateCoordinates(latitude, longitude)) {
            console.error("❌ Coordonnées invalides:", { latitude, longitude });
            setGeolocationStatus('error');
            toast.error("Coordonnées invalides détectées");
            setDefaultLocation();
            return;
          }

          setAddressLoading(true);
          const address = await getAddressFromCoordinates(latitude, longitude);
          setAddressLoading(false);

          setFormData(prev => ({
            ...prev,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            address: address || prev.address,
          }));

          setGeolocationStatus('success');
          setManualLocation(false);
          setRetryCount(0);

          if (address) {
            toast.success("📍 Position et adresse détectées automatiquement!", {
              duration: 4000,
              icon: "🎯"
            });
          } else {
            toast.success("📍 Position détectée! Veuillez compléter l'adresse.", {
              duration: 4000
            });
          }
        },
        (error) => {
          let errorMessage = "Géolocalisation échouée";

          console.error("❌ Erreur de géolocalisation:", error);

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "🚫 Permission de géolocalisation refusée. Veuillez autoriser l'accès à votre position ou sélectionner manuellement sur la carte.";
              setGeolocationStatus('denied');
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "📡 Position indisponible. Veuillez sélectionner manuellement votre position sur la carte.";
              setGeolocationStatus('error');
              break;
            case error.TIMEOUT:
              errorMessage = "⏱️ Délai de géolocalisation dépassé. Veuillez sélectionner manuellement votre position sur la carte.";
              setGeolocationStatus('error');
              break;
            default:
              errorMessage = "⚠️ Erreur de géolocalisation. Veuillez sélectionner manuellement votre position sur la carte.";
              setGeolocationStatus('error');
              break;
          }

          toast.error(errorMessage, { duration: 5000 });
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

    getGeolocation();
  }, [authChecked, formData.order_type, retryCount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'order_type') {
      // ✅ CORRECTION: Ne pas réinitialiser delivery_fee pour relay_point
      // Le frais sera calculé via l'API
      const newDeliveryFee = (value === 'pickup' || value === 'store_pickup') ? PICKUP_DELIVERY_FEE : null;

      setFormData(prev => ({
        ...prev,
        [name]: value,
        ...(newDeliveryFee !== null && { delivery_fee: newDeliveryFee }),
      }));

      if (value === 'delivery' && geolocationStatus !== 'success') {
        setRetryCount(prev => prev + 1);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMapClick = async ({ lat, lng }) => {
    if (formData.order_type !== 'delivery') {
      toast("La sélection sur la carte n'est disponible qu'en mode livraison", { icon: 'ℹ️' });
      return;
    }

    console.log("🗺️ Clic sur la carte:", { lat, lng });

    if (!validateCoordinates(lat, lng)) {
      toast.error("Coordonnées invalides. Veuillez réessayer.");
      return;
    }

    setAddressLoading(true);
    setGeolocationStatus('loading');

    const address = await getAddressFromCoordinates(lat, lng);
    setAddressLoading(false);

    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      address: address || prev.address,
    }));

    setGeolocationStatus('success');
    setManualLocation(true);

    if (address) {
      toast.success("📍 Position et adresse mises à jour!", { duration: 3000 });
    } else {
      toast.success("📍 Position mise à jour!", { duration: 3000 });
    }
  };

  const handleRetryGeolocation = () => {
    setRetryCount(prev => prev + 1);
    toast("Nouvelle tentative de géolocalisation...", { icon: '🔄' });
  };

  const calculateOrderAmount = () => {
    const calculatedSubtotal = orderDetails.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);

    // ✅ CORRECTION: Utiliser formData.delivery_fee OU calculatedFee (le vrai frais calculé)
    const deliveryFee = (formData.delivery_fee !== null && formData.delivery_fee !== 0)
      ? parseFloat(formData.delivery_fee)
      : (formData.order_type === 'pickup' ? 0 : (calculatedFee || 0));

    const cagnotteDeduction = parseFloat(formData.cagnotte_deduction) || 0;

    const calculatedAmount = calculatedSubtotal + deliveryFee - cagnotteDeduction;

    if (isNaN(calculatedAmount) || !isFinite(calculatedAmount)) {
      return 0;
    }

    return Math.max(0, calculatedAmount);
  };

  /**
   * ✅ FONCTION CRITIQUE: Validation et soumission de la commande
   */
  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const { contact_person_name, contact_person_number, address, payment_method, latitude, longitude } = formData;

    // ============================================
    // 1. VALIDATIONS DE BASE
    // ============================================

    const basicValidations = [
      { condition: !contact_person_name?.trim(), message: "⚠️ Veuillez saisir votre nom complet." },
      { condition: !contact_person_number?.trim(), message: "⚠️ Veuillez saisir votre numéro de téléphone." },
      { condition: !payment_method, message: "⚠️ Veuillez sélectionner un mode de paiement." },
    ];

    for (const validation of basicValidations) {
      if (validation.condition) {
        toast.error(validation.message);
        setIsSubmitting(false);
        return;
      }
    }

    // ============================================
    // 2. VALIDATIONS SPÉCIFIQUES LIVRAISON
    // ============================================

    if (formData.order_type === 'delivery') {
      // Vérifier que la géolocalisation est terminée
      if (geolocationStatus === 'loading') {
        toast.error("⏳ La détection de position est en cours. Veuillez patienter...");
        setIsSubmitting(false);
        return;
      }

      // ✅ Vérifier les champs d'adresse structurés
      if (!formData.rue?.trim()) {
        toast.error("📍 Veuillez saisir le nom de la rue.");
        setIsSubmitting(false);
        return;
      }

      if (!formData.ville?.trim()) {
        toast.error("📍 Veuillez saisir la ville.");
        setIsSubmitting(false);
        return;
      }

      if (!formData.gouvernorat?.trim()) {
        toast.error("📍 Veuillez saisir le gouvernorat.");
        setIsSubmitting(false);
        return;
      }

      // Vérifier que le mode de livraison est sélectionné
      if (!selectedMode) {
        toast.error("🚚 Veuillez sélectionner un mode de livraison.");
        setIsSubmitting(false);
        return;
      }

      // ✅ VALIDATION CRITIQUE: Vérifier les coordonnées (optionnel maintenant)
      // Les coordonnées GPS sont optionnelles - l'utilisateur peut juste entrer l'adresse
      if (latitude && longitude) {
        // ✅ Valider le format des coordonnées si elles sont fournies
        if (!validateCoordinates(latitude, longitude)) {
          toast.error("❌ Coordonnées GPS invalides. Veuillez sélectionner à nouveau votre position sur la carte.");
          console.error("❌ Coordonnées invalides:", { latitude, longitude });
          setIsSubmitting(false);
          return;
        }
      }

      // ✅ Vérifier position par défaut
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const isDefaultLocation = Math.abs(lat - DEFAULT_LOCATION.lat) < 0.001 &&
        Math.abs(lng - DEFAULT_LOCATION.lng) < 0.001;

      if (isDefaultLocation && !manualLocation) {
        const confirmDefault = window.confirm(
          "📍 Vous utilisez la position par défaut (Tunis centre). Est-ce votre adresse de livraison ?\n\n" +
          "Cliquez sur OK pour confirmer ou sur Annuler pour sélectionner une autre position sur la carte."
        );

        if (!confirmDefault) {
          setIsSubmitting(false);
          toast("Veuillez sélectionner votre adresse exacte sur la carte", { icon: '📍' });
          return;
        }
      }
    }

    // ============================================
    // 3. VÉRIFIER LE TOKEN
    // ============================================

    const auth_token = getAuthToken();

    if (!auth_token) {
      toast.error("Session expirée. Veuillez vous reconnecter.");
      navigate("/login");
      setIsSubmitting(false);
      return;
    }

    // ============================================
    // 4. CALCULER LES MONTANTS
    // ============================================

    const calculatedOrderAmount = calculateOrderAmount();

    if (calculatedOrderAmount <= 0 || isNaN(calculatedOrderAmount)) {
      toast.error("Erreur de calcul du montant. Vérifiez votre panier.");
      setIsSubmitting(false);
      return;
    }

    const finalOrderAmount = parseFloat(calculatedOrderAmount.toFixed(2));
    // ✅ Utiliser le frais calculé dynamiquement (respect du backend)
    const deliveryFee = formData.delivery_fee !== null && formData.delivery_fee !== undefined && formData.delivery_fee !== 0
      ? parseFloat(formData.delivery_fee)
      : (formData.order_type === 'pickup' ? PICKUP_DELIVERY_FEE : (calculatedFee || DEFAULT_DELIVERY_FEE));

    console.log("🛠️ Submit Debug:", {
      formData_fee: formData.delivery_fee,
      calculatedFee_redux: calculatedFee,
      final_deliveryFee: deliveryFee,
      finalOrderAmount: finalOrderAmount,
      order_type: formData.order_type
    });

    const cagnotteDeduction = parseFloat(formData.cagnotte_deduction) || 0;

    // ============================================
    // 5. CONSTRUIRE orderData - PARTIE CRITIQUE
    // ============================================

    const orderData = {
      order_amount: finalOrderAmount,
      cagnotte_deduction: cagnotteDeduction,
      delivery_fee: deliveryFee,
      contact_person_name: contact_person_name.trim(),
      contact_person_number: contact_person_number.trim(),
      // ✅ Retour au respect du backend : on envoie le vrai type
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

    // ✅ CORRECTION CRITIQUE: Gérer address et coordonnées selon le type
    if (formData.order_type === 'delivery') {
      // Construire l'adresse complète à partir des champs structurés
      const addressParts = [
        formData.rue,
        formData.ville,
        formData.gouvernorat,
        formData.code_postal,
        formData.address // Informations complémentaires
      ].filter(part => part && part.trim());

      orderData.address = addressParts.join(', ');

      // Inclure les coordonnées GPS seulement si elles sont valides
      if (latitude && longitude && validateCoordinates(latitude, longitude)) {
        orderData.latitude = parseFloat(latitude);
        orderData.longitude = parseFloat(longitude);
      }

      // ✅ Hack: On force l'envoi des coordonnées même si on a mappé vers 'pickup'
      // Cela permet de garder les infos de livraison même si le backend croit que c'est un pickup
    } else if (formData.order_type === 'relay_point') {
      // ✅ Pour relay_point: garder l'adresse du relais (déjà dans formData.address)
      orderData.address = formData.address;

      // ⭐ AJOUT: Inclure store_id et mode_livraison_id (comme sur mobile)
      if (selectedRelayPoint?.id) {
        orderData.store_id = selectedRelayPoint.id;
      }

      // Trouver l'ID du mode relais
      const relayMode = deliveryModes?.find(m =>
        m.code === 'POINT_RELAIS' ||
        ['point relais', 'point-relais', 'relais'].includes(m.nom?.toLowerCase())
      );
      if (relayMode?.mode_livraison_id) {
        orderData.mode_livraison_id = relayMode.mode_livraison_id.toString();
      } else {
        orderData.mode_livraison_id = 'POINT_RELAIS';
      }
    } else {
      // Pour pickup standard: juste l'adresse "Emporté en magasin"
      orderData.address = 'Emporté en magasin';
      // NE PAS inclure latitude et longitude
    }

    // ============================================
    // 6. VALIDATION FINALE
    // ============================================

    if (!orderData.order_amount || isNaN(orderData.order_amount)) {
      toast.error("Erreur de calcul du montant final.");
      setIsSubmitting(false);
      return;
    }

    if (orderData.delivery_fee === undefined || orderData.delivery_fee === null) {
      toast.error("Frais de livraison manquants.");
      setIsSubmitting(false);
      return;
    }

    // ✅ Vérifier les coordonnées une dernière fois pour delivery (même si mappé pickup)
    if (formData.order_type === 'delivery') {
      if (typeof orderData.latitude !== 'number' || typeof orderData.longitude !== 'number') {
        toast.error("❌ Format de coordonnées invalide");
        console.error("❌ Type invalide:", {
          latType: typeof orderData.latitude,
          lngType: typeof orderData.longitude
        });
        setIsSubmitting(false);
        return;
      }

      if (!validateCoordinates(orderData.latitude, orderData.longitude)) {
        toast.error("❌ Coordonnées GPS invalides");
        console.error("❌ Validation échouée:", {
          lat: orderData.latitude,
          lng: orderData.longitude
        });
        setIsSubmitting(false);
        return;
      }
    }

    // ============================================
    // 7. LOGS DE DEBUGGING DÉTAILLÉS
    // ============================================

    // ✅ Log détaillé du calcul des montants
    const subtotalCalculated = orderDetails.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);

    console.log("💰 Détails du calcul du montant:", {
      subtotal: subtotalCalculated.toFixed(2),
      delivery_fee: deliveryFee.toFixed(2),
      cagnotte_deduction: cagnotteDeduction.toFixed(2),
      calculated_total: finalOrderAmount.toFixed(2),
      formula: `${subtotalCalculated.toFixed(2)} + ${deliveryFee.toFixed(2)} - ${cagnotteDeduction.toFixed(2)} = ${finalOrderAmount.toFixed(2)}`
    });

    console.log("📦 Données de commande envoyées:", {
      order_amount: orderData.order_amount,
      delivery_fee: orderData.delivery_fee,
      cagnotte_deduction: orderData.cagnotte_deduction,
      order_type: orderData.order_type,
      address: orderData.address,
      has_latitude: 'latitude' in orderData,
      has_longitude: 'longitude' in orderData,
      latitude: orderData.latitude,
      longitude: orderData.longitude,
      latitude_type: typeof orderData.latitude,
      longitude_type: typeof orderData.longitude,
      coordinates_valid: orderData.latitude && orderData.longitude ?
        validateCoordinates(orderData.latitude, orderData.longitude) : null,
      cart_items_count: orderData.cart.length,
      has_promotions: orderData.cart.some(item => item.promo_id),
    });

    // ✅ Log complet en JSON
    console.log("📊 OrderData JSON:", JSON.stringify(orderData, null, 2));

    // ============================================
    // 8. ENVOI DE LA REQUÊTE
    // ============================================

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
        toast.success("✅ Commande passée avec succès!", { duration: 4000 });
        setModalIsOpen(true);

        localStorage.removeItem("cart");
        sessionStorage.removeItem("cart");
        localStorage.removeItem('cagnotte_deduction');
      } else {
        toast.error(`Erreur : ${response.data.message || "Une erreur est survenue."}`);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la commande:", error);
      console.error("📋 Données envoyées:", orderData);

      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        console.error("🔢 Status:", status);
        console.error("📨 Réponse serveur:", errorData);

        if (status === 400) {
          const errorMsg = errorData.message || errorData.error || JSON.stringify(errorData);

          // ✅ Gérer les différents types d'erreur 400
          if (errorData.errors && typeof errorData.errors === 'object') {
            const errorDetails = Object.entries(errorData.errors)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`)
              .join(" | ");
            toast.error(`❌ Validation: ${errorDetails}`, { duration: 6000 });
            console.error("📋 Détails validation:", errorData.errors);
          } else if (errorMsg.includes("latitude") || errorMsg.includes("longitude") || errorMsg.includes("coordonnées")) {
            toast.error("📍 Erreur de coordonnées GPS. Veuillez sélectionner à nouveau votre position sur la carte.", { duration: 6000 });
          } else if (errorMsg.includes("Amount") || errorMsg.includes("montant")) {
            toast.error("💰 Erreur de calcul du montant. Veuillez réessayer.", { duration: 6000 });
          } else {
            toast.error(`❌ Erreur: ${errorMsg}`, { duration: 6000 });
          }
        } else if (status === 403 || status === 401) {
          toast.error("🔐 Session expirée. Veuillez vous reconnecter.");
          setTimeout(() => navigate("/login"), 2000);
        } else if (status === 422) {
          const errors = errorData.errors || {};
          const errorMessages = Object.entries(errors).map(([field, msgs]) =>
            `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`
          );
          toast.error(`❌ Validation: ${errorMessages.join(" | ") || errorData.message || "Données invalides"}`, { duration: 6000 });
          console.error("📋 Erreurs 422:", errors);
        } else if (status === 500) {
          toast.error("⚠️ Erreur serveur. Veuillez réessayer plus tard.");
        } else {
          toast.error(`❌ Erreur ${status}: ${errorData.message || JSON.stringify(errorData)}`);
        }
      } else if (error.request) {
        console.error("📡 Aucune réponse du serveur:", error.request);
        toast.error("📡 Erreur de connexion réseau. Vérifiez votre connexion.");
      } else {
        console.error("⚠️ Erreur:", error.message);
        toast.error("⚠️ Une erreur inattendue est survenue.");
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
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-8">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-blue-100 rounded-full"></div>
          </div>
        </div>
        <p className="mt-6 text-xl font-medium text-gray-700 animate-pulse">Vérification de l'authentification...</p>
      </div>
    );
  }

  if (!orderDetails || orderDetails.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-8">
        <div className="bg-white p-10 rounded-3xl shadow-xl flex flex-col items-center max-w-md w-full">
          <div className="text-7xl mb-6">🛒</div>
          <p className="text-2xl font-bold text-gray-800 mb-4 text-center">Votre panier est vide</p>
          <p className="text-gray-500 mb-8 text-center">Ajoutez des articles à votre panier pour pouvoir passer commande.</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-200"
          >
            Découvrir nos produits
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = calculateOrderAmount();

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Finaliser votre commande
            </h1>
            <p className="mt-2 text-slate-500 font-medium">
              Vérifiez vos informations et choisissez votre mode de livraison
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-sm border border-slate-100 font-bold text-slate-700">
            <FaBoxOpen className="text-blue-500" />
            <span>{orderDetails.length} articles</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form Area */}
          <div className="lg:col-span-8 space-y-6">

            {/* 1. Informations Personnelles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <FaUser size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Informations personnelles</h2>
                    <p className="text-sm text-slate-400 font-medium">Pour vous contacter concernant la livraison</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Nom complet *</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <FaUser size={14} />
                      </div>
                      <input
                        type="text"
                        name="contact_person_name"
                        value={formData.contact_person_name}
                        onChange={handleInputChange}
                        placeholder="Jean Dupont"
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-[1.25rem] focus:ring-4 focus:ring-blue-100 transition-all font-medium placeholder:text-slate-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Numéro de téléphone *</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <FaPhone size={14} />
                      </div>
                      <input
                        type="tel"
                        name="contact_person_number"
                        value={formData.contact_person_number}
                        onChange={handleInputChange}
                        placeholder="+216 XX XXX XXX"
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-[1.25rem] focus:ring-4 focus:ring-blue-100 transition-all font-medium placeholder:text-slate-300"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2. Mode de livraison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <FaTruck size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Mode de livraison</h2>
                    <p className="text-sm text-slate-400 font-medium">Comment souhaitez-vous recevoir votre commande ?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'delivery', label: 'Domicile', icon: <FaTruck />, color: 'blue', desc: 'Livraison express' },
                    { id: 'relay_point', label: 'Point Relais', icon: <FaMapMarkerAlt />, color: 'purple', desc: 'Proche de vous' },
                    { id: 'pickup', label: 'Magasin', icon: <FaStore />, color: 'green', desc: 'Retrait gratuit' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleInputChange({ target: { name: 'order_type', value: mode.id } })}
                      className={`relative group p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center text-center gap-3 ${formData.order_type === mode.id
                        ? `border-${mode.color}-500 bg-${mode.color}-50 ring-4 ring-${mode.color}-50`
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                        }`}
                    >
                      <div className={`text-3xl mb-1 ${formData.order_type === mode.id ? `text-${mode.color}-500` : 'text-slate-400'}`}>
                        {mode.icon}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{mode.label}</div>
                        <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mt-0.5">{mode.desc}</div>
                      </div>

                      {formData.order_type === mode.id && (
                        <div className="absolute top-4 right-4 text-blue-500">
                          <FaCheckCircle size={18} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Content Section (Delivery / Relay / Pickup) */}
                <div className="mt-8 pt-8 border-t border-slate-50">
                  <AnimatePresence mode="wait">
                    {formData.order_type === 'relay_point' ? (
                      <motion.div
                        key="relay"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <RelayPointSelector
                          onStoreSelected={(store, fee) => {
                            setSelectedRelayPoint(store);
                            setRelayPointFee(fee || 0);
                            setFormData(prev => ({
                              ...prev,
                              delivery_fee: fee || 0,
                              address: `Point relais: ${store.name}, ${store.address || ''}, ${store.city || ''}`,
                            }));
                          }}
                          selectedStoreId={selectedRelayPoint?.id}
                          cartTotal={subtotal}
                          cartItems={orderDetails}
                          deliveryModes={deliveryModes}
                        />
                        {selectedRelayPoint && (
                          <div className="mt-6 p-6 bg-green-50 rounded-[1.5rem] border border-green-100 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                              <FaCheckCircle />
                            </div>
                            <div>
                              <p className="font-bold text-green-800 tracking-tight">{selectedRelayPoint.name}</p>
                              <p className="text-sm text-green-600 font-medium">{selectedRelayPoint.address}, {selectedRelayPoint.city}</p>
                              <div className="mt-2 inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-xs font-black text-green-700 border border-green-100">
                                FRAIS: {relayPointFee === 0 ? 'GRATUIT' : `${relayPointFee.toFixed(2)} DT`}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ) : formData.order_type === 'delivery' ? (
                      <motion.div
                        key="delivery"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between gap-4 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <FaMapMarkerAlt className="text-blue-500" />
                            <span className="font-bold text-slate-700 uppercase tracking-wider text-xs">Vérification de position</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {geolocationStatus === 'loading' && (
                              <div className="flex items-center gap-3 text-blue-600 text-sm font-bold">
                                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                <span>Détection...</span>
                              </div>
                            )}
                            {geolocationStatus === 'success' && (
                              <span className="text-green-600 text-sm font-bold flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                                <FaCheckCircle /> Position OK
                              </span>
                            )}
                            {(geolocationStatus === 'error' || geolocationStatus === 'denied') && (
                              <button
                                onClick={handleRetryGeolocation}
                                className="text-orange-600 text-sm font-black flex items-center gap-1 hover:bg-orange-50 px-3 py-1 rounded-full transition-all"
                              >
                                <FaSyncAlt /> RÉESSAYER
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Mode Selector */}
                        {deliveryModes.length > 0 && (
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Vitesse de livraison *</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {deliveryModes.map((mode) => (
                                <button
                                  key={mode.mode_livraison_id}
                                  onClick={() => dispatch(setSelectedMode(mode.mode_livraison_id))}
                                  className={`p-4 rounded-2xl text-left border-2 transition-all font-bold ${selectedMode === mode.mode_livraison_id.toString() || selectedMode === mode.mode_livraison_id
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-50 bg-slate-50 text-slate-500'
                                    }`}
                                >
                                  {mode.nom || mode.mode_livraison_id}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Address Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                          {[
                            { name: 'rue', label: 'Rue & Numéro *', placeholder: 'Ex: 12 Rue des Oliviers' },
                            { name: 'ville', label: 'Ville *', placeholder: 'Ex: Tunis' },
                            { name: 'gouvernorat', label: 'Gouvernorat *', placeholder: 'Ex: Ariana' },
                            { name: 'code_postal', label: 'Code Postal', placeholder: '1000' }
                          ].map((field) => (
                            <div key={field.name} className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 ml-1">{field.label}</label>
                              <input
                                type="text"
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleInputChange}
                                placeholder={field.placeholder}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-medium placeholder:text-slate-300"
                                required={field.name !== 'code_postal'}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Additional info */}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Détails d'accès (Optionnel)</label>
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Étage, code porte, sonnerie, point de repère..."
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-medium min-h-[100px] placeholder:text-slate-300"
                          />
                        </div>

                        {/* Google Map */}
                        <div className="mt-8 rounded-[2rem] overflow-hidden border-4 border-slate-100 shadow-inner relative" style={{ height: '450px' }}>
                          <GoogleMapReact
                            bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY, libraries: ['places'] }}
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
                                className="relative flex flex-col items-center"
                                style={{ transform: 'translate(-50%, -100%)' }}
                              >
                                <div className="absolute -top-16 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl whitespace-nowrap mb-2 flex items-center gap-2 border-2 border-white">
                                  <span>📦 LIVRAISON ICI</span>
                                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-blue-600 absolute -bottom-2 left-1/2 -ml-2"></div>
                                </div>
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-blue-600">
                                  <FaMapMarkerAlt className="text-blue-600 text-xl" />
                                </div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full blur-[2px] mt-2 animate-ping"></div>
                              </div>
                            )}
                          </GoogleMapReact>

                          <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
                            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center justify-between border border-blue-50/50">
                              <div className="flex items-center gap-3">
                                <FaInfoCircle className="text-blue-500" />
                                <span className="text-xs font-bold text-slate-700">Cliquez sur la carte pour ajuster votre position</span>
                              </div>
                            </div>
                          </div>
                        </div>

                      </motion.div>
                    ) : (
                      <motion.div
                        key="pickup"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="text-center py-10 space-y-6"
                      >
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto">
                          <FaStore size={40} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Emaporté en magasin</h3>
                          <p className="text-slate-500 font-medium">Récupérez votre commande directement au point de vente</p>
                        </div>
                        <div className="bg-white px-8 py-3 rounded-full inline-flex items-center gap-2 border-2 border-green-500 text-green-600 font-black">
                          <FaCheckCircle /> FRAIS DE LIVRAISON GRATUIT
                        </div>

                        <div className="max-w-md mx-auto p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left mt-8">
                          <div className="flex items-center gap-3 mb-4">
                            <FaMapMarkerAlt className="text-slate-400" />
                            <span className="font-bold text-slate-800">Point de retrait principal</span>
                          </div>
                          <p className="text-slate-600 font-medium ml-7">Tunis, Tunisie</p>
                          <p className="text-sm text-slate-400 ml-7 mt-1">🕒 Horaires : Lun-Sam 09:00 - 19:00</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* 3. Mode de paiement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <FaCreditCard size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Moyen de paiement</h2>
                    <p className="text-sm text-slate-400 font-medium">Choisissez comment vous souhaitez régler</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'cash', label: 'Paiement à la livraison', icon: <FaMoneyBillWave />, desc: 'Payez en espèces lors de la réception' },
                    { id: 'card', label: 'Carte Bancaire', icon: <FaCreditCard />, desc: 'Paiement sécurisé en ligne' }
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all hover:shadow-md ${formData.payment_method === method.id
                        ? 'border-orange-500 bg-orange-50 font-bold'
                        : 'border-slate-50 bg-slate-50 text-slate-500'
                        }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.id}
                        checked={formData.payment_method === method.id}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-4 ${formData.payment_method === method.id ? 'bg-orange-500 text-white' : 'bg-white text-slate-300 shadow-sm'
                        }`}>
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <div className={`text-lg ${formData.payment_method === method.id ? 'text-slate-900' : 'text-slate-500'}`}>{method.label}</div>
                        <div className="text-xs font-semibold opacity-60 uppercase tracking-wide mt-0.5">{method.desc}</div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.payment_method === method.id ? 'border-orange-500 bg-orange-500' : 'border-slate-200'
                        }`}>
                        {formData.payment_method === method.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sticky Summary Area */}
          <div className="lg:col-span-4 sticky top-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900 text-white rounded-[2.5rem] shadow-2xl shadow-blue-900/20 overflow-hidden"
            >
              <div className="p-8">
                <h3 className="text-2xl font-black mb-8 tracking-tight flex items-center gap-3">
                  <span className="p-2 bg-blue-600 rounded-lg"><FaChevronRight className="animate-pulse" /></span>
                  Résumé
                </h3>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {orderDetails.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm tracking-tight truncate max-w-[150px]">{item.name}</span>
                          <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded-full font-black">X{item.quantity}</span>
                        </div>
                        {item.isPromotion && (
                          <span className="text-[9px] font-black uppercase tracking-tighter text-blue-400">🏷️ EXCLUSIVITÉ WEB</span>
                        )}
                      </div>
                      <div className="text-right">
                        {item.isPromotion && item.Initialprice && (
                          <div className="text-[10px] text-white/30 line-through">{(item.Initialprice * item.quantity).toFixed(2)}</div>
                        )}
                        <span className="font-black text-blue-400">{(item.price * item.quantity).toFixed(2)} <span className="text-[10px]">DT</span></span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 space-y-4 font-bold text-sm">
                  <div className="flex justify-between text-white/50">
                    <span>Sous-total</span>
                    <span className="text-white">{subtotal.toFixed(2)} DT</span>
                  </div>

                  <div className="flex justify-between text-white/50">
                    <span>Livraison</span>
                    <span className={formData.delivery_fee === 0 ? 'text-green-400 font-extrabold' : 'text-white'}>
                      {formData.delivery_fee === 0 ? 'GRATUIT' : `${formData.delivery_fee.toFixed(2)} DT`}
                    </span>
                  </div>

                  {formData.cagnotte_deduction > 0 && (
                    <div className="flex justify-between text-blue-400 bg-blue-400/10 p-4 rounded-2xl border border-blue-400/20">
                      <div className="flex items-center gap-2">
                        <FaWallet />
                        <span>Réduction Cagnotte</span>
                      </div>
                      <span className="font-black">-{parseFloat(formData.cagnotte_deduction).toFixed(2)} DT</span>
                    </div>
                  )}

                  <div className="pt-6 mt-6 border-t-[3px] border-white/5 border-dashed">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black text-white/40 tracking-widest">Total à régler</span>
                        <span className="text-3xl font-black text-white tracking-tighter">{totalAmount.toFixed(2)} <span className="text-lg">DT</span></span>
                      </div>
                      <div className="text-7xl opacity-5 -mr-4">🛒</div>
                    </div>
                  </div>
                </div>

                {/* Submit Button inside Summary */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !tokenValid || (formData.order_type === 'delivery' && geolocationStatus === 'loading')}
                  className={`w-full mt-8 py-5 rounded-3xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${isSubmitting || !tokenValid || (formData.order_type === 'delivery' && geolocationStatus === 'loading')
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white shadow-blue-900/40'
                    }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span className="uppercase tracking-widest">Traitement...</span>
                    </div>
                  ) : formData.order_type === 'delivery' && geolocationStatus === 'loading' ? (
                    '⏳ LOCALISATION...'
                  ) : (
                    <>
                      <FaCheckCircle />
                      <span className="uppercase tracking-widest">Confirmer</span>
                    </>
                  )}
                </button>

                {formData.order_type === 'delivery' && geolocationStatus === 'loading' && (
                  <p className="text-center text-[10px] font-bold text-orange-400 mt-4 uppercase tracking-tighter">
                    ⚠️ Validation de position requise
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modern Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Confirmation de commande"
        className="outline-none"
        overlayClassName="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[3rem] p-8 sm:p-12 w-full max-w-xl text-center shadow-2xl relative overflow-hidden"
        >
          {/* Confetti effect placeholder */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500"></div>

          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-8 shadow-inner">
            <FaCheckCircle size={50} />
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Commande confirmée ! 🥳</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Votre commande a été enregistrée avec succès. <br />
            Un email de confirmation vous a été envoyé.
          </p>

          <div className="bg-slate-50 rounded-[2rem] p-8 mb-8 space-y-4 text-left border border-slate-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-bold uppercase tracking-widest">Paiement</span>
              <span className="text-slate-900 font-black">
                {formData.payment_method === "cash" ? "💰 Espèces" : "💳 Carte Bancaire"}
              </span>
            </div>
            {formData.cagnotte_deduction > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Cagnotte</span>
                <span className="text-blue-600 font-black">-{formData.cagnotte_deduction.toFixed(2)} DT</span>
              </div>
            )}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-slate-900 font-black text-lg">Montant total</span>
              <span className="text-blue-600 font-black text-2xl tracking-tighter">{totalAmount.toFixed(2)} DT</span>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl font-black text-lg transition-all shadow-xl shadow-slate-200"
          >
            VOIR MES COMMANDES
          </button>
        </motion.div>
      </Modal>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmation;