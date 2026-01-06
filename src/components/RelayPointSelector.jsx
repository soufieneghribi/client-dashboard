import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStores, selectAllStores, selectStoresLoading, selectStore } from '../store/slices/stores';
import axios from 'axios';
import { API_ENDPOINTS, getAuthHeaders } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaStore, FaClock, FaCheck, FaTruck } from 'react-icons/fa';

/**
 * RelayPointSelector - Component for selecting a relay point/store
 * Displays list of stores with calculated delivery fees
 */
const RelayPointSelector = ({ onStoreSelected, selectedStoreId, cartTotal, cartItems, deliveryModes }) => {
    const dispatch = useDispatch();
    const stores = useSelector(selectAllStores);
    const loading = useSelector(selectStoresLoading);

    const [selectedId, setSelectedId] = useState(selectedStoreId);
    const [storeFees, setStoreFees] = useState({});
    const [loadingFees, setLoadingFees] = useState({});
    const [authError, setAuthError] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch stores on mount
    useEffect(() => {
        dispatch(fetchStores());
    }, [dispatch]);

    // Filter stores based on search
    const filteredStores = stores.filter(store =>
        store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate fees for a specific store
    const calculateFeeForStore = async (store) => {
        console.log("🧮 calculateFeeForStore called for:", store.name);
        console.log("   cartTotal:", cartTotal);
        console.log("   cartItems:", cartItems);
        console.log("   deliveryModes:", deliveryModes);

        if (!cartTotal || !cartItems || cartItems.length === 0 || !deliveryModes) {
            console.warn("⚠️ Missing required data for fee calculation:", {
                hasCartTotal: !!cartTotal,
                hasCartItems: !!cartItems,
                cartItemsLength: cartItems?.length,
                hasDeliveryModes: !!deliveryModes
            });
            return;
        }

        // Find Point Relais mode ID
        const relayMode = deliveryModes?.find(m =>
            m.code === 'POINT_RELAIS' ||
            ['point relais', 'point-relais', 'relais'].includes(m.nom?.toLowerCase())
        );

        const modeId = relayMode ? relayMode.mode_livraison_id : 'POINT_RELAIS';
        console.log("   Using mode ID:", modeId);

        setLoadingFees(prev => ({ ...prev, [store.id]: true }));

        const fetchFee = async (useStoreId) => {
            console.log(`📡 Fetching Fee (Use Store ID: ${useStoreId})...`);
            const deliveryAddress = {
                ville: store.city || '',
                gouvernorat: store.gouvernorat || '',
                latitude: !isNaN(parseFloat(store.latitude)) ? parseFloat(store.latitude) : null,
                longitude: !isNaN(parseFloat(store.longitude)) ? parseFloat(store.longitude) : null,
            };

            const params = {
                delivery_address: deliveryAddress,
                cart_total: cartTotal,
                mode_livraison_id: modeId,
                store_id: useStoreId ? store.id : null,
                total_weight: 0.0,
                cart_items: cartItems.map(item => ({
                    article_id: parseInt(item.id || item.article_id),
                    quantity: parseInt(item.quantity)
                }))
            };

            console.log("📤 Params:", params);

            const response = await axios.post(
                API_ENDPOINTS.DELIVERY.CALCULATE_FEE,
                params,
                { headers: getAuthHeaders() }
            );
            return response.data;
        };

        try {
            // Try with specific store ID first
            let data;
            try {
                data = await fetchFee(true);
            } catch (error) {
                console.warn(`⚠️ Fee Calcluation Error (Specific Store): ${error.response?.status}`);
                // If specific calculation fails (e.g., 400 Bad Request due to missing zone rule),
                // fallback to default calculation (store_id: null)
                if (error.response?.status === 400 || error.response?.status === 422) {
                    console.log("🔄 Retrying with Store ID: NULL...");
                    data = await fetchFee(false);
                } else {
                    throw error;
                }
            }

            const fee = data.frais_livraison !== undefined
                ? data.frais_livraison
                : (data.delivery_fee !== undefined ? data.delivery_fee : null);

            setStoreFees(prev => ({
                ...prev,
                [store.id]: fee
            }));
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                setAuthError(true);
            }
            setStoreFees(prev => ({
                ...prev,
                [store.id]: null
            }));
        } finally {
            setLoadingFees(prev => ({ ...prev, [store.id]: false }));
        }
    };

    // Calculate fees for all stores
    useEffect(() => {
        if (authError) return;

        if (stores.length > 0 && deliveryModes && deliveryModes.length > 0 && cartTotal > 0) {
            stores.forEach(store => {
                if (storeFees[store.id] === undefined && !loadingFees[store.id]) {
                    calculateFeeForStore(store);
                }
            });
        }
    }, [stores, deliveryModes, cartTotal, cartItems, authError]);

    const handleStoreSelect = (store) => {
        setSelectedId(store.id);
        dispatch(selectStore(store));
        const fee = storeFees[store.id] || 0;
        onStoreSelected(store, fee);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Chargement des points relais...</p>
            </div>
        );
    }

    if (stores.length === 0) {
        return (
            <div className="bg-slate-50 rounded-[2rem] p-10 text-center border-2 border-dashed border-slate-200">
                <div className="text-4xl mb-4 opacity-20">📍</div>
                <p className="text-slate-500 font-bold uppercase tracking-tight">Aucun point relais disponible</p>
                <p className="text-slate-400 text-xs mt-1">Revenez plus tard.</p>
            </div>
        );
    }

    if (authError) {
        return (
            <div className="bg-orange-50 rounded-[2rem] p-10 text-center border-2 border-orange-200">
                <div className="text-4xl mb-4">⚠️</div>
                <p className="text-orange-700 font-bold uppercase tracking-tight">Session expirée</p>
                <p className="text-orange-500 text-xs mt-1">Veuillez vous reconnecter.</p>
            </div>
        );
    }


    return (
        <div className="mt-3 bg-blue-50 rounded-2xl border-2 border-blue-200 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3">
                <FaMapMarkerAlt className="text-blue-600 text-lg" />
                <h3 className="text-sm font-bold text-blue-800">
                    Sélectionnez un point de relai
                </h3>
            </div>

            <div className="h-px bg-blue-200"></div>

            {/* Search Bar */}
            <div className="px-4 pt-4 pb-2">
                <input
                    type="text"
                    placeholder="Rechercher un point relais (ville, nom...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-blue-100 text-sm font-medium focus:ring-2 focus:ring-blue-300 focus:border-blue-300 placeholder:text-slate-400 transition-all"
                />
            </div>

            {/* Store List */}
            <div className="px-2 pb-2">
                <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                    <AnimatePresence>
                        {filteredStores.map((store, index) => {
                            const isSelected = selectedId === store.id;
                            const isLoadingFee = loadingFees[store.id];
                            const fee = storeFees[store.id];
                            const isFree = fee !== undefined && fee === 0;

                            return (
                                <React.Fragment key={store.id}>
                                    {index > 0 && <div className="h-px bg-blue-100 mx-2"></div>}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => handleStoreSelect(store)}
                                        className={`cursor-pointer transition-all ${isSelected ? 'bg-blue-100' : 'bg-transparent hover:bg-white'
                                            }`}
                                    >
                                        <div className="px-3 py-3 flex items-center gap-3">
                                            {/* Store Icon */}
                                            <div
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isSelected
                                                        ? 'bg-blue-600 bg-opacity-20'
                                                        : 'bg-slate-200'
                                                    }`}
                                            >
                                                <FaStore
                                                    className={`text-lg ${isSelected ? 'text-blue-600' : 'text-slate-600'
                                                        }`}
                                                />
                                            </div>

                                            {/* Store Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">
                                                    {store.name}
                                                </p>
                                                {(store.address || store.city) && (
                                                    <p className="text-xs text-slate-600 truncate mt-0.5">
                                                        {[store.address, store.city].filter(Boolean).join(', ')}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Price Tag */}
                                            <div className="flex items-center gap-2">
                                                {isLoadingFee ? (
                                                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                                ) : fee !== undefined && fee !== null ? (
                                                    <div
                                                        className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${isFree
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-orange-100 text-orange-700'
                                                            }`}
                                                    >
                                                        {isFree ? 'Gratuit' : `${Number(fee).toFixed(2)} DT`}
                                                    </div>
                                                ) : null}

                                                {/* Selection Indicator */}
                                                <div
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${isSelected
                                                            ? 'bg-blue-600 border-blue-600'
                                                            : 'border-slate-400'
                                                        }`}
                                                >
                                                    {isSelected && (
                                                        <FaCheck className="text-white text-[10px]" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </React.Fragment>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default RelayPointSelector;
