import React from 'react';
import { FaTruck, FaMapMarkerAlt, FaStore, FaCheckCircle, FaHome, FaClock, FaTag, FaGift, FaShippingFast } from "react-icons/fa";
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
            subtitle: 'Livré chez vous',
            time: '24-72h',
            cost: 'Variable',
            gradient: 'from-blue-500 to-indigo-600',
            lightBg: 'from-blue-50 to-indigo-50',
            borderActive: 'border-blue-300',
            textColor: 'text-blue-700',
            shadowColor: 'shadow-blue-500/20'
        },
        {
            id: 'pickup',
            label: 'Retrait en magasin',
            icon: FaStore,
            subtitle: 'Click & Collect',
            time: '1h',
            cost: 'Gratuit',
            gradient: 'from-emerald-500 to-teal-600',
            lightBg: 'from-emerald-50 to-teal-50',
            borderActive: 'border-emerald-300',
            textColor: 'text-emerald-700',
            shadowColor: 'shadow-emerald-500/20',
            badge: 'ÉCONOMIQUE'
        },
        {
            id: 'relay_point',
            label: 'Point relais',
            icon: FaMapMarkerAlt,
            subtitle: 'Proche de vous',
            time: '48-96h',
            cost: 'Réduit',
            gradient: 'from-amber-500 to-orange-600',
            lightBg: 'from-amber-50 to-orange-50',
            borderActive: 'border-amber-300',
            textColor: 'text-amber-700',
            shadowColor: 'shadow-amber-500/20'
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
            {/* Mode Selection Cards */}
            {!onlyDetails && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                    {modes.map((mode, index) => {
                        const Icon = mode.icon;
                        const isSelected = formData.order_type === mode.id;

                        return (
                            <motion.button
                                key={mode.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleModeChange(mode.id)}
                                className={`
                                    relative p-4 lg:p-6 rounded-2xl border-2 transition-all duration-300 text-left
                                    ${isSelected
                                        ? `bg-gradient-to-br ${mode.lightBg} ${mode.borderActive} shadow-lg ${mode.shadowColor}`
                                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                                    }
                                `}
                            >
                                {/* Selected Check */}
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        <FaCheckCircle className="text-white text-sm" />
                                    </motion.div>
                                )}

                                {/* Badge */}
                                {mode.badge && (
                                    <div className="absolute top-3 right-3">
                                        <span className={`
                                            px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-full
                                            ${isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'}
                                        `}>
                                            {mode.badge}
                                        </span>
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`
                                    w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center mb-3 lg:mb-4 transition-all
                                    ${isSelected
                                        ? `bg-gradient-to-br ${mode.gradient} shadow-lg ${mode.shadowColor}`
                                        : 'bg-slate-100'
                                    }
                                `}>
                                    <Icon className={`text-lg lg:text-xl ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                </div>

                                {/* Content */}
                                <h3 className={`text-sm lg:text-base font-bold mb-0.5 ${isSelected ? mode.textColor : 'text-slate-700'}`}>
                                    {mode.label}
                                </h3>
                                <p className="text-xs text-slate-400 mb-3 lg:mb-4">{mode.subtitle}</p>

                                {/* Info Tags */}
                                <div className="flex flex-wrap gap-1.5">
                                    <span className={`
                                        inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-lg
                                        ${isSelected ? 'bg-white/80' : 'bg-slate-50'} text-slate-600
                                    `}>
                                        <FaClock size={8} /> {mode.time}
                                    </span>
                                    <span className={`
                                        inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-lg
                                        ${isSelected
                                            ? mode.cost === 'Gratuit' ? 'bg-emerald-500 text-white' : 'bg-white/80 text-slate-600'
                                            : mode.cost === 'Gratuit' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-600'
                                        }
                                    `}>
                                        <FaTag size={8} /> {mode.cost}
                                    </span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            )}

            {/* Delivery Forms */}
            {!onlyCards && (
                <AnimatePresence mode="wait">
                    {/* Home Delivery Form */}
                    {formData.order_type === 'delivery' && (
                        <motion.div
                            key="delivery-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-2xl lg:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 lg:p-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <FaHome className="text-white text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl lg:text-2xl font-black text-white">Adresse de livraison</h3>
                                        <p className="text-blue-100 text-sm">Où souhaitez-vous être livré ?</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 lg:p-8">
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
                            </div>
                        </motion.div>
                    )}

                    {/* Store Pickup */}
                    {formData.order_type === 'pickup' && (
                        <motion.div
                            key="pickup-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-2xl lg:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 lg:p-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <FaStore className="text-white text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl lg:text-2xl font-black text-white">Retrait en magasin</h3>
                                        <p className="text-emerald-100 text-sm">Choisissez votre point de retrait</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 lg:p-8">
                                {/* Free Delivery Banner */}
                                <div className="mb-6 p-4 lg:p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-dashed border-emerald-200">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 text-center sm:text-left">
                                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                <FaGift className="text-emerald-500 text-xl" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-emerald-800">Livraison offerte !</p>
                                                <p className="text-xs text-emerald-600">Économisez sur les frais de port</p>
                                            </div>
                                        </div>
                                        <div className="px-5 py-2.5 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/30">
                                            <span className="text-lg font-black text-white">GRATUIT</span>
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
                            </div>
                        </motion.div>
                    )}

                    {/* Relay Point */}
                    {formData.order_type === 'relay_point' && (
                        <motion.div
                            key="relay-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-2xl lg:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 lg:p-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <FaMapMarkerAlt className="text-white text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl lg:text-2xl font-black text-white">Point relais</h3>
                                        <p className="text-amber-100 text-sm">Retirez à votre convenance</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 lg:p-8">
                                {/* Advantages */}
                                <div className="mb-6 grid grid-cols-2 gap-3">
                                    <div className="p-3 lg:p-4 bg-amber-50 rounded-xl border border-amber-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                                                <FaTag className="text-amber-500" size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-amber-800">Tarif réduit</p>
                                                <p className="text-[10px] text-amber-600">Option économique</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 lg:p-4 bg-amber-50 rounded-xl border border-amber-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                                                <FaClock className="text-amber-500" size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-amber-800">Flexible</p>
                                                <p className="text-[10px] text-amber-600">Horaires étendus</p>
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
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};

export default DeliveryModeSection;