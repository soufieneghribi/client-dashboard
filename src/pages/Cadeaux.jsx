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
  FaTimes
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
    const clientId = Userprofile?.ID_client;
    
    if (!clientId) {
      toast.error("Erreur: ID client non trouvé");
      return;
    }

    setExchangeLoading(true);
    try {
      // ✅ Appel à l'endpoint cagnotte-deduct pour déduire le montant
      const deductResponse = await fetch(
        'https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/customer/cagnotte-deduct',
        {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify({
            client_id: clientId,
            amount: parseFloat(selectedCadeau.prix_cagnotte),
            description: `Échange cadeau: ${selectedCadeau.titre}`,
            type: 'gift_exchange',
            gift_id: selectedCadeau.id
          })
        }
      );

      const deductResult = await deductResponse.json();

      if (deductResponse.ok && deductResult.success) {
        // Succès de la déduction de cagnotte
        toast.success(`🎁 Cadeau "${selectedCadeau.titre}" échangé avec succès !`);
        
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
        
        // Optionnel: Enregistrer l'échange dans l'historique
        // await saveExchangeHistory(selectedCadeau.id, clientId, selectedCadeau.prix_cagnotte);
        
      } else {
        toast.error(deductResult.message || "Erreur lors de la déduction de la cagnotte");
      }
    } catch (error) {
      console.error('Erreur échange cadeau:', error);
      toast.error(handleApiError(error));
    } finally {
      setExchangeLoading(false);
    }
  };

  const userCagnotte = parseFloat(Userprofile?.cagnotte_balance || 0);

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-pink-500 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Chargement des cadeaux...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <MdCardGiftcard className="text-8xl text-pink-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Connectez-vous pour accéder aux cadeaux
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all"
          >
            Se connecter
          </button>
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
            
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <MdCardGiftcard className="text-pink-500 text-3xl" />
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  Boutique Cadeaux
                </h1>
              </div>
              <p className="text-gray-600">Échangez votre cagnotte contre des cadeaux</p>
            </div>
          </div>

          {/* Solde Cagnotte */}
          <div className="mt-6 bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white p-3 rounded-full">
                  <FaCoins className="text-2xl text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Votre Cagnotte</p>
                  <p className="text-3xl font-bold text-pink-600">
                    {userCagnotte.toFixed(2)} DT
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Cadeaux disponibles</p>
                <p className="text-2xl font-bold text-purple-600">{cadeaux.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres par Catégorie */}
        {categories.length > 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Catégories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((categorie) => (
                <button
                  key={categorie}
                  onClick={() => setSelectedCategorie(categorie)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
                    selectedCategorie === categorie
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {categorie}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Liste des Cadeaux */}
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
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all"
            >
              Retour au Catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cadeauxFiltres.map((cadeau) => {
              const peutAcheter = canAfford(cadeau.prix_cagnotte);
              const estDisponible = cadeau.est_publie && cadeau.quantite_disponible > 0;
              const estExpire = new Date(cadeau.date_fin_validite) < new Date();
              
              return (
                <div
                  key={cadeau.id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                    estDisponible && !estExpire
                      ? 'hover:shadow-2xl hover:-translate-y-1'
                      : 'opacity-60'
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100">
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
                        <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold block">
                          {cadeau.categorie}
                        </span>
                      )}
                    </div>

                    {/* Prix en Cagnotte */}
                    <div className="absolute bottom-2 left-2 bg-white rounded-full px-4 py-2 shadow-lg">
                      <div className="flex items-center gap-2">
                        <FaCoins className="text-yellow-500" />
                        <span className="font-bold text-pink-600 text-lg">
                          {parseFloat(cadeau.prix_cagnotte).toFixed(2)} DT
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-4">
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
                      <FaCalendarAlt className="text-pink-500" />
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
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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

      {/* Modal de Confirmation */}
      {showConfirmModal && selectedCadeau && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-3xl">
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
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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