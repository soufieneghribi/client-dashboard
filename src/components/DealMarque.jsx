import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../store/slices/user";
import { fetchDealMarque } from "../store/slices/dealMarque.js";
import DealEnded from "./DealEnded.jsx";
import Timer from "./Timer";

const DealMarque = ({ Time }) => {
  const { marque = [], loading, error } = useSelector((state) => state.marque);
  const { Userprofile } = useSelector((state) => state.user);
  const [objectif, setObjectif] = useState("0%");
  const [gain, setGain] = useState(0);
  
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchDealMarque());
  }, [dispatch]);

  const filteredDeals = marque.filter(
    (el) => Userprofile && el.ID_client === Userprofile.ID_client
  );

  useEffect(() => {
    if (filteredDeals.length > 0) {
      filteredDeals.forEach((deals) => {
        const compteur = parseFloat(deals.compteur_objectif);
        const obj1 = parseFloat(deals.objectif_1);
        const obj2 = parseFloat(deals.objectif_2);
        const obj3 = parseFloat(deals.objectif_3);

        if (compteur >= obj3) {
          setObjectif("100%");
          setGain(deals.gain_objectif_3);
        } else if (compteur >= obj2) {
          const progress = ((compteur - obj2) / (obj3 - obj2)) * 33.33 + 66.66;
          setObjectif(`${progress}%`);
          setGain(deals.gain_objectif_2);
        } else if (compteur >= obj1) {
          const progress = ((compteur - obj1) / (obj2 - obj1)) * 33.33 + 33.33;
          setObjectif(`${progress}%`);
          setGain(deals.gain_objectif_1);
        } else if (compteur > 0) {
          const progress = (compteur / obj1) * 33.33;
          setObjectif(`${progress}%`);
          setGain(0);
        } else {
          setObjectif("0%");
          setGain(0);
        }
      });
    }
  }, [filteredDeals]);

  const styles = {
    card: {
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    content: {
      padding: '16px',
    },
    header: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: '12px',
    },
    badge: {
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '600',
      color: 'white',
      background: 'linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)',
    },
    infoSection: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      marginBottom: '20px',
    },
    logo: {
      width: '100px',
      height: '100px',
      objectFit: 'contain',
      borderRadius: '12px',
      padding: '8px',
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
    },
    textInfo: {
      flex: 1,
    },
    description: {
      fontSize: '14px',
      color: '#666',
      margin: '0 0 4px 0',
    },
    reward: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#FF5722',
      margin: '4px 0',
    },
    condition: {
      fontSize: '13px',
      color: '#666',
      margin: '4px 0 0 0',
      lineHeight: '1.4',
    },
    progressSection: {
      marginTop: '20px',
    },
    progressContainer: {
      position: 'relative',
      width: '100%',
      height: '40px',
      background: '#e0e0e0',
      borderRadius: '20px',
      border: '2px solid #333',
      overflow: 'visible',
      marginBottom: '60px',
    },
    progressBar: {
      height: '100%',
      background: 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%)',
      borderRadius: '18px',
      transition: 'width 0.5s ease',
    },
    marker: {
      position: 'absolute',
      top: '50%',
      transform: 'translateX(-50%) translateY(-50%)',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: '600',
      color: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      zIndex: 2,
    },
    value: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      transform: 'translateX(-50%)',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: '600',
      color: 'white',
      background: '#1A237E',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    },
    status: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: '#333',
      marginTop: '16px',
    },
    currentGain: {
      color: '#4CAF50',
      fontWeight: '600',
      marginLeft: '8px',
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      background: 'white',
      borderRadius: '16px',
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #6A1B9A',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    error: {
      padding: '20px',
      background: '#ffebee',
      color: '#c62828',
      borderRadius: '12px',
      textAlign: 'center',
    },
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p>Erreur: {error}</p>
      </div>
    );
  }

  const renderObjectiveMarker = (el, position, objValue, gainValue, isAchieved) => {
    return (
      <div key={position}>
        <span
          style={{
            ...styles.marker,
            left: position,
            background: isAchieved 
              ? "linear-gradient(135deg, #d19e1d 0%, #ffd86e 50%, #e3a812 100%)"
              : "#9e9e9e",
          }}
        >
          {gainValue}dt
        </span>
        <span
          style={{
            ...styles.value,
            left: position,
          }}
        >
          {parseInt(objValue)}dt
        </span>
      </div>
    );
  };

  return (
    <div>
      {filteredDeals.length > 0 &&
        filteredDeals.map((el) =>
          parseFloat(el.compteur_objectif) < parseFloat(el.objectif_3) ? (
            <div key={el.ID_deal_marque} style={styles.card}>
              <Timer flashSaleTimeLeft={Time} />
              
              <div style={styles.content}>
                <div style={styles.header}>
                  <span style={styles.badge}>Marque</span>
                </div>

                <div style={styles.infoSection}>
                  <img
                    src={el.marque?.marqueLogo}
                    alt={el.marque?.nom || "Marque"}
                    style={styles.logo}
                  />
                  
                  <div style={styles.textInfo}>
                    <p style={styles.description}>Gagné jusqu'à</p>
                    <p style={styles.reward}>{el.gain_objectif_3} dt</p>
                    <p style={styles.condition}>si vous atteignez l'objectif</p>
                  </div>
                </div>

                <div style={styles.progressSection}>
                  <div style={styles.progressContainer}>
                    {renderObjectiveMarker(
                      el,
                      "33.33%",
                      el.objectif_1,
                      el.gain_objectif_1,
                      parseFloat(el.compteur_objectif) >= parseFloat(el.objectif_1)
                    )}
                    {renderObjectiveMarker(
                      el,
                      "66.66%",
                      el.objectif_2,
                      el.gain_objectif_2,
                      parseFloat(el.compteur_objectif) >= parseFloat(el.objectif_2)
                    )}
                    {renderObjectiveMarker(
                      el,
                      "100%",
                      el.objectif_3,
                      el.gain_objectif_3,
                      parseFloat(el.compteur_objectif) >= parseFloat(el.objectif_3)
                    )}

                    <div style={{...styles.progressBar, width: objectif}}></div>
                  </div>

                  <div style={styles.status}>
                    <i className="fas fa-shopping-bag" style={{color: '#FF5722', fontSize: '16px'}}></i>
                    <span>Mes achats: {parseFloat(el.compteur_objectif).toFixed(2)} DT</span>
                    {gain > 0 && (
                      <span style={styles.currentGain}>
                        (Gain: {gain} DT)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div key={el.ID_deal_marque}>
              <DealEnded 
                gain={el.gain_objectif_3} 
                image={el.marque?.marqueLogo} 
              />
            </div>
          )
        )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default DealMarque;