import React from 'react';
import { FaTruck, FaMapMarkerAlt, FaStore, FaCheckCircle, FaHome } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import RelayPointSelector from "../../../components/RelayPointSelector";
import StorePickupSelector from "../../../components/StorePickupSelector";
import DomicileDeliveryForm from "./DomicileDeliveryForm";

const DeliveryModeSection = ({
    formData,
    handleInputChange,
    deliveryModes,
    selectedMode,
    setSelectedMode,
    subtotal,
    orderDetails,
    selectedRelayPoint,
    setSelectedRelayPoint,
    relayPointFee,
    setRelayPointFee,
    setFormData,
    geolocationStatus,
    handleRetryGeolocation,
    handleMapClick,
    GOOGLE_MAPS_API_KEY,
    DEFAULT_LOCATION,
    selectedPickupStore,
    setSelectedPickupStore,
    setPickupStoreFee
}) => {

    const modes = [
        { id: 'delivery', label: 'Domicile', icon: FaHome, subtitle: 'Expédition' },
        { id: 'pickup', label: 'Retrait', icon: FaStore, subtitle: 'Gratuit' },
        { id: 'relay_point', label: 'Point Relais', icon: FaMapMarkerAlt, subtitle: 'Éco' }
    ];

    const handleModeChange = (modeId) => {
        handleInputChange({ target: { name: 'order_type', value: modeId } });

        if (deliveryModes && deliveryModes.length > 0) {
            let targetMode = null;
            if (modeId === 'relay_point') {
                targetMode = deliveryModes.find(m =>
                    m.code === 'POINT_RELAIS' ||
                    ['point relais', 'point-relais', 'relais'].includes(m.nom?.toLowerCase())
                );
            } else if (modeId === 'pickup') {
                targetMode = deliveryModes.find(m =>
                    m.code === 'RETRAIT' ||
                    ['retrait', 'magasin', 'boutique'].includes(m.nom?.toLowerCase())
                );
            } else {
                targetMode = deliveryModes.find(m =>
                    !m.code?.includes('POINT_RELAIS') &&
                    !['point relais', 'retrait'].includes(m.nom?.toLowerCase())
                );
            }

            if (targetMode) {
                setSelectedMode(targetMode.mode_livraison_id);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden"
        >
            <div className="p-8 sm:p-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <FaTruck size={20} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-[#2D2D5F] tracking-tight">Mode de livraison</h2>
                        <p className="text-slate-400 font-medium mt-1">Choisissez l'option la plus pratique pour vous.</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-10">
                    {modes.map((mode) => {
                        const isSelected = formData.order_type === mode.id;
                        const Icon = mode.icon;
                        return (
                            <button
                                key={mode.id}
                                onClick={() => handleModeChange(mode.id)}
                                className={`group relative flex flex-col items-center justify-center p-6 rounded-[2rem] transition-all duration-300 border-2 ${isSelected
                                    ? 'border-[#2D2D5F] bg-[#2D2D5F] text-white shadow-2xl shadow-indigo-900/20'
                                    : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-indigo-100 hover:bg-white hover:text-indigo-600'
                                    }`}
                            >
                                <div className={`mb-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSelected ? 'bg-white/10' : 'bg-white group-hover:bg-indigo-50 shadow-sm'}`}>
                                    <Icon size={20} />
                                </div>
                                <span className="font-extrabold text-sm mb-1">{mode.label}</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'opacity-60' : 'text-slate-300 group-hover:text-indigo-400'}`}>
                                    {mode.subtitle}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-2">
                    <AnimatePresence mode="wait">
                        {formData.order_type === 'delivery' && (
                            <motion.div
                                key="delivery"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                            >
                                <DomicileDeliveryForm
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    geolocationStatus={geolocationStatus}
                                    handleRetryGeolocation={handleRetryGeolocation}
                                    deliveryModes={deliveryModes}
                                    selectedMode={selectedMode}
                                    setSelectedMode={setSelectedMode}
                                    handleMapClick={handleMapClick}
                                    GOOGLE_MAPS_API_KEY={GOOGLE_MAPS_API_KEY}
                                    DEFAULT_LOCATION={DEFAULT_LOCATION}
                                />
                            </motion.div>
                        )}
                        {formData.order_type === 'relay_point' && (
                            <motion.div
                                key="relay"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                            >
                                <RelayPointSelector
                                    onStoreSelected={(store, fee) => {
                                        setSelectedRelayPoint(store);
                                        setRelayPointFee(fee);
                                        setFormData(prev => ({ ...prev, delivery_fee: fee }));
                                    }}
                                    selectedStoreId={selectedRelayPoint?.id}
                                    cartTotal={orderDetails.reduce((t, i) => t + (parseFloat(i.price) * parseInt(i.quantity)), 0)}
                                    cartItems={orderDetails}
                                    deliveryModes={deliveryModes}
                                />
                            </motion.div>
                        )}

                        {(formData.order_type === 'pickup' || formData.order_type === 'store_pickup') && (
                            <motion.div
                                key="pickup"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                            >
                                <StorePickupSelector
                                    onStoreSelected={(store) => {
                                        setSelectedPickupStore(store);
                                        setPickupStoreFee(0);
                                        setFormData(prev => ({ ...prev, delivery_fee: 0 }));
                                    }}
                                    selectedStoreId={selectedPickupStore?.id}
                                    lightMode={true}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default DeliveryModeSection;
