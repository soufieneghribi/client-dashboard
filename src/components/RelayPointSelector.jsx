import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStores, selectAllStores, selectStoresLoading, selectStore } from '../store/slices/stores';
import axios from 'axios';
import { API_ENDPOINTS, getAuthHeaders } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaStore, FaCheck, FaSearch, FaInfoCircle } from 'react-icons/fa';

const RelayPointSelector = ({ onStoreSelected, selectedStoreId, cartTotal, cartItems, deliveryModes }) => {
    const dispatch = useDispatch();
    const stores = useSelector(selectAllStores);
    const loading = useSelector(selectStoresLoading);

    const [selectedId, setSelectedId] = useState(selectedStoreId);
    const [storeFees, setStoreFees] = useState({});
    const [loadingFees, setLoadingFees] = useState({});
    const [authError, setAuthError] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        dispatch(fetchStores());
    }, [dispatch]);

    const filteredStores = stores.filter(store =>
        store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const calculateFeeForStore = async (store) => {
        if (!cartTotal || !cartItems || cartItems.length === 0 || !deliveryModes) return;

        const relayMode = deliveryModes?.find(m =>
            m.code === 'POINT_RELAIS' ||
            ['point relais', 'point-relais', 'relais'].includes(m.nom?.toLowerCase())
        );

        const modeId = relayMode ? relayMode.mode_livraison_id : 'POINT_RELAIS';
        setLoadingFees(prev => ({ ...prev, [store.id]: true }));

        const fetchFee = async (useStoreId) => {
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

            const response = await axios.post(
                API_ENDPOINTS.DELIVERY.CALCULATE_FEE,
                params,
                { headers: getAuthHeaders() }
            );
            return response.data;
        };

        try {
            let data;
            try {
                data = await fetchFee(true);
            } catch (error) {
                if (error.response?.status === 400 || error.response?.status === 422) {
                    data = await fetchFee(false);
                } else {
                    throw error;
                }
            }

            const fee = data.frais_livraison !== undefined
                ? data.frais_livraison
                : (data.delivery_fee !== undefined ? data.delivery_fee : null);

            setStoreFees(prev => ({ ...prev, [store.id]: fee }));
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                setAuthError(true);
            }
            setStoreFees(prev => ({ ...prev, [store.id]: null }));
        } finally {
            setLoadingFees(prev => ({ ...prev, [store.id]: false }));
        }
    };

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
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recherche des points relais...</p>
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100/50">
                        <FaMapMarkerAlt size={14} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-[#2D2D5F] uppercase tracking-widest">Points Relais</h3>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Économisez sur les frais de port</p>
                    </div>
                </div>
            </div>

            {/* Search Input */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                    <FaSearch size={14} />
                </div>
                <input
                    type="text"
                    placeholder="Chercher par ville ou nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 transition-all font-bold text-slate-700 text-sm placeholder:text-slate-300 placeholder:font-medium"
                />
            </div>

            {/* Store Grid */}
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar custom-scrollbar-light">
                <AnimatePresence>
                    {filteredStores.map((store, index) => {
                        const isSelected = selectedId === store.id;
                        const isLoadingFee = loadingFees[store.id];
                        const fee = storeFees[store.id];
                        const isFree = fee !== undefined && fee === 0;

                        return (
                            <motion.div
                                key={store.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => handleStoreSelect(store)}
                                className={`relative flex items-center justify-between p-5 rounded-[1.75rem] cursor-pointer transition-all border-2 ${isSelected
                                    ? 'border-[#2D2D5F] bg-white shadow-xl shadow-indigo-900/5'
                                    : 'border-slate-50 bg-slate-50/50 hover:border-slate-100 hover:bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg transition-all ${isSelected ? 'bg-[#2D2D5F] text-white shadow-lg' : 'bg-white text-slate-300 shadow-sm'}`}>
                                        <FaStore />
                                    </div>
                                    <div className="min-w-0 pr-4">
                                        <div className="flex items-center gap-2">
                                            <p className={`font-black text-sm tracking-tight truncate ${isSelected ? 'text-[#2D2D5F]' : 'text-slate-700'}`}>
                                                {store.name}
                                            </p>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-tighter mt-0.5">
                                            {[store.address, store.city].filter(Boolean).join(', ')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    {isLoadingFee ? (
                                        <div className="w-4 h-4 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                                    ) : fee !== undefined && fee !== null ? (
                                        <div className={`px-4 py-1.5 rounded-2xl text-[10px] font-black tracking-widest uppercase border ${isFree ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                                            {isFree ? 'Gratuit' : `${Number(fee).toFixed(2)} DT`}
                                        </div>
                                    ) : (
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                    )}

                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${isSelected ? 'border-[#2D2D5F] bg-[#2D2D5F] shadow-lg shadow-indigo-500/20' : 'border-slate-200 bg-white'}`}>
                                        {isSelected && <FaCheck className="text-white text-[10px]" />}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RelayPointSelector;
