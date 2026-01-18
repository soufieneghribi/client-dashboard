import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from 'react-toastify';

import { useSelector, useDispatch } from "react-redux";
import axios from 'axios';
import { fetchUserProfile, updateUserLocal } from "../../store/slices/user";
import { logout, refreshAuth } from "../../store/slices/authSlice";
import {
    fetchAvailableModes,
    calculateDeliveryFee,
    setSelectedMode,
    selectDeliveryModes,
    selectSelectedMode,
    selectCalculatedFee,
    selectDeliveryCalculating,
} from "../../store/slices/delivery";
import store from "../../store";
import { API_BASE_URL } from "../../services/api";
import { motion } from "framer-motion";
import { FaBoxOpen } from "react-icons/fa";

// Sub-components
import PersonalInfoSection from './components/PersonalInfoSection';
import DeliveryModeSection from './components/DeliveryModeSection';
import PaymentMethodSection from './components/PaymentMethodSection';
import OrderSummarySection from './components/OrderSummarySection';
import SuccessModal from './components/SuccessModal';

// Styles
import './OrderConfirmation.css';

// Constants
const GOOGLE_MAPS_API_KEY = "AIzaSyAFwGAsC3VUZYdxkEwB43DEf5tpSx4hAZg";
const DEFAULT_LOCATION = { lat: 36.8065, lng: 10.1815 };
const PICKUP_DELIVERY_FEE = 0;

// Helper Functions
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
        const response = await axios.get(`${API_BASE_URL}/customer/info1`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });
        return { isValid: !!response.data, user: response.data || null };
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

        if (data.status === 'OK' && data.results?.[0]) {
            const result = data.results[0];
            const components = result.address_components;
            const structured = { full_address: result.formatted_address, rue: "", ville: "", gouvernorat: "", code_postal: "" };

            components.forEach(comp => {
                const types = comp.types;
                if (types.includes("route") || types.includes("street_number")) structured.rue += (structured.rue ? " " : "") + comp.long_name;
                if (types.includes("locality") || types.includes("administrative_area_level_2")) structured.ville = comp.long_name;
                if (types.includes("administrative_area_level_1")) structured.gouvernorat = comp.long_name;
                if (types.includes("postal_code")) structured.code_postal = comp.long_name;
            });
            return structured;
        }
        return null;
    } catch (error) {

        return null;
    }
};

const validateCoordinates = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) return false;
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return false;
    return !(latitude === 0 && longitude === 0);
};

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
        deliveryFee: 0,
        cagnotteDeduction: 0
    };

    const initialOrderType = (parseFloat(receivedDeliveryFee) === 0 || receivedDeliveryFee === 0) ? "pickup" : "delivery";

    const deliveryModes = useSelector(selectDeliveryModes);
    const selectedMode = useSelector(selectSelectedMode);
    const calculatedFee = useSelector(selectCalculatedFee);
    const isCalculatingFee = useSelector(selectDeliveryCalculating);

    const [formData, setFormData] = useState({
        contact_person_name: "",
        contact_person_number: "",
        rue: "",
        ville: "",
        gouvernorat: "",
        code_postal: "",
        address: "",
        longitude: "",
        latitude: "",
        cart: orderDetails,
        order_type: initialOrderType,
        payment_method: "cash",
        delivery_fee: parseFloat(receivedDeliveryFee) || 0,
        cagnotte_deduction: parseFloat(receivedCagnotteDeduction) || 0,
    });

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [geolocationStatus, setGeolocationStatus] = useState('idle');
    const [manualLocation, setManualLocation] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    // Restored States for Delivery Modes
    const [selectedPickupStore, setSelectedPickupStore] = useState(null);
    const [selectedRelayPoint, setSelectedRelayPoint] = useState(null);
    const [pickupStoreFee, setPickupStoreFee] = useState(0);
    const [relayPointFee, setRelayPointFee] = useState(0);

    useEffect(() => {
        if (authChecked && tokenValid) return;
        const checkAuthentication = async () => {
            const token = getAuthToken();
            if (!token) {

                navigate("/login");
                return;
            }
            if (auth.isLoggedIn && auth.user && !authChecked) {
                setTokenValid(true);
                setAuthChecked(true);
                return;
            }
            try {
                const { isValid } = await testTokenValidity(token);
                setTokenValid(isValid);
                if (!isValid) {

                    dispatch(logout());
                    navigate("/login");
                    return;
                }
                if (!auth.isLoggedIn) dispatch(refreshAuth());
                if (!Userprofile) await dispatch(fetchUserProfile()).unwrap();
                setAuthChecked(true);
            } catch (error) {
                setAuthChecked(true);
            }
        };
        const timer = setTimeout(checkAuthentication, 100);
        return () => clearTimeout(timer);
    }, [auth.isLoggedIn, authChecked, tokenValid, navigate, dispatch, Userprofile]);

    useEffect(() => {
        if (!orderDetails || orderDetails.length === 0) {

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
        if (authChecked) dispatch(fetchAvailableModes());
    }, [authChecked, dispatch]);

    useEffect(() => {
        const shouldCalculateFee =
            (formData.order_type === 'delivery' && selectedMode && (
                (formData.rue && formData.ville && formData.gouvernorat) ||
                (validateCoordinates(formData.latitude, formData.longitude))
            ));

        if (shouldCalculateFee && orderDetails.length > 0) {
            const cartTotal = orderDetails.reduce((total, item) => total + (parseFloat(item.price) * parseInt(item.quantity)), 0);
            let deliveryAddress = {};
            let modeId = selectedMode;
            let storeId = null;

            if (formData.order_type === 'delivery') {
                deliveryAddress = {
                    rue: formData.rue,
                    ville: formData.ville,
                    gouvernorat: formData.gouvernorat,
                    code_postal: formData.code_postal || "",
                    latitude: !isNaN(parseFloat(formData.latitude)) ? parseFloat(formData.latitude) : null,
                    longitude: !isNaN(parseFloat(formData.longitude)) ? parseFloat(formData.longitude) : null,
                };
            }

            dispatch(calculateDeliveryFee({
                delivery_address: deliveryAddress,
                cart_total: cartTotal,
                mode_livraison_id: modeId,
                store_id: storeId,
                cart_items: orderDetails.map(item => ({ article_id: parseInt(item.id), quantity: parseInt(item.quantity) })),
            }));
        }
    }, [formData, selectedMode, orderDetails, dispatch, deliveryModes]);

    useEffect(() => {
        if (calculatedFee !== null && formData.order_type === 'delivery') {
            setFormData(prev => ({ ...prev, delivery_fee: calculatedFee }));
        } else if (formData.order_type === 'pickup' || formData.order_type === 'store_pickup') {
            setFormData(prev => ({ ...prev, delivery_fee: PICKUP_DELIVERY_FEE }));
        }
        // For relay_point, delivery_fee is set manually when a relay point is selected
        // in DeliveryModeSection, so we don't override it here
    }, [calculatedFee, formData.order_type]);

    useEffect(() => {
        if (!authChecked || formData.order_type !== 'delivery') {
            if (formData.order_type !== 'delivery') setGeolocationStatus('not_needed');
            return;
        }

        const getGeolocation = () => {
            if (!navigator.geolocation) {
                setGeolocationStatus('error');

                setDefaultLocation();
                return;
            }

            setGeolocationStatus('loading');
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    if (!validateCoordinates(latitude, longitude)) {
                        setGeolocationStatus('error');
                        setDefaultLocation();
                        return;
                    }

                    const structuredAddress = await getAddressFromCoordinates(latitude, longitude);
                    setFormData(prev => ({
                        ...prev,
                        latitude: latitude.toFixed(6),
                        longitude: longitude.toFixed(6),
                        rue: structuredAddress?.rue || prev.rue,
                        ville: structuredAddress?.ville || prev.ville,
                        gouvernorat: structuredAddress?.gouvernorat || prev.gouvernorat,
                        code_postal: structuredAddress?.code_postal || prev.code_postal,
                        address: structuredAddress?.full_address || prev.address,
                    }));
                    setGeolocationStatus('success');
                    setManualLocation(false);

                },
                () => {
                    setGeolocationStatus('error');
                    setDefaultLocation();

                },
                { timeout: 5000, enableHighAccuracy: false, maximumAge: 30000 }
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
            setFormData(prev => ({
                ...prev,
                [name]: value,
                ...((value === 'pickup' || value === 'store_pickup') && { delivery_fee: PICKUP_DELIVERY_FEE })
            }));
            if (value === 'delivery' && geolocationStatus !== 'success') setRetryCount(prev => prev + 1);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleMapClick = async ({ lat, lng }) => {
        if (formData.order_type !== 'delivery') return;
        if (!validateCoordinates(lat, lng)) return;

        setGeolocationStatus('loading');
        const structuredAddress = await getAddressFromCoordinates(lat, lng);
        setFormData(prev => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
            rue: structuredAddress?.rue || prev.rue,
            ville: structuredAddress?.ville || prev.ville,
            gouvernorat: structuredAddress?.gouvernorat || prev.gouvernorat,
            code_postal: structuredAddress?.code_postal || prev.code_postal,
            address: structuredAddress?.full_address || prev.address,
        }));
        setGeolocationStatus('success');
        setManualLocation(true);

    };

    const calculateOrderAmount = () => {
        const sub = orderDetails.reduce((t, i) => t + (parseFloat(i.price) * parseInt(i.quantity)), 0);
        const fee = parseFloat(formData.delivery_fee) || 0;

        // Sécurité Web: La déduction ne peut pas dépasser le solde réel actuel du profil
        const currentBalance = parseFloat(Userprofile?.cagnotte_balance) || 0;
        const ded = Math.min(parseFloat(formData.cagnotte_deduction) || 0, currentBalance);

        const total = Math.max(0, parseFloat((sub + fee - ded).toFixed(2)));

        return total;
    };

    const prepareOrder = async (orderData) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/customer/order/prepare`,
                orderData,
                {
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            if (response.status === 200 && response.data.success) {
                const data = response.data.data;
                return data;
            }

            throw new Error('Prepare order failed');
        } catch (error) {
            console.error("❌ Prepare Order Failed:", error.response?.status, error.response?.data);
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const { contact_person_name, contact_person_number, payment_method, latitude, longitude } = formData;

        if (!contact_person_name?.trim() || !contact_person_number?.trim() || !payment_method) {
            toast.error("Veuillez remplir tous les champs obligatoires (nom, téléphone, méthode de paiement)");
            setIsSubmitting(false);
            return;
        }

        if (formData.order_type === 'delivery') {
            if (geolocationStatus === 'loading') {
                toast.info("Veuillez patienter, localisation en cours...");
                setIsSubmitting(false);
                return;
            }
            if (!formData.rue?.trim() || !formData.ville?.trim() || !formData.gouvernorat?.trim() || !selectedMode) {
                toast.error("Veuillez remplir l'adresse complète et choisir un mode de livraison");
                setIsSubmitting(false);
                return;
            }
        } else if (formData.order_type === 'relay_point') {
            if (!selectedRelayPoint) {
                toast.error("Veuillez sélectionner un point relais");
                setIsSubmitting(false);
                return;
            }
        } else if (formData.order_type === 'pickup' || formData.order_type === 'store_pickup') {
            if (!selectedPickupStore) {
                toast.error("Veuillez sélectionner un magasin pour le retrait");
                setIsSubmitting(false);
                return;
            }
        }

        const auth_token = getAuthToken();
        if (!auth_token) {
            toast.warning("Votre session a expiré. Veuillez vous reconnecter.");
            navigate("/login");
            setIsSubmitting(false);
            return;
        }

        const amount = calculateOrderAmount();
        const orderData = {
            order_amount: amount,
            cagnotte_deduction: Math.min(parseFloat(formData.cagnotte_deduction) || 0, parseFloat(Userprofile?.cagnotte_balance) || 0),
            delivery_fee: parseFloat(formData.delivery_fee) || 0,
            contact_person_name: contact_person_name.trim(),
            contact_person_number: contact_person_number.trim(),
            order_type: formData.order_type || "delivery",
            payment_method: formData.payment_method || "cash",
            mode_livraison_id: selectedMode,
            ...(formData.ville?.trim() && { city: formData.ville.trim() }),
            ...(formData.gouvernorat?.trim() && { gouvernorat: formData.gouvernorat.trim(), state: formData.gouvernorat.trim() }),
            ...(formData.code_postal?.trim() && { postal_code: formData.code_postal.trim() }),
            cart: formData.cart.map(item => ({
                id: parseInt(item.id),
                quantity: parseInt(item.quantity),
                price: parseFloat(item.price || 0),
                ...(item.isPromotion && item.promo_id && { promo_id: parseInt(item.promo_id) })
            }))
        };

        if (formData.order_type === 'delivery') {
            orderData.address = [formData.rue, formData.ville, formData.gouvernorat, formData.code_postal, formData.address].filter(Boolean).join(', ');
            if (latitude && longitude && validateCoordinates(latitude, longitude)) {
                orderData.latitude = parseFloat(latitude);
                orderData.longitude = parseFloat(longitude);
            }
        } else if (formData.order_type === 'relay_point') {
            if (selectedRelayPoint) {
                orderData.address = `Point Relais: ${selectedRelayPoint.name}, ${selectedRelayPoint.address || ''}, ${selectedRelayPoint.city || ''}`;
                orderData.store_id = selectedRelayPoint.id;
                // Ensure the correct mode ID is sent if available
                if (selectedMode) orderData.mode_livraison_id = selectedMode;
            } else {
                orderData.address = 'Point Relais';
            }
        } else {
            // Pickup / Store Pickup
            if (selectedPickupStore) {
                orderData.address = `Retrait Magasin: ${selectedPickupStore.name}`;
                orderData.store_id = selectedPickupStore.id;
            } else {
                orderData.address = 'Emporté en magasin';
            }
        }

        try {
            // -----------------------------------------------------------------------
            // STEP 1: PREPARE ORDER (Server-Side Calculation)
            // -----------------------------------------------------------------------
            const preparedData = await prepareOrder(orderData);

            // -----------------------------------------------------------------------
            // STEP 2: Update order data with backend-calculated values
            // -----------------------------------------------------------------------
            const finalOrderData = {
                ...orderData,
                order_amount: preparedData.total_amount,
                delivery_fee: preparedData.delivery_fee,
                cagnotte_deduction: preparedData.cagnotte_deduction || 0
            };

            // -----------------------------------------------------------------------
            // STEP 3: PLACE ORDER (With Verified Values)
            // -----------------------------------------------------------------------
            const response = await axios.post(`${API_BASE_URL}/customer/order/place`, finalOrderData, {
                headers: { 'Authorization': `Bearer ${auth_token}`, 'Content-Type': 'application/json' },
                timeout: 30000
            });

            if (response.status === 200 || response.status === 201) {
                toast.success("Commande passée avec succès !");

                // Mettre à jour le solde dans l'interface immédiatement (Web-only fix)
                const currentBalance = parseFloat(Userprofile?.cagnotte_balance) || 0;
                const deduction = parseFloat(formData.cagnotte_deduction) || 0;
                dispatch(updateUserLocal({ cagnotte_balance: Math.max(0, currentBalance - deduction) }));

                setModalIsOpen(true);
                // Clear cart from both localStorage and cookies after successful order
                localStorage.removeItem("cart");
                localStorage.removeItem('cagnotte_amount');
                localStorage.removeItem('use_cagnotte');
                Cookies.remove("cart");
            }
        } catch (error) {
            console.error("❌ Order Submission Failed:", error.response?.status, error.response?.data);

            // Show user-friendly error message
            if (error.response?.data?.error) {
                toast.error(`Erreur: ${error.response.data.error}`);
            } else if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error("Session expirée. Veuillez vous reconnecter.");
                navigate("/login");
            } else {
                toast.error("Une erreur est survenue lors de la commande. Veuillez réessayer.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!authChecked) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-12 pb-24">
            <div className="max-w-6xl mx-auto px-6">
                <div className="mb-12 flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-[#2D2D5F] tracking-tight">Finaliser la commande</h1>
                        <p className="mt-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest pl-1">Vérifiez vos informations avant de confirmer</p>
                    </div>
                    <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-white rounded-[1.5rem] shadow-sm border border-slate-100/50">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                            <FaBoxOpen size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Panier</span>
                            <span className="text-sm font-black text-[#2D2D5F]">{orderDetails.length} articles</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">
                        <PersonalInfoSection formData={formData} handleInputChange={handleInputChange} />

                        <DeliveryModeSection
                            formData={formData}
                            handleInputChange={handleInputChange}
                            deliveryModes={deliveryModes}
                            selectedMode={selectedMode}
                            setSelectedMode={(id) => dispatch(setSelectedMode(id))}
                            subtotal={subtotal}
                            orderDetails={orderDetails}
                            setFormData={setFormData}
                            geolocationStatus={geolocationStatus}
                            handleRetryGeolocation={() => setRetryCount(prev => prev + 1)}
                            handleMapClick={handleMapClick}
                            GOOGLE_MAPS_API_KEY={GOOGLE_MAPS_API_KEY}
                            DEFAULT_LOCATION={DEFAULT_LOCATION}
                            selectedRelayPoint={selectedRelayPoint}
                            setSelectedRelayPoint={setSelectedRelayPoint}
                            relayPointFee={relayPointFee}
                            setRelayPointFee={setRelayPointFee}
                            selectedPickupStore={selectedPickupStore}
                            setSelectedPickupStore={setSelectedPickupStore}
                            setPickupStoreFee={setPickupStoreFee}
                        />

                        <PaymentMethodSection formData={formData} handleInputChange={handleInputChange} />
                    </div>

                    <OrderSummarySection
                        orderDetails={orderDetails}
                        subtotal={subtotal}
                        formData={formData}
                        isCalculatingFee={isCalculatingFee}
                        totalAmount={calculateOrderAmount()}
                        handleSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        tokenValid={tokenValid}
                        geolocationStatus={geolocationStatus}
                    />
                </div>
            </div>

            <SuccessModal
                isOpen={modalIsOpen}
                closeModal={() => { setModalIsOpen(false); navigate("/Mes-Commandes", { replace: true }); }}
                formData={formData}
                totalAmount={calculateOrderAmount()}
            />
        </div >
    );
};

export default OrderConfirmation;
