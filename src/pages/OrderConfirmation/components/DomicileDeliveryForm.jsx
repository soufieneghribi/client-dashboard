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
        <div className="space-y-8 mt-6">
            <div className="flex items-center justify-between gap-4 py-5 px-8 bg-slate-50/50 rounded-[2rem] border border-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                        <FaMapMarkerAlt size={14} />
                    </div>
                    <span className="font-extrabold text-[#2D2D5F] uppercase tracking-widest text-[10px]">Vérification de position</span>
                </div>

                <div className="flex items-center gap-2">
                    {geolocationStatus === 'loading' && (
                        <div className="flex items-center gap-3 text-indigo-500 text-[10px] font-black uppercase tracking-widest">
                            <div className="animate-spin h-3 w-3 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                            <span>Détection...</span>
                        </div>
                    )}
                    {geolocationStatus === 'success' && (
                        <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                            <FaCheckCircle /> Position Validée
                        </span>
                    )}
                    {(geolocationStatus === 'error' || geolocationStatus === 'denied') && (
                        <button
                            type="button"
                            onClick={handleRetryGeolocation}
                            className="text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-amber-50 px-4 py-2 rounded-full transition-all border border-amber-100"
                        >
                            <FaSyncAlt /> RÉESSAYER
                        </button>
                    )}
                </div>
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { name: 'rue', label: 'Rue & Numéro *', placeholder: 'Ex: 12 Rue des Oliviers' },
                    { name: 'ville', label: 'Ville *', placeholder: 'Ex: Tunis' },
                    { name: 'gouvernorat', label: 'Gouvernorat *', placeholder: 'Ex: Ariana' },
                    { name: 'code_postal', label: 'Code Postal', placeholder: '1000' }
                ].map((field) => (
                    <div key={field.name} className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{field.label}</label>
                        <input
                            type="text"
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleInputChange}
                            placeholder={field.placeholder}
                            className="w-full px-6 py-5 bg-slate-50/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-100 transition-all font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
                            required={field.name !== 'code_postal'}
                        />
                    </div>
                ))}
            </div>

            {/* Additional info */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Détails d'accès (Optionnel)</label>
                <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Étage, code porte, sonnerie, point de repère..."
                    className="w-full px-6 py-5 bg-slate-50/50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-100 transition-all font-bold text-slate-700 min-h-[120px] placeholder:text-slate-300 placeholder:font-medium"
                />
            </div>

            {/* Google Map */}
            <div className="mt-8 rounded-[3rem] overflow-hidden border-8 border-slate-50 shadow-2xl relative group" style={{ height: '450px' }}>
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
                            <div className="absolute -top-16 bg-[#2D2D5F] text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl whitespace-nowrap mb-2 flex items-center gap-2 border-2 border-white/20 backdrop-blur-sm">
                                <FaMapMarkerAlt className="text-amber-400" />
                                <span>LIVRAISON ICI</span>
                                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#2D2D5F] absolute -bottom-2 left-1/2 -ml-2"></div>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-3xl flex items-center justify-center shadow-2xl border-[6px] border-[#2D2D5F] group-hover:scale-110 transition-transform duration-500">
                                <div className="w-2 h-2 bg-[#2D2D5F] rounded-full"></div>
                            </div>
                        </div>
                    )}
                </GoogleMapReact>

                <div className="absolute top-6 left-6">
                    <div className="bg-[#2D2D5F]/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
                        <FaInfoCircle className="text-amber-400" size={14} />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Précision requise pour la livraison</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DomicileDeliveryForm;
