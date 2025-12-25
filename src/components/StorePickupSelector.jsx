import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStores, selectAllStores, selectStoresLoading, selectStore } from '../store/slices/stores';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStore, FaMapMarkerAlt, FaCheck, FaShoppingBag } from 'react-icons/fa';

/**
 * StorePickupSelector - Component for selecting a store for pickup
 * Similar to RelayPointSelector but without fee calculation (always free)
 */
const StorePickupSelector = ({ onStoreSelected, selectedStoreId }) => {
    const dispatch = useDispatch();
    const stores = useSelector(selectAllStores);
    const loading = useSelector(selectStoresLoading);

    const [selectedId, setSelectedId] = useState(selectedStoreId);

    // Fetch stores on mount
    useEffect(() => {
        dispatch(fetchStores());
    }, [dispatch]);

    const handleStoreSelect = (store) => {
        setSelectedId(store.id);
        dispatch(selectStore(store));
        onStoreSelected(store, 0); // Always free for pickup
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Chargement des magasins...</p>
            </div>
        );
    }

    if (stores.length === 0) {
        return (
            <div className="bg-slate-50 rounded-[2rem] p-10 text-center border-2 border-dashed border-slate-200">
                <div className="text-4xl mb-4 opacity-20">🏪</div>
                <p className="text-slate-500 font-bold uppercase tracking-tight">Aucun magasin disponible</p>
                <p className="text-slate-400 text-xs mt-1">Veuillez choisir un autre mode de livraison.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                    <FaShoppingBag size={14} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Points de retrait gratuits</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Choisissez votre point de vente habituel</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
                <AnimatePresence>
                    {stores.map((store, index) => {
                        const isSelected = selectedId === store.id;

                        return (
                            <motion.div
                                key={store.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleStoreSelect(store)}
                                className={`relative group p-5 rounded-[1.75rem] cursor-pointer transition-all border-2 overflow-hidden ${isSelected
                                    ? 'border-green-500 bg-white shadow-xl shadow-green-900/5 ring-4 ring-green-50'
                                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    {/* Store Icon */}
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${isSelected ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-white shadow-sm'
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
                                                <span className="bg-green-600 text-[8px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-widest leading-normal">Sélectionné</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <FaMapMarkerAlt className="text-slate-300 text-[10px]" />
                                            <p className="text-[11px] text-slate-400 font-medium truncate uppercase tracking-tighter">
                                                {[store.address, store.city].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="flex flex-col items-end gap-2 text-right">
                                        <div className="px-4 py-1.5 rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-sm border bg-green-50 text-green-600 border-green-100">
                                            Gratuit
                                        </div>

                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-green-600 border-green-600 shadow-lg shadow-green-500/30' : 'border-slate-200 bg-white'
                                            }`}>
                                            {isSelected && <FaCheck className="text-white text-[10px]" />}
                                        </div>
                                    </div>
                                </div>

                                {isSelected && (
                                    <motion.div
                                        layoutId="selection-glow-green"
                                        className="absolute -left-10 -bottom-10 w-32 h-32 bg-green-500/5 blur-[40px] rounded-full"
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

export default StorePickupSelector;
