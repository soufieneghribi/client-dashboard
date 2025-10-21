import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from "react-native";
import { useDispatch } from "react-redux";
import { transferDealToCagnotte } from "../store/slices/deals";

const DealCard = ({ deal, dealType, timeLeft }) => {
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(0);
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    // Calculate progress percentage
    const currentProgress = calculateProgress(deal, dealType);
    setProgress(currentProgress);
    
    // Animate progress bar
    Animated.timing(animatedValue, {
      toValue: currentProgress,
      duration: 1000,
      useNativeDriver: false
    }).start();
  }, [deal]);

  const calculateProgress = (deal, type) => {
    if (!deal) return 0;
    
    switch(type) {
      case 'depense':
      case 'marque':
      case 'anniversaire':
        const objectives = [
          deal.objectif_1,
          deal.objectif_2,
          deal.objectif_3,
          deal.objectif_4,
          deal.objectif_5
        ];
        const currentObjective = objectives.find(obj => 
          deal.compteur_objectif < obj
        ) || deal.objectif_5;
        return (deal.compteur_objectif / currentObjective) * 100;
        
      case 'frequence':
        return (deal.compteur_frequence / deal.objectif_frequence) * 100;
        
      default:
        return 0;
    }
  };

  const getCurrentObjective = () => {
    if (!deal) return { objective: 0, reward: 0 };
    
    const objectives = [
      { level: 1, value: deal.objectif_1, gain: deal.gain_objectif_1 },
      { level: 2, value: deal.objectif_2, gain: deal.gain_objectif_2 },
      { level: 3, value: deal.objectif_3, gain: deal.gain_objectif_3 },
      { level: 4, value: deal.objectif_4, gain: deal.gain_objectif_4 },
      { level: 5, value: deal.objectif_5, gain: deal.gain_objectif_5 }
    ];
    
    const current = objectives.find(obj => 
      deal.compteur_objectif < obj.value
    ) || objectives[objectives.length - 1];
    
    return current;
  };

  const handleTransfer = async () => {
    if (deal.amount_earned > 0) {
      dispatch(transferDealToCagnotte({
        dealType,
        dealId: deal.ID
      }));
    }
  };

  const formatTime = (time) => {
    if (!time) return "Expiré";
    return (
      <View style={styles.timerContainer}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeNumber}>{time.days}</Text>
          <Text style={styles.timeLabel}>JOURS</Text>
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.timeNumber}>{time.hours}</Text>
          <Text style={styles.timeLabel}>HEURES</Text>
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.timeNumber}>{time.minutes}</Text>
          <Text style={styles.timeLabel}>MIN</Text>
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.timeNumber}>{time.seconds}</Text>
          <Text style={styles.timeLabel}>SEC</Text>
        </View>
      </View>
    );
  };

  const currentObj = getCurrentObjective();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.earnedContainer}>
            <Text style={styles.earnedLabel}>Gagné</Text>
            <Text style={styles.earnedAmount}>{deal.amount_earned || 0} DT</Text>
          </View>
          <View style={styles.pendingContainer}>
            <Text style={styles.pendingLabel}>En attente</Text>
            <Text style={styles.pendingAmount}>
              {deal.status === 'pending' ? currentObj.gain : 0} DT
            </Text>
          </View>
        </View>

        {/* Brand Logo or Deal Image */}
        {dealType === 'marque' && deal.marque_logo && (
          <Image source={{ uri: deal.marque_logo }} style={styles.brandLogo} />
        )}

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>
            {dealType === 'frequence' 
              ? `${deal.compteur_frequence}/${deal.objectif_frequence} commandes`
              : `${deal.compteur_objectif} DT / ${currentObj.value} DT`
            }
          </Text>
          
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: animatedValue.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          </View>

          {/* Objectives Dots */}
          {dealType !== 'frequence' && (
            <View style={styles.objectiveDots}>
              {[1, 2, 3, 4, 5].map((level) => (
                <View 
                  key={level}
                  style={[
                    styles.dot,
                    deal.compteur_objectif >= deal[`objectif_${level}`] 
                      ? styles.dotCompleted 
                      : styles.dotPending
                  ]}
                >
                  <Text style={styles.dotText}>{level}ère</Text>
                  <Text style={styles.dotAmount}>
                    {deal[`objectif_${level}`]} DT
                  </Text>
                  <Text style={styles.dotReward}>
                    +{deal[`gain_objectif_${level}`]} DT
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Timer */}
        <View style={styles.timerSection}>
          <Text style={styles.timerTitle}>TEMPS RESTANT</Text>
          {formatTime(timeLeft)}
        </View>

        {/* Deal Info */}
        <View style={styles.infoSection}>
          <View style={styles.dealTypeTag}>
            <Text style={styles.dealTypeText}>{dealType.toUpperCase()}</Text>
          </View>
          
          {dealType === 'marque' && (
            <View style={styles.brandInfo}>
              <Text style={styles.brandName}>{deal.marque_name || 'SIGNAL'}</Text>
              <Text style={styles.rewardText}>
                Gagné jusqu'à {deal.gain_objectif_5 || 5.00} dt
              </Text>
              <Text style={styles.conditionText}>
                si vous atteignez l'objectif
              </Text>
            </View>
          )}
        </View>

        {/* Transfer Button */}
        {deal.amount_earned > 0 && (
          <TouchableOpacity 
            style={styles.transferButton}
            onPress={handleTransfer}
          >
            <Text style={styles.transferButtonText}>
              Transférer {deal.amount_earned} DT à la cagnotte
            </Text>
          </TouchableOpacity>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {dealType === 'depense' && "Deal Dépense"}
            {dealType === 'marque' && "Deal Marques"}
            {dealType === 'frequence' && "Deal Fréquence"}
            {dealType === 'anniversaire' && "Deal Anniversaire"}
          </Text>
          <Text style={styles.footerDescription}>
            {dealType === 'marque' && "Découvrez nos marques et gagnez jusqu'à 5 DT"}
            {dealType === 'depense' && "Plus vous dépensez, plus vous gagnez"}
            {dealType === 'frequence' && "Commandez régulièrement et économisez"}
            {dealType === 'anniversaire' && "Offre spéciale anniversaire"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    backgroundColor: '#FF6B4A',
    borderRadius: 8,
    padding: 10,
  },
  earnedContainer: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#FFFFFF50',
  },
  pendingContainer: {
    flex: 1,
    alignItems: 'center',
  },
  earnedLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 5,
  },
  earnedAmount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  pendingLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 5,
  },
  pendingAmount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  brandLogo: {
    width: 100,
    height: 60,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginVertical: 15,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  objectiveDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  dot: {
    alignItems: 'center',
    flex: 1,
  },
  dotCompleted: {
    opacity: 1,
  },
  dotPending: {
    opacity: 0.4,
  },
  dotText: {
    fontSize: 10,
    color: '#666',
  },
  dotAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  dotReward: {
    fontSize: 10,
    color: '#4CAF50',
  },
  timerSection: {
    marginBottom: 20,
  },
  timerTitle: {
    fontSize: 14,
    color: '#FF6B4A',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeBlock: {
    backgroundColor: '#2C3E50',
    borderRadius: 8,
    padding: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  timeNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  timeLabel: {
    color: '#FF6B4A',
    fontSize: 10,
    marginTop: 5,
  },
  infoSection: {
    marginBottom: 15,
  },
  dealTypeTag: {
    backgroundColor: '#6B5B95',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  dealTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  brandInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  rewardText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  conditionText: {
    fontSize: 14,
    color: '#666',
  },
  transferButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  transferButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  footerDescription: {
    fontSize: 12,
    color: '#666',
  },
});

export default DealCard;