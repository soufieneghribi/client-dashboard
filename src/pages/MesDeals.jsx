import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchClientDeals, transferDealToCagnotte, isDealFullyCompleted } from "../store/slices/deals";
import { fetchUserProfile } from "../store/slices/user";
import { toast } from "react-hot-toast";

const MesDeals = () => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { Userprofile } = useSelector((state) => state.user);
  const { 
    depense = [], 
    marque = [], 
    frequence = [], 
    anniversaire = [], 
    loading,
    transferLoading,
    transferredDeals = [],
    totalEarned,
    totalPending
  } = useSelector((state) => state.deals);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [congratsData, setCongratsData] = useState(null);
  
  // État local pour les deals transférés
  const [localTransferredDeals, setLocalTransferredDeals] = useState([]);

  const images = [
    "./src/assets/allmarque.jpg",
    "./src/assets/allmarque.jpg",
    "./src/assets/allmarque.jpg",
  ];

  const allDeals = [
    ...depense.map((d) => ({ ...d, type: "depense" })),
    ...marque.map((d) => ({ ...d, type: "marque" })),
    ...frequence.map((d) => ({ ...d, type: "frequence" })),
    ...anniversaire.map((d) => ({ ...d, type: "anniversaire" })),
  ];

  // Mettre à jour les deals transférés localement
  useEffect(() => {
    setLocalTransferredDeals(transferredDeals);
  }, [transferredDeals]);

  useEffect(() => {
    if (isLoggedIn && !Userprofile) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isLoggedIn, Userprofile]);

  useEffect(() => {
    if (Userprofile?.ID_client) {
      dispatch(fetchClientDeals(Userprofile.ID_client));
    }
  }, [dispatch, Userprofile?.ID_client]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  // Helper pour obtenir la couleur de la marque
  const getBrandColor = (brandName) => {
    if (!brandName) return '#7C3AED';
    
    const brand = brandName.toUpperCase();
    switch (brand) {
      case 'CARREFOUR': return '#0066CC';
      case 'MONOPRIX': return '#E31837';
      case 'AZIZA': return '#FF6B35';
      case 'MG': return '#00A651';
      default: return '#7C3AED';
    }
  };

  // Helper pour obtenir les initiales de la marque
  const getBrandInitials = (brandName) => {
    if (!brandName) return '?';
    const words = brandName.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return brandName.length >= 2 
      ? brandName.substring(0, 2).toUpperCase()
      : brandName[0].toUpperCase();
  };

  // Fonction pour obtenir le gain maximum
  const getHighestGain = (deal) => {
    if (deal.type === "frequence") {
      return parseFloat(deal.gain) || 0;
    }
    
    let highestGain = 0;
    if ((deal.gain_objectif_5 ?? 0) > 0) {
      highestGain = deal.gain_objectif_5;
    } else if ((deal.gain_objectif_4 ?? 0) > 0) {
      highestGain = deal.gain_objectif_4;
    } else if ((deal.gain_objectif_3 ?? 0) > 0) {
      highestGain = deal.gain_objectif_3;
    } else if ((deal.gain_objectif_2 ?? 0) > 0) {
      highestGain = deal.gain_objectif_2;
    } else if ((deal.gain_objectif_1 ?? 0) > 0) {
      highestGain = deal.gain_objectif_1;
    }
    return highestGain;
  };

  // Vérifier si un deal a déjà été transféré (version locale)
  const isDealTransferred = (deal) => {
    const dealKey = `${deal.type}_${deal.ID}`;
    return localTransferredDeals.includes(dealKey);
  };

  // Fonction pour gérer le transfert MANUEL - SEULEMENT SI COMPLÈTEMENT TERMINÉ
  const handleManualTransfer = async (deal) => {
    if (!isDealFullyCompleted(deal)) {
      toast.error("Le deal n'est pas encore complètement terminé!");
      return;
    }

    if (isDealTransferred(deal)) {
      toast.error("Ce deal a déjà été transféré!");
      return;
    }

    const highestGain = getHighestGain(deal);
    
    if (highestGain <= 0) {
      toast.error("Aucun montant à transférer!");
      return;
    }

    try {
      // Marquer comme transféré localement
      setLocalTransferredDeals(prev => [...prev, `${deal.type}_${deal.ID}`]);

      // Effectuer le transfert - le rechargement se fait automatiquement dans deals.js
      await dispatch(transferDealToCagnotte({
        dealType: deal.type,
        dealId: deal.ID,
        amount: highestGain
      })).unwrap();

      // Afficher la modal de félicitations
      setCongratsData({ amount: highestGain, type: deal.type });
      setShowCongrats(true);

      // Note: Le profil et les deals sont déjà rechargés dans transferDealToCagnotte
      // La cagnotte se mettra à jour automatiquement via Redux

    } catch (error) {
      console.error("Transfer failed:", error);
      // Annuler le marquage local en cas d'erreur
      setLocalTransferredDeals(prev => prev.filter(id => id !== `${deal.type}_${deal.ID}`));
      toast.error("Échec du transfert. Veuillez réessayer.");
    }
  };

  // Victory Card Component - SEULEMENT POUR LES DEALS COMPLÈTEMENT TERMINÉS
  const VictoryCard = ({ deal }) => {
    const [isTransferring, setIsTransferring] = useState(false);
    const isTransferred = isDealTransferred(deal);
    const isFullyCompleted = isDealFullyCompleted(deal);
    const highestGain = getHighestGain(deal);

    if (!isFullyCompleted) {
      return null;
    }

    const handleTransfer = async () => {
      if (isTransferred || isTransferring || !isFullyCompleted) return;
      
      setIsTransferring(true);
      await handleManualTransfer(deal);
      setIsTransferring(false);
    };

    return (
      <div className="col-12 col-md-6 col-lg-4 mb-3">
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid #FFD700',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'5\' fill=\'%23FFD700\'/%3E%3Ccircle cx=\'50\' cy=\'30\' r=\'3\' fill=\'%23FF6B6B\'/%3E%3Ccircle cx=\'80\' cy=\'20\' r=\'4\' fill=\'%234ECDC4\'/%3E%3C/svg%3E")',
            pointerEvents: 'none'
          }} />

          <div style={{
            fontSize: '48px',
            textAlign: 'center',
            marginBottom: '12px',
            animation: 'bounce 2s infinite'
          }}>
            🏆
          </div>

          <div style={{
            textAlign: 'center',
            color: 'white',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              margin: '0 0 6px 0',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}>
              FÉLICITATIONS ! 🎉
            </h2>
            <p style={{
              fontSize: '13px',
              margin: 0,
              opacity: 0.9
            }}>
              Vous avez complété tous les objectifs !
            </p>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            marginBottom: '16px',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <div style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '12px',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {isTransferred ? 'Montant transféré' : 'Gain total à transférer'}
            </div>
            <div style={{
              color: '#FFD700',
              fontSize: '36px',
              fontWeight: 'bold',
              textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
              marginBottom: '4px'
            }}>
              {Number(highestGain).toFixed(1)} DT
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '11px'
            }}>
              {isTransferred ? 'déjà dans votre cagnotte' : 'Tous les objectifs atteints!'}
            </div>
          </div>

          {deal.type === 'marque' && deal.marque_name && (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'center',
              marginBottom: '16px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              {deal.marque_logo ? (
                <img 
                  src={deal.marque_logo} 
                  alt={deal.marque_name}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div style={{
                display: deal.marque_logo ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: getBrandColor(deal.marque_name),
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {getBrandInitials(deal.marque_name)}
              </div>
              <div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>Marque</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {deal.marque_name}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleTransfer}
            disabled={isTransferred || isTransferring || transferLoading || !isFullyCompleted}
            className="w-100"
            style={{
              backgroundColor: isTransferred ? '#4CAF50' : 
                             isTransferring ? '#FFA000' : '#FFD700',
              color: isTransferred ? 'white' : '#1A202C',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: (isTransferred || isTransferring || !isFullyCompleted) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              opacity: (isTransferred || isTransferring || !isFullyCompleted) ? 0.7 : 1,
              marginTop: 'auto'
            }}
          >
            {isTransferring ? (
              <span>🔄 Transfert en cours...</span>
            ) : isTransferred ? (
              <span>✅ Déjà transféré</span>
            ) : !isFullyCompleted ? (
              <span>⏳ Objectifs en cours...</span>
            ) : (
              <span>💰 Transférer {Number(highestGain).toFixed(1)} DT</span>
            )}
          </button>

          {isTransferred && (
            <div style={{
              marginTop: '10px',
              textAlign: 'center',
              color: 'white',
              fontSize: '12px',
              opacity: 0.9
            }}>
              🎊 Le montant a été ajouté à votre cagnotte !
            </div>
          )}
        </div>
      </div>
    );
  };

  // Regular Deal Card Component
  const DealCard = ({ deal }) => {
    const [imageError, setImageError] = useState(false);

    const getCurrentObjective = () => {
      if (deal.type === "frequence") {
        return {
          current: parseFloat(deal.compteur_frequence) || 0,
          target: parseFloat(deal.objectif_frequence) || 5,
          reward: parseFloat(deal.gain) || 5,
          objectives: null,
          maxReward: parseFloat(deal.gain) || 5
        };
      }
      
      const objectives = [
        { value: parseFloat(deal.objectif_1) || 0, gain: parseFloat(deal.gain_objectif_1) || 0, level: 1 },
        { value: parseFloat(deal.objectif_2) || 0, gain: parseFloat(deal.gain_objectif_2) || 0, level: 2 },
        { value: parseFloat(deal.objectif_3) || 0, gain: parseFloat(deal.gain_objectif_3) || 0, level: 3 },
        { value: parseFloat(deal.objectif_4) || 0, gain: parseFloat(deal.gain_objectif_4) || 0, level: 4 },
        { value: parseFloat(deal.objectif_5) || 0, gain: parseFloat(deal.gain_objectif_5) || 0, level: 5 },
      ].filter(obj => obj.value > 0);
      
      const current = parseFloat(deal.compteur_objectif) || 0;
      const activeObjective = objectives.find((o) => current < o.value) || objectives[objectives.length - 1];
      
      return {
        current,
        target: activeObjective?.value || 0,
        reward: activeObjective?.gain || 0,
        objectives,
        maxReward: objectives[objectives.length - 1]?.gain || 0
      };
    };

    const objective = getCurrentObjective();
    const progress = objective.target > 0 ? Math.min((objective.current / objective.target) * 100, 100) : 0;
    const isFullyCompleted = isDealFullyCompleted(deal);

    const getBadgeName = () => {
      if (deal.type === "marque") return "Marque";
      if (deal.type === "depense") return "Dépense";
      if (deal.type === "frequence") return "Fréquence";
      if (deal.type === "anniversaire") return "Anniversaire";
      return deal.type;
    };

    if (isFullyCompleted) {
      return null;
    }

    const brandColor = deal.type === 'marque' ? getBrandColor(deal.marque_name) : '#7C3AED';

    return (
      <div className="col-12 col-md-6 col-lg-4 mb-3">
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #E2E8F0',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: brandColor,
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 'bold',
            marginBottom: '12px',
            alignSelf: 'flex-start'
          }}>
            {getBadgeName()}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            {deal.type === 'marque' && deal.marque_name ? (
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: `2px solid ${brandColor}`,
                boxShadow: `0 4px 12px ${brandColor}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {deal.marque_logo && !imageError ? (
                  <img 
                    src={deal.marque_logo} 
                    alt={deal.marque_name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(135deg, ${brandColor}, ${brandColor}CC)`,
                      color: 'white',
                      padding: '8px'
                    }}
                  >
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      marginBottom: '2px'
                    }}>
                      {getBrandInitials(deal.marque_name)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '40px', textAlign: 'center' }}>
                {deal.type === "depense" ? "💰" : 
                 deal.type === "frequence" ? "🔄" : 
                 deal.type === "anniversaire" ? "🎂" : "🎁"}
              </div>
            )}
          </div>

          <div style={{
            backgroundColor: '#F7FAFC',
            borderRadius: '10px',
            padding: '12px',
            textAlign: 'center',
            marginBottom: '12px'
          }}>
            <div style={{ color: '#718096', fontSize: '11px', marginBottom: '4px' }}>
              Gagnez jusqu'à
            </div>
            <div style={{ 
              color: brandColor, 
              fontSize: '22px', 
              fontWeight: 'bold'
            }}>
              {Number(objective.maxReward).toFixed(1)} DT
            </div>
            <div style={{ color: '#718096', fontSize: '10px' }}>
              {deal.type === 'marque' && deal.marque_name ? (
                `avec ${deal.marque_name}`
              ) : (
                "si vous atteignez l'objectif"
              )}
            </div>
          </div>

          {objective.objectives && objective.objectives.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '12px',
              padding: '8px 0'
            }}>
              {objective.objectives.map((obj, idx) => {
                const isCompleted = objective.current >= obj.value;
                const isActive = !isCompleted && objective.current < obj.value && 
                               (idx === 0 || objective.current >= objective.objectives[idx - 1].value);
                
                return (
                  <div key={idx} style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative'
                  }}>
                    {idx < objective.objectives.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        left: '50%',
                        width: '100%',
                        height: '2px',
                        backgroundColor: isCompleted ? brandColor : '#E2E8F0',
                        zIndex: 0
                      }} />
                    )}
                    
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? brandColor : 
                                     isActive ? `${brandColor}40` : '#F7FAFC',
                      border: `2px solid ${isCompleted || isActive ? brandColor : '#E2E8F0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '6px',
                      position: 'relative',
                      zIndex: 1,
                      transition: 'all 0.3s ease'
                    }}>
                      {isCompleted ? (
                        <span style={{ color: 'white', fontSize: '14px' }}>✓</span>
                      ) : (
                        <span style={{
                          color: isActive ? brandColor : '#CBD5E0',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          {obj.level}
                        </span>
                      )}
                    </div>
                    
                    <div style={{
                      fontSize: '9px',
                      color: isCompleted || isActive ? brandColor : '#A0AEC0',
                      fontWeight: isCompleted || isActive ? 'bold' : 'normal',
                      textAlign: 'center'
                    }}>
                      {obj.value} DT
                    </div>
                    <div style={{
                      fontSize: '8px',
                      color: '#718096',
                      textAlign: 'center'
                    }}>
                      +{obj.gain} DT
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#718096' }}>
                {deal.type === "frequence" 
                  ? `${Math.floor(objective.current)} visite${Math.floor(objective.current) > 1 ? 's' : ''}`
                  : `${Number(objective.current).toFixed(1)} DT`
                }
              </span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: brandColor }}>
                {deal.type === "frequence"
                  ? `${objective.target} visite${objective.target > 1 ? 's' : ''}`
                  : `${objective.target} DT`
                }
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#F7FAFC',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: brandColor,
                transition: 'width 0.3s ease',
                borderRadius: '10px'
              }} />
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            backgroundColor: '#F7FAFC',
            borderRadius: '8px',
            fontSize: '11px'
          }}>
            <span style={{ fontSize: '16px' }}>🎁</span>
            <span style={{ color: '#718096', fontWeight: '600' }}>
              {deal.type === "frequence" 
                ? `Mes visites : ${Math.floor(objective.current)}`
                : `Mes achats : ${Number(deal.compteur_objectif || 0).toFixed(1)} DT`
              }
            </span>
          </div>

          {!isFullyCompleted && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px',
              backgroundColor: '#E6FFFA',
              borderRadius: '8px',
              marginTop: '8px',
              border: '1px solid #81E6D9'
            }}>
              <span style={{ fontSize: '16px', color: '#319795' }}>⏳</span>
              <span style={{ color: '#319795', fontSize: '11px', fontWeight: '600' }}>
                Objectif en cours: {Math.round(progress)}% complété
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const CongratsModal = ({ data }) => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '30px',
        textAlign: 'center',
        maxWidth: '350px',
        width: '100%'
      }}>
        <div style={{ fontSize: '50px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{
          color: '#2D3748',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>
          Félicitations!
        </h2>
        <p style={{
          color: '#718096',
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          Vous avez transféré
        </p>
        <div style={{
          color: '#10B981',
          fontSize: '40px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          {data?.amount} DT
        </div>
        <p style={{
          color: '#718096',
          fontSize: '13px',
          marginBottom: '20px'
        }}>
          vers votre cagnotte
        </p>
        <button
          style={{
            width: '100%',
            backgroundColor: '#7C3AED',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onClick={() => setShowCongrats(false)}
        >
          Fermer
        </button>
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#F7FAFC' }}>
        <div className="text-center">
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎁</div>
          <h2 style={{ color: '#1A202C', fontSize: '20px', marginBottom: '8px' }}>
            Connectez-vous
          </h2>
          <p style={{ color: '#718096', fontSize: '14px' }}>
            pour voir vos offres fidélité
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F7FAFC',
      paddingBottom: '80px'
    }}>
      {/*
      *
      * NOUVEAU HEADER
      *
      */}
      <div style={{
        backgroundColor: '#4F46E5', // Un violet/indigo moderne et simple
        padding: '32px 20px 40px',
        color: 'white', // Texte blanc pour le contraste
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Motif SVG subtil en arrière-plan */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Cg fill=\'%23FFFFFF\'%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'3\'/%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'3\'/%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'3\'/%3E%3Ccircle cx=\'70\' cy=\'70\' r=\'3\'/%3E%3Ccircle cx=\'90\' cy=\'90\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <div style={{ fontSize: '32px' }}>
              🎁
            </div>
            <h1 style={{
              fontSize: '26px',
              fontWeight: '800',
              margin: 0,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)' // Ombre légère pour le texte
            }}>
              Mes Offres Fidélité
            </h1>
          </div>
          <p style={{
            margin: 0,
            fontSize: '14px',
            textAlign: 'center',
            color: '#E0E7FF', // Un blanc cassé/lavande pour le sous-titre
            fontWeight: '500'
          }}>
            {allDeals.length} {allDeals.length > 1 ? 'offres actives' : 'offre active'}
          </p>
        </div>
      </div>

      {/*
      *
      * NOUVELLES CARTES DE STATS
      *
      */}
      <div className="container-fluid px-3 py-3">
        <div className="row g-2">
          
          {/* CARTE CAGNOTTE */}
          <div className="col-4">
            <div style={{
              background: '#FFFFFF', // Fond blanc
              borderRadius: '16px',
              padding: '16px 10px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', // Ombre subtile
              border: '1px solid #E2E8F0', // Bordure grise
              position: 'relative',
              overflow: 'hidden',
              transform: 'translateY(0)',
              transition: 'all 0.3s ease',
              height: '100%'
            }}
            className="stat-card">
              
              {/* Icone dans un cercle coloré */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#FEF9C3', // Jaune pâle
                color: '#B45309', // Jaune foncé
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                margin: '0 auto 12px'
              }}>
                💰
              </div>
              <div style={{
                color: '#9CA3AF', // Gris pour le label
                fontSize: '11px',
                marginBottom: '4px',
                fontWeight: '600',
                textTransform: 'uppercase',
              }}>
                Cagnotte
              </div>
              <div style={{
                color: '#1F2937', // Texte noir/gris foncé
                fontSize: '20px',
                fontWeight: 'bold',
              }}>
                {Number(Userprofile?.cagnotte_balance || 0).toFixed(1)} DT
              </div>
            </div>
          </div>

          {/* CARTE GAGNÉ */}
          <div className="col-4">
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '16px 10px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E2E8F0',
              position: 'relative',
              overflow: 'hidden',
              transform: 'translateY(0)',
              transition: 'all 0.3s ease',
              height: '100%'
            }}
            className="stat-card">
              
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#F0FDF4', // Vert pâle
                color: '#15803D', // Vert foncé
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                margin: '0 auto 12px'
              }}>
                ✅
              </div>
              <div style={{
                color: '#9CA3AF',
                fontSize: '11px',
                marginBottom: '4px',
                fontWeight: '600',
                textTransform: 'uppercase',
              }}>
                Gagné
              </div>
              <div style={{
                color: '#1F2937',
                fontSize: '20px',
                fontWeight: 'bold',
              }}>
                {Number(totalEarned || 0).toFixed(1)} DT
              </div>
            </div>
          </div>

          {/* CARTE EN ATTENTE */}
          <div className="col-4">
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '16px 10px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E2E8F0',
              position: 'relative',
              overflow: 'hidden',
              transform: 'translateY(0)',
              transition: 'all 0.3s ease',
              height: '100%'
            }}
            className="stat-card">
              
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#F8FAFC', // Gris pâle
                color: '#475569', // Gris foncé
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                margin: '0 auto 12px'
              }}>
                ⏳
              </div>
              <div style={{
                color: '#9CA3AF',
                fontSize: '11px',
                marginBottom: '4px',
                fontWeight: '600',
                textTransform: 'uppercase',
              }}>
                En attente
              </div>
              <div style={{
                color: '#1F2937',
                fontSize: '20px',
                fontWeight: 'bold',
              }}>
                {Number(totalPending || 0).toFixed(1)} DT
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid px-3">
        {loading ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
            <p style={{ color: '#718096' }}>Chargement des offres...</p>
          </div>
        ) : allDeals.length > 0 ? (
          <div className="row">
            {allDeals.map((deal, index) => {
              const isFullyCompleted = isDealFullyCompleted(deal);
              
              return isFullyCompleted ? (
                <VictoryCard key={`${deal.type}_${deal.ID || index}`} deal={deal} />
              ) : (
                <DealCard key={`${deal.type}_${deal.ID || index}`} deal={deal} />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-5" style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎁</div>
            <p style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1A202C',
              marginBottom: '8px'
            }}>
              Aucune offre active
            </p>
            <p style={{ color: '#718096', fontSize: '14px' }}>
              Revenez bientôt pour de nouvelles offres !
            </p>
          </div>
        )}
      </div>

      {showCongrats && congratsData && <CongratsModal data={congratsData} />}

      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .stat-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08) !important;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .stat-card {
          animation: fadeIn 0.5s ease-out;
        }
        
        .stat-card:nth-child(1) {
          animation-delay: 0.1s;
        }
        
        .stat-card:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .stat-card:nth-child(3) {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
};

export default MesDeals;