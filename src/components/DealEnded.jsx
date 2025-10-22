import React, { useEffect, useState } from 'react';
import { fetchUserProfile, updateCagnotteInDB } from '../store/slices/user';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

const DealEnded = ({ gain, image }) => {
  const [hasClicked, setHasClicked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { Userprofile } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    const gainKey = `gain_added_${gain}_${image}`;
    const hasAlreadyAdded = localStorage.getItem(gainKey);
    if (hasAlreadyAdded) {
      setHasClicked(true);
    }
  }, [gain, image]);

  const handleAddToCagnotte = async () => {
    if (hasClicked || isProcessing) return;

    setIsProcessing(true);
    const gainKey = `gain_added_${gain}_${image}`;

    try {
      const updatedBalance = parseFloat(gain);
      
      await dispatch(updateCagnotteInDB(updatedBalance)).unwrap();
      await dispatch(fetchUserProfile()).unwrap();
      
      localStorage.setItem(gainKey, 'true');
      setHasClicked(true);
      
      toast.success(`${gain} DT ajoutés à votre cagnotte!`, {
        duration: 3000,
        icon: '🎉',
      });
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la cagnotte');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const styles = {
    container: {
      background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
      borderRadius: '16px',
      padding: '24px',
      color: 'white',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      cursor: hasClicked || isProcessing ? 'default' : 'pointer',
      transition: 'transform 0.2s',
    },
    content: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    image: {
      width: '100px',
      height: '100px',
      objectFit: 'contain',
      background: 'white',
      borderRadius: '12px',
      padding: '8px',
    },
    textSection: {
      flex: 1,
    },
    title: {
      fontSize: '18px',
      fontWeight: 'bold',
      margin: '0 0 8px 0',
    },
    reward: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#FFD700',
      margin: '8px 0',
    },
    action: {
      fontSize: '14px',
      margin: '8px 0 0 0',
      opacity: 0.9,
    },
  };

  const containerHoverStyle = !hasClicked && !isProcessing ? {
    ':hover': {
      transform: 'scale(1.02)',
    }
  } : {};

  if (hasClicked) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <img
            src={image}
            alt="Deal terminé"
            style={styles.image}
          />
          <div style={styles.textSection}>
            <p style={styles.title}>✓ Mission accomplie!</p>
            <p style={styles.reward}>{gain} DT</p>
            <p style={styles.action}>Ajouté à votre cagnotte avec succès</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={styles.container}
      onClick={handleAddToCagnotte}
      onMouseEnter={(e) => {
        if (!hasClicked && !isProcessing) {
          e.currentTarget.style.transform = 'scale(1.02)';
        }
      }}
      onMouseLeave={(e) => {
        if (!hasClicked && !isProcessing) {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      <div style={styles.content}>
        <img
          src={image}
          alt="Deal terminé"
          style={styles.image}
        />
        <div style={styles.textSection}>
          <p style={styles.title}>
            {isProcessing ? 'Traitement...' : '🎉 Félicitations!'}
          </p>
          <p style={styles.reward}>{gain} DT</p>
          <p style={styles.action}>
            {isProcessing 
              ? 'Ajout en cours...'
              : 'Cliquez pour ajouter à votre cagnotte'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default DealEnded;