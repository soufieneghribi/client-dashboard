import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, getAuthHeaders, handleApiError } from "../services/api";
import { toast } from "react-hot-toast";
import { 
  FaArrowLeft, 
  FaSpinner, 
  FaCoins,
  FaCalendarAlt,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaCopy
} from "react-icons/fa";
import { MdCardGiftcard, MdQrCode } from "react-icons/md";

const MesCadeaux = () => {
  const navigate = useNavigate();
  
  const [acquisitions, setAcquisitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all"); // all, active, used
  const [selectedAcquisition, setSelectedAcquisition] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
      
      // Ajouter le filtre de statut si nécessaire
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
      year: 'numeric'
    });
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Code copié dans le presse-papiers !");
    }).catch(() => {
      toast.error("Impossible de copier le code");
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
        <span className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
          <FaTimesCircle />
          Utilisé
        </span>
      );
    }
    
    if (isExpired(acquisition.date_expiration)) {
      return (
        <span className="flex items-center gap-1 bg-orange-200 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
          <FaClock />
          Expiré
        </span>
      );
    }
    
    return (
      <span className="flex items-center gap-1 bg-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-pink-500 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Chargement de vos cadeaux...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
            >
              <FaArrowLeft className="text-xl" />
              <span className="font-semibold">Retour</span>
            </button>
            
            <div className="text-center flex-1">
              <div className="flex items-center gap-3 justify-center mb-1">
                <MdCardGiftcard className="text-pink-500 text-4xl" />
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  Mes Cadeaux Acquis
                </h1>
              </div>
              <p className="text-gray-600">Consultez et utilisez vos cadeaux</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 justify-center mt-6 flex-wrap">
            <button
              onClick={() => setSelectedTab("all")}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                selectedTab === "all"
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tous ({acquisitions.length})
            </button>
          
       
          </div>
        </div>

        {/* Liste des acquisitions */}
        {filteredAcquisitions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-8xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Aucun cadeau dans cette catégorie
            </h2>
            <p className="text-gray-600 mb-6">
              {selectedTab === "all" 
                ? "Vous n'avez pas encore acquis de cadeaux"
                : selectedTab === "active"
                ? "Vous n'avez pas de cadeaux actifs"
                : "Vous n'avez pas de cadeaux utilisés ou expirés"}
            </p>
            <button
              onClick={() => navigate('/cadeaux')}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all"
            >
              Découvrir les cadeaux
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAcquisitions.map((acquisition) => (
              <div
                key={acquisition.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => openDetailModal(acquisition)}
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100">
                  <img
                    src={acquisition.cadeau?.image || 'https://via.placeholder.com/300x200?text=Cadeau'}
                    alt={acquisition.cadeau?.titre || 'Cadeau'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Cadeau';
                    }}
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(acquisition)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    {acquisition.cadeau?.titre || 'Cadeau'}
                  </h3>

                  {/* Code */}
                  <div className="bg-gray-100 rounded-lg p-3 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MdQrCode className="text-pink-500 text-xl" />
                      <span className="font-mono font-bold text-gray-800 text-sm">
                        {acquisition.code_acquisition}
                      </span>
                    </div>
                  </div>

                  {/* Prix */}
                  <div className="flex items-center gap-2 mb-3 text-pink-600">
                    <FaCoins className="text-lg" />
                    <span className="font-bold">
                      {parseFloat(acquisition.cadeau?.prix_cagnotte || 0).toFixed(2)} DT
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-400" />
                      <span>Acquis le {formatDate(acquisition.date_acquisition)}</span>
                    </div>
                    
                    {acquisition.date_expiration && (
                      <div className={`flex items-center gap-2 ${isExpired(acquisition.date_expiration) ? 'text-red-600 font-semibold' : ''}`}>
                        <FaCalendarAlt className={isExpired(acquisition.date_expiration) ? 'text-red-600' : 'text-orange-400'} />
                        <span>Expire le {formatDate(acquisition.date_expiration)}</span>
                      </div>
                    )}

                    {acquisition.date_utilisation && (
                      <div className="flex items-center gap-2 text-green-600">
                        <FaCheckCircle />
                        <span>Utilisé le {formatDate(acquisition.date_utilisation)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de détails */}
      {showDetailModal && selectedAcquisition && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">🎁 Détails du Cadeau</h2>
                <button
                  onClick={closeDetailModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* QR Code Placeholder avec design moderne */}
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-pink-500 to-purple-500 p-1 rounded-2xl shadow-xl">
                  <div className="bg-white p-6 rounded-xl">
                    <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center border-4 border-dashed border-pink-300">
                      <div className="text-center">
                        <MdQrCode className="text-6xl text-pink-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">QR Code</p>
                        <p className="text-xs text-gray-400 mt-1">À scanner au magasin</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code avec bouton copier */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">Code d'acquisition</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-2xl font-mono font-bold text-pink-600">
                    {selectedAcquisition.code_acquisition}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(selectedAcquisition.code_acquisition);
                    }}
                    className="p-2 bg-pink-100 hover:bg-pink-200 rounded-lg transition-all"
                    title="Copier le code"
                  >
                    <FaCopy className="text-pink-600" />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-center mb-6">
                {getStatusBadge(selectedAcquisition)}
              </div>

              {/* Cadeau Info */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-5 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {selectedAcquisition.cadeau?.titre}
                </h3>
                
                {selectedAcquisition.cadeau?.description && (
                  <p className="text-sm text-gray-700 mb-4">
                    {selectedAcquisition.cadeau.description}
                  </p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-pink-600">
                    <FaCoins className="text-lg" />
                    <span className="font-bold">
                      {parseFloat(selectedAcquisition.cadeau?.prix_cagnotte || 0).toFixed(2)} DT
                    </span>
                  </div>

                  {selectedAcquisition.cadeau?.partenaire && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <span className="font-semibold">Partenaire:</span>
                      <span>{selectedAcquisition.cadeau.partenaire}</span>
                    </div>
                  )}

                  {selectedAcquisition.cadeau?.categorie && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <span className="font-semibold">Catégorie:</span>
                      <span>{selectedAcquisition.cadeau.categorie}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date d'acquisition</span>
                  <span className="font-semibold text-gray-800">
                    {formatDate(selectedAcquisition.date_acquisition)}
                  </span>
                </div>

                {selectedAcquisition.date_expiration && (
                  <div className="flex justify-between items-center">
                    <span className={isExpired(selectedAcquisition.date_expiration) ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                      Date d'expiration
                    </span>
                    <span className={`font-semibold ${isExpired(selectedAcquisition.date_expiration) ? 'text-red-600' : 'text-orange-600'}`}>
                      {formatDate(selectedAcquisition.date_expiration)}
                    </span>
                  </div>
                )}

                {selectedAcquisition.date_utilisation && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">Date d'utilisation</span>
                    <span className="font-semibold text-green-600">
                      {formatDate(selectedAcquisition.date_utilisation)}
                    </span>
                  </div>
                )}
              </div>

              {/* Conditions */}
              {selectedAcquisition.cadeau?.conditions && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>📋 Conditions:</strong> {selectedAcquisition.cadeau.conditions}
                  </p>
                </div>
              )}

              {/* Instructions pour utilisation */}
              {selectedAcquisition.statut === 'active' && !isExpired(selectedAcquisition.date_expiration) && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-800">
                    <strong>ℹ️ Instructions:</strong> Présentez ce code au partenaire pour utiliser votre cadeau.
                  </p>
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