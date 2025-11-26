import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, updateUserProfile, changePassword, updateUserLocal } from "../store/slices/user";
import { toast } from "react-hot-toast";
import { Container, Row, Col, Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar, 
  FiEdit2, FiSave, FiX, FiLock, FiEye, FiEyeOff, FiCheckCircle,
  FiHome, FiGlobe, FiSmile, FiHeart, FiFlag, FiArchive
} from 'react-icons/fi';

const Profile = () => {
  const dispatch = useDispatch();
  const { Userprofile, loading } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    nom_et_prenom: "", email: "", tel: "", date_de_naissance: "",
    profession: "", situation_familiale: "", address: "",
    civilite: "", ville: "", gouvernorat: "", code_postal: ""
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "", 
    new_password_confirmation: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  // Styles inline avec design friendly
  const styles = {
    container: { 
      minHeight: '100vh', 
      paddingTop: '1.5rem', 
      paddingBottom: '3rem' 
    },
    loadingContainer: { 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
    },
    headerCard: { 
      background: 'white',
      borderRadius: '20px', 
      border: 'none', 
      marginBottom: '1.5rem', 
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden'
    },
    headerCardBody: { 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      color: 'white'
    },
    avatar: { 
      width: '90px', 
      height: '90px', 
      borderRadius: '50%', 
      background: 'white',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      color: '#667eea', 
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
      fontSize: '2.5rem',
      fontWeight: 'bold'
    },
    mainCard: { 
      borderRadius: '20px', 
      border: 'none', 
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
      background: 'white'
    },
    mainCardBody: { 
      padding: '2.5rem' 
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
      fontSize: '0.95rem'
    },
    primaryButton: { 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      color: 'white', 
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    },
    headerPrimaryButton: { 
      background: 'white', 
      color: '#667eea', 
      border: 'none', 
      fontWeight: '600', 
      padding: '0.6rem 1.5rem', 
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    headerOutlineButton: { 
      background: 'rgba(255, 255, 255, 0.2)', 
      color: 'white', 
      border: '2px solid white', 
      fontWeight: '600', 
      padding: '0.6rem 1.5rem', 
      borderRadius: '12px',
      backdropFilter: 'blur(10px)'
    },
    lightButton: { 
      background: '#f8f9fa', 
      color: '#495057', 
      border: '1px solid #dee2e6'
    },
    formLabel: { 
      color: '#495057', 
      fontWeight: '600', 
      fontSize: '0.9rem', 
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    formControl: { 
      border: '2px solid #e9ecef', 
      borderRadius: '12px', 
      padding: '0.75rem 1rem', 
      fontSize: '0.95rem',
      transition: 'all 0.3s ease'
    },
    inputGroupText: { 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '12px 0 0 12px', 
      padding: '0.75rem 1rem',
      color: 'white'
    },
    inputGroupControl: { 
      borderRadius: '0 12px 12px 0',
      border: '2px solid #e9ecef'
    },
    profileInfoItem: { 
      display: 'flex', 
      gap: '1rem', 
      padding: '1.5rem', 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', 
      borderRadius: '16px', 
      border: '2px solid #f1f3f5',
      marginBottom: '1rem',
      transition: 'all 0.3s ease',
      cursor: 'default'
    },
    profileInfoIcon: { 
      width: '56px', 
      height: '56px', 
      minWidth: '56px', 
      borderRadius: '14px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      color: 'white', 
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      fontSize: '1.5rem'
    },
    profileInfoContent: { 
      flex: 1 
    },
    profileInfoLabel: { 
      display: 'block', 
      fontSize: '0.75rem', 
      color: '#868e96', 
      fontWeight: '700', 
      textTransform: 'uppercase', 
      letterSpacing: '0.8px', 
      marginBottom: '0.4rem' 
    },
    profileInfoValue: { 
      fontSize: '1.05rem', 
      color: '#212529', 
      fontWeight: '500', 
      margin: 0, 
      wordBreak: 'break-word',
      lineHeight: '1.5'
    },
    sectionTitle: { 
      color: '#212529', 
      fontSize: '1.5rem', 
      fontWeight: '700', 
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    sectionSubtitle: { 
      color: '#6c757d', 
      fontSize: '0.95rem', 
      marginBottom: '2rem',
      lineHeight: '1.6'
    }
  };

  // Couleurs pour les icônes (palette harmonieuse)
  const iconColors = {
    violet: '#667eea',
    rose: '#f093fb',
    orange: '#fa709a',
    bleu: '#4facfe',
    vert: '#43e97b',
    rouge: '#fa709a',
    turquoise: '#30cfd0',
    purple: '#a890fe'
  };

  useEffect(() => { 
    dispatch(fetchUserProfile()); 
  }, [dispatch]);

  useEffect(() => {
    if (Userprofile) {
      // Fonction pour formater la date au format YYYY-MM-DD pour input type="date"
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        
        try {
          // Si la date est déjà au format YYYY-MM-DD, la retourner telle quelle
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
          }
          
          // Sinon, essayer de la parser et la formater
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return ""; // Date invalide
          
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          
          return `${year}-${month}-${day}`;
        } catch (error) {
          console.error("Erreur de formatage de date:", error);
          return "";
        }
      };

      // Fonction pour normaliser la situation familiale
      const normalizeSituationFamiliale = (situation) => {
        if (!situation) return "";
        
        const normalized = situation.toLowerCase().trim();
        
        // Mapper les différentes variations possibles
        const mappings = {
          'celibataire': 'célibataire',
          'célibataire': 'célibataire',
          'marie': 'marié(e)',
          'marié': 'marié(e)',
          'mariee': 'marié(e)',
          'mariée': 'marié(e)',
          'marié(e)': 'marié(e)',
          'divorce': 'divorcé(e)',
          'divorcé': 'divorcé(e)',
          'divorcee': 'divorcé(e)',
          'divorcée': 'divorcé(e)',
          'divorcé(e)': 'divorcé(e)',
          'veuf': 'veuf(ve)',
          'veuve': 'veuf(ve)',
          'veuf(ve)': 'veuf(ve)'
        };

        return mappings[normalized] || situation;
      };

      const formattedData = {
        nom_et_prenom: Userprofile.nom_et_prenom || "",
        email: Userprofile.email || "",
        tel: Userprofile.tel || "",
        date_de_naissance: formatDateForInput(Userprofile.date_de_naissance),
        profession: Userprofile.profession || "",
        situation_familiale: normalizeSituationFamiliale(Userprofile.situation_familiale),
        address: Userprofile.address || "",
        civilite: Userprofile.civilite || "",
        ville: Userprofile.ville || "",
        gouvernorat: Userprofile.gouvernorat || "",
        code_postal: Userprofile.code_postal || ""
      };

      // Debug: Afficher les données formatées dans la console
      console.log("📋 Données du profil chargées:", {
        date_original: Userprofile.date_de_naissance,
        date_formatee: formattedData.date_de_naissance,
        situation_originale: Userprofile.situation_familiale,
        situation_normalisee: formattedData.situation_familiale
      });

      setFormData(formattedData);
    }
  }, [Userprofile]);

  const handleChange = (e) => { 
    const { name, value } = e.target; 
    setFormData(prev => ({ ...prev, [name]: value })); 
  };

  const handlePasswordChange = (e) => { 
    const { name, value } = e.target; 
    setPasswordData(prev => ({ ...prev, [name]: value })); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Mettre à jour localement IMMÉDIATEMENT avant la requête API
      dispatch(updateUserLocal(formData));
      
      // Puis envoyer la requête API
      await dispatch(updateUserProfile(formData)).unwrap();
      
      setIsEditing(false);
      toast.success("Profil mis à jour avec succès");
      
    } catch (error) {
      console.error("Update failed:", error);
      // En cas d'erreur, recharger les données originales
      dispatch(fetchUserProfile());
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordData.current_password) {
      toast.error("Veuillez entrer votre mot de passe actuel");
      return;
    }
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }
    
    try {
      await dispatch(changePassword({
        currentPassword: passwordData.current_password,
        newPassword: passwordData.new_password
      })).unwrap();
      setIsChangingPassword(false);
      setPasswordData({ current_password: "", new_password: "", new_password_confirmation: "" });
    } catch (error) {
      console.error("Password change failed:", error);
    }
  };

  const cancelEdit = () => {
    if (Userprofile) {
      // Réutiliser la même logique de formatage que dans useEffect
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        try {
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        } catch (error) {
          return "";
        }
      };

      const normalizeSituationFamiliale = (situation) => {
        if (!situation) return "";
        const normalized = situation.toLowerCase().trim();
        const mappings = {
          'celibataire': 'célibataire',
          'célibataire': 'célibataire',
          'marie': 'marié(e)',
          'marié': 'marié(e)',
          'mariee': 'marié(e)',
          'mariée': 'marié(e)',
          'marié(e)': 'marié(e)',
          'divorce': 'divorcé(e)',
          'divorcé': 'divorcé(e)',
          'divorcee': 'divorcé(e)',
          'divorcée': 'divorcé(e)',
          'divorcé(e)': 'divorcé(e)',
          'veuf': 'veuf(ve)',
          'veuve': 'veuf(ve)',
          'veuf(ve)': 'veuf(ve)'
        };
        return mappings[normalized] || situation;
      };

      setFormData({
        nom_et_prenom: Userprofile.nom_et_prenom || "",
        email: Userprofile.email || "",
        tel: Userprofile.tel || "",
        date_de_naissance: formatDateForInput(Userprofile.date_de_naissance),
        profession: Userprofile.profession || "",
        situation_familiale: normalizeSituationFamiliale(Userprofile.situation_familiale),
        address: Userprofile.address || "",
        civilite: Userprofile.civilite || "",
        ville: Userprofile.ville || "",
        gouvernorat: Userprofile.gouvernorat || "",
        code_postal: Userprofile.code_postal || ""
      });
    }
    setIsEditing(false);
  };

  const cancelPasswordChange = () => { 
    setPasswordData({ current_password: "", new_password: "", new_password_confirmation: "" }); 
    setIsChangingPassword(false); 
  };

  // Obtenir les initiales pour l'avatar
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading && !Userprofile) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} className="mb-3" />
          <p style={{ color: '#495057', fontSize: '1.1rem', fontWeight: '500' }}>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} lg={11} xl={10}>
            {/* Header Card */}
            <Card style={styles.headerCard}>
              <Card.Body style={styles.headerCardBody}>
                <Row className="align-items-center">
                  <Col xs={12} md={8}>
                    <div className="d-flex align-items-center gap-3">
                      <div style={styles.avatar}>
                        {getInitials(formData.nom_et_prenom)}
                      </div>
                      <div>
                        <h3 style={{ marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '1.75rem' }}>
                          {formData.nom_et_prenom || "Utilisateur"}
                        </h3>
                        <p style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.95, fontSize: '1rem' }}>
                          <FiMail size={16} />
                          {formData.email}
                        </p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={4} className="mt-3 mt-md-0">
                    <div className="d-flex flex-column flex-md-row gap-2 justify-content-md-end">
                      {!isEditing && !isChangingPassword && (
                        <>
                          <Button size="sm" onClick={() => setIsEditing(true)} style={styles.headerPrimaryButton}>
                            <FiEdit2 size={18} />
                            <span className="ms-2 d-none d-sm-inline">Modifier</span>
                          </Button>
                          <Button size="sm" onClick={() => setIsChangingPassword(true)} style={styles.headerOutlineButton}>
                            <FiLock size={18} />
                            <span className="ms-2 d-none d-sm-inline">Mot de passe</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Main Content Card */}
            <Card style={styles.mainCard}>
              <Card.Body style={styles.mainCardBody}>
                {isChangingPassword ? (
                  <div>
                    <div style={{ marginBottom: '2rem' }}>
                      <h5 style={styles.sectionTitle}>
                        <FiLock size={28} />
                        Changer le mot de passe
                      </h5>
                      <p style={styles.sectionSubtitle}>
                        Pour votre sécurité, assurez-vous que votre mot de passe contient au moins 6 caractères
                      </p>
                    </div>
                    <Form onSubmit={handlePasswordSubmit}>
                      <Row className="g-3 g-md-4">
                        <Col xs={12}>
                          <Form.Group>
                            <Form.Label style={styles.formLabel}>
                              <FiLock size={16} />
                              Mot de passe actuel *
                            </Form.Label>
                            <InputGroup>
                              <InputGroup.Text style={styles.inputGroupText}>
                                <FiLock size={18} />
                              </InputGroup.Text>
                              <Form.Control 
                                type={showPassword.current ? "text" : "password"} 
                                name="current_password" 
                                value={passwordData.current_password} 
                                onChange={handlePasswordChange} 
                                required 
                                placeholder="Entrez votre mot de passe actuel" 
                                style={styles.inputGroupControl}
                              />
                              <Button
                                variant="outline-secondary"
                                onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                                style={{ borderRadius: '0 12px 12px 0', border: '2px solid #e9ecef', borderLeft: 'none' }}
                              >
                                {showPassword.current ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                              </Button>
                            </InputGroup>
                          </Form.Group>
                        </Col>
                        
                        <Col xs={12} md={6}>
                          <Form.Group>
                            <Form.Label style={styles.formLabel}>
                              <FiCheckCircle size={16} />
                              Nouveau mot de passe *
                            </Form.Label>
                            <InputGroup>
                              <InputGroup.Text style={styles.inputGroupText}>
                                <FiLock size={18} />
                              </InputGroup.Text>
                              <Form.Control 
                                type={showPassword.new ? "text" : "password"} 
                                name="new_password" 
                                value={passwordData.new_password} 
                                onChange={handlePasswordChange} 
                                required 
                                minLength="6" 
                                placeholder="Nouveau mot de passe" 
                                style={styles.inputGroupControl}
                              />
                              <Button
                                variant="outline-secondary"
                                onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                                style={{ borderRadius: '0 12px 12px 0', border: '2px solid #e9ecef', borderLeft: 'none' }}
                              >
                                {showPassword.new ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                              </Button>
                            </InputGroup>
                          </Form.Group>
                        </Col>
                        
                        <Col xs={12} md={6}>
                          <Form.Group>
                            <Form.Label style={styles.formLabel}>
                              <FiCheckCircle size={16} />
                              Confirmer le mot de passe *
                            </Form.Label>
                            <InputGroup>
                              <InputGroup.Text style={styles.inputGroupText}>
                                <FiCheckCircle size={18} />
                              </InputGroup.Text>
                              <Form.Control 
                                type={showPassword.confirm ? "text" : "password"} 
                                name="new_password_confirmation" 
                                value={passwordData.new_password_confirmation} 
                                onChange={handlePasswordChange} 
                                required 
                                minLength="6" 
                                placeholder="Confirmez le mot de passe" 
                                style={styles.inputGroupControl}
                              />
                              <Button
                                variant="outline-secondary"
                                onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                                style={{ borderRadius: '0 12px 12px 0', border: '2px solid #e9ecef', borderLeft: 'none' }}
                              >
                                {showPassword.confirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                              </Button>
                            </InputGroup>
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
                        <Button onClick={cancelPasswordChange} style={{ ...styles.button, ...styles.lightButton }}>
                          <FiX size={18} />
                          Annuler
                        </Button>
                        <Button type="submit" disabled={loading} style={{ ...styles.button, ...styles.primaryButton }}>
                          {loading ? <Spinner animation="border" size="sm" /> : <><FiCheckCircle size={18} />Changer le mot de passe</>}
                        </Button>
                      </div>
                    </Form>
                  </div>
                ) : isEditing ? (
                  <div>
                    <div style={{ marginBottom: '2rem' }}>
                      <h5 style={styles.sectionTitle}>
                        <FiEdit2 size={28} />
                        Modifier les informations
                      </h5>
                      <p style={styles.sectionSubtitle}>
                        Mettez à jour vos informations personnelles pour une meilleure expérience
                      </p>
                    </div>
                    <Form onSubmit={handleSubmit}>
                      <Row className="g-3 g-md-4">
                        <Col xs={12} md={6}>
                          <Form.Group>
                            <Form.Label style={styles.formLabel}>
                              <FiSmile size={16} />
                              Civilité
                            </Form.Label>
                            <Form.Select name="civilite" value={formData.civilite} onChange={handleChange} style={styles.formControl}>
                              <option value="">Sélectionner</option>
                              <option value="Monsieur">Monsieur</option>
                              <option value="Madame">Madame</option>
                              <option value="Mademoiselle">Mademoiselle</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Group>
                            <Form.Label style={styles.formLabel}>
                              <FiUser size={16} />
                              Nom et Prénom *
                            </Form.Label>
                            <InputGroup>
                              <InputGroup.Text style={styles.inputGroupText}><FiUser size={18} /></InputGroup.Text>
                              <Form.Control name="nom_et_prenom" value={formData.nom_et_prenom} onChange={handleChange} placeholder="Votre nom complet" required style={styles.inputGroupControl} />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Group>
                            <Form.Label style={styles.formLabel}>
                              <FiMail size={16} />
                              Email *
                            </Form.Label>
                            <InputGroup>
                              <InputGroup.Text style={styles.inputGroupText}><FiMail size={18} /></InputGroup.Text>
                              <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@email.com" required style={styles.inputGroupControl} />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Group>
                            <Form.Label style={styles.formLabel}>
                              <FiPhone size={16} />
                              Téléphone
                            </Form.Label>
                            <InputGroup>
                              <InputGroup.Text style={styles.inputGroupText}><FiPhone size={18} /></InputGroup.Text>
                              <Form.Control name="tel" value={formData.tel} onChange={handleChange} placeholder="+216 XX XXX XXX" style={styles.inputGroupControl} />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Group>
                            <Form.Label style={styles.formLabel}>
                              <FiCalendar size={16} />
                              Date de naissance
                            </Form.Label>
                            <InputGroup>
                              <InputGroup.Text style={styles.inputGroupText}><FiCalendar size={18} /></InputGroup.Text>
                              <Form.Control type="date" name="date_de_naissance" value={formData.date_de_naissance} onChange={handleChange} style={styles.inputGroupControl} />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Group>
                            <Form.Label style={styles.formLabel}>
                              <FiBriefcase size={16} />
                              Profession
                            </Form.Label>
                            <InputGroup>
                              <InputGroup.Text style={styles.inputGroupText}><FiBriefcase size={18} /></InputGroup.Text>
                              <Form.Control name="profession" value={formData.profession} onChange={handleChange} placeholder="Votre profession" style={styles.inputGroupControl} />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Group>
                            <Form.Label style={styles.formLabel}>
                              <FiHeart size={16} />
                              Situation familiale
                            </Form.Label>
                            <Form.Select name="situation_familiale" value={formData.situation_familiale} onChange={handleChange} style={styles.formControl}>
                              <option value="">Sélectionner</option>
                              <option value="célibataire">Célibataire</option>
                              <option value="marié(e)">Marié(e)</option>
                              <option value="divorcé(e)">Divorcé(e)</option>
                              <option value="veuf(ve)">Veuf(ve)</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Group>
                            <Form.Label style={styles.formLabel}>
                              <FiGlobe size={16} />
                              Gouvernorat
                            </Form.Label>
                            <InputGroup>
                              <InputGroup.Text style={styles.inputGroupText}><FiGlobe size={18} /></InputGroup.Text>
                              <Form.Control name="gouvernorat" value={formData.gouvernorat} onChange={handleChange} placeholder="Votre gouvernorat" style={styles.inputGroupControl} />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Group>
                            <Form.Label style={styles.formLabel}>
                              <FiFlag size={16} />
                              Ville
                            </Form.Label>
                            <InputGroup>
                              <InputGroup.Text style={styles.inputGroupText}><FiFlag size={18} /></InputGroup.Text>
                              <Form.Control name="ville" value={formData.ville} onChange={handleChange} placeholder="Votre ville" style={styles.inputGroupControl} />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Group>
                            <Form.Label style={styles.formLabel}>
                              <FiArchive size={16} />
                              Code Postal
                            </Form.Label>
                            <InputGroup>
                              <InputGroup.Text style={styles.inputGroupText}><FiArchive size={18} /></InputGroup.Text>
                              <Form.Control name="code_postal" value={formData.code_postal} onChange={handleChange} placeholder="Code postal" style={styles.inputGroupControl} />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                        <Col xs={12}>
                          <Form.Group>
                            <Form.Label style={styles.formLabel}>
                              <FiHome size={16} />
                              Adresse
                            </Form.Label>
                            <InputGroup>
                              <InputGroup.Text style={{ ...styles.inputGroupText, alignItems: 'flex-start', paddingTop: '0.75rem' }}><FiHome size={18} /></InputGroup.Text>
                              <Form.Control as="textarea" rows={2} name="address" value={formData.address} onChange={handleChange} placeholder="Votre adresse complète" style={styles.inputGroupControl} />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
                        <Button onClick={cancelEdit} style={{ ...styles.button, ...styles.lightButton }}>
                          <FiX size={18} />
                          Annuler
                        </Button>
                        <Button type="submit" disabled={loading} style={{ ...styles.button, ...styles.primaryButton }}>
                          {loading ? <Spinner animation="border" size="sm" /> : <><FiSave size={18} />Sauvegarder</>}
                        </Button>
                      </div>
                    </Form>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '2rem' }}>
                      <h5 style={styles.sectionTitle}>
                        <FiUser size={28} />
                        Informations personnelles
                      </h5>
                      <p style={styles.sectionSubtitle}>
                        Consultez vos informations de profil
                      </p>
                    </div>
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <div style={styles.profileInfoItem}>
                          <div style={{ ...styles.profileInfoIcon, background: `linear-gradient(135deg, ${iconColors.violet} 0%, ${iconColors.purple} 100%)` }}>
                            <FiSmile size={24} />
                          </div>
                          <div style={styles.profileInfoContent}>
                            <label style={styles.profileInfoLabel}>Civilité</label>
                            <p style={styles.profileInfoValue}>{formData.civilite || "Non renseigné"}</p>
                          </div>
                        </div>
                      </Col>

                      <Col xs={12} md={6}>
                        <div style={styles.profileInfoItem}>
                          <div style={{ ...styles.profileInfoIcon, background: `linear-gradient(135deg, ${iconColors.bleu} 0%, ${iconColors.turquoise} 100%)` }}>
                            <FiUser size={24} />
                          </div>
                          <div style={styles.profileInfoContent}>
                            <label style={styles.profileInfoLabel}>Nom et Prénom</label>
                            <p style={styles.profileInfoValue}>{formData.nom_et_prenom || "Non renseigné"}</p>
                          </div>
                        </div>
                      </Col>

                      <Col xs={12} md={6}>
                        <div style={styles.profileInfoItem}>
                          <div style={{ ...styles.profileInfoIcon, background: `linear-gradient(135deg, ${iconColors.rose} 0%, ${iconColors.rouge} 100%)` }}>
                            <FiMail size={24} />
                          </div>
                          <div style={styles.profileInfoContent}>
                            <label style={styles.profileInfoLabel}>Email</label>
                            <p style={styles.profileInfoValue}>{formData.email || "Non renseigné"}</p>
                          </div>
                        </div>
                      </Col>

                      <Col xs={12} md={6}>
                        <div style={styles.profileInfoItem}>
                          <div style={{ ...styles.profileInfoIcon, background: `linear-gradient(135deg, ${iconColors.vert} 0%, ${iconColors.turquoise} 100%)` }}>
                            <FiPhone size={24} />
                          </div>
                          <div style={styles.profileInfoContent}>
                            <label style={styles.profileInfoLabel}>Téléphone</label>
                            <p style={styles.profileInfoValue}>{formData.tel || "Non renseigné"}</p>
                          </div>
                        </div>
                      </Col>

                      <Col xs={12} md={6}>
                        <div style={styles.profileInfoItem}>
                          <div style={{ ...styles.profileInfoIcon, background: `linear-gradient(135deg, ${iconColors.orange} 0%, ${iconColors.rouge} 100%)` }}>
                            <FiCalendar size={24} />
                          </div>
                          <div style={styles.profileInfoContent}>
                            <label style={styles.profileInfoLabel}>Date de naissance</label>
                            <p style={styles.profileInfoValue}>
                              {formData.date_de_naissance ? 
                                new Date(formData.date_de_naissance).toLocaleDateString('fr-FR', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                }) 
                                : "Non renseigné"
                              }
                            </p>
                          </div>
                        </div>
                      </Col>

                      <Col xs={12} md={6}>
                        <div style={styles.profileInfoItem}>
                          <div style={{ ...styles.profileInfoIcon, background: `linear-gradient(135deg, ${iconColors.purple} 0%, ${iconColors.violet} 100%)` }}>
                            <FiBriefcase size={24} />
                          </div>
                          <div style={styles.profileInfoContent}>
                            <label style={styles.profileInfoLabel}>Profession</label>
                            <p style={styles.profileInfoValue}>{formData.profession || "Non renseigné"}</p>
                          </div>
                        </div>
                      </Col>

                      <Col xs={12} md={6}>
                        <div style={styles.profileInfoItem}>
                          <div style={{ ...styles.profileInfoIcon, background: `linear-gradient(135deg, ${iconColors.rose} 0%, ${iconColors.orange} 100%)` }}>
                            <FiHeart size={24} />
                          </div>
                          <div style={styles.profileInfoContent}>
                            <label style={styles.profileInfoLabel}>Situation familiale</label>
                            <p style={styles.profileInfoValue}>{formData.situation_familiale || "Non renseigné"}</p>
                          </div>
                        </div>
                      </Col>

                      <Col xs={12} md={6}>
                        <div style={styles.profileInfoItem}>
                          <div style={{ ...styles.profileInfoIcon, background: `linear-gradient(135deg, ${iconColors.bleu} 0%, ${iconColors.violet} 100%)` }}>
                            <FiGlobe size={24} />
                          </div>
                          <div style={styles.profileInfoContent}>
                            <label style={styles.profileInfoLabel}>Gouvernorat</label>
                            <p style={styles.profileInfoValue}>{formData.gouvernorat || "Non renseigné"}</p>
                          </div>
                        </div>
                      </Col>

                      <Col xs={12} md={6}>
                        <div style={styles.profileInfoItem}>
                          <div style={{ ...styles.profileInfoIcon, background: `linear-gradient(135deg, ${iconColors.turquoise} 0%, ${iconColors.vert} 100%)` }}>
                            <FiFlag size={24} />
                          </div>
                          <div style={styles.profileInfoContent}>
                            <label style={styles.profileInfoLabel}>Ville</label>
                            <p style={styles.profileInfoValue}>{formData.ville || "Non renseigné"}</p>
                          </div>
                        </div>
                      </Col>

                      <Col xs={12} md={6}>
                        <div style={styles.profileInfoItem}>
                          <div style={{ ...styles.profileInfoIcon, background: `linear-gradient(135deg, ${iconColors.orange} 0%, ${iconColors.rose} 100%)` }}>
                            <FiArchive size={24} />
                          </div>
                          <div style={styles.profileInfoContent}>
                            <label style={styles.profileInfoLabel}>Code Postal</label>
                            <p style={styles.profileInfoValue}>{formData.code_postal || "Non renseigné"}</p>
                          </div>
                        </div>
                      </Col>

                      <Col xs={12}>
                        <div style={styles.profileInfoItem}>
                          <div style={{ ...styles.profileInfoIcon, background: `linear-gradient(135deg, ${iconColors.violet} 0%, ${iconColors.bleu} 100%)` }}>
                            <FiHome size={24} />
                          </div>
                          <div style={styles.profileInfoContent}>
                            <label style={styles.profileInfoLabel}>Adresse</label>
                            <p style={styles.profileInfoValue}>{formData.address || "Non renseigné"}</p>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;