import React from 'react';
import { FaMapMarkerAlt, FaCheckCircle, FaSyncAlt, FaInfoCircle, FaHome, FaCity, FaMapPin } from "react-icons/fa";
import { motion } from "framer-motion";
import GoogleMapReact from "google-map-react";

const DomicileDeliveryForm = ({
    formData,
    handleInputChange,
    geolocationStatus,
    handleRetryGeolocation,
    deliveryModes,
    selectedMode,
    setSelectedMode,
    handleMapClick,
    GOOGLE_MAPS_API_KEY,
    DEFAULT_LOCATION
}) => {

    const addressFields = [
        {
            name: 'rue',
            label: 'Rue & Numéro',
            placeholder: 'Ex: 12 Avenue Habib Bourguiba',
            icon: FaHome,
            required: true,
            colSpan: 'full'
        },
        {
            name: 'ville',
            label: 'Ville',
            placeholder: 'Ex: Tunis',
            icon: FaCity,
            required: true
        },
        {
            name: 'gouvernorat',
            label: 'Gouvernorat',
            placeholder: 'Ex: Tunis',
            icon: FaMapPin,
            required: true
        },
        {
            name: 'code_postal',
            label: 'Code Postal',
            placeholder: '1000',
            icon: FaMapMarkerAlt,
            required: false
        }
    ];

    // Custom Map Marker Component
    const DeliveryMarker = ({ lat, lng }) => (
        <div className="relative" style={{ transform: 'translate(-50%, -100%)' }}>
            {/* Pulse Ring */}
            <motion.div
                className="absolute top-1/2 left-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Label */}
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2">
                    <FaMapMarkerAlt className="text-amber-300" />
                    <span>Point de livraison</span>
                </div>
                <div className="w-3 h-3 bg-indigo-600 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
            </div>

            {/* Pin */}
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                <FaHome className="text-white text-lg" />
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Geolocation Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                        ${geolocationStatus === 'success' ? 'bg-emerald-100 text-emerald-600' :
                            geolocationStatus === 'loading' ? 'bg-indigo-100 text-indigo-600' :
                                'bg-slate-200 text-slate-500'}
                    `}>
                        <FaMapMarkerAlt />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-700">Localisation</p>
                        <p className="text-xs text-slate-500">
                            {geolocationStatus === 'success' ? 'Position détectée' :
                                geolocationStatus === 'loading' ? 'Détection en cours...' :
                                    'Cliquez sur la carte pour préciser'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {geolocationStatus === 'loading' && (
                        <div className="flex items-center gap-2 text-indigo-600">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full"
                            />
                            <span className="text-xs font-semibold">Détection...</span>
                        </div>
                    )}

                    {geolocationStatus === 'success' && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                            <FaCheckCircle /> Validée
                        </span>
                    )}

                    {(geolocationStatus === 'error' || geolocationStatus === 'denied') && (
                        <button
                            type="button"
                            onClick={handleRetryGeolocation}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold hover:bg-amber-200 transition-colors"
                        >
                            <FaSyncAlt /> Réessayer
                        </button>
                    )}
                </div>
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addressFields.map((field, index) => {
                    const Icon = field.icon;
                    return (
                        <motion.div
                            key={field.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`space-y-2 ${field.colSpan === 'full' ? 'md:col-span-2' : ''}`}
                        >
                            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                                {field.label}
                                {field.required && <span className="text-red-500">*</span>}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Icon size={14} />
                                </div>
                                <input
                                    type="text"
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleInputChange}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Additional Instructions */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">
                    Instructions de livraison <span className="text-slate-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    placeholder="Étage, code de porte, sonnerie, point de repère..."
                    rows={3}
                    className="w-full px-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                />
            </div>

            {/* Google Map */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600">
                        📍 Confirmez sur la carte
                    </label>
                    <span className="text-[10px] text-slate-400">Cliquez pour ajuster</span>
                </div>

                <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-xl" style={{ height: '350px' }}>
                    {/* Map Gradient Overlay */}
                    <div className="absolute inset-0 pointer-events-none z-10 rounded-2xl ring-1 ring-inset ring-black/5" />

                    <GoogleMapReact
                        bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY, libraries: ['places'] }}
                        center={{
                            lat: parseFloat(formData.latitude) || DEFAULT_LOCATION?.lat || 36.8065,
                            lng: parseFloat(formData.longitude) || DEFAULT_LOCATION?.lng || 10.1815
                        }}
                        zoom={15}
                        onClick={handleMapClick}
                        options={{
                            fullscreenControl: false,
                            zoomControl: true,
                            streetViewControl: false,
                            mapTypeControl: false,
                            styles: [
                                { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
                                { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] }
                            ]
                        }}
                    >
                        {formData.latitude && formData.longitude && (
                            <DeliveryMarker
                                lat={parseFloat(formData.latitude)}
                                lng={parseFloat(formData.longitude)}
                            />
                        )}
                    </GoogleMapReact>

                    {/* Map Hint */}
                    <div className="absolute top-4 left-4 z-20">
                        <div className="bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2">
                            <FaInfoCircle className="text-indigo-500" size={14} />
                            <span className="text-xs font-semibold text-slate-700">
                                Cliquez pour positionner le point de livraison
                            </span>
                        </div>
                    </div>

                    {/* Coordinates Display */}
                    {formData.latitude && formData.longitude && (
                        <div className="absolute bottom-4 right-4 z-20">
                            <div className="bg-slate-900/90 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2">
                                <FaMapMarkerAlt className="text-emerald-400" size={12} />
                                <span className="text-[10px] font-mono text-white">
                                    {parseFloat(formData.latitude).toFixed(5)}, {parseFloat(formData.longitude).toFixed(5)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DomicileDeliveryForm;