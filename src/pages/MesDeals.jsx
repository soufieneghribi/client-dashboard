
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchClientDeals,
  transferDealToCagnotte,
  isDealFullyCompleted,
} from "../store/slices/deals";
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
    totalPending,
  } = useSelector((state) => state.deals);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [congratsData, setCongratsData] = useState(null);
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

  const getBrandColor = (brandName) => {
    if (!brandName) return "#673AB7"; // violet par défaut
    const brand = brandName.toUpperCase();
    switch (brand) {
      case "CARREFOUR":
        return "#0066CC";
      case "MONOPRIX":
        return "#E31837";
      case "AZIZA":
        return "#FF6B35";
      case "MG":
        return "#00A651";
      case "DELICE":
        return "#1A237E";
      default:
        return "#673AB7";
    }
  };

  const getBrandInitials = (brandName) => {
    if (!brandName) return "?";
    const words = brandName.trim().split(" ");
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return brandName.length >= 2
      ? brandName.substring(0, 2).toUpperCase()
      : brandName[0].toUpperCase();
  };

  const getHighestGain = (deal) => {
    if (deal.type === "frequence") {
      return parseFloat(deal.gain) || 0;
    }
    let highestGain = 0;
    if ((deal.gain_objectif_5 ?? 0) > 0) highestGain = deal.gain_objectif_5;
    else if ((deal.gain_objectif_4 ?? 0) > 0) highestGain = deal.gain_objectif_4;
    else if ((deal.gain_objectif_3 ?? 0) > 0) highestGain = deal.gain_objectif_3;
    else if ((deal.gain_objectif_2 ?? 0) > 0) highestGain = deal.gain_objectif_2;
    else if ((deal.gain_objectif_1 ?? 0) > 0) highestGain = deal.gain_objectif_1;
    return highestGain;
  };

  // Utiliser le bon compteur d’achats / visites
  const getDealProgress = (deal) => {
    if (deal.type === "frequence") {
      return {
        current: Math.floor(parseFloat(deal.compteur_frequence) || 0),
        isFrequence: true,
      };
    }
    const compteur =
      parseFloat(deal.compteur_objectif) ||
      parseFloat(deal.montant_achats) ||
      parseFloat(deal.total_achats) ||
      parseFloat(deal.current_amount) ||
      0;
    return {
      current: compteur,
      isFrequence: false,
    };
  };

  const isDealTransferred = (deal) => {
    const dealKey = `${deal.type}_${deal.ID}`;
    return localTransferredDeals.includes(dealKey);
  };

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
      setLocalTransferredDeals((prev) => [...prev, `${deal.type}_${deal.ID}`]);
      await dispatch(
        transferDealToCagnotte({
          dealType: deal.type,
          dealId: deal.ID,
          amount: highestGain,
        })
      ).unwrap();
      setCongratsData({ amount: highestGain, type: deal.type });
      setShowCongrats(true);
    } catch (error) {
      console.error("Transfer failed:", error);
      setLocalTransferredDeals((prev) =>
        prev.filter((id) => id !== `${deal.type}_${deal.ID}`)
      );
      toast.error("Échec du transfert. Veuillez réessayer.");
    }
  };

  // ---------- Victory Card (VERSION ORIGINALE) ----------
  const VictoryCard = ({ deal }) => {
    const [isTransferring, setIsTransferring] = useState(false);
    const isTransferred = isDealTransferred(deal);
    const isFullyCompleted = isDealFullyCompleted(deal);
    const highestGain = getHighestGain(deal);

    if (!isFullyCompleted) return null;

    const handleTransfer = async () => {
      if (isTransferred || isTransferring || !isFullyCompleted) return;
      setIsTransferring(true);
      await handleManualTransfer(deal);
      setIsTransferring(false);
    };

    return (
      <div className="col-12 col-md-6 col-lg-4 mb-3">
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)",
            position: "relative",
            overflow: "hidden",
            border: "2px solid #FFD700",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              textAlign: "center",
              marginBottom: "12px",
            }}
          >
            🏆
          </div>
          <div
            style={{
              textAlign: "center",
              color: "white",
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                margin: "0 0 6px 0",
              }}
            >
              FÉLICITATIONS ! 🎉
            </h2>
            <p
              style={{
                fontSize: "13px",
                margin: 0,
                opacity: 0.9,
              }}
            >
              Vous avez complété tous les objectifs !
            </p>
          </div>
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "12px",
                marginBottom: "6px",
              }}
            >
              {isTransferred ? "Montant transféré" : "Gain total à transférer"}
            </div>
            <div
              style={{
                color: "#FFD700",
                fontSize: "36px",
                fontWeight: "bold",
              }}
            >
              {Number(highestGain).toFixed(1)} DT
            </div>
          </div>
          {deal.type === "marque" && deal.marque_name && (
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: "12px",
                padding: "12px",
                textAlign: "center",
                marginBottom: "16px",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: getBrandColor(deal.marque_name),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                {getBrandInitials(deal.marque_name)}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    opacity: 0.8,
                  }}
                >
                  Marque
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  {deal.marque_name}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleTransfer}
            disabled={isTransferred || isTransferring || transferLoading}
            style={{
              backgroundColor: isTransferred
                ? "#4CAF50"
                : isTransferring
                ? "#FFA000"
                : "#FFD700",
              color: isTransferred ? "white" : "#1A202C",
              border: "none",
              borderRadius: "10px",
              padding: "12px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor:
                isTransferred || isTransferring ? "not-allowed" : "pointer",
              marginTop: "auto",
            }}
          >
            {isTransferring
              ? "🔄 Transfert..."
              : isTransferred
              ? "✅ Déjà transféré"
              : `💰 Transférer ${Number(highestGain).toFixed(1)} DT`}
          </button>
        </div>
      </div>
    );
  };

  // ---------- DealCard : design style appli mobile fidélité ----------
  const DealCard = ({ deal }) => {
    const [imageError, setImageError] = useState(false);

    const getCurrentObjective = () => {
      if (deal.type === "frequence") {
        return {
          current: parseFloat(deal.compteur_frequence) || 0,
          target: parseFloat(deal.objectif_frequence) || 5,
          reward: parseFloat(deal.gain) || 5,
          objectives: null,
          maxReward: parseFloat(deal.gain) || 5,
        };
      }

      const objectives = [
        {
          value: parseFloat(deal.objectif_1) || 0,
          gain: parseFloat(deal.gain_objectif_1) || 0,
          level: 1,
        },
        {
          value: parseFloat(deal.objectif_2) || 0,
          gain: parseFloat(deal.gain_objectif_2) || 0,
          level: 2,
        },
        {
          value: parseFloat(deal.objectif_3) || 0,
          gain: parseFloat(deal.gain_objectif_3) || 0,
          level: 3,
        },
        {
          value: parseFloat(deal.objectif_4) || 0,
          gain: parseFloat(deal.gain_objectif_4) || 0,
          level: 4,
        },
        {
          value: parseFloat(deal.objectif_5) || 0,
          gain: parseFloat(deal.gain_objectif_5) || 0,
          level: 5,
        },
      ].filter((obj) => obj.value > 0);

      const progressData = getDealProgress(deal);
      const current = progressData.current;
      const activeObjective =
        objectives.find((o) => current < o.value) ||
        objectives[objectives.length - 1];

      return {
        current,
        target: activeObjective?.value || 0,
        reward: activeObjective?.gain || 0,
        objectives,
        maxReward: objectives[objectives.length - 1]?.gain || 0,
      };
    };

    const objective = getCurrentObjective();
    const progress =
      objective.target > 0
        ? Math.min((objective.current / objective.target) * 100, 100)
        : 0;
    const isFullyCompletedFlag = isDealFullyCompleted(deal);

    const getBadgeName = () => {
      if (deal.type === "marque") return deal.marque_name || "Marque";
      if (deal.type === "depense") return "Dépense";
      if (deal.type === "frequence") return "Fréquence";
      if (deal.type === "anniversaire") return "Anniversaire";
      return deal.type;
    };

    if (isFullyCompletedFlag) return null;

    const brandColor =
      deal.type === "marque" ? getBrandColor(deal.marque_name) : "#4F46E5";
    const progressData = getDealProgress(deal);

    return (
      <div className="col-12 col-md-6 col-lg-4 mb-3">
        {/* Conteneur gris + carte blanche comme le screen */}
        <div
          style={{
            background:
              "linear-gradient(180deg, #F9FAFB 0%, #E5E7EB 80%, #E5E7EB 100%)",
            borderRadius: "26px",
            padding: "10px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "22px",
              padding: "16px 14px 14px",
              boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
              border: "1px solid #E5E7EB",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Badge type / Marque */}
            <div style={{ marginBottom: "12px" }}>
              <span
                style={{
                  backgroundColor: "#A855F7",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {deal.type === "marque" ? "Marque" : getBadgeName()}
              </span>
            </div>

            {/* Logo + bloc Gagné jusqu'à */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              {/* Logo */}
              <div
                style={{
                  width: "62px",
                  height: "62px",
                  borderRadius: "18px",
                  background:
                    "linear-gradient(145deg, #FEF3C7 0%, #FDE68A 50%, #FDBA74 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {deal.type === "marque" && deal.marque_name ? (
                  deal.marque_logo && !imageError ? (
                    <img
                      src={deal.marque_logo}
                      alt={deal.marque_name}
                      onError={() => setImageError(true)}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: `linear-gradient(135deg, ${brandColor}, ${brandColor}CC)`,
                        color: "white",
                        fontWeight: 800,
                        fontSize: "20px",
                      }}
                    >
                      {getBrandInitials(deal.marque_name)}
                    </div>
                  )
                ) : (
                  <div style={{ fontSize: "32px" }}>
                    {deal.type === "depense"
                      ? "💰"
                      : deal.type === "frequence"
                      ? "🔄"
                      : deal.type === "anniversaire"
                      ? "🎂"
                      : "🎁"}
                  </div>
                )}
              </div>

              {/* Texte à droite */}
              <div
                style={{
                  marginLeft: "12px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#111827",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  {deal.type === "marque" && deal.marque_name
                    ? deal.marque_name
                    : getBadgeName()}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    textAlign: "right",
                    color: "#6B7280",
                    lineHeight: 1.3,
                  }}
                >
                  Gagné jusqu&apos;à{" "}
                  <span
                    style={{
                      color: "#EF4444",
                      fontWeight: 800,
                    }}
                  >
                    {Number(objective.maxReward).toFixed(1)} DT
                  </span>
                  <br />
                  <span style={{ fontSize: "10px" }}>
                    si vous atteignez l&apos;objectif
                  </span>
                </div>
              </div>
            </div>

            {/* Titre / description */}
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#111827",
                  marginBottom: "3px",
                }}
              >
                {deal.type === "marque"
                  ? "Deal Marques"
                  : `Deal ${getBadgeName()}`}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#6B7280",
                  lineHeight: 1.4,
                }}
              >
                Profitez de ce deal et gagnez jusqu&apos;à{" "}
                {Number(objective.maxReward).toFixed(1)} DT.
              </div>
            </div>

            {/* Objectifs multiples */}
            {objective.objectives && objective.objectives.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  gap: "8px",
                }}
              >
                {objective.objectives.map((obj, idx) => {
                  const isCompleted = objective.current >= obj.value;
                  const isActive =
                    !isCompleted &&
                    objective.current < obj.value &&
                    (idx === 0 ||
                      objective.current >=
                        objective.objectives[idx - 1].value);

                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        backgroundColor: isCompleted
                          ? "#F97316"
                          : isActive
                          ? "#FFFFFF"
                          : "#F3F4F6",
                        borderRadius: "14px",
                        padding: "6px 4px",
                        textAlign: "center",
                        boxShadow: isCompleted
                          ? "0 6px 12px rgba(249,115,22,0.35)"
                          : "none",
                        border: isActive
                          ? `1px solid ${brandColor}`
                          : "1px solid #E5E7EB",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "9px",
                          color: isCompleted ? "#FFFBEB" : "#6B7280",
                          marginBottom: "3px",
                          fontWeight: 600,
                        }}
                      >
                        {obj.level}ère
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: isCompleted ? "white" : "#111827",
                        }}
                      >
                        {obj.value} DT
                      </div>
                      <div
                        style={{
                          fontSize: "9px",
                          color: isCompleted ? "#FED7AA" : "#F97316",
                          marginTop: "2px",
                          fontWeight: 600,
                        }}
                      >
                        +{obj.gain} DT
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Barre de progression */}
            <div style={{ marginBottom: "10px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "#6B7280",
                  }}
                >
                  {deal.type === "frequence"
                    ? `${Math.floor(objective.current)} visite${
                        Math.floor(objective.current) > 1 ? "s" : ""
                      }`
                    : `${Number(objective.current).toFixed(1)} DT`}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: brandColor,
                  }}
                >
                  {deal.type === "frequence"
                    ? `${objective.target} visite${
                        objective.target > 1 ? "s" : ""
                      }`
                    : `${objective.target} DT`}
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  backgroundColor: "#F3F4F6",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background:
                      "linear-gradient(90deg, #F59E0B 0%, #F97316 45%, #EF4444 100%)",
                    borderRadius: "999px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* Mes achats / visites */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                backgroundColor: "#FEF3C7",
                borderRadius: "10px",
                fontSize: "11px",
                marginBottom: "6px",
              }}
            >
              <span style={{ fontSize: "16px" }}>🎁</span>
              <span
                style={{
                  color: "#92400E",
                  fontWeight: 600,
                }}
              >
                {progressData.isFrequence
                  ? `Mes visites : ${progressData.current}`
                  : `Mes achats : ${Number(progressData.current).toFixed(
                      1
                    )} DT`}
                {deal.type === "marque" && deal.marque_name && (
                  <span
                    style={{
                      color: brandColor,
                      marginLeft: "4px",
                    }}
                  >
                    ({deal.marque_name})
                  </span>
                )}
              </span>
            </div>

            {/* Objectif en cours */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 10px",
                backgroundColor: "#ECFEFF",
                borderRadius: "10px",
                border: "1px solid #22D3EE",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  color: "#0891B2",
                }}
              >
                ⏳
              </span>
              <span
                style={{
                  color: "#0E7490",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                Objectif en cours : {Math.round(progress)}% complété
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CongratsModal = ({ data }) => (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "30px",
          textAlign: "center",
          maxWidth: "350px",
          width: "100%",
        }}
      >
        <div style={{ fontSize: "50px", marginBottom: "16px" }}>🎉</div>
        <h2
          style={{
            color: "#2D3748",
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "8px",
          }}
        >
          Félicitations!
        </h2>
        <p
          style={{
            color: "#718096",
            fontSize: "14px",
            marginBottom: "16px",
          }}
        >
          Vous avez transféré
        </p>
        <div
          style={{
            color: "#10B981",
            fontSize: "40px",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          {data?.amount} DT
        </div>
        <p
          style={{
            color: "#718096",
            fontSize: "13px",
            marginBottom: "20px",
          }}
        >
          vers votre cagnotte
        </p>
        <button
          style={{
            width: "100%",
            backgroundColor: "#7C3AED",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
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
      <div
        className="container-fluid vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#F7FAFC" }}
      >
        <div className="text-center">
          <div style={{ fontSize: "60px", marginBottom: "16px" }}>🎁</div>
          <h2
            style={{
              color: "#1A202C",
              fontSize: "20px",
              marginBottom: "8px",
            }}
          >
            Connectez-vous
          </h2>
          <p style={{ color: "#718096", fontSize: "14px" }}>
            pour voir vos offres fidélité
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F3F4F6",
        paddingBottom: "80px",
      }}
    >
      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #4C1D95 0%, #4F46E5 40%, #6366F1 100%)",
          padding: "32px 20px 40px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <div style={{ fontSize: "32px" }}>🎁</div>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "800",
                margin: 0,
              }}
            >
              Mes Offres Fidélité
            </h1>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              textAlign: "center",
              color: "#E0E7FF",
              fontWeight: "500",
            }}
          >
            {allDeals.length}{" "}
            {allDeals.length > 1 ? "offres actives" : "offre active"}
          </p>
        </div>
      </div>

      {/* Cartes stats */}
      <div className="container-fluid px-3 py-3">
        <div className="row g-2">
          {/* Cagnotte */}
          <div className="col-4">
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "16px",
                padding: "16px 10px",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                border: "1px solid #E2E8F0",
                position: "relative",
                overflow: "hidden",
                transform: "translateY(0)",
                transition: "all 0.3s ease",
                height: "100%",
              }}
              className="stat-card"
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#FEF9C3",
                  color: "#B45309",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  margin: "0 auto 12px",
                }}
              >
                💰
              </div>
              <div
                style={{
                  color: "#9CA3AF",
                  fontSize: "11px",
                  marginBottom: "4px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                Cagnotte
              </div>
              <div
                style={{
                  color: "#1F2937",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                {Number(Userprofile?.cagnotte_balance || 0).toFixed(1)} DT
              </div>
            </div>
          </div>

          {/* Gagné */}
          <div className="col-4">
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "16px",
                padding: "16px 10px",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                border: "1px solid #E2E8F0",
                position: "relative",
                overflow: "hidden",
                transform: "translateY(0)",
                transition: "all 0.3s ease",
                height: "100%",
              }}
              className="stat-card"
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#F0FDF4",
                  color: "#15803D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  margin: "0 auto 12px",
                }}
              >
                ✅
              </div>
              <div
                style={{
                  color: "#9CA3AF",
                  fontSize: "11px",
                  marginBottom: "4px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                Gagné
              </div>
              <div
                style={{
                  color: "#1F2937",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                {Number(totalEarned || 0).toFixed(1)} DT
              </div>
            </div>
          </div>

          {/* En attente */}
          <div className="col-4">
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "16px",
                padding: "16px 10px",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                border: "1px solid #E2E8F0",
                position: "relative",
                overflow: "hidden",
                transform: "translateY(0)",
                transition: "all 0.3s ease",
                height: "100%",
              }}
              className="stat-card"
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#F8FAFC",
                  color: "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  margin: "0 auto 12px",
                }}
              >
                ⏳
              </div>
              <div
                style={{
                  color: "#9CA3AF",
                  fontSize: "11px",
                  marginBottom: "4px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                En attente
              </div>
              <div
                style={{
                  color: "#1F2937",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                {Number(totalPending || 0).toFixed(1)} DT
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste deals */}
      <div className="container-fluid px-3">
        {loading ? (
          <div className="text-center py-5">
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
            <p style={{ color: "#718096" }}>Chargement des offres...</p>
          </div>
        ) : allDeals.length > 0 ? (
          <div className="row">
            {allDeals.map((deal, index) => {
              const isFullyCompletedFlag = isDealFullyCompleted(deal);
              return isFullyCompletedFlag ? (
                <VictoryCard
                  key={`${deal.type}_${deal.ID || index}`}
                  deal={deal}
                />
              ) : (
                <DealCard
                  key={`${deal.type}_${deal.ID || index}`}
                  deal={deal}
                />
              );
            })}
          </div>
        ) : (
          <div
            className="text-center py-5"
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: "60px", marginBottom: "16px" }}>🎁</div>
            <p
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#1A202C",
                marginBottom: "8px",
              }}
            >
              Aucune offre active
            </p>
            <p style={{ color: "#718096", fontSize: "14px" }}>
              Revenez bientôt pour de nouvelles offres !
            </p>
          </div>
        )}
      </div>

      {showCongrats && congratsData && <CongratsModal data={congratsData} />}

      <style>{`
        .stat-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08) !important;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .stat-card {
          animation: fadeIn 0.5s ease-out;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
};

export default MesDeals;
