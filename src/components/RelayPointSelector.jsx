import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStores, selectAllStores, selectStoresLoading, selectStore } from '../store/slices/stores';

import axios from 'axios';
import { API_ENDPOINTS, getAuthHeaders } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaStore, FaClock, FaCheck, FaTruck } from 'react-icons/fa';

/**
 * RelayPointSelector - Component for selecting a relay point/store
 * Displays list of stores with calculated delivery fees
 * Matches mobile app functionality
 */
const RelayPointSelector = ({ onStoreSelected, selectedStoreId, cartTotal, cartItems, deliveryModes }) => {
    const dispatch = useDispatch();
    const stores = useSelector(selectAllStores);
    const loading = useSelector(selectStoresLoading);

    const [selectedId, setSelectedId] = useState(selectedStoreId);
    const [storeFees, setStoreFees] = useState({});
    const [loadingFees, setLoadingFees] = useState({});

    // Fetch stores on mount
    useEffect(() => {
        dispatch(fetchStores());
    }, [dispatch]);

    // Calculate fees for all stores when they load or dependencies change
    useEffect(() => {
        if (stores.length > 0 && deliveryModes && deliveryModes.length > 0 && cartTotal > 0) {
            stores.forEach(store => {
                calculateFeeForStore(store);
            });
        }
    }, [stores, deliveryModes, cartTotal, cartItems]);

    const calculateFeeForStore = async (store) => {
        if (!cartTotal || !cartItems || cartItems.length === 0) return;

        console.log("🔍 Modes disponibles:", deliveryModes);
        // Find Point Relais mode ID
        // Important: Mobile app uses 'POINT_RELAIS' as a fallback code
        const relayMode = deliveryModes?.find(m =>
            m.code === 'POINT_RELAIS' ||
            ['point relais', 'point-relais', 'relais'].includes(m.nom?.toLowerCase())
        );

        const modeId = relayMode ? relayMode.mode_livraison_id : 'POINT_RELAIS';

        setLoadingFees(prev => ({ ...prev, [store.id]: true }));

        try {
            const deliveryAddress = {
                ville: store.city || '',
                gouvernorat: store.gouvernorat || '',
                latitude: store.latitude,
                longitude: store.longitude,
            };

            const params = {
                delivery_address: deliveryAddress,
                cart_total: cartTotal,
                mode_livraison_id: modeId,
                // ⭐ CRITIQUE: store_id: null pour forcer l'entrepôt comme origine (comme sur mobile)
                store_id: null,
                total_weight: 0.0,
                cart_items: cartItems.map(item => ({
                    article_id: parseInt(item.id || item.article_id),
                    quantity: parseInt(item.quantity)
                }))
            };

            const response = await axios.post(
                API_ENDPOINTS.DELIVERY.CALCULATE_FEE,
                params,
                { headers: getAuthHeaders() }
            );

            // ⭐ CORRECT FONCTIONNEMENT: Utiliser 'frais_livraison' comme sur le modèle mobile
            const fee = response.data.frais_livraison !== undefined
                ? response.data.frais_livraison
                : (response.data.delivery_fee !== undefined ? response.data.delivery_fee : null);

            setStoreFees(prev => ({
                ...prev,
                [store.id]: fee
            }));
        } catch (error) {
            console.error(`Error calculating fee for store ${store.id}:`, error);
            // Si erreur, on ne met pas 0 par défaut pour éviter l'erreur de mismatch côté serveur
            setStoreFees(prev => ({
                ...prev,
                [store.id]: null
            }));
        } finally {
            setLoadingFees(prev => ({ ...prev, [store.id]: false }));
        }
    };

    const handleStoreSelect = (store) => {
        setSelectedId(store.id);
        dispatch(selectStore(store));
        const fee = storeFees[store.id] || 0;
        onStoreSelected(store, fee);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Chargement des points relais...</p>
            </div>
        );
    }

    if (stores.length === 0) {
        return (
            <div className="bg-slate-50 rounded-[2rem] p-10 text-center border-2 border-dashed border-slate-200">
                <div className="text-4xl mb-4 opacity-20">📍</div>
                <p className="text-slate-500 font-bold uppercase tracking-tight">Aucun point relais disponible</p>
                <p className="text-slate-400 text-xs mt-1">Revenez plus tard ou choisissez un autre mode.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <FaTruck size={14} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Points de retrait disponibles</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sélectionnez le point le plus proche</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
                <AnimatePresence>
                    {stores.map((store, index) => {
                        const isSelected = selectedId === store.id;
                        const isLoadingFee = loadingFees[store.id];
                        const fee = storeFees[store.id];
                        const isFree = fee !== undefined && fee === 0;

                        return (
                            <motion.div
                                key={store.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleStoreSelect(store)}
                                className={`relative group p-5 rounded-[1.75rem] cursor-pointer transition-all border-2 overflow-hidden ${isSelected
                                    ? 'border-blue-500 bg-white shadow-xl shadow-blue-900/5 ring-4 ring-blue-50'
                                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    {/* Store Icon */}
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-white shadow-sm'
                                        }`}>
                                        <FaStore />
                                    </div>

                                    {/* Store Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={`font-black tracking-tight truncate ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                                {store.name}
                                            </p>
                                            {isSelected && (
                                                <span className="bg-blue-600 text-[8px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-widest leading-normal">Sélectionné</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <FaMapMarkerAlt className="text-slate-300 text-[10px]" />
                                            <p className="text-[11px] text-slate-400 font-medium truncate uppercase tracking-tighter">
                                                {[store.address, store.city].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price / Status */}
                                    <div className="flex flex-col items-end gap-2">
                                        {isLoadingFee ? (
                                            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                        ) : (fee !== undefined && fee !== null) ? (
                                            <div className={`px-4 py-1.5 rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-sm border ${isFree
                                                ? 'bg-green-50 text-green-600 border-green-100'
                                                : 'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                {isFree ? 'Gratuit' : `${Number(fee).toFixed(2)} DT`}
                                            </div>
                                        ) : (
                                            <div className="text-[10px] text-slate-300 font-bold italic">Frais non disp.</div>
                                        )}

                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/30' : 'border-slate-200 bg-white'
                                            }`}>
                                            {isSelected && <FaCheck className="text-white text-[10px]" />}
                                        </div>
                                    </div>
                                </div>

                                {isSelected && (
                                    <motion.div
                                        layoutId="selection-glow"
                                        className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full"
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default RelayPointSelector;
