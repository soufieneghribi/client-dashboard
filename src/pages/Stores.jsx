import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GoogleMapReact from 'google-map-react';
import { FaStore, FaClock, FaDirections, FaSearch, FaTimes, FaMapMarkerAlt, FaMap, FaTruck, FaShoppingBag, FaCar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { GOOGLE_MAPS_API_KEY } from '../services/api';
import { fetchStores, selectAllStores, selectStoresLoading, selectStoresError } from '../store/slices/stores';

// ============================================
// GEOCODING: Coordonnées GPS par ville tunisienne
// ============================================
const CITY_COORDINATES = {
    'tunis': { lat: 36.8065, lng: 10.1815 },
    'ariana': { lat: 36.8663, lng: 10.1647 },
    'ben arous': { lat: 36.7533, lng: 10.2283 },
    'manouba': { lat: 36.8101, lng: 10.0956 },
    'bizerte': { lat: 37.2744, lng: 9.8739 },
    'nabeul': { lat: 36.4513, lng: 10.7357 },
    'hammamet': { lat: 36.4000, lng: 10.6167 },
    'sousse': { lat: 35.8288, lng: 10.6405 },
    'monastir': { lat: 35.7643, lng: 10.8113 },
    'mahdia': { lat: 35.5047, lng: 11.0622 },
    'sfax': { lat: 34.7406, lng: 10.7603 },
    'kairouan': { lat: 35.6781, lng: 10.0963 },
    'béja': { lat: 36.7256, lng: 9.1817 },
    'beja': { lat: 36.7256, lng: 9.1817 },
    'jendouba': { lat: 36.5011, lng: 8.7803 },
    'le kef': { lat: 36.1826, lng: 8.7149 },
    'siliana': { lat: 36.0849, lng: 9.3708 },
    'zaghouan': { lat: 36.4029, lng: 10.1429 },
    'gabès': { lat: 33.8815, lng: 10.0982 },
    'gabes': { lat: 33.8815, lng: 10.0982 },
    'médenine': { lat: 33.3399, lng: 10.4912 },
    'medenine': { lat: 33.3399, lng: 10.4912 },
    'djerba': { lat: 33.8076, lng: 10.8451 },
    'tozeur': { lat: 33.9197, lng: 8.1336 },
    'kébili': { lat: 33.7044, lng: 8.9714 },
    'kebili': { lat: 33.7044, lng: 8.9714 },
    'gafsa': { lat: 34.4311, lng: 8.7842 },
    'sidi bouzid': { lat: 35.0382, lng: 9.4858 },
    'kasserine': { lat: 35.1676, lng: 8.8365 },
    'tataouine': { lat: 32.9297, lng: 10.4518 },
    'ezzahra': { lat: 36.7450, lng: 10.3050 },
    'megrine': { lat: 36.7678, lng: 10.2342 },
    'borj louzir': { lat: 36.8700, lng: 10.1900 },
    'lafayette': { lat: 36.8123, lng: 10.1834 },
    'el menzah': { lat: 36.8412, lng: 10.1710 },
};

const getStoreCoordinates = (store) => {
    if (store.latitude && store.longitude) {
        return { lat: parseFloat(store.latitude), lng: parseFloat(store.longitude) };
    }
    const city = (store.city || store.ville || '').toLowerCase().trim();
    if (CITY_COORDINATES[city]) return CITY_COORDINATES[city];

    // Essayer avec des parties du nom de la ville
    for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
        if (city.includes(key) || key.includes(city)) return coords;
    }

    // Fallback: centre de la Tunisie
    return { lat: 35.5, lng: 10.0 };
};

// ============================================
// HELPERS
// ============================================
const getEnseigneName = (store) =>
    store.store_list?.enseigne?.name || store.enseigne || 'MG';

const getRegionName = (store) =>
    store.store_list?.name || store.gouvernorat || '';

const getStoreAddress = (store) =>
    store.address || store.adresse || store.city || '';

const getStoreCity = (store) =>
    store.city || store.ville || '';

const isBatamStore = (store) =>
    getEnseigneName(store).toLowerCase().includes('batam');

const getMainColor = (store) =>
    isBatamStore(store) ? '#2D2D5F' : '#E11F26';

