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
        { id: 'delivery', label: 'Domicile', icon: FaHome, subtitle: 'Voir prix' },
        { id: 'pickup', label: 'Retrait', icon: FaStore, subtitle: 'Gratuit' },
        { id: 'relay_point', label: 'Point Relais', icon: FaMapMarkerAlt, subtitle: 'Voir prix' }
    ];

    const handleModeChange = (modeId) => {
        handleInputChange({ target: { name: 'order_type', value: modeId } });

        // Auto-select the corresponding API mode ID if available
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
                // Default to Domicile/Standard
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

                {/* Mode Selector Cards */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {modes.map((mode) => {
                        const isSelected = formData.order_type === mode.id;
                        const Icon = mode.icon;
                        return (
                            <button
                                key={mode.id}
                                onClick={() => handleModeChange(mode.id)}
                                className={`relative flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-200 border-2 ${isSelected
                                    ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {isSelected && (
                                    <div className="absolute top-3 right-3 text-white">
                                        <FaCheckCircle size={16} />
                                    </div>
                                )}
                                <Icon size={24} className={`mb-3 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                <span className="font-bold text-sm mb-1">{mode.label}</span>
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-slate-300' : 'text-blue-500'}`}>
                                    {mode.subtitle}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Content Section */}
                <div className="mt-2">
                    <AnimatePresence mode="wait">
                        {formData.order_type === 'delivery' && (
                            <motion.div
                                key="delivery"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
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
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                {(() => {
                                    // Recalculate subtotal from orderDetails to match backend calculation
                                    const calculatedSubtotal = orderDetails.reduce((t, i) => t + (parseFloat(i.price) * parseInt(i.quantity)), 0);
                                    console.log("🔍 RelayPointSelector Props:");
                                    console.log("   cartTotal (calculated from orderDetails):", calculatedSubtotal);
                                    console.log("   cartTotal (from location.state):", subtotal);
                                    console.log("   cartItems:", orderDetails);
                                    console.log("   deliveryModes:", deliveryModes);
                                    return null;
                                })()}
                                <RelayPointSelector
                                    onStoreSelected={(store, fee) => {
                                        console.log("🏪 Relay Point Selected:", store.name);
                                        console.log("💵 Relay Point Fee:", fee);
                                        setSelectedRelayPoint(store);
                                        setRelayPointFee(fee);
                                        setFormData(prev => {
                                            console.log("📝 Updating formData.delivery_fee to:", fee);
                                            return { ...prev, delivery_fee: fee };
                                        });
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
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <StorePickupSelector
                                    onStoreSelected={(store) => {
                                        setSelectedPickupStore(store);
                                        setPickupStoreFee(0);
                                        setFormData(prev => ({ ...prev, delivery_fee: 0 }));
                                    }}
                                    selectedStoreId={selectedPickupStore?.id}
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
