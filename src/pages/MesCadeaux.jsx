import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { API_ENDPOINTS, getAuthHeaders, handleApiError } from "../services/api";
import { toast } from "react-hot-toast";
import { fetchUserProfile } from "../store/slices/user";
import { 
  FaArrowLeft, 
  FaSpinner, 
  FaCoins,
  FaCalendarAlt,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaCopy,
  FaChevronLeft,
  FaWallet,
  FaGift,
  FaHistory,
  FaDownload,
  FaQrcode,
  FaEye,
  FaBox,
  FaTag
} from "react-icons/fa";
import { MdCardGiftcard, MdQrCode, MdLocalOffer } from "react-icons/md";

const MesCadeaux = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { Userprofile, loading: userLoading } = useSelector((state) => state.user);
  const { isLoggedIn } = useSelector((state) => state.auth);
  
  const [acquisitions, setAcquisitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedAcquisition, setSelectedAcquisition] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Récupérer le profil utilisateur au chargement
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    fetchAcquisitions();
  }, [selectedTab]);

  const fetchAcquisitions = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      toast.error("Veuillez vous connecter");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      let url = API_ENDPOINTS.CADEAUX.MY_ACQUISITIONS;
      
      if (selectedTab !== "all") {
        url += `?statut=${selectedTab}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setAcquisitions(result.data || []);
      } else {
        setAcquisitions([]);
      }
    } catch (error) {
      console.error('Erreur chargement acquisitions:', error);
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Code copié !");
    }).catch(() => {
      toast.error("Impossible de copier le code");
    });
  };

  // Générer l'URL du QR code via l'API QR Server
  const getQRCodeUrl = (codeValue) => {
    const encodedCode = encodeURIComponent(codeValue);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedCode}&bgcolor=fff&color=2563eb&qzone=2`;
  };

  // Télécharger le QR code
  const downloadQRCode = (codeValue, fileName) => {
    const qrUrl = getQRCodeUrl(codeValue);
    fetch(qrUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName || 'cadeau'}_qrcode.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("QR Code téléchargé !");
      })
      .catch(() => {
        toast.error("Erreur lors du téléchargement");
      });
  };

  const openDetailModal = (acquisition) => {
    setSelectedAcquisition(acquisition);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedAcquisition(null);
    setShowDetailModal(false);
  };

  const getStatusBadge = (acquisition) => {
    if (acquisition.statut === 'used') {
      return (
        <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-bold">
          <FaTimesCircle />
          Utilisé
        </span>
      );
    }
    
    if (isExpired(acquisition.date_expiration)) {
      return (
        <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold">
          <FaClock />
          Expiré
        </span>
      );
    }
    
    return (
      <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold">
        <FaCheckCircle />
        Actif
      </span>
    );
  };

  const getStatusBadgeForModal = (acquisition) => {
    if (acquisition.statut === 'used') {
      return (
        <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-bold">
          <FaTimesCircle />
          Utilisé
        </span>
      );
    }
    
    if (isExpired(acquisition.date_expiration)) {
      return (
        <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold">
          <FaClock />
          Expiré
        </span>
      );
    }
    
    return (
      <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold">
        <FaCheckCircle />
        Actif
      </span>
    );
  };

  const filteredAcquisitions = acquisitions.filter(acq => {
    if (selectedTab === "all") return true;
    if (selectedTab === "active") return acq.statut === "active" && !isExpired(acq.date_expiration);
    if (selectedTab === "used") return acq.statut === "used" || isExpired(acq.date_expiration);
    return true;
  });

  const userCagnotte = parseFloat(Userprofile?.cagnotte_balance || 0);

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Chargement de vos cadeaux...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header moderne cohérent avec Catalogue */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/catalogue')}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 transition-all duration-200"
            >
              <FaChevronLeft className="text-sm" />
              <span className="font-medium text-xs">Retour</span>
            </button>
            
            {/* Cagnotte rapide */}
            <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
              <div className="flex items-center gap-2">
                <FaWallet className="text-amber-300 text-sm" />
                <span className="text-white font-bold text-md">{userCagnotte.toFixed(2)} DT</span>
              </div>
            </div>
          </div>
          
          {/* Titre */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 mb-3">
              <FaHistory className="text-2xl" />
              <h1 className="text-2xl font-bold">
                Mes Cadeaux
              </h1>
            </div>
            <p className="text-white/80 text-sm">
              Gérez et utilisez vos cadeaux acquis
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Section statistiques compacte */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Votre collection
                </h2>
                <p className="text-gray-600 text-xs">
                  Résumé de vos cadeaux acquis
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <FaGift className="text-sm text-white" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg p-3 border border-blue-100 group hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-md flex items-center justify-center">
                    <FaGift className="text-sm text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      {acquisitions.length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white to-green-50 rounded-lg p-3 border border-green-100 group hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-md flex items-center justify-center">
                    <FaCheckCircle className="text-sm text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Actifs</p>
                    <p className="text-lg font-bold text-gray-900">
                      {acquisitions.filter(a => a.statut === "active" && !isExpired(a.date_expiration)).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-3 border border-gray-100 group hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex items-center justify-center">
                    <FaTimesCircle className="text-sm text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Utilisés</p>
                    <p className="text-lg font-bold text-gray-900">
                      {acquisitions.filter(a => a.statut === "used").length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white to-orange-50 rounded-lg p-3 border border-orange-100 group hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-md flex items-center justify-center">
                    <FaClock className="text-sm text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Expirés</p>
                    <p className="text-lg font-bold text-gray-900">
                      {acquisitions.filter(a => isExpired(a.date_expiration)).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs filtres */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => setSelectedTab("all")}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                selectedTab === "all"
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Tous ({acquisitions.length})
            </button>
            <button
              onClick={() => setSelectedTab("active")}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                selectedTab === "active"
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Actifs ({acquisitions.filter(a => a.statut === "active" && !isExpired(a.date_expiration)).length})
            </button>
            <button
              onClick={() => setSelectedTab("used")}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                selectedTab === "used"
                  ? 'bg-gradient-to-r from-gray-600 to-slate-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Utilisés/Expirés ({acquisitions.filter(a => a.statut === "used" || isExpired(a.date_expiration)).length})
            </button>
          </div>
        </div>

        {/* Liste des acquisitions */}
        <div className="max-w-6xl mx-auto">
          {filteredAcquisitions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="text-8xl mb-6">📦</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Aucun cadeau dans cette catégorie
              </h2>
              <p className="text-gray-600 mb-6">
                {selectedTab === "all" 
                  ? "Vous n'avez pas encore acquis de cadeaux."
                  : selectedTab === "active"
                  ? "Aucun cadeau actif pour le moment."
                  : "Aucun cadeau utilisé ou expiré."}
              </p>
              <button
                onClick={() => navigate('/cadeaux')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Découvrir les cadeaux
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAcquisitions.map((acquisition) => {
                const estExpire = isExpired(acquisition.date_expiration);
                const estUtilise = acquisition.statut === 'used';
                const estActif = acquisition.statut === 'active' && !estExpire;

                return (
                  <div 
                    key={acquisition.id}
                    className={`group bg-white rounded-2xl shadow-lg border-2 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
                      estActif ? 'border-green-200 hover:border-green-300' :
                      estExpire ? 'border-orange-200 hover:border-orange-300' :
                      'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                      {acquisition.cadeau?.image ? (
                        <img
                          src={acquisition.cadeau.image}
                          alt={acquisition.cadeau?.titre || 'Cadeau'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=Cadeau';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MdCardGiftcard className="text-6xl text-blue-400" />
                        </div>
                      )}
                      
                      {/* Badge statut */}
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(acquisition)}
                      </div>

                      {/* Mini QR code preview */}
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                        <FaQrcode className="text-2xl text-blue-600" />
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                        {acquisition.cadeau?.titre || 'Cadeau'}
                      </h3>

                      {/* Code avec icône copier */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <MdQrCode className="text-blue-600 text-xl flex-shrink-0" />
                          <span className="font-mono font-bold text-gray-800 text-sm truncate">
                            {acquisition.code_cadeau}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(acquisition.code_cadeau);
                          }}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-all ml-2 flex-shrink-0"
                          title="Copier le code"
                        >
                          <FaCopy className="text-blue-600" />
                        </button>
                      </div>

                      {/* Prix */}
                      <div className="flex items-center gap-2 mb-3 text-blue-600">
                        <FaCoins className="text-lg" />
                        <span className="font-bold">
                          {parseFloat(acquisition.cadeau?.prix_cagnotte || 0).toFixed(2)} DT
                        </span>
                      </div>

                      {/* Dates */}
                      <div className="space-y-2 text-xs text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          <span>Acquis le {new Date(acquisition.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                        
                        {acquisition.date_expiration && (
                          <div className={`flex items-center gap-2 ${estExpire ? 'text-orange-600 font-semibold' : ''}`}>
                            <FaClock className={estExpire ? 'text-orange-600' : 'text-blue-400'} />
                            <span>
                              {estExpire ? 'Expiré le' : 'Expire le'} {new Date(acquisition.date_expiration).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        )}

                        {acquisition.date_utilisation && (
                          <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <FaCheckCircle />
                            <span>Utilisé le {new Date(acquisition.date_utilisation).toLocaleDateString('fr-FR')}</span>
                          </div>
                        )}
                      </div>

                      {/* BOUTON VOIR DÉTAILS */}
                      <button
                        onClick={() => openDetailModal(acquisition)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                      >
                        <FaEye className="text-sm" />
                        Voir détails
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails avec couleurs unifiées */}
      {showDetailModal && selectedAcquisition && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header avec couleurs unifiées */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 rounded-t-3xl sticky top-0 z-10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">🎁 Détails du Cadeau</h2>
                <button
                  onClick={closeDetailModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
              {/* Status badge dans le header */}
              <div className="flex justify-center">
                {getStatusBadgeForModal(selectedAcquisition)}
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* QR Code réel généré avec couleurs unifiées */}
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1 rounded-2xl shadow-xl">
                  <div className="bg-white p-4 rounded-xl">
                    <img 
                      src={getQRCodeUrl(selectedAcquisition.code_cadeau)}
                      alt="QR Code"
                      className="w-64 h-64 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Bouton télécharger QR code */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => downloadQRCode(
                    selectedAcquisition.code_cadeau, 
                    selectedAcquisition.cadeau?.titre || 'cadeau'
                  )}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-lg"
                >
                  <FaDownload />
                  Télécharger le QR Code
                </button>
              </div>

              {/* Code avec bouton copier */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">Code d'acquisition</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-2xl font-mono font-bold text-blue-600">
                    {selectedAcquisition.code_cadeau}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(selectedAcquisition.code_cadeau);
                    }}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all"
                    title="Copier le code"
                  >
                    <FaCopy className="text-blue-600" />
                  </button>
                </div>
              </div>

              {/* Cadeau Info avec couleurs unifiées */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {selectedAcquisition.cadeau?.titre}
                </h3>
                
                {selectedAcquisition.cadeau?.description && (
                  <p className="text-sm text-gray-700 mb-4">
                    {selectedAcquisition.cadeau.description}
                  </p>
                )}

                <div className="space-y-3">
                  {/* Prix */}
                  <div className="flex items-center gap-2 text-blue-600">
                    <FaCoins className="text-lg" />
                    <span className="font-bold">
                      {parseFloat(selectedAcquisition.cadeau?.prix_cagnotte || 0).toFixed(2)} DT
                    </span>
                  </div>

                  {/* Partenaire */}
                  {selectedAcquisition.cadeau?.partenaire && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MdLocalOffer className="text-blue-500" />
                      <span className="font-semibold">Partenaire:</span>
                      <span>{selectedAcquisition.cadeau.partenaire}</span>
                    </div>
                  )}

                  {/* Catégorie */}
                  {selectedAcquisition.cadeau?.categorie && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <FaTag className="text-blue-500" />
                      <span className="font-semibold">Catégorie:</span>
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-xs font-bold">
                        {selectedAcquisition.cadeau.categorie}
                      </span>
                    </div>
                  )}

                  {/* Quantité */}
                  {selectedAcquisition.cadeau?.quantite_disponible !== undefined && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <FaBox className="text-blue-500" />
                      <span className="font-semibold">Quantité:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {selectedAcquisition.cadeau.quantite_disponible} unité(s)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates avec style cohérent */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 mb-6 border border-gray-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Date d'acquisition</span>
                  <span className="font-semibold text-gray-800 text-sm">
                    {formatDate(selectedAcquisition.created_at)}
                  </span>
                </div>

                {selectedAcquisition.date_expiration && (
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isExpired(selectedAcquisition.date_expiration) ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                      Date d'expiration
                    </span>
                    <span className={`font-semibold text-sm ${isExpired(selectedAcquisition.date_expiration) ? 'text-orange-600' : 'text-blue-600'}`}>
                      {formatDate(selectedAcquisition.date_expiration)}
                    </span>
                  </div>
                )}

                {selectedAcquisition.date_utilisation && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 text-sm">Date d'utilisation</span>
                    <span className="font-semibold text-green-600 text-sm">
                      {formatDate(selectedAcquisition.date_utilisation)}
                    </span>
                  </div>
                )}
              </div>

              {/* Conditions */}
              {selectedAcquisition.cadeau?.conditions && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 text-lg">📋</span>
                    <div>
                      <p className="text-sm font-semibold text-blue-800 mb-1">Conditions d'utilisation</p>
                      <p className="text-sm text-blue-700">
                        {selectedAcquisition.cadeau.conditions}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions pour utilisation */}
              {selectedAcquisition.statut === 'active' && !isExpired(selectedAcquisition.date_expiration) && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">ℹ️</span>
                    <div>
                      <p className="text-sm font-semibold text-green-800 mb-1">Instructions d'utilisation</p>
                      <p className="text-sm text-green-700">
                        Présentez ce QR code ou le code d'acquisition au partenaire pour utiliser votre cadeau.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Message si cadeau expiré */}
              {isExpired(selectedAcquisition.date_expiration) && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600 text-lg">⚠️</span>
                    <div>
                      <p className="text-sm font-semibold text-orange-800 mb-1">Cadeau expiré</p>
                      <p className="text-sm text-orange-700">
                        Ce cadeau a expiré le {new Date(selectedAcquisition.date_expiration).toLocaleDateString('fr-FR')} et n'est plus utilisable.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Message si cadeau utilisé */}
              {selectedAcquisition.statut === 'used' && (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-600 text-lg">✅</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">Cadeau utilisé</p>
                      <p className="text-sm text-gray-700">
                        Ce cadeau a été utilisé le {new Date(selectedAcquisition.date_utilisation).toLocaleDateString('fr-FR')}.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MesCadeaux;