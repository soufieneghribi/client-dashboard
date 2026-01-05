import React from 'react';
import { FaMapMarkerAlt, FaCheckCircle, FaSyncAlt, FaInfoCircle } from "react-icons/fa";
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
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                    <FaMapMarkerAlt className="text-blue-500" />
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-xs">Vérification de position</span>
                </div>

                <div className="flex items-center gap-2">
                    {geolocationStatus === 'loading' && (
                        <div className="flex items-center gap-3 text-blue-600 text-sm font-bold">
                            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            <span>Détection...</span>
                        </div>
                    )}
                    {geolocationStatus === 'success' && (
                        <span className="text-green-600 text-sm font-bold flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                            <FaCheckCircle /> Position OK
                        </span>
                    )}
                    {(geolocationStatus === 'error' || geolocationStatus === 'denied') && (
                        <button
                            type="button"
                            onClick={handleRetryGeolocation}
                            className="text-orange-600 text-sm font-black flex items-center gap-1 hover:bg-orange-50 px-3 py-1 rounded-full transition-all"
                        >
                            <FaSyncAlt /> RÉESSAYER
                        </button>
                    )}
                </div>
            </div>

            {/* Mode Selector */}
            {deliveryModes.length > 0 && (
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Vitesse de livraison *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {deliveryModes.map((mode) => (
                            <button
                                key={mode.mode_livraison_id}
                                type="button"
                                onClick={() => setSelectedMode(mode.mode_livraison_id)}
                                className={`p-4 rounded-2xl text-left border-2 transition-all font-bold ${selectedMode === mode.mode_livraison_id.toString() || selectedMode === mode.mode_livraison_id
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-50 bg-slate-50 text-slate-500'
                                    }`}
                            >
                                {mode.nom || mode.mode_livraison_id}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Address Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {[
                    { name: 'rue', label: 'Rue & Numéro *', placeholder: 'Ex: 12 Rue des Oliviers' },
                    { name: 'ville', label: 'Ville *', placeholder: 'Ex: Tunis' },
                    { name: 'gouvernorat', label: 'Gouvernorat *', placeholder: 'Ex: Ariana' },
                    { name: 'code_postal', label: 'Code Postal', placeholder: '1000' }
                ].map((field) => (
                    <div key={field.name} className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">{field.label}</label>
                        <input
                            type="text"
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleInputChange}
                            placeholder={field.placeholder}
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-medium placeholder:text-slate-300"
                            required={field.name !== 'code_postal'}
                        />
                    </div>
                ))}
            </div>

            {/* Additional info */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Détails d'accès (Optionnel)</label>
                <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Étage, code porte, sonnerie, point de repère..."
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-medium min-h-[100px] placeholder:text-slate-300"
                />
            </div>

            {/* Google Map */}
            <div className="mt-8 rounded-[2rem] overflow-hidden border-4 border-slate-100 shadow-inner relative" style={{ height: '450px' }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY, libraries: ['places'] }}
                    center={{
                        lat: parseFloat(formData.latitude) || DEFAULT_LOCATION.lat,
                        lng: parseFloat(formData.longitude) || DEFAULT_LOCATION.lng
                    }}
                    zoom={15}
                    onClick={handleMapClick}
                    yesIWantToUseGoogleMapApiInternals
                >
                    {formData.latitude && formData.longitude && (
                        <div
                            lat={parseFloat(formData.latitude)}
                            lng={parseFloat(formData.longitude)}
                            className="relative flex flex-col items-center"
                            style={{ transform: 'translate(-50%, -100%)' }}
                        >
                            <div className="absolute -top-16 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl whitespace-nowrap mb-2 flex items-center gap-2 border-2 border-white">
                                <span>📦 LIVRAISON ICI</span>
                                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-blue-600 absolute -bottom-2 left-1/2 -ml-2"></div>
                            </div>
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-blue-600">
                                <FaMapMarkerAlt className="text-blue-600 text-xl" />
                            </div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full blur-[2px] mt-2 animate-ping"></div>
                        </div>
                    )}
                </GoogleMapReact>

                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center justify-between border border-blue-50/50">
                        <div className="flex items-center gap-3">
                            <FaInfoCircle className="text-blue-500" />
                            <span className="text-xs font-bold text-slate-700">Cliquez sur la carte pour ajuster votre position</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DomicileDeliveryForm;
