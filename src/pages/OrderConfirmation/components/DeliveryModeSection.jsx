import React from 'react';
import { FaTruck, FaMapMarkerAlt, FaStore, FaCheckCircle, FaHome, FaClock, FaTag, FaBox } from "react-icons/fa";
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
    setPickupStoreFee,
    onlyCards = false,
    onlyDetails = false
}) => {

    const modes = [
        {
            id: 'delivery',
            label: 'Livraison à domicile',
            icon: FaHome,
            subtitle: 'Recevez votre commande chez vous',
            time: '2-4 jours',
            cost: 'Variable',
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'from-blue-50 to-cyan-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700'
        },
        {
            id: 'pickup',
            label: 'Retrait en magasin',
            icon: FaStore,
            subtitle: 'Disponible immédiatement',
            time: '24h',
            cost: 'Gratuit',
            color: 'from-emerald-500 to-teal-500',
            bgColor: 'from-emerald-50 to-teal-50',
            borderColor: 'border-emerald-200',
            textColor: 'text-emerald-700'
        },
        {
            id: 'relay_point',
            label: 'Point relais',
            icon: FaMapMarkerAlt,
            subtitle: 'Retirez dans un point proche',
            time: '3-5 jours',
            cost: 'Réduit',
            color: 'from-amber-500 to-orange-500',
            bgColor: 'from-amber-50 to-orange-50',
            borderColor: 'border-amber-200',
            textColor: 'text-amber-700'
        }
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
        <div className="space-y-6">
            {/* Delivery Mode Selection Cards - Hidden if onlyDetails is true */}
            {!onlyDetails && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {modes.map((mode, index) => {
                        const Icon = mode.icon;
                        const isSelected = formData.order_type === mode.id;

                        return (
                            <motion.button
                                key={mode.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleModeChange(mode.id)}
                                className={`relative p-6 rounded-2xl border-2 transition-all text-left ${isSelected
                                    ? `bg-gradient-to-br ${mode.bgColor} ${mode.borderColor} shadow-lg scale-102`
                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md text-slate-400'
                                    }`}
                            >
                                {/* Selected Indicator */}
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        <FaCheckCircle className="text-white" size={16} />
                                    </motion.div>
                                )}

                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${isSelected ? mode.color : 'from-slate-100 to-slate-200'} flex items-center justify-center mb-4 shadow-lg transition-all`}>
                                    <Icon className={isSelected ? 'text-white' : 'text-slate-400'} size={24} />
                                </div>

                                {/* Content */}
                                <div>
                                    <h3 className={`text-lg font-black mb-1 ${isSelected ? mode.textColor : 'text-slate-700'}`}>
                                        {mode.label}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-4">{mode.subtitle}</p>

                                    {/* Info Badges */}
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-100">
                                            <FaClock className="text-slate-400" size={10} />
                                            <span className="text-[10px] font-black text-slate-600 uppercase">{mode.time}</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${mode.cost === 'Gratuit'
                                            ? 'bg-emerald-50 border border-emerald-100'
                                            : 'bg-white border border-gray-100'
                                            }`}>
                                            <FaTag className={mode.cost === 'Gratuit' ? 'text-emerald-500' : 'text-slate-400'} size={10} />
                                            <span className={`text-[10px] font-bold uppercase ${mode.cost === 'Gratuit' ? 'text-emerald-700' : 'text-slate-600'
                                                }`}>
                                                {mode.cost}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            )}

            {/* Conditional Forms Based on Selected Mode - Hidden if onlyCards is true */}
            {!onlyCards && (
                <AnimatePresence mode="wait">
                    {formData.order_type === 'delivery' && (
                        <motion.div
                            key="delivery-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <FaHome className="text-white" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#2D2D5F]">Adresse de livraison</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Où souhaitez-vous recevoir votre commande ?</p>
                                </div>
                            </div>
                            <DomicileDeliveryForm
                                formData={formData}
                                handleInputChange={handleInputChange}
                                setFormData={setFormData}
                                geolocationStatus={geolocationStatus}
                                handleRetryGeolocation={handleRetryGeolocation}
                                handleMapClick={handleMapClick}
                                GOOGLE_MAPS_API_KEY={GOOGLE_MAPS_API_KEY}
                                DEFAULT_LOCATION={DEFAULT_LOCATION}
                            />
                        </motion.div>
                    )}

                    {formData.order_type === 'pickup' && (
                        <motion.div
                            key="pickup-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-sm"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <FaStore className="text-white" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-emerald-900">Choisissez votre magasin</h3>
                                    <p className="text-xs font-bold text-emerald-700/60 uppercase tracking-widest mt-0.5">Retrait gratuit disponible immédiatement</p>
                                </div>
                            </div>

                            {/* Free Badge */}
                            <div className="mb-8 p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100/50 border-dashed">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 text-center sm:text-left">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                                            <FaCheckCircle className="text-emerald-500" size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-emerald-900 tracking-tight uppercase">Frais de livraison offerts</p>
                                            <p className="text-xs font-bold text-emerald-700/70 uppercase">Économisez sur les frais de port</p>
                                        </div>
                                    </div>
                                    <div className="px-6 py-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/30">
                                        <span className="text-xl font-black text-white uppercase italic">GRATUIT</span>
                                    </div>
                                </div>
                            </div>

                            <StorePickupSelector
                                onStoreSelected={(store, fee) => {
                                    setSelectedPickupStore(store);
                                    setPickupStoreFee(fee);
                                }}
                                selectedStoreId={selectedPickupStore?.id}
                            />
                        </motion.div>
                    )}

                    {formData.order_type === 'relay_point' && (
                        <motion.div
                            key="relay-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-3xl border border-amber-100 p-6 sm:p-8 shadow-sm"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <FaMapMarkerAlt className="text-white" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-amber-900">Sélectionnez un point relais</h3>
                                    <p className="text-xs font-bold text-amber-700/60 uppercase tracking-widest mt-0.5">Retirez votre colis à votre convenance</p>
                                </div>
                            </div>

                            {/* Advantages */}
                            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-amber-50/30 rounded-2xl border border-amber-100/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm">
                                            <FaTag size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest leading-tight">Tarif réduit</p>
                                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">Option économique</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-amber-50/30 rounded-2xl border border-amber-100/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm">
                                            <FaClock size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest leading-tight">Libre retrait</p>
                                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">Horaires flexibles</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <RelayPointSelector
                                onStoreSelected={(store, fee) => {
                                    setSelectedRelayPoint(store);
                                    setRelayPointFee(fee);
                                }}
                                selectedStoreId={selectedRelayPoint?.id}
                                cartTotal={subtotal}
                                cartItems={orderDetails}
                                deliveryModes={deliveryModes}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};

export default DeliveryModeSection;
