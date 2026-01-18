import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStores, selectAllStores, selectStoresLoading, selectStore } from '../store/slices/stores';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStore, FaCheck, FaShoppingBag, FaMapMarkerAlt } from 'react-icons/fa';

const StorePickupSelector = ({ onStoreSelected, selectedStoreId }) => {
    const dispatch = useDispatch();
    const stores = useSelector(selectAllStores);
    const loading = useSelector(selectStoresLoading);

    const [selectedId, setSelectedId] = useState(selectedStoreId);

    useEffect(() => {
        dispatch(fetchStores());
    }, [dispatch]);

    const handleStoreSelect = (store) => {
        setSelectedId(store.id);
        dispatch(selectStore(store));
        onStoreSelected(store, 0);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chargement des magasins...</p>
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100/50">
                    <FaShoppingBag size={14} />
                </div>
                <div>
                    <h3 className="text-[10px] font-black text-[#2D2D5F] uppercase tracking-widest">Retrait en magasin</h3>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Disponible immédiatement</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar custom-scrollbar-light">
                <AnimatePresence>
                    {stores.map((store, index) => {
                        const isSelected = selectedId === store.id;
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
                                        <p className={`font-black text-sm tracking-tight truncate ${isSelected ? 'text-[#2D2D5F]' : 'text-slate-700'}`}>
                                            {store.name}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <FaMapMarkerAlt className="text-slate-300 text-[10px]" />
                                            <p className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-tighter">
                                                {[store.address, store.city].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <div className="px-4 py-1.5 rounded-2xl text-[10px] font-black tracking-widest uppercase border bg-emerald-50 text-emerald-600 border-emerald-100">
                                        Gratuit
                                    </div>
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

export default StorePickupSelector;