// ============================================
// STORE MARKER (Google Maps)
// ============================================
const StoreMarker = ({ store, isSelected, isHovered, onClick }) => {
    const mainColor = getMainColor(store);
    const isActive = isSelected || isHovered;

    return (
        <div
            onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
            style={{
                position: 'absolute',
                transform: 'translate(-50%, -100%)',
                cursor: 'pointer',
                zIndex: isActive ? 1000 : 10,
            }}
        >
            {isSelected && (
                <div style={{
                    position: 'absolute', width: '50px', height: '50px',
                    borderRadius: '50%', backgroundColor: mainColor, opacity: 0.3,
                    top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    animation: 'pulse 1.5s ease-out infinite',
                }} />
            )}

            <div style={{
                width: isActive ? '48px' : '38px',
                height: isActive ? '48px' : '38px',
                backgroundColor: mainColor,
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid white',
                boxShadow: isActive ? '0 8px 25px rgba(0,0,0,0.4)' : '0 4px 15px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease',
            }}>
                <FaStore style={{ transform: 'rotate(45deg)', color: 'white', fontSize: isActive ? '18px' : '14px' }} />
            </div>

            {isActive && (
                <div style={{
                    position: 'absolute', bottom: '100%', left: '50%',
                    transform: 'translateX(-50%)', marginBottom: '12px',
                    backgroundColor: mainColor, color: 'white',
                    padding: '8px 14px', borderRadius: '10px',
                    fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
                }}>
                    {store.name}
                    <div style={{
                        position: 'absolute', bottom: '-8px', left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0, height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderTop: `8px solid ${mainColor}`,
                    }} />
                </div>
            )}
        </div>
    );
};

// ============================================
// STORE CARD
// ============================================
const StoreCard = ({ store, isSelected, onClick, onHover, onLeave }) => {
    const mainColor = getMainColor(store);
    const enseigne = getEnseigneName(store);
    const city = getStoreCity(store);
    const address = getStoreAddress(store);
    const region = getRegionName(store);

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
            <div className="absolute left-0 top-0 bottom-0 w-1 transition-opacity duration-300"
                style={{ backgroundColor: mainColor, opacity: isSelected ? 1 : 0 }} />

            <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                    style={{ backgroundColor: isSelected ? mainColor : `${mainColor}15` }}>
                    <FaStore className="text-lg transition-colors duration-300"
                        style={{ color: isSelected ? 'white' : mainColor }} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{store.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <FaMapMarkerAlt className="flex-shrink-0 text-gray-400" />
                        <span className="truncate">{city}{region ? ` - ${region}` : ''}</span>
                    </p>
                </div>
                <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    isBatamStore(store)
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                    {enseigne.split(' ').pop()}
                </span>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{address}</p>

            {/* Services */}
            <div className="flex items-center gap-3 mb-3">
                {store.has_delivery && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                        <FaTruck className="text-[10px]" /> Livraison
                    </span>
                )}
                {store.has_pickup && (
                    <span className="flex items-center gap-1 text-xs text-blue-600">
                        <FaShoppingBag className="text-[10px]" /> Retrait
                    </span>
                )}
                {store.has_parking && (
                    <span className="flex items-center gap-1 text-xs text-purple-600">
                        <FaCar className="text-[10px]" /> Parking
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-gray-600">Ouvert</span>
                </div>
                <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${getStoreCoordinates(store).lat},${getStoreCoordinates(store).lng}`}
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
// MAIN STORES PAGE
// ============================================
const Stores = () => {
    const dispatch = useDispatch();
    const stores = useSelector(selectAllStores);
    const loading = useSelector(selectStoresLoading);
    const error = useSelector(selectStoresError);

    const [selectedStore, setSelectedStore] = useState(null);
    const [hoveredStore, setHoveredStore] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [center, setCenter] = useState({ lat: 36.8065, lng: 10.1815 });
    const [zoom, setZoom] = useState(7);
    const [showMobileMap, setShowMobileMap] = useState(false);
    const [selectedEnseigne, setSelectedEnseigne] = useState('all');

    useEffect(() => {
        dispatch(fetchStores());
    }, [dispatch]);

    const enseignes = useMemo(() =>
        [...new Set(stores.map((s) => getEnseigneName(s)))].sort(),
        [stores]
    );

    const filteredStores = useMemo(() => stores.filter((store) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            !query ||
            store.name?.toLowerCase().includes(query) ||
            getStoreCity(store).toLowerCase().includes(query) ||
            getStoreAddress(store).toLowerCase().includes(query) ||
            getEnseigneName(store).toLowerCase().includes(query) ||
            getRegionName(store).toLowerCase().includes(query);

        const matchesEnseigne =
            selectedEnseigne === 'all' ||
            getEnseigneName(store) === selectedEnseigne;

        return matchesSearch && matchesEnseigne;
    }), [stores, searchQuery, selectedEnseigne]);

    const handleStoreClick = useCallback((store) => {
        const coords = getStoreCoordinates(store);
        setSelectedStore(store);
        setCenter(coords);
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
        <GoogleMapReact
            bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
            center={center}
            zoom={zoom}
            options={mapOptions}
        >
            {filteredStores.map((store) => {
                const coords = getStoreCoordinates(store);
                return (
                    <StoreMarker
                        key={store.id}
                        lat={coords.lat}
                        lng={coords.lng}
                        store={store}
                        isSelected={selectedStore?.id === store.id}
                        isHovered={hoveredStore?.id === store.id}
                        onClick={() => handleStoreClick(store)}
                    />
                );
            })}
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

            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">NOTRE RÉSEAU</h1>
                    <p className="mt-2 text-[#E11F26] font-semibold text-sm sm:text-base">
                        {stores.length} magasin{stores.length > 1 ? 's' : ''} à travers la Tunisie
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Left: Search + Store list */}
                    <div className="w-full lg:w-[420px] xl:w-[450px] flex-shrink-0">
                        <div className="sticky top-4 z-20 mb-4">
                            {/* Search */}
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

                            {/* Enseigne filter */}
                            {enseignes.length > 1 && (
                                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                    <button
                                        onClick={() => setSelectedEnseigne('all')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                            selectedEnseigne === 'all'
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                        }`}
                                    >
                                        Tous
                                    </button>
                                    {enseignes.map((enseigne) => {
                                        const isBatam = enseigne.toLowerCase().includes('batam');
                                        return (
                                            <button
                                                key={enseigne}
                                                onClick={() => setSelectedEnseigne(enseigne)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                                    selectedEnseigne === enseigne
                                                        ? 'text-white'
                                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                                }`}
                                                style={selectedEnseigne === enseigne ? { backgroundColor: isBatam ? '#2D2D5F' : '#E11F26' } : {}}
                                            >
                                                {enseigne}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-sm text-gray-500 font-medium">
                                    {filteredStores.length} magasin{filteredStores.length > 1 ? 's' : ''} trouvé{filteredStores.length > 1 ? 's' : ''}
                                </span>
                                <button onClick={() => setShowMobileMap(true)} className="lg:hidden flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#E11F26] to-[#c91920] text-white rounded-xl text-sm font-bold shadow-lg">
                                    <FaMap /> Voir la carte
                                </button>
                            </div>
                        </div>

                        {/* Loading */}
                        {loading && stores.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="w-10 h-10 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mb-3" />
                                <p className="text-gray-500 text-sm">Chargement des magasins...</p>
                            </div>
                        )}

                        {/* Error */}
                        {error && stores.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16">
                                <FaStore className="text-4xl text-gray-300 mb-3" />
                                <p className="text-gray-500 font-semibold mb-3">Erreur de chargement</p>
                                <button onClick={() => dispatch(fetchStores())} className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">
                                    Réessayer
                                </button>
                            </div>
                        )}

                        {/* Store cards */}
                        <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 pb-6 custom-scrollbar">
                            {filteredStores.length > 0 ? (
                                <AnimatePresence mode="popLayout">
                                    {filteredStores.map((store, index) => (
                                        <motion.div key={store.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                                            <StoreCard
                                                store={store}
                                                isSelected={selectedStore?.id === store.id}
                                                onClick={() => handleStoreClick(store)}
                                                onHover={() => setHoveredStore(store)}
                                                onLeave={() => setHoveredStore(null)}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            ) : !loading && stores.length > 0 ? (
                                <div className="text-center py-16">
                                    <FaStore className="text-5xl text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-semibold">Aucun magasin trouvé</p>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Right: Google Map (Desktop) */}
                    <div className="hidden lg:block flex-1 h-[calc(100vh-200px)] min-h-[500px] rounded-3xl overflow-hidden shadow-2xl sticky top-6 border-4 border-white">
                        {renderMap()}
                        <AnimatePresence>
                            {selectedStore && (
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="absolute bottom-6 left-6 right-6 max-w-md bg-white rounded-2xl shadow-2xl p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: getMainColor(selectedStore) }}>
                                            <FaStore className="text-white text-xl" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-lg truncate">{selectedStore.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{getStoreAddress(selectedStore)}</p>
                                            <p className="text-sm text-gray-400 mt-1">{getRegionName(selectedStore)}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                {selectedStore.has_delivery && <span className="text-xs text-green-600 flex items-center gap-1"><FaTruck className="text-[10px]" /> Livraison</span>}
                                                {selectedStore.has_pickup && <span className="text-xs text-blue-600 flex items-center gap-1"><FaShoppingBag className="text-[10px]" /> Retrait</span>}
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedStore(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">
                                            <FaTimes size={14} />
                                        </button>
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${getStoreCoordinates(selectedStore).lat},${getStoreCoordinates(selectedStore).lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 w-full py-3.5 rounded-xl text-white font-bold text-center flex items-center justify-center gap-2"
                                        style={{ backgroundColor: getMainColor(selectedStore) }}
                                    >
                                        <FaDirections /> Obtenir l'itinéraire
                                    </a>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Mobile Map Modal */}
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
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: getMainColor(selectedStore) }}>
                                            <FaStore className="text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 truncate">{selectedStore.name}</h3>
                                            <p className="text-xs text-gray-500 truncate">{getStoreAddress(selectedStore)}</p>
                                        </div>
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${getStoreCoordinates(selectedStore).lat},${getStoreCoordinates(selectedStore).lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-5 py-2.5 rounded-xl text-white font-bold text-sm"
                                            style={{ backgroundColor: getMainColor(selectedStore) }}
                                        >
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
