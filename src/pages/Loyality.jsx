import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getLoyaltyCard,
  generateLoyaltyCard,
  reportLostCard,
  getLoyaltyCardHistory
} from "../store/slices/loyaltyCardSlice";
import { Container, Row, Col, Card, Button, Spinner, Modal, Alert } from 'react-bootstrap';
import { 
  FiCreditCard, 
  FiRefreshCw, 
  FiCopy, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiClock,
  FiTrendingUp,
  FiGift,
  FiDownload,
  FiUser
} from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode'; // 🆕 AJOUTÉ pour le code-barres
import { toast } from "react-hot-toast";

const Loyality = () => {
  const dispatch = useDispatch();
  const { loyaltyCard, history, loading, isGenerating, error } = useSelector((state) => state.loyaltyCard);
  const { Userprofile } = useSelector((state) => state.user);
  
  const [showLostCardModal, setShowLostCardModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 🆕 État pour gérer la carte déclarée perdue
  const [cardDeclaredLost, setCardDeclaredLost] = useState(false);
  const [lostReason, setLostReason] = useState('');
  
  // 🆕 État pour déclencher le refresh automatique
  const [shouldRefreshPage, setShouldRefreshPage] = useState(false);

  // Debug logs
  console.log("🔍 Loyalty Card State in Component:", loyaltyCard);
  console.log("🔍 Card Declared Lost:", cardDeclaredLost);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔄 Starting data fetch...");
        await Promise.all([
          dispatch(getLoyaltyCard()).unwrap(),
          dispatch(getLoyaltyCardHistory()).unwrap()
        ]);
        console.log("✅ Data fetch completed");
      } catch (err) {
        console.error("❌ Error during data fetch:", err);
      }
    };
    fetchData();
  }, [dispatch]);

  // 🆕 useEffect pour refresh automatique après génération
  useEffect(() => {
    if (shouldRefreshPage) {
      console.log("🔄 Refreshing page after card generation...");
      // Petit délai pour permettre au toast success de s'afficher
      const timer = setTimeout(() => {
        window.location.reload();
      }, 1500); // 1.5 secondes pour voir le toast success
      
      return () => clearTimeout(timer);
    }
  }, [shouldRefreshPage]);

  // Get history array from response
  const historyArray = history?.history || history || [];

  // 🆕 Étape 1 : Confirmer la déclaration de perte (pas d'appel API)
  const handleConfirmLostDeclaration = useCallback(() => {
    console.log("✅ Carte déclarée comme perdue (étape 1)");
    setCardDeclaredLost(true);
    setLostReason("Carte perdue"); // ou autre raison selon sélection
    setShowLostCardModal(false);
    
    toast.info("Carte déclarée comme perdue. Générez une nouvelle carte pour continuer.");
  }, []);

  // 🆕 Étape 2 : Générer la nouvelle carte (APPEL API)
  const handleGenerateNewCard = useCallback(async () => {
    try {
      console.log("🔄 Generating new card after lost declaration...");
      
      // Appel API pour déclarer carte perdue et générer nouvelle
      await dispatch(reportLostCard(lostReason)).unwrap();
      
      // Reset l'état
      setCardDeclaredLost(false);
      setLostReason('');
      
      // Actualiser l'historique
      await dispatch(getLoyaltyCardHistory()).unwrap();
      
      console.log("✅ New card generation completed");
      
      // 🆕 Déclencher le refresh automatique de la page
      setShouldRefreshPage(true);
      
    } catch (err) {
      console.error("❌ Error during card generation:", err);
    }
  }, [dispatch, lostReason]);

  // Handle card generation (première carte)
  const handleGenerateCard = useCallback(async () => {
    try {
      console.log("🔄 Generating first card...");
      await dispatch(generateLoyaltyCard()).unwrap();
      await dispatch(getLoyaltyCardHistory()).unwrap();
      console.log("✅ Card generation completed");
    } catch (err) {
      console.error("❌ Error during card generation:", err);
    }
  }, [dispatch]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      console.log("🔄 Refreshing data...");
      await Promise.all([
        dispatch(getLoyaltyCard()).unwrap(),
        dispatch(getLoyaltyCardHistory()).unwrap()
      ]);
      toast.success("Données actualisées avec succès !");
      console.log("✅ Data refresh completed");
    } catch (err) {
      console.error("❌ Error during refresh:", err);
      toast.error("Erreur lors de l'actualisation");
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch]);

  // Copy to clipboard
  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success("Code copié dans le presse-papiers !"),
      () => toast.error("Erreur lors de la copie")
    );
  }, []);

  // Download QR Code
  const downloadQRCode = useCallback(() => {
    const svg = document.getElementById("loyalty-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.download = `carte-fidelite-${loyaltyCard?.code}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast.success("QR Code téléchargé !");
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, [loyaltyCard]);

  // Format date helper
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    if (/^\d{2}\/\d{2}\/\d{4}/.test(dateString)) {
      return dateString;
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const styles = {
    container: { 
      minHeight: '100vh', 
      paddingTop: '2rem', 
      paddingBottom: '3rem',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    },
    headerCard: { 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px', 
      border: 'none', 
      marginBottom: '2rem', 
      boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
      overflow: 'hidden',
      color: 'white'
    },
    loyaltyCardContainer: {
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      borderRadius: '20px',
      padding: '2rem',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '2rem',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    },
    // 🆕 Style pour carte déclarée perdue
    lostCardContainer: {
      background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
      borderRadius: '20px',
      padding: '2rem',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '2rem',
      boxShadow: '0 20px 60px rgba(220, 53, 69, 0.3)'
    },
    loyaltyCardPattern: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: '300px',
      height: '300px',
      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
      borderRadius: '50%',
      transform: 'translate(30%, -30%)'
    },
    button: { 
      fontWeight: '600', 
      borderRadius: '12px', 
      padding: '0.75rem 1.75rem', 
      border: 'none', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem', 
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    primaryButton: { 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      color: 'white', 
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    },
    whiteButton: {
      background: 'white',
      color: '#667eea',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    outlineButton: {
      background: 'transparent',
      color: 'white',
      border: '2px solid white'
    },
    // 🆕 Style pour bouton de génération après perte
    generateButton: {
      background: 'white',
      color: '#dc3545',
      boxShadow: '0 4px 15px rgba(255, 255, 255, 0.4)',
      fontSize: '1.1rem',
      padding: '1rem 2rem'
    }
  };

  // Loading state
  if (loading && !loyaltyCard && !historyArray.length) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="text-center">
          <Spinner animation="border" style={{ width: '3rem', height: '3rem', color: '#667eea' }} />
          <p className="mt-3" style={{ color: '#667eea', fontWeight: '600' }}>Chargement de votre carte...</p>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur a une carte fidélité
  const hasCard = loyaltyCard && loyaltyCard.code;
  
  // Récupérer les informations
  const userName = loyaltyCard?.client_name || Userprofile?.nom_et_prenom || 'Client';
  const cagnotteBalance = loyaltyCard?.balance || Userprofile?.cagnotte_balance || 0;
  const displayCode = loyaltyCard?.formatted_code || '';

  return (
    <div style={styles.container}>
      <Container>
        {/* Error Alert */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => dispatch({ type: 'loyaltyCard/clearError' })}>
            <FiAlertCircle className="me-2" />
            {error}
          </Alert>
        )}

        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div className="mb-3 mb-md-0">
                <h1 className="mb-1" style={{ fontSize: '2rem', fontWeight: '700' }}>
                  <FiCreditCard className="me-2" />
                  Ma Carte Fidélité
                </h1>
                <p className="mb-0" style={{ opacity: 0.9 }}>
                  Gérez votre fidélité et gagnez des points
                </p>
              </div>
              {hasCard && !cardDeclaredLost && (
                <Button 
                  onClick={handleRefresh}
                  style={{ ...styles.button, ...styles.whiteButton }}
                  disabled={isRefreshing || loading}
                >
                  <FiRefreshCw size={18} className={isRefreshing ? 'spin' : ''} />
                  {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>

        <Row>
          <Col lg={8} className="mx-auto">
            {/* 🆕 ÉTAT : Carte déclarée perdue - Afficher bouton "Générer ma carte" */}
            {cardDeclaredLost ? (
              <div style={styles.lostCardContainer}>
                <div style={styles.loyaltyCardPattern}></div>
                
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                  <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    background: 'rgba(255,255,255,0.2)', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <FiAlertCircle size={50} />
                  </div>

                  <h2 className="mb-3" style={{ fontSize: '1.75rem', fontWeight: '700' }}>
                    Carte Déclarée Perdue
                  </h2>
                  
                  <p className="mb-4" style={{ fontSize: '1.1rem', opacity: 0.95, maxWidth: '500px', margin: '0 auto 2rem' }}>
                    Votre ancienne carte a été déclarée comme perdue. 
                    Cliquez sur le bouton ci-dessous pour générer une nouvelle carte.
                  </p>

                  {/* 🆕 Bouton pour générer la nouvelle carte - APPEL API ICI */}
                  <Button
                    onClick={handleGenerateNewCard}
                    disabled={isGenerating}
                    style={{ ...styles.button, ...styles.generateButton }}
                  >
                    {isGenerating ? (
                      <>
                        <Spinner animation="border" size="sm" style={{ color: '#dc3545' }} />
                        <span style={{ color: '#dc3545' }}>Génération en cours...</span>
                      </>
                    ) : (
                      <>
                        <FiCreditCard size={24} />
                        Générer ma nouvelle carte
                      </>
                    )}
                  </Button>

                  <p className="mt-3" style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    Une nouvelle carte sera créée et votre ancienne carte sera définitivement désactivée.
                  </p>
                </div>
              </div>
            ) : hasCard ? (
              /* ÉTAT : Carte active normale */
              <div style={styles.loyaltyCardContainer}>
                <div style={styles.loyaltyCardPattern}></div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <p className="mb-1" style={{ opacity: 0.9, fontSize: '0.875rem', fontWeight: '500' }}>
                        CARTE FIDÉLITÉ
                      </p>
                      <h2 className="mb-0" style={{ fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
                        TN360
                      </h2>
                    </div>
                    <div className="text-end">
                      <div 
                        style={{ 
                          background: 'rgba(255,255,255,0.2)', 
                          backdropFilter: 'blur(10px)', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <FiCheckCircle size={16} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                          {loyaltyCard?.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="mb-2" style={{ opacity: 0.9, fontSize: '0.75rem', fontWeight: '600', letterSpacing: '1px' }}>
                      NUMÉRO DE CARTE
                    </p>
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      <h3 className="mb-0" style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'monospace', letterSpacing: '2px' }}>
                        {displayCode}
                      </h3>
                      <Button
                        onClick={() => copyToClipboard(loyaltyCard.code)}
                        style={{
                          background: 'rgba(255,255,255,0.2)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.5rem',
                          color: 'white',
                          backdropFilter: 'blur(10px)',
                          cursor: 'pointer'
                        }}
                        title="Copier le code"
                      >
                        <FiCopy size={18} />
                      </Button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
                    <div>
                      <p className="mb-1" style={{ opacity: 0.9, fontSize: '0.75rem', fontWeight: '600', letterSpacing: '1px' }}>
                        TITULAIRE
                      </p>
                      <p className="mb-0" style={{ fontSize: '1.125rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiUser size={16} />
                        {userName}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="mb-1" style={{ opacity: 0.9, fontSize: '0.75rem', fontWeight: '600', letterSpacing: '1px' }}>
                        SOLDE CAGNOTTE
                      </p>
                      <p className="mb-0" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                        {parseFloat(cagnotteBalance).toFixed(2)} DT
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 d-flex gap-2 flex-wrap">
                    <Button
                      onClick={() => setShowQRModal(true)}
                      style={{ ...styles.button, ...styles.whiteButton, flex: '1 1 auto' }}
                    >
                      Afficher QR Code
                    </Button>
                    <Button
                      onClick={() => setShowLostCardModal(true)}
                      style={{ ...styles.button, ...styles.outlineButton, flex: '0 1 auto' }}
                    >
                      <FiAlertCircle size={18} />
                      Carte perdue
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* ÉTAT : Pas encore de carte */
              <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)', background: 'white' }}>
                <Card.Body className="p-5 text-center">
                  <div className="mb-4">
                    <div 
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                      }}
                    >
                      <FiCreditCard size={50} color="white" />
                    </div>
                  </div>
                  <h3 style={{ fontWeight: '700', marginBottom: '1rem', color: '#212529' }}>
                    Vous n'avez pas encore de carte fidélité
                  </h3>
                  <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
                    Générez votre carte pour commencer à accumuler des points et profiter d'avantages exclusifs
                  </p>
                  <Button
                    onClick={handleGenerateCard}
                    disabled={isGenerating}
                    style={{ ...styles.button, ...styles.primaryButton }}
                  >
                    {isGenerating ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <FiCreditCard size={20} />
                        Générer ma carte
                      </>
                    )}
                  </Button>
                </Card.Body>
              </Card>
            )}

            {/* Advantages Section */}
            {hasCard && !cardDeclaredLost && (
              <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)', marginTop: '2rem', background: 'white' }}>
                <Card.Body className="p-4">
                  <h4 style={{ fontWeight: '700', marginBottom: '1.5rem', color: '#212529' }}>
                    <FiGift className="me-2" />
                    Avantages de la carte fidélité
                  </h4>
                  <Row>
                    <Col md={6} className="mb-3">
                      <div className="d-flex gap-3">
                        <div style={{ fontSize: '2rem' }}>🎁</div>
                        <div>
                          <h6 style={{ fontWeight: '600', color: '#212529' }}>Gagnez des points</h6>
                          <p style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: 0 }}>
                            À chaque achat, accumulez des points sur votre cagnotte
                          </p>
                        </div>
                      </div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div className="d-flex gap-3">
                        <div style={{ fontSize: '2rem' }}>💰</div>
                        <div>
                          <h6 style={{ fontWeight: '600', color: '#212529' }}>Réductions exclusives</h6>
                          <p style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: 0 }}>
                            Profitez d'offres spéciales réservées aux membres
                          </p>
                        </div>
                      </div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div className="d-flex gap-3">
                        <div style={{ fontSize: '2rem' }}>🎉</div>
                        <div>
                          <h6 style={{ fontWeight: '600', color: '#212529' }}>Cadeaux d'anniversaire</h6>
                          <p style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: 0 }}>
                            Recevez des surprises pour votre anniversaire
                          </p>
                        </div>
                      </div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div className="d-flex gap-3">
                        <div style={{ fontSize: '2rem' }}>⚡</div>
                        <div>
                          <h6 style={{ fontWeight: '600', color: '#212529' }}>Accès prioritaire</h6>
                          <p style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: 0 }}>
                            Soyez le premier informé des nouveautés
                          </p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>

        {/* 🆕 MODAL AMÉLIORÉ - QR Code + Code-barres côte à côte */}
        <Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered size="lg">
          <Modal.Header closeButton style={{ border: 'none', paddingBottom: 0 }}>
            <Modal.Title style={{ fontWeight: '700', color: '#212529' }}>
              Votre Carte Fidélité Complète
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-5">
            {/* Code numérique */}
            <div className="text-center mb-4">
              <p style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem', fontWeight: '600' }}>
                CODE DE LA CARTE
              </p>
              <p style={{ fontWeight: '700', fontSize: '1.75rem', fontFamily: 'monospace', color: '#212529', letterSpacing: '3px' }}>
                {displayCode}
              </p>
            </div>

            <Row className="justify-content-center">
              {/* QR Code */}
              <Col md={6} className="text-center mb-4">
                <div className="mb-3">
                  <h5 style={{ fontWeight: '600', color: '#212529', fontSize: '1rem' }}>QR Code</h5>
                  <p style={{ fontSize: '0.75rem', color: '#6c757d' }}>Scannez avec votre téléphone</p>
                </div>
                <div 
                  style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    display: 'inline-block',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    border: '2px solid #f8f9fa'
                  }}
                >
                  <QRCodeSVG 
                    id="loyalty-qr-code"
                    value={loyaltyCard?.code || ''} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </Col>

              {/* Code-barres */}
              <Col md={6} className="text-center mb-4">
                <div className="mb-3">
                  <h5 style={{ fontWeight: '600', color: '#212529', fontSize: '1rem' }}>Code-Barres</h5>
                  <p style={{ fontSize: '0.75rem', color: '#6c757d' }}>Présentez en caisse</p>
                </div>
                <div 
                  style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    display: 'inline-block',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    border: '2px solid #f8f9fa'
                  }}
                >
                  <Barcode 
                    id="loyalty-barcode"
                    value={loyaltyCard?.code || ''} 
                    format="CODE128"
                    width={2}
                    height={80}
                    displayValue={true}
                    fontSize={14}
                    background="white"
                    lineColor="#000"
                  />
                </div>
              </Col>
            </Row>

            {/* Instructions */}
            <div 
              style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '12px',
                marginTop: '1.5rem'
              }}
            >
              <h6 style={{ fontWeight: '600', color: '#212529', marginBottom: '0.75rem' }}>
                💡 Comment utiliser votre carte ?
              </h6>
              <ul style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: 0, paddingLeft: '1.25rem' }}>
                <li>Présentez le QR Code ou le code-barres lors de vos achats en magasin</li>
                <li>Téléchargez l'image pour l'avoir toujours sur vous</li>
                <li>Vous pouvez aussi simplement communiquer le code numérique</li>
              </ul>
            </div>

            {/* Boutons d'action */}
            <div className="d-flex gap-2 justify-content-center flex-wrap mt-4">
              <Button
                onClick={downloadQRCode}
                style={{ ...styles.button, ...styles.primaryButton }}
              >
                <FiDownload size={18} />
                Télécharger
              </Button>
              <Button
                onClick={() => copyToClipboard(loyaltyCard?.code)}
                style={{ ...styles.button, background: '#6c757d', color: 'white', border: 'none' }}
              >
                <FiCopy size={18} />
                Copier le code
              </Button>
            </div>
          </Modal.Body>
        </Modal>

        {/* 🆕 Lost Card Modal - Étape 1 : Confirmation seulement */}
        <Modal show={showLostCardModal} onHide={() => setShowLostCardModal(false)} centered>
          <Modal.Header closeButton style={{ border: 'none' }}>
            <Modal.Title style={{ fontWeight: '700', color: '#212529' }}>
              <FiAlertCircle className="me-2" style={{ color: '#ffc107' }} />
              Déclarer une carte perdue
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <p style={{ color: '#212529' }}>
              Vous êtes sur le point de déclarer votre carte comme perdue. 
              Après confirmation, vous devrez générer une nouvelle carte.
            </p>
            <div 
              style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '12px',
                padding: '1rem',
                marginTop: '1rem'
              }}
            >
              <p style={{ marginBottom: 0, fontSize: '0.875rem', color: '#856404' }}>
                <strong>⚠️ Attention:</strong> Cette action marquera votre carte comme perdue. 
                Vous devrez ensuite générer une nouvelle carte pour continuer à utiliser le service.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ border: 'none', padding: '1rem 1.5rem' }}>
            <Button 
              variant="light" 
              onClick={() => setShowLostCardModal(false)}
              style={{ ...styles.button, background: '#f8f9fa', color: '#6c757d' }}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmLostDeclaration}
              style={{ ...styles.button, background: '#ffc107', color: 'white', border: 'none' }}
            >
              Confirmer la déclaration
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loyality;