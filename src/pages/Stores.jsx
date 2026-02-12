import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GoogleMapReact from 'google-map-react';
import { FaStore, FaClock, FaDirections, FaSearch, FaTimes, FaMapMarkerAlt, FaMap } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { GOOGLE_MAPS_API_KEY } from '../services/api';
import { fetchStores, selectAllStores, selectStoresLoading } from '../store/slices/stores';

// ============================================
// DONNÉES DES 42 MAGASINS (23 MG + 19 BATAM)
// ============================================
const STORES_DATA = [
    // === MG STORES (23) ===
    { id: 1, name: "MG Maxi Centre Ville", enseigne: "MG", concept: "MG Maxi", gouvernorat: "Tunis", ville: "Tunis", adresse: "Centre Ville, Tunis", latitude: 36.7992, longitude: 10.1797, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 2, name: "MG City Lafayette", enseigne: "MG", concept: "MG City", gouvernorat: "Tunis", ville: "Tunis", adresse: "Avenue de la Liberté, Lafayette", latitude: 36.8123, longitude: 10.1834, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 3, name: "MG Proxi El Menzah", enseigne: "MG", concept: "MG Proxi", gouvernorat: "Tunis", ville: "Tunis", adresse: "El Menzah, Tunis", latitude: 36.8412, longitude: 10.1710, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 4, name: "MG Maxi Ariana", enseigne: "MG", concept: "MG Maxi", gouvernorat: "Ariana", ville: "Ariana", adresse: "Centre Ville, Ariana", latitude: 36.8663, longitude: 10.1647, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 5, name: "MG Proxi Borj Louzir", enseigne: "MG", concept: "MG Proxi", gouvernorat: "Ariana", ville: "Borj Louzir", adresse: "Borj Louzir, Ariana", latitude: 36.8700, longitude: 10.1900, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 6, name: "MG Maxi Ezzahra", enseigne: "MG", concept: "MG Maxi", gouvernorat: "Ben Arous", ville: "Ezzahra", adresse: "Ezzahra, Ben Arous", latitude: 36.7450, longitude: 10.3050, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 7, name: "MG Bizerte Centre", enseigne: "MG", concept: "MG Maxi", gouvernorat: "Bizerte", ville: "Bizerte", adresse: "Centre Ville, Bizerte", latitude: 37.2744, longitude: 9.8739, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 8, name: "MG Hammamet", enseigne: "MG", concept: "MG Maxi", gouvernorat: "Nabeul", ville: "Hammamet", adresse: "Centre Ville, Hammamet", latitude: 36.4000, longitude: 10.6167, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 9, name: "MG Nabeul Centre", enseigne: "MG", concept: "MG City", gouvernorat: "Nabeul", ville: "Nabeul", adresse: "Centre Ville, Nabeul", latitude: 36.4513, longitude: 10.7357, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 10, name: "MG Sousse Centre", enseigne: "MG", concept: "MG Maxi", gouvernorat: "Sousse", ville: "Sousse", adresse: "Centre Ville, Sousse", latitude: 35.8288, longitude: 10.6405, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 11, name: "MG Monastir Centre", enseigne: "MG", concept: "MG Maxi", gouvernorat: "Monastir", ville: "Monastir", adresse: "Centre Ville, Monastir", latitude: 35.7643, longitude: 10.8113, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 12, name: "MG Mahdia", enseigne: "MG", concept: "MG City", gouvernorat: "Mahdia", ville: "Mahdia", adresse: "Centre Ville, Mahdia", latitude: 35.5047, longitude: 11.0622, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 13, name: "MG Maxi Sfax", enseigne: "MG", concept: "MG Maxi", gouvernorat: "Sfax", ville: "Sfax", adresse: "Centre Ville, Sfax", latitude: 34.7406, longitude: 10.7603, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 14, name: "MG Beja", enseigne: "MG", concept: "MG City", gouvernorat: "Beja", ville: "Beja", adresse: "Centre Ville, Béja", latitude: 36.7256, longitude: 9.1817, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 15, name: "MG Gabes", enseigne: "MG", concept: "MG Maxi", gouvernorat: "Gabes", ville: "Gabes", adresse: "Centre Ville, Gabès", latitude: 33.8815, longitude: 10.0982, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 16, name: "MG Medenine", enseigne: "MG", concept: "MG City", gouvernorat: "Medenine", ville: "Medenine", adresse: "Centre Ville, Médenine", latitude: 33.3399, longitude: 10.4912, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 17, name: "MG Tozeur", enseigne: "MG", concept: "MG City", gouvernorat: "Tozeur", ville: "Tozeur", adresse: "Centre Ville, Tozeur", latitude: 33.9197, longitude: 8.1336, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 18, name: "MG Kebili", enseigne: "MG", concept: "MG City", gouvernorat: "Kebili", ville: "Kebili", adresse: "Centre Ville, Kébili", latitude: 33.7044, longitude: 8.9714, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 19, name: "MG Zaghouan", enseigne: "MG", concept: "MG City", gouvernorat: "Zaghouan", ville: "Zaghouan", adresse: "Centre Ville, Zaghouan", latitude: 36.4029, longitude: 10.1429, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 20, name: "MG Kef", enseigne: "MG", concept: "MG City", gouvernorat: "Le Kef", ville: "Le Kef", adresse: "Centre Ville, Le Kef", latitude: 36.1826, longitude: 8.7149, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 21, name: "MG Siliana", enseigne: "MG", concept: "MG City", gouvernorat: "Siliana", ville: "Siliana", adresse: "Centre Ville, Siliana", latitude: 36.0849, longitude: 9.3708, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 22, name: "MG Kairouan", enseigne: "MG", concept: "MG Maxi", gouvernorat: "Kairouan", ville: "Kairouan", adresse: "Centre Ville, Kairouan", latitude: 35.6781, longitude: 10.0963, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 23, name: "MG Gafsa", enseigne: "MG", concept: "MG Maxi", gouvernorat: "Gafsa", ville: "Gafsa", adresse: "Centre Ville, Gafsa", latitude: 34.4311, longitude: 8.7842, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },

    // === BATAM STORES (19) ===
    { id: 24, name: "Batam Avenue de Paris", enseigne: "Batam", concept: "Batam", gouvernorat: "Tunis", ville: "Tunis", adresse: "Avenue de Paris, Tunis", latitude: 36.7980, longitude: 10.1800, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 25, name: "Batam Jean Jaurès", enseigne: "Batam", concept: "Batam", gouvernorat: "Tunis", ville: "Tunis", adresse: "Avenue Jean Jaurès, Tunis", latitude: 36.8050, longitude: 10.1780, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 26, name: "Batam Ariana", enseigne: "Batam", concept: "Batam", gouvernorat: "Ariana", ville: "Ariana", adresse: "Centre Ville, Ariana", latitude: 36.8663, longitude: 10.1647, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 27, name: "Batam Megrine", enseigne: "Batam", concept: "Batam", gouvernorat: "Ben Arous", ville: "Megrine", adresse: "Centre Ville, Mégrine", latitude: 36.7678, longitude: 10.2342, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 28, name: "Batam Sousse Trocadero", enseigne: "Batam", concept: "Batam", gouvernorat: "Sousse", ville: "Sousse", adresse: "Trocadéro, Sousse", latitude: 35.8288, longitude: 10.6405, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 29, name: "Batam Monastir", enseigne: "Batam", concept: "Batam", gouvernorat: "Monastir", ville: "Monastir", adresse: "Centre Ville, Monastir", latitude: 35.7643, longitude: 10.8113, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 30, name: "Batam Sfax", enseigne: "Batam", concept: "Batam", gouvernorat: "Sfax", ville: "Sfax", adresse: "Centre Ville, Sfax", latitude: 34.7406, longitude: 10.7603, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 31, name: "Batam Gabes", enseigne: "Batam", concept: "Batam", gouvernorat: "Gabes", ville: "Gabes", adresse: "Centre Ville, Gabès", latitude: 33.8815, longitude: 10.0982, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 32, name: "Batam Gafsa", enseigne: "Batam", concept: "Batam", gouvernorat: "Gafsa", ville: "Gafsa", adresse: "Centre Ville, Gafsa", latitude: 34.4311, longitude: 8.7842, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 33, name: "Batam Hammamet", enseigne: "Batam", concept: "Batam", gouvernorat: "Nabeul", ville: "Hammamet", adresse: "Centre Ville, Hammamet", latitude: 36.4000, longitude: 10.6167, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 34, name: "Batam Djerba", enseigne: "Batam", concept: "Batam", gouvernorat: "Medenine", ville: "Djerba", adresse: "Houmt Souk, Djerba", latitude: 33.8076, longitude: 10.8451, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 35, name: "Batam Beja", enseigne: "Batam", concept: "Batam", gouvernorat: "Beja", ville: "Beja", adresse: "Centre Ville, Béja", latitude: 36.7256, longitude: 9.1817, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 36, name: "Batam Zaghouan", enseigne: "Batam", concept: "Batam", gouvernorat: "Zaghouan", ville: "Zaghouan", adresse: "Centre Ville, Zaghouan", latitude: 36.4029, longitude: 10.1429, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 37, name: "Batam Kairouan", enseigne: "Batam", concept: "Batam", gouvernorat: "Kairouan", ville: "Kairouan", adresse: "Centre Ville, Kairouan", latitude: 35.6781, longitude: 10.0963, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 38, name: "Batam Jendouba", enseigne: "Batam", concept: "Batam", gouvernorat: "Jendouba", ville: "Jendouba", adresse: "Centre Ville, Jendouba", latitude: 36.5011, longitude: 8.7803, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 39, name: "Batam Sidi Bouzid", enseigne: "Batam", concept: "Batam", gouvernorat: "Sidi Bouzid", ville: "Sidi Bouzid", adresse: "Centre Ville, Sidi Bouzid", latitude: 35.0382, longitude: 9.4858, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 40, name: "Batam Kef", enseigne: "Batam", concept: "Batam", gouvernorat: "Le Kef", ville: "Le Kef", adresse: "Centre Ville, Le Kef", latitude: 36.1826, longitude: 8.7149, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 41, name: "Batam Tozeur", enseigne: "Batam", concept: "Batam", gouvernorat: "Tozeur", ville: "Tozeur", adresse: "Centre Ville, Tozeur", latitude: 33.9197, longitude: 8.1336, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
    { id: 42, name: "Batam Ain Zaghouan", enseigne: "Batam", concept: "Batam", gouvernorat: "Tunis", ville: "Tunis", adresse: "Ain Zaghouan, Tunis", latitude: 36.7850, longitude: 10.1650, horaires_ouverture: "08:00", horaires_fermeture: "20:00" },
];

// ============================================
// STORE MARKER COMPONENT
// ============================================
const StoreMarker = ({ store, isSelected, isHovered, onClick }) => {
    const isBatam = store?.enseigne === 'Batam';
    const mainColor = isBatam ? '#2D2D5F' : '#E11F26';
    const isActive = isSelected || isHovered;
    const storeName = store?.name || store?.nom || 'Magasin';

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onClick && onClick();
            }}
            style={{
                position: 'absolute',
                transform: 'translate(-50%, -100%)',
                cursor: 'pointer',
                zIndex: isActive ? 1000 : 10,
            }}
        >
            {isSelected && (
                <div
                    style={{
                        position: 'absolute',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: mainColor,
                        opacity: 0.3,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        animation: 'pulse 1.5s ease-out infinite',
                    }}
                />
            )}

            <div
                style={{
                    width: isActive ? '48px' : '38px',
                    height: isActive ? '48px' : '38px',
                    backgroundColor: mainColor,
                    borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid white',
                    boxShadow: isActive ? '0 8px 25px rgba(0,0,0,0.4)' : '0 4px 15px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s ease',
                }}
            >
                <FaStore style={{ transform: 'rotate(45deg)', color: 'white', fontSize: isActive ? '18px' : '14px' }} />
            </div>

            {isActive && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: '12px',
                        backgroundColor: mainColor,
                        color: 'white',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
                    }}
                >
                    {storeName}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '-8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderTop: `8px solid ${mainColor}`,
                        }}
                    />
                </div>
            )}
        </div>
    );
};

// ============================================
// STORE CARD COMPONENT
// ============================================
const StoreCard = ({ store, isSelected, onClick, onHover, onLeave }) => {
    const isBatam = store.enseigne === 'Batam';
    const mainColor = isBatam ? '#2D2D5F' : '#E11F26';

    const getConceptLabel = () => {
        if (isBatam) return 'Batam';
        if (store.concept) return store.concept.split(' ').pop();
        return 'MG';
    };

    const getConceptColors = () => {
        if (isBatam) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        switch (store.concept) {
            case 'MG Maxi': return 'bg-red-50 text-red-700 border-red-200';
            case 'MG City': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'MG Proxi': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            className={`relative p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden bg-white ${isSelected ? 'shadow-2xl' : 'shadow-sm hover:shadow-xl'}`}
            style={{ borderColor: isSelected ? mainColor : '#f3f4f6' }}
        >
            <div className="absolute left-0 top-0 bottom-0 w-1 transition-opacity duration-300" style={{ backgroundColor: mainColor, opacity: isSelected ? 1 : 0 }} />

            <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300" style={{ backgroundColor: isSelected ? mainColor : `${mainColor}15` }}>
                    <FaStore className="text-lg transition-colors duration-300" style={{ color: isSelected ? 'white' : mainColor }} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{store.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <FaMapMarkerAlt className="flex-shrink-0 text-gray-400" />
                        <span className="truncate">{store.ville || store.gouvernorat}</span>
                    </p>
                </div>
                <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getConceptColors()}`}>
                    {getConceptLabel()}
                </span>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{store.adresse}</p>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-gray-600">{store.horaires_ouverture} - {store.horaires_fermeture}</span>
                </div>
                <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide hover:underline"
                    style={{ color: mainColor }}
                >
                    <FaDirections />
                    <span>Itinéraire</span>
                </a>
            </div>
        </motion.div>
    );
};

// ============================================
// MAIN STORES COMPONENT
// ============================================
const Stores = () => {
    const dispatch = useDispatch();
    const apiStores = useSelector(selectAllStores);
    const loading = useSelector(selectStoresLoading);

    // Utiliser données locales OU API (priorité aux données locales avec coordonnées)
    const stores = STORES_DATA;

    const [selectedStore, setSelectedStore] = useState(null);
    const [hoveredStore, setHoveredStore] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [center, setCenter] = useState({ lat: 36.8065, lng: 10.1815 });
    const [zoom, setZoom] = useState(7);
    const [showMobileMap, setShowMobileMap] = useState(false);

    useEffect(() => {
        dispatch(fetchStores());
    }, [dispatch]);

    const filteredStores = stores.filter((store) => {
        const query = searchQuery.toLowerCase();
        return (
            store.name.toLowerCase().includes(query) ||
            store.ville.toLowerCase().includes(query) ||
            store.gouvernorat.toLowerCase().includes(query) ||
            store.enseigne.toLowerCase().includes(query) ||
            store.adresse.toLowerCase().includes(query) ||
            store.concept.toLowerCase().includes(query)
        );
    });

    const handleStoreClick = useCallback((store) => {
        setSelectedStore(store);
        setCenter({ lat: store.latitude, lng: store.longitude });
        setZoom(14);
        if (window.innerWidth < 1024) setShowMobileMap(true);
    }, []);

    const mapOptions = {
        fullscreenControl: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ],
    };

    const renderMap = () => (
        <GoogleMapReact bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }} center={center} zoom={zoom} options={mapOptions}>
            {filteredStores.map((store) => (
                <StoreMarker
                    key={store.id}
                    lat={store.latitude}
                    lng={store.longitude}
                    store={store}
                    isSelected={selectedStore?.id === store.id}
                    isHovered={hoveredStore?.id === store.id}
                    onClick={() => handleStoreClick(store)}
                />
            ))}
        </GoogleMapReact>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <style>{`
                @keyframes pulse {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
                    100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
                }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
            `}</style>

            <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">NOS MAGASINS</h1>
                    <p className="mt-2 text-[#E11F26] font-semibold text-sm sm:text-base">MG & BATAM : Trouvez votre magasin</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    <div className="w-full lg:w-[420px] xl:w-[450px] flex-shrink-0">
                        <div className="sticky top-4 z-20 mb-4">
                            <div className="relative">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Ville, nom, MG ou Batam..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 bg-white shadow-lg focus:border-[#E11F26] focus:ring-4 focus:ring-red-100 transition-all outline-none text-gray-900 placeholder-gray-400"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">
                                        <FaTimes size={12} />
                                    </button>
                                )}
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm text-gray-500 font-medium">{filteredStores.length} magasin{filteredStores.length > 1 ? 's' : ''} trouvé{filteredStores.length > 1 ? 's' : ''}</span>
                                <button onClick={() => setShowMobileMap(true)} className="lg:hidden flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#E11F26] to-[#c91920] text-white rounded-xl text-sm font-bold shadow-lg">
                                    <FaMap /> Voir la carte
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 pb-6 custom-scrollbar">
                            {filteredStores.length > 0 ? (
                                <AnimatePresence mode="popLayout">
                                    {filteredStores.map((store, index) => (
                                        <motion.div key={store.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                                            <StoreCard store={store} isSelected={selectedStore?.id === store.id} onClick={() => handleStoreClick(store)} onHover={() => setHoveredStore(store)} onLeave={() => setHoveredStore(null)} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            ) : (
                                <div className="text-center py-16">
                                    <FaStore className="text-5xl text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-semibold">Aucun magasin trouvé</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hidden lg:block flex-1 h-[calc(100vh-200px)] min-h-[500px] rounded-3xl overflow-hidden shadow-2xl sticky top-6 border-4 border-white">
                        {renderMap()}
                        <AnimatePresence>
                            {selectedStore && (
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="absolute bottom-6 left-6 right-6 max-w-md bg-white rounded-2xl shadow-2xl p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: selectedStore.enseigne === 'Batam' ? '#2D2D5F' : '#E11F26' }}>
                                            <FaStore className="text-white text-xl" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-lg truncate">{selectedStore.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{selectedStore.adresse}</p>
                                            <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                                                <FaClock className="text-green-500" /> {selectedStore.horaires_ouverture} - {selectedStore.horaires_fermeture}
                                            </p>
                                        </div>
                                        <button onClick={() => setSelectedStore(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">
                                            <FaTimes size={14} />
                                        </button>
                                    </div>
                                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStore.latitude},${selectedStore.longitude}`} target="_blank" rel="noopener noreferrer" className="mt-4 w-full py-3.5 rounded-xl text-white font-bold text-center flex items-center justify-center gap-2" style={{ backgroundColor: selectedStore.enseigne === 'Batam' ? '#2D2D5F' : '#E11F26' }}>
                                        <FaDirections /> Obtenir l'itinéraire
                                    </a>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showMobileMap && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/60" onClick={() => setShowMobileMap(false)} />
                        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-3xl overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-14 bg-white z-10 flex items-center justify-center border-b">
                                <div className="w-12 h-1.5 rounded-full bg-gray-300" />
                                <button onClick={() => setShowMobileMap(false)} className="absolute right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <FaTimes className="text-gray-500" />
                                </button>
                            </div>
                            <div className="w-full h-full pt-14">{renderMap()}</div>
                            {selectedStore && (
                                <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t shadow-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: selectedStore.enseigne === 'Batam' ? '#2D2D5F' : '#E11F26' }}>
                                            <FaStore className="text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 truncate">{selectedStore.name}</h3>
                                            <p className="text-xs text-gray-500 truncate">{selectedStore.adresse}</p>
                                        </div>
                                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStore.latitude},${selectedStore.longitude}`} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl text-white font-bold text-sm" style={{ backgroundColor: selectedStore.enseigne === 'Batam' ? '#2D2D5F' : '#E11F26' }}>
                                            Y aller
                                        </a>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Stores;