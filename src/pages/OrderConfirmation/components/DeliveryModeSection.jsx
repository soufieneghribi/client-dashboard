import React from 'react';
import { FaTruck, FaMapMarkerAlt, FaStore, FaCheckCircle } from "react-icons/fa";
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
                                            ville: store.city || prev.ville,
                                            gouvernorat: store.gouvernorat || prev.gouvernorat,
                                            code_postal: String(store.code_postal || prev.code_postal || ""),
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
                        ) : (
                            <motion.div
                                key="pickup"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <StorePickupSelector
                                    onStoreSelected={(store, fee) => {
                                        setSelectedPickupStore(store);
                                        setPickupStoreFee(fee || 0);
                                        setFormData(prev => ({
                                            ...prev,
                                            delivery_fee: fee || 0,
                                            address: `Retrait magasin: ${store.name}, ${store.address || ''}, ${store.city || ''}`,
                                            ville: store.city || prev.ville,
                                            gouvernorat: store.gouvernorat || prev.gouvernorat,
                                            code_postal: String(store.code_postal || prev.code_postal || ""),
                                        }));
                                    }}
                                    selectedStoreId={selectedPickupStore?.id}
                                />

                                {selectedPickupStore ? (
                                    <div className="p-6 bg-green-50 rounded-[1.5rem] border border-green-100 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                                            <FaStore />
                                        </div>
                                        <div>
                                            <p className="font-bold text-green-800 tracking-tight">{selectedPickupStore.name}</p>
                                            <p className="text-sm text-green-600 font-medium">{selectedPickupStore.address}, {selectedPickupStore.city}</p>
                                            <div className="mt-2 inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-xs font-black text-green-700 border border-green-100">
                                                HORAIRES: Lun-Sam 09:00 - 19:00
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 space-y-6">
                                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto">
                                            <FaStore size={40} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Emporté en magasin</h3>
                                            <p className="text-slate-500 font-medium">Veuillez sélectionner un point de retrait</p>
                                        </div>
                                        <div className="bg-white px-8 py-3 rounded-full inline-flex items-center gap-2 border-2 border-green-500 text-green-600 font-black">
                                            <FaCheckCircle /> FRAIS DE LIVRAISON GRATUIT
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default DeliveryModeSection;
