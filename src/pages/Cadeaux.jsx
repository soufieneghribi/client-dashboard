import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { API_ENDPOINTS, getAuthHeaders, handleApiError } from "../services/api";
import { toast } from "react-hot-toast";
import { 
  FaArrowLeft, 
  FaSpinner, 
  FaCoins,
  FaBox,
  FaCheckCircle,
  FaCalendarAlt,
  FaTimes,
  FaHistory,
  FaChevronLeft,
  FaWallet,
  FaGift
} from "react-icons/fa";
import { MdCardGiftcard, MdLocalOffer } from "react-icons/md";
import { fetchUserProfile } from "../store/slices/user";

const Cadeaux = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { Userprofile, loading: userLoading } = useSelector((state) => state.user);
  const { isLoggedIn } = useSelector((state) => state.auth);
  
  const [cadeaux, setCadeaux] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState("Tous");
  const [categories, setCategories] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCadeau, setSelectedCadeau] = useState(null);
  const [exchangeLoading, setExchangeLoading] = useState(false);

  // Récupérer le profil utilisateur au chargement
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isLoggedIn]);

  // Récupérer les cadeaux disponibles
  useEffect(() => {
    const fetchCadeaux = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Veuillez vous connecter");
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          API_ENDPOINTS.CADEAUX?.ALL || `${API_ENDPOINTS.BASE_URL || 'https://tn360-back-office-122923924979.europe-west1.run.app/'}/api/v1/cadeaux`,
          {
            method: 'GET',
            headers: getAuthHeaders(token)
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          const cadeauxData = result.data || [];
          setCadeaux(cadeauxData);
          
          // Extraire les catégories uniques
          const uniqueCategories = ["Tous", ...new Set(cadeauxData.map(c => c.categorie).filter(Boolean))];
          setCategories(uniqueCategories);
        } else {
          setCadeaux([]);
        }
      } catch (error) {
        console.error('Erreur chargement cadeaux:', error);
        const errorMessage = handleApiError(error);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCadeaux();
  }, [navigate]);

  // Filtrer les cadeaux par catégorie
  const cadeauxFiltres = selectedCategorie === "Tous" 
    ? cadeaux 
    : cadeaux.filter(c => c.categorie === selectedCategorie);

  // Vérifier si l'utilisateur peut acheter un cadeau
  const canAfford = (prixCagnotte) => {
    const userCagnotte = parseFloat(Userprofile?.cagnotte_balance || 0);
    return userCagnotte >= parseFloat(prixCagnotte);
  };

  // Ouvrir le modal de confirmation
  const openConfirmModal = (cadeau) => {
    if (!canAfford(cadeau.prix_cagnotte)) {
      toast.error("Cagnotte insuffisante pour ce cadeau");
      return;
    }

    if (cadeau.quantite_disponible <= 0) {
      toast.error("Ce cadeau n'est plus disponible");
      return;
    }

    const estExpire = new Date(cadeau.date_fin_validite) < new Date();
    if (estExpire) {
      toast.error("Ce cadeau est expiré");
      return;
    }

    setSelectedCadeau(cadeau);
    setShowConfirmModal(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setShowConfirmModal(false);
    setSelectedCadeau(null);
  };

  // Échanger un cadeau
  const echangerCadeau = async () => {
    if (!selectedCadeau) return;

    const token = localStorage.getItem("token");
    
    if (!token) {
      toast.error("Veuillez vous connecter");
      navigate("/login");
      return;
    }

    setExchangeLoading(true);
    try {
      // ✅ Appel à l'endpoint d'acquisition du cadeau
      const acquireResponse = await fetch(
        API_ENDPOINTS.CADEAUX.ACQUIRE(selectedCadeau.id),
        {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify({})
        }
      );

      const acquireResult = await acquireResponse.json();

      if (acquireResponse.ok && acquireResult.success) {
        // Succès de l'acquisition
        const acquisitionData = acquireResult.data;
        const codeAcquisition = acquisitionData?.acquisition?.code_cadeau;
        
        toast.success(
          `🎁 Cadeau "${selectedCadeau.titre}" acquis avec succès !\n` +
          `Code: ${codeAcquisition || 'Voir dans "Mes Cadeaux"'}`,
          { duration: 5000 }
        );
        
        // Fermer le modal
        closeModal();
        
        // Rafraîchir le profil utilisateur pour mettre à jour la cagnotte
        await dispatch(fetchUserProfile());
        
        // Mettre à jour la quantité disponible du cadeau localement
        const updatedCadeaux = cadeaux.map(c => 
          c.id === selectedCadeau.id 
            ? { ...c, quantite_disponible: Math.max(0, c.quantite_disponible - 1) }
            : c
        );
        setCadeaux(updatedCadeaux);
        
        // Rediriger vers la page "Mes Cadeaux" après 2 secondes
        setTimeout(() => {
          navigate('/mes-cadeaux');
        }, 2000);
        
      } else {
        // Gérer les différentes erreurs
        const errorMessage = acquireResult.message || "Erreur lors de l'acquisition du cadeau";
        
        if (errorMessage.includes("insuffisante")) {
          toast.error("❌ Cagnotte insuffisante pour ce cadeau");
        } else if (errorMessage.includes("disponible")) {
          toast.error("❌ Ce cadeau n'est plus disponible");
        } else if (errorMessage.includes("expiré")) {
          toast.error("❌ Ce cadeau est expiré");
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Erreur acquisition cadeau:', error);
      toast.error(handleApiError(error));
    } finally {
      setExchangeLoading(false);
    }
  };

  const userCagnotte = parseFloat(Userprofile?.cagnotte_balance || 0);

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Chargement des cadeaux...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <MdCardGiftcard className="text-8xl text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Connectez-vous pour accéder aux cadeaux
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header moderne cohérent avec MesCadeaux */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
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
              <FaGift className="text-2xl" />
              <h1 className="text-2xl font-bold">
                 Cadeaux
              </h1>
            </div>
            <p className="text-white/80 text-sm">
              Échangez votre cagnotte contre des cadeaux exclusifs
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
                  Votre sélection
                </h2>
                <p className="text-gray-600 text-xs">
                  Cadeaux disponibles pour échange
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <FaGift className="text-sm text-white" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg p-3 border border-purple-100 group hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-md flex items-center justify-center">
                    <FaGift className="text-sm text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      {cadeaux.length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg p-3 border border-blue-100 group hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-md flex items-center justify-center">
                    <FaWallet className="text-sm text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Votre cagnotte</p>
                    <p className="text-lg font-bold text-gray-900">
                      {userCagnotte.toFixed(2)} DT
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
                    <p className="text-xs font-semibold text-gray-600">Disponibles</p>
                    <p className="text-lg font-bold text-gray-900">
                      {cadeaux.filter(c => c.quantite_disponible > 0 && new Date(c.date_fin_validite) >= new Date()).length}
                    </p>
                  </div>
                </div>
              </div>
              
<div className="bg-gradient-to-br from-white to-purple-50 rounded-lg p-3 border border-purple-100 group hover:shadow-md transition-all duration-200">
  <div className="flex items-center gap-2 mb-1">
    <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-md flex items-center justify-center">
      <FaHistory className="text-sm text-purple-600" />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-600">Mes cadeaux</p>
      <button
        onClick={() => navigate('/mes-cadeaux')}
        className="mt-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow"
      >
        Voir mes cadeaux
      </button>
    </div>
  </div>
</div>
            </div>
          </div>
        </div>

        {/* Filtres par Catégorie */}
        {categories.length > 1 && (
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-5 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Catégories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((categorie) => (
                <button
                  key={categorie}
                  onClick={() => setSelectedCategorie(categorie)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                    selectedCategorie === categorie
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {categorie}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Liste des Cadeaux */}
        <div className="max-w-6xl mx-auto">
          {cadeauxFiltres.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="text-8xl mb-6">🎁</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Aucun cadeau disponible
              </h2>
              <p className="text-gray-600 mb-6">
                {selectedCategorie !== "Tous" 
                  ? `Aucun cadeau dans la catégorie "${selectedCategorie}"`
                  : "Revenez bientôt pour découvrir nos nouveaux cadeaux !"}
              </p>
              <button
                onClick={() => navigate('/catalogue')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Retour au Catalogue
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cadeauxFiltres.map((cadeau) => {
                const peutAcheter = canAfford(cadeau.prix_cagnotte);
                const estDisponible = cadeau.est_publie && cadeau.quantite_disponible > 0;
                const estExpire = new Date(cadeau.date_fin_validite) < new Date();
                
                return (
                  <div
                    key={cadeau.id}
                    className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-300 ${
                      estDisponible && !estExpire && peutAcheter
                        ? 'hover:shadow-2xl hover:-translate-y-1 border-purple-200 hover:border-purple-300'
                        : 'border-gray-200'
                    } ${!(estDisponible && !estExpire) ? 'opacity-60' : ''}`}
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
                      <img
                        src={cadeau.image}
                        alt={cadeau.titre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Cadeau';
                        }}
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-2 right-2 space-y-2">
                        {!estDisponible && (
                          <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold block">
                            Épuisé
                          </span>
                        )}
                        {estExpire && (
                          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold block">
                            Expiré
                          </span>
                        )}
                        {cadeau.categorie && (
                          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold block">
                            {cadeau.categorie}
                          </span>
                        )}
                      </div>

                      {/* Prix en Cagnotte */}
                      <div className="absolute bottom-2 left-2 bg-white rounded-lg px-4 py-2 shadow-lg">
                        <div className="flex items-center gap-2">
                          <FaCoins className="text-yellow-500" />
                          <span className="font-bold text-blue-600 text-lg">
                            {parseFloat(cadeau.prix_cagnotte).toFixed(2)} DT
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                        {cadeau.titre}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3 min-h-[4rem]">
                        {cadeau.description}
                      </p>

                      {/* Partenaire */}
                      {cadeau.partenaire && (
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                          <MdLocalOffer className="text-purple-500" />
                          <span>Par {cadeau.partenaire}</span>
                        </div>
                      )}

                      {/* Dates de validité */}
                      <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                        <FaCalendarAlt className="text-blue-500" />
                        <span>
                          Valide jusqu'au {new Date(cadeau.date_fin_validite).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      {/* Quantité disponible */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <FaBox className="text-purple-500" />
                          <span className="text-gray-600">
                            {cadeau.quantite_disponible} disponible{cadeau.quantite_disponible > 1 ? 's' : ''}
                          </span>
                        </div>
                        {peutAcheter && estDisponible && !estExpire && (
                          <FaCheckCircle className="text-green-500 text-xl" />
                        )}
                      </div>

                      {/* Bouton Échanger */}
                      <button
                        onClick={() => openConfirmModal(cadeau)}
                        disabled={!peutAcheter || !estDisponible || estExpire}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                          peutAcheter && estDisponible && !estExpire
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {!estDisponible
                          ? 'Épuisé'
                          : estExpire
                          ? 'Expiré'
                          : !peutAcheter
                          ? 'Cagnotte insuffisante'
                          : '🎁 Échanger'}
                      </button>

                      {/* Conditions */}
                      {cadeau.conditions && (
                        <p className="text-xs text-gray-500 mt-3 italic">
                          * {cadeau.conditions}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmation */}
      {showConfirmModal && selectedCadeau && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">🎁 Confirmer l'échange</h2>
                <button
                  onClick={closeModal}
                  disabled={exchangeLoading}
                  className="text-white hover:bg-white hover:bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Image du cadeau */}
              <div className="text-center mb-6">
                <img
                  src={selectedCadeau.image}
                  alt={selectedCadeau.titre}
                  className="w-40 h-40 object-cover rounded-2xl mx-auto shadow-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200?text=Cadeau';
                  }}
                />
              </div>

              <h3 className="text-xl font-bold text-gray-800 text-center mb-3">
                {selectedCadeau.titre}
              </h3>

              {selectedCadeau.description && (
                <p className="text-sm text-gray-600 text-center mb-6">
                  {selectedCadeau.description}
                </p>
              )}

              {/* Détails de la transaction */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Votre cagnotte :</span>
                  <span className="font-bold text-gray-800">
                    {userCagnotte.toFixed(2)} DT
                  </span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Coût du cadeau :</span>
                  <span className="font-bold text-red-600">
                    -{parseFloat(selectedCadeau.prix_cagnotte).toFixed(2)} DT
                  </span>
                </div>
                <div className="border-t-2 border-gray-200 my-3"></div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">Nouveau solde :</span>
                  <span className="font-bold text-green-600 text-lg">
                    {(userCagnotte - parseFloat(selectedCadeau.prix_cagnotte)).toFixed(2)} DT
                  </span>
                </div>
              </div>

              {/* Conditions */}
              {selectedCadeau.conditions && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>📋 Conditions :</strong> {selectedCadeau.conditions}
                  </p>
                </div>
              )}

              {/* Avertissement */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Information :</strong> Cette action est irréversible. Le montant sera déduit de votre cagnotte immédiatement.
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  disabled={exchangeLoading}
                  className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  onClick={echangerCadeau}
                  disabled={exchangeLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {exchangeLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Échange...
                    </>
                  ) : (
                    <>
                      🎁 Confirmer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cadeaux;