import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchClientDeals, transferDealToCagnotte } from "../store/slices/deals";
import { fetchUserProfile } from "../store/slices/user";

const MesDeals = () => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { Userprofile } = useSelector((state) => state.user);
  const { depense, marque, frequence, anniversaire, loading } = useSelector((state) => state.deals);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [congratsData, setCongratsData] = useState(null);
  
  // 🔥 CORRECTION: Charger depuis le localStorage au démarrage
  const [transferredLevels, setTransferredLevels] = useState(() => {
    const saved = localStorage.getItem('transferredLevels');
    return saved ? JSON.parse(saved) : {};
  });

  // 🔥 NOUVEAU: État local pour la cagnotte mise à jour immédiatement
  const [localCagnotte, setLocalCagnotte] = useState(Userprofile?.cagnotte_balance || 0);

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

  // 🔥 CORRECTION: Sauvegarder dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('transferredLevels', JSON.stringify(transferredLevels));
  }, [transferredLevels]);

  // 🔥 CORRECTION: Mettre à jour la cagnotte locale quand le profil change
  useEffect(() => {
    if (Userprofile?.cagnotte_balance !== undefined) {
      setLocalCagnotte(Userprofile.cagnotte_balance);
    }
  }, [Userprofile]);

  useEffect(() => {
    if (isLoggedIn && !Userprofile) dispatch(fetchUserProfile());
  }, [dispatch, isLoggedIn, Userprofile]);

  useEffect(() => {
    if (Userprofile?.ID_client) {
      dispatch(fetchClientDeals(Userprofile.ID_client));
    }
  }, [dispatch, Userprofile]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  const calculateTimeLeft = (endDate) => {
    const end = new Date(endDate);
    const diff = end - new Date();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  };

  // Calculer le total gagné (montants transférables)
  const totalGagne = allDeals.reduce((sum, deal) => {
    const dealKey = `${deal.type}_${deal.ID}`;
    const transferred = transferredLevels[dealKey] || 0;
    
    const getCurrentEarned = () => {
      if (deal.type === "frequence") {
        const visites = Math.floor(parseFloat(deal.compteur_frequence) || 0);
        if (visites >= 5 && transferred < 5) return 5;
        else if (visites >= 4 && transferred < 4) return 4;
        else if (visites >= 3 && transferred < 3) return 3;
        else if (visites >= 2 && transferred < 2) return 2;
        else if (visites >= 1 && transferred < 1) return 1;
        return 0;
      }
      
      const objectives = [
        { value: parseFloat(deal.objectif_1) || 0, gain: parseFloat(deal.gain_objectif_1) || 0 },
        { value: parseFloat(deal.objectif_2) || 0, gain: parseFloat(deal.gain_objectif_2) || 0 },
        { value: parseFloat(deal.objectif_3) || 0, gain: parseFloat(deal.gain_objectif_3) || 0 },
        { value: parseFloat(deal.objectif_4) || 0, gain: parseFloat(deal.gain_objectif_4) || 0 },
        { value: parseFloat(deal.objectif_5) || 0, gain: parseFloat(deal.gain_objectif_5) || 0 },
      ];
      const current = parseFloat(deal.compteur_objectif) || 0;
      
      let earned = 0;
      objectives.forEach((obj) => {
        if (current >= obj.value && obj.value > 0 && obj.gain > transferred) {
          earned = obj.gain;
        }
      });
      return earned > transferred ? earned - transferred : 0;
    };
    return sum + getCurrentEarned();
  }, 0);

  // Calculer le total en attente
  const totalEnAttente = allDeals.reduce((sum, deal) => {
    const getCurrentReward = () => {
      if (deal.type === "frequence") return parseFloat(deal.gain) || 5;
      const objectives = [
        { value: parseFloat(deal.objectif_1) || 0, gain: parseFloat(deal.gain_objectif_1) || 0 },
        { value: parseFloat(deal.objectif_2) || 0, gain: parseFloat(deal.gain_objectif_2) || 0 },
        { value: parseFloat(deal.objectif_3) || 0, gain: parseFloat(deal.gain_objectif_3) || 0 },
        { value: parseFloat(deal.objectif_4) || 0, gain: parseFloat(deal.gain_objectif_4) || 0 },
        { value: parseFloat(deal.objectif_5) || 0, gain: parseFloat(deal.gain_objectif_5) || 0 },
      ];
      const current = parseFloat(deal.compteur_objectif) || 0;
      const active = objectives.find((o) => current < o.value) || objectives[4];
      return active.gain;
    };
    return sum + getCurrentReward();
  }, 0);

  const handleTransfer = async (dealType, dealId, amount) => {
    try {
      // 🔥 CORRECTION: Mettre à jour immédiatement l'UI sans attendre la réponse
      const dealKey = `${dealType}_${dealId}`;
      
      // Mettre à jour les transferts immédiatement
      setTransferredLevels(prev => {
        const updated = {
          ...prev,
          [dealKey]: (prev[dealKey] || 0) + amount
        };
        return updated;
      });

      // 🔥 CORRECTION: Mettre à jour la cagnotte immédiatement
      setLocalCagnotte(prev => prev + amount);

      // Afficher la confirmation immédiatement
      setCongratsData({ amount, type: dealType });
      setShowCongrats(true);
      setTimeout(() => setShowCongrats(false), 5000);

      // 🔥 CORRECTION: Envoyer la requête en arrière-plan
      dispatch(transferDealToCagnotte({ 
        dealType, 
        dealId, 
        amount 
      })).unwrap()
      .then(() => {
        // Recharger les données en arrière-plan pour synchroniser
        if (Userprofile?.ID_client) {
          dispatch(fetchUserProfile());
        }
      })
      .catch((error) => {
        console.error("Transfer failed:", error);
        // 🔥 CORRECTION: Revenir en arrière en cas d'erreur
        setTransferredLevels(prev => {
          const reverted = { ...prev };
          delete reverted[dealKey];
          return reverted;
        });
        setLocalCagnotte(prev => prev - amount);
        alert("Erreur lors du transfert. Veuillez réessayer.");
      });
      
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  };

  const DealCard = ({ deal }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(deal.date_fin));
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft(deal.date_fin));
      }, 1000);
      return () => clearInterval(timer);
    }, [deal.date_fin]);

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
      ];
      const current = parseFloat(deal.compteur_objectif) || 0;
      const activeObjective = objectives.find((o) => current < o.value) || objectives[4];
      return {
        current,
        target: activeObjective.value,
        reward: activeObjective.gain,
        objectives,
        maxReward: objectives[4].gain
      };
    };

    const objective = getCurrentObjective();
    const progress = Math.min((objective.current / objective.target) * 100, 100);

    // 🔥 CORRECTION: Utiliser l'état persisté
    const dealKey = `${deal.type}_${deal.ID}`;
    const alreadyTransferred = transferredLevels[dealKey] || 0;
    
    let earnedAmount = 0;
    if (deal.type === "frequence") {
      const visites = Math.floor(objective.current);
      // Système de paliers pour fréquence
      if (visites >= 5 && alreadyTransferred < 5) earnedAmount = 5;
      else if (visites >= 4 && alreadyTransferred < 4) earnedAmount = 4;
      else if (visites >= 3 && alreadyTransferred < 3) earnedAmount = 3;
      else if (visites >= 2 && alreadyTransferred < 2) earnedAmount = 2;
      else if (visites >= 1 && alreadyTransferred < 1) earnedAmount = 1;
    } else {
      const objectives = objective.objectives || [];
      objectives.forEach((obj) => {
        if (objective.current >= obj.value && obj.value > 0 && obj.gain > alreadyTransferred) {
          earnedAmount = obj.gain;
        }
      });
      // Ne transférer que la différence
      if (earnedAmount > alreadyTransferred) {
        earnedAmount = earnedAmount - alreadyTransferred;
      } else {
        earnedAmount = 0;
      }
    }

    const getIllustration = () => {
      if (deal.type === "depense") return "📊";
      if (deal.type === "frequence") return "🔄";
      if (deal.type === "anniversaire") return "🎂";
      return "🎁";
    };

    const getBadgeColor = () => "#7C3AED";
    const getBadgeName = () => {
      if (deal.type === "marque") return "Marque";
      if (deal.type === "depense") return "Dépense";
      if (deal.type === "frequence") return "Fréquence";
      if (deal.type === "anniversaire") return "Anniversaire";
      return deal.type;
    };

    return (
      <div style={{
        backgroundColor: '#E8E4F3',
        borderRadius: '24px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {timeLeft && (
          <div>
            <div style={{
              textAlign: 'center',
              color: '#FF6B6B',
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '15px',
              letterSpacing: '1px'
            }}>
              TEMPS RESTANT
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              marginBottom: '20px'
            }}>
              {[
                { value: timeLeft.days, label: 'JOURS' },
                { value: timeLeft.hours, label: 'HEURES' },
                { value: timeLeft.minutes, label: 'MIN' },
                { value: timeLeft.seconds, label: 'SEC' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#2D3561',
                  borderRadius: '16px',
                  padding: '15px 10px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    color: 'white',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    lineHeight: '1'
                  }}>
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div style={{
                    color: '#FF6B6B',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    marginTop: '5px',
                    letterSpacing: '0.5px'
                  }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{
          display: 'inline-block',
          backgroundColor: getBadgeColor(),
          color: 'white',
          padding: '10px 24px',
          borderRadius: '20px',
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '15px'
        }}>
          {getBadgeName()}
        </div>

        {deal.type === "frequence" ? (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              gap: '15px'
            }}>
              <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '100px'
              }}>
                🎁
              </div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '16px 20px',
                textAlign: 'center',
                minWidth: '140px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <div style={{
                  color: '#2D3748',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}>
                  Gagné
                </div>
                <div style={{
                  color: '#FF6B6B',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}>
                  {Number(objective.reward).toFixed(1)} dt
                </div>
                <div style={{
                  color: '#718096',
                  fontSize: '11px',
                  lineHeight: '1.4'
                }}>
                  si vous atteignez<br/>l'objectif
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <h3 style={{
                color: '#2D3748',
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                Deal Fréquence
              </h3>
              <p style={{
                color: '#718096',
                fontSize: '14px',
                margin: 0
              }}>
                Commandez régulièrement et gagnez jusqu'à {Number(objective.reward).toFixed(1)} DT
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(90deg, #10B981 0%, #3B82F6 100%)',
              height: '10px',
              borderRadius: '10px',
              marginBottom: '15px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #FCD34D 0%, #10B981 50%, #3B82F6 100%)',
                borderRadius: '10px'
              }} />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px',
              gap: '8px'
            }}>
              {[1, 2, 3, 4, 5].map((level) => {
                const isCompleted = objective.current >= level;
                const isTransferred = alreadyTransferred >= level;
                const colors = ['#FCD34D', '#84CC16', '#10B981', '#06B6D4', '#3B82F6'];
                let bgColor = '#E2E8F0';
                
                if (isTransferred) {
                  bgColor = '#9CA3AF'; // Gris pour transféré
                } else if (isCompleted) {
                  bgColor = colors[level - 1];
                }
                
                return (
                  <div key={level} style={{
                    textAlign: 'center',
                    flex: 1
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      backgroundColor: bgColor,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: (isCompleted || isTransferred) ? 'white' : '#A0AEC0',
                      boxShadow: isCompleted && !isTransferred ? `0 4px 12px ${bgColor}80` : 'none',
                      transition: 'all 0.3s ease'
                    }}>
                      {isTransferred && (
                        <div style={{ fontSize: '18px', marginBottom: '2px' }}>💰</div>
                      )}
                      {isCompleted && !isTransferred && (
                        <div style={{ fontSize: '18px', marginBottom: '2px' }}>✓</div>
                      )}
                      <div style={{ fontSize: '10px', opacity: 0.9 }}>
                        {level === 1 ? '1ère' : `${level}ème`}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#2D3748',
                      fontWeight: 'bold',
                      marginBottom: '2px'
                    }}>
                      {level * 10} DT
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: isTransferred ? '#9CA3AF' : '#10B981',
                      fontWeight: 'bold'
                    }}>
                      {isTransferred ? '✓ Transféré' : `+${level} DT`}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              backgroundColor: 'white',
              borderRadius: '12px',
              marginBottom: '15px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              <div style={{ fontSize: '28px' }}>🛒</div>
              <div>
                <div style={{
                  color: '#FF6B6B',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '2px'
                }}>
                  Mes visites :
                </div>
                <div style={{
                  color: '#FF6B6B',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  {Math.floor(objective.current)}
                </div>
              </div>
            </div>
          </div>
        ) : deal.type === "marque" ? (
          <div>
            <div style={{
              textAlign: 'center',
              margin: '20px 0',
              padding: '30px',
              backgroundColor: 'white',
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              {deal.marque_logo && !imageError ? (
                <img
                  src={deal.marque_logo}
                  alt={deal.marque_name || "Marque"}
                  onError={() => setImageError(true)}
                  style={{
                    maxWidth: '160px',
                    maxHeight: '90px',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div style={{
                  color: '#2D3748',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  letterSpacing: '2px'
                }}>
                  {deal.marque_name || "MARQUE"}
                </div>
              )}
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '16px 20px',
              textAlign: 'center',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              {deal.marque_name && (
                <div style={{
                  color: '#2D3561',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
                  {deal.marque_name}
                </div>
              )}
              <div style={{
                color: '#718096',
                fontSize: '13px',
                marginBottom: '5px'
              }}>
                Gagné jusqu'à
              </div>
              <div style={{
                color: '#FF6B6B',
                fontSize: '28px',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>
                {Number(objective.maxReward).toFixed(2)} dt
              </div>
              <div style={{
                color: '#718096',
                fontSize: '11px',
                lineHeight: '1.4'
              }}>
                si vous atteignez l'objectif
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            gap: '15px'
          }}>
            <div style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '80px'
            }}>
              {getIllustration()}
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '16px 20px',
              textAlign: 'center',
              minWidth: '140px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{
                color: '#718096',
                fontSize: '13px',
                marginBottom: '5px'
              }}>
                Gagné jusqu'à
              </div>
              <div style={{
                color: '#FF6B6B',
                fontSize: '28px',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>
                {Number(objective.maxReward).toFixed(2)} dt
              </div>
              <div style={{
                color: '#718096',
                fontSize: '11px',
                lineHeight: '1.4'
              }}>
                si vous atteignez<br/>l'objectif
              </div>
            </div>
          </div>
        )}

        {deal.type !== "frequence" && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{
                color: '#2D3748',
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                {deal.type === "marque" && "Deal Marques"}
                {deal.type === "depense" && "Deal Dépense"}
                {deal.type === "anniversaire" && "Deal Anniversaire"}
              </h3>
              <p style={{
                color: '#718096',
                fontSize: '14px',
                margin: 0
              }}>
                {deal.type === "marque" && `Découvrez nos marques et gagnez jusqu'à ${Number(objective.maxReward).toFixed(0)} DT`}
                {deal.type === "depense" && `Dépensez et gagnez jusqu'à ${Number(objective.maxReward).toFixed(0)} DT`}
                {deal.type === "anniversaire" && "Offre spéciale anniversaire"}
              </p>
            </div>

            <div style={{
              backgroundColor: '#FFE5B4',
              height: '8px',
              borderRadius: '10px',
              marginBottom: '15px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${progress}%`,
                backgroundColor: '#FFC107',
                borderRadius: '10px'
              }} />
            </div>

            {objective.objectives && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '20px',
                gap: '8px'
              }}>
                {objective.objectives.map((obj, index) => {
                  const isCompleted = objective.current >= obj.value;
                  const isTransferred = alreadyTransferred >= obj.gain;
                  let bgColor = '#E2E8F0';
                  
                  if (isTransferred) {
                    bgColor = '#9CA3AF';
                  } else if (isCompleted) {
                    bgColor = '#FFC107';
                  }
                  
                  return (
                    <div key={index} style={{
                      textAlign: 'center',
                      flex: 1
                    }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        backgroundColor: bgColor,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: (isCompleted || isTransferred) ? 'white' : '#A0AEC0',
                        boxShadow: isCompleted && !isTransferred ? '0 4px 12px rgba(255, 193, 7, 0.3)' : 'none'
                      }}>
                        {isTransferred && (
                          <div style={{ fontSize: '16px', marginBottom: '2px' }}>💰</div>
                        )}
                        {isCompleted && !isTransferred && (
                          <div style={{ fontSize: '16px', marginBottom: '2px' }}>✓</div>
                        )}
                        <div style={{ fontSize: '10px', opacity: 0.8 }}>
                          {obj.level === 1 ? '1ère' : `${obj.level}ème`}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#2D3748',
                        fontWeight: 'bold',
                        marginBottom: '2px'
                      }}>
                        {Number(obj.value).toFixed(0)} DT
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: isTransferred ? '#9CA3AF' : '#10B981',
                        fontWeight: 'bold'
                      }}>
                        {isTransferred ? '✓ Transféré' : `+${Number(obj.gain).toFixed(0)} DT`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              backgroundColor: 'white',
              borderRadius: '12px',
              marginBottom: '15px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              <div style={{ fontSize: '28px' }}>🛒</div>
              <div>
                <div style={{
                  color: '#FF6B6B',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '2px'
                }}>
                  Mes achats :
                </div>
                <div style={{
                  color: '#FF6B6B',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  {Number(objective.current).toFixed(1)} dt
                </div>
              </div>
            </div>
          </>
        )}

        {earnedAmount > 0 && (
          <button
            style={{
              width: '100%',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
            onClick={() => handleTransfer(deal.type, deal.ID, earnedAmount)}
          >
            Transférer {Number(earnedAmount).toFixed(0)} DT à la cagnotte
          </button>
        )}
        
        {alreadyTransferred > 0 && earnedAmount === 0 && (
          <div style={{
            width: '100%',
            backgroundColor: '#F3F4F6',
            color: '#6B7280',
            border: '2px solid #E5E7EB',
            borderRadius: '12px',
            padding: '14px',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            ✓ {Number(alreadyTransferred).toFixed(0)} DT déjà transféré
          </div>
        )}
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
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '400px',
        margin: '20px'
      }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
        <h2 style={{
          color: '#2D3748',
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '10px'
        }}>
          Félicitations!
        </h2>
        <p style={{
          color: '#718096',
          fontSize: '16px',
          marginBottom: '20px'
        }}>
          Vous avez transféré
        </p>
        <div style={{
          color: '#10B981',
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '30px'
        }}>
          {data?.amount} DT
        </div>
        <p style={{
          color: '#718096',
          fontSize: '14px',
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
            borderRadius: '12px',
            padding: '14px',
            fontSize: '16px',
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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F7FAFC',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎁</div>
          <h2 style={{ color: '#2D3748', fontSize: '24px' }}>
            Connectez-vous pour voir vos offres
          </h2>
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
      <div style={{
        background: 'linear-gradient(135deg, #5B4BB4 0%, #7C3AED 100%)',
        padding: '25px 20px 20px 20px',
        color: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '15px'
        }}>
          <button style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer'
          }}>
            ‹
          </button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              margin: '0 0 5px 0'
            }}>
              Offres Fidélité
            </h1>
            <p style={{
              margin: 0,
              opacity: 0.9,
              fontSize: '14px'
            }}>
              {allDeals.length} offres disponibles
            </p>
          </div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            🏷️
          </div>
        </div>
      </div>

      <div style={{
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '10px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '16px 12px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '2px solid #7C3AED'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
          <div style={{
            color: '#718096',
            fontSize: '12px',
            marginBottom: '5px',
            fontWeight: '600'
          }}>
            Cagnotte
          </div>
          <div style={{
            color: '#7C3AED',
            fontSize: '22px',
            fontWeight: 'bold'
          }}>
            {/* 🔥 CORRECTION: Utiliser la cagnotte locale mise à jour immédiatement */}
            {Number(localCagnotte || 0).toFixed(1)} DT
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '16px 12px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '2px solid #10B981'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
          <div style={{
            color: '#718096',
            fontSize: '12px',
            marginBottom: '5px',
            fontWeight: '600'
          }}>
            Gagné
          </div>
          <div style={{
            color: '#10B981',
            fontSize: '22px',
            fontWeight: 'bold'
          }}>
            {Number(totalGagne).toFixed(1)} DT
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '16px 12px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '2px solid #FF6B6B'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          <div style={{
            color: '#718096',
            fontSize: '12px',
            marginBottom: '5px',
            fontWeight: '600'
          }}>
            En Attente
          </div>
          <div style={{
            color: '#FF6B6B',
            fontSize: '22px',
            fontWeight: 'bold'
          }}>
            {Number(totalEnAttente).toFixed(1)} DT
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 20px 20px' }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '50px',
            color: '#718096'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>⏳</div>
            Chargement des offres...
          </div>
        ) : allDeals.length > 0 ? (
          allDeals.map((deal) => (
            <DealCard key={`${deal.type}_${deal.ID}`} deal={deal} />
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '50px',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '15px' }}>🎁</div>
            <p style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#2D3748',
              marginBottom: '5px'
            }}>
              Aucune offre active
            </p>
            <p style={{ color: '#718096', fontSize: '14px' }}>
              Revenez plus tard!
            </p>
          </div>
        )}
      </div>

      {showCongrats && congratsData && <CongratsModal data={congratsData} />}
    </div>
  );
};

export default MesDeals;