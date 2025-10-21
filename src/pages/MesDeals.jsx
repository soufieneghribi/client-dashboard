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
    if (isLoggedIn && !Userprofile) dispatch(fetchUserProfile());
  }, [dispatch, isLoggedIn, Userprofile]);

  useEffect(() => {
    if (Userprofile?.ID_client && allDeals.length === 0) {
      dispatch(fetchClientDeals(Userprofile.ID_client));
    }
  }, [dispatch, Userprofile, allDeals.length]);

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

  const totalGagne = allDeals.reduce((sum, deal) => {
    const getCurrentEarned = () => {
      if (deal.type === "frequence") {
        const current = parseFloat(deal.compteur_frequence) || 0;
        const target = parseFloat(deal.objectif_frequence) || 5;
        return current >= target ? parseFloat(deal.gain) || 0 : 0;
      }

      const objectives = [
        { value: parseFloat(deal.objectif_1), gain: parseFloat(deal.gain_objectif_1) },
        { value: parseFloat(deal.objectif_2), gain: parseFloat(deal.gain_objectif_2) },
        { value: parseFloat(deal.objectif_3), gain: parseFloat(deal.gain_objectif_3) },
        { value: parseFloat(deal.objectif_4), gain: parseFloat(deal.gain_objectif_4) },
        { value: parseFloat(deal.objectif_5), gain: parseFloat(deal.gain_objectif_5) },
      ];

      const current = parseFloat(deal.compteur_objectif) || 0;
      let earned = 0;
      objectives.forEach((obj) => {
        if (current >= obj.value) earned = obj.gain || 0;
      });
      return earned;
    };
    return sum + getCurrentEarned();
  }, 0);

  const totalEnAttente = allDeals.reduce((sum, deal) => {
    const getCurrentReward = () => {
      if (deal.type === "frequence") return parseFloat(deal.gain) || 0;
      const objectives = [
        { value: parseFloat(deal.objectif_1), gain: parseFloat(deal.gain_objectif_1) },
        { value: parseFloat(deal.objectif_2), gain: parseFloat(deal.gain_objectif_2) },
        { value: parseFloat(deal.objectif_3), gain: parseFloat(deal.gain_objectif_3) },
        { value: parseFloat(deal.objectif_4), gain: parseFloat(deal.gain_objectif_4) },
        { value: parseFloat(deal.objectif_5), gain: parseFloat(deal.gain_objectif_5) },
      ];
      const current = parseFloat(deal.compteur_objectif) || 0;
      const active = objectives.find((o) => current < o.value) || objectives[4];
      return active.gain || 0;
    };
    return sum + getCurrentReward();
  }, 0);

  const handleTransfer = async (dealType, dealId, amount) => {
    try {
      await dispatch(transferDealToCagnotte({ dealType, dealId, amount })).unwrap();
      setCongratsData({ amount, type: dealType });
      setShowCongrats(true);
      setTimeout(() => setShowCongrats(false), 5000);
      if (Userprofile?.ID_client) dispatch(fetchClientDeals(Userprofile.ID_client));
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
      };
    };

    const objective = getCurrentObjective();
    const progress = Math.min((objective.current / objective.target) * 100, 100);

    let earnedAmount = 0;
    if (deal.type === "frequence") {
      if (objective.current >= objective.target) earnedAmount = objective.reward;
    } else {
      const objectives = objective.objectives || [];
      objectives.forEach((obj) => {
        if (objective.current >= obj.value) earnedAmount = obj.gain;
      });
    }

    return (
      <div className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="deal-card card border-0 shadow-sm rounded-4 h-100">
          <div className="card-body">
            <div className="badge bg-primary text-white mb-3 px-3 py-2 rounded-pill">
              {deal.type.toUpperCase()}
            </div>

            {deal.type === "marque" && (
              <div className="text-center mb-3">
                {deal.marque_logo && !imageError ? (
                  <img
                    src={deal.marque_logo}
                    alt="marque"
                    onError={() => setImageError(true)}
                    style={{ height: "60px", objectFit: "contain" }}
                  />
                ) : (
                  <div className="fw-bold text-primary">{deal.marque_name || "Marque"}</div>
                )}
              </div>
            )}

            <div className="mb-3 text-center text-muted small">
              {deal.type === "depense" && "Plus vous dépensez, plus vous gagnez."}
              {deal.type === "frequence" && "Commandez régulièrement et économisez."}
              {deal.type === "marque" && "Découvrez nos marques partenaires."}
              {deal.type === "anniversaire" && "Offre spéciale pour votre anniversaire."}
            </div>

            <div className="progress rounded-pill mb-3" style={{ height: "8px", backgroundColor: "#E0E7FF" }}>
              <div
                className="progress-bar"
                style={{ width: `${progress}%`, backgroundColor: "#4F46E5" }}
              ></div>
            </div>

            <div className="d-flex justify-content-between fw-bold mb-3" style={{ color: "#4F46E5" }}>
              <span>{objective.current.toFixed(2)} / {objective.target}</span>
              <span>{Math.round(progress)}%</span>
            </div>

            {timeLeft && (
              <div className="text-center small text-muted mb-3">
                ⏰ {timeLeft.days}j {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </div>
            )}

            {earnedAmount > 0 && (
              <button
                className="btn w-100 rounded-pill fw-bold py-2"
                style={{ backgroundColor: "#4F46E5", color: "white" }}
                onClick={() => handleTransfer(deal.type, deal.ID, earnedAmount)}
              >
                Transférer {earnedAmount} DT à la cagnotte
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CongratsModal = ({ data }) => (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow">
          <div className="modal-body text-center p-5">
            <div className="display-3 text-primary mb-3">🎉</div>
            <h4 className="fw-bold mb-3 text-primary">Félicitations!</h4>
            <p className="text-muted">Vous avez gagné</p>
            <h2 className="fw-bold text-primary mb-4">{data?.amount} DT</h2>
            <button
              className="btn rounded-pill px-4"
              style={{ backgroundColor: "#4F46E5", color: "white" }}
              onClick={() => setShowCongrats(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light text-center">
        <div>
          <div className="display-1 text-primary mb-4">🎁</div>
          <h2>Connectez-vous pour voir vos offres</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#F9FAFB" }}>
      <div className="text-white text-center py-5 shadow-sm mb-4"
           style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}>
        <h1 className="fw-bold mb-1">Offres Fidélité</h1>
        <p className="mb-0 opacity-75">{allDeals.length} offres disponibles</p>
      </div>

      <div className="container mb-4">
        <div className="row text-center g-3">
          <div className="col-6">
            <div className="p-3 bg-white border rounded-3 shadow-sm">
              <div className="small text-muted">Cagnotte</div>
              <h4 className="fw-bold text-primary">
                {Userprofile?.cagnotte_balance || 0} DT
              </h4>
            </div>
          </div>
          <div className="col-3">
            <div className="p-3 bg-white border rounded-3 shadow-sm">
              <div className="small text-muted">Gagné</div>
              <h4 className="fw-bold text-primary">{totalGagne} DT</h4>
            </div>
          </div>
          <div className="col-3">
            <div className="p-3 bg-white border rounded-3 shadow-sm">
              <div className="small text-muted">En attente</div>
              <h4 className="fw-bold text-primary">{totalEnAttente} DT</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="text-center py-5 text-primary">
            <div className="spinner-border text-primary mb-3"></div>
            <p>Chargement des offres...</p>
          </div>
        ) : allDeals.length > 0 ? (
          <div className="row g-4">
            {allDeals.map((d) => <DealCard key={`${d.type}_${d.ID}`} deal={d} />)}
          </div>
        ) : (
          <div className="text-center text-muted py-5">Aucune offre active</div>
        )}
      </div>

      {showCongrats && congratsData && <CongratsModal data={congratsData} />}

      <style jsx>{`
        .deal-card:hover {
          transform: translateY(-5px);
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default MesDeals;
