
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, updateUserProfile, changePassword, updateUserLocal } from "../store/slices/user";
import { getLoyaltyCard } from "../store/slices/loyaltyCardSlice";
import { toast } from "react-hot-toast";
import { Container, Row, Col, Card, Form, Button, Spinner, InputGroup } from "react-bootstrap";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiCalendar,
  FiEdit2,
  FiSave,
  FiX,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiHome,
  FiGlobe,
  FiSmile,
  FiHeart,
  FiFlag,
  FiArchive,
  FiCreditCard,
  FiGift,
  FiChevronRight,
} from "react-icons/fi";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { Userprofile, loading } = useSelector((state) => state.user);
  const { loyaltyCard } = useSelector((state) => state.loyaltyCard);

  const [formData, setFormData] = useState({
    nom_et_prenom: "",
    email: "",
    tel: "",
    date_de_naissance: "",
    profession: "",
    situation_familiale: "",
    address: "",
    civilite: "",
    ville: "",
    gouvernorat: "",
    code_postal: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(getLoyaltyCard());
  }, [dispatch]);

  // Formater le code de carte de fidélité
  const formatLoyaltyCode = (code) => {
    if (!code) return "";
    const formatted = code.replace(/(\d{3})(\d{9})(\d{2})/, "$1-$2-$3");
    return formatted.substring(0, 17) + "...";
  };

  // Styles inline
  const styles = {
    container: {
      minHeight: "100vh",
      paddingTop: "1.5rem",
      paddingBottom: "3rem",
    },
    loadingContainer: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    headerCard: {
      background: "white",
      borderRadius: "20px",
      border: "none",
      marginBottom: "1.5rem",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
      overflow: "hidden",
    },
    headerCardBody: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "2rem",
      color: "white",
    },
    avatar: {
      width: "90px",
      height: "90px",
      borderRadius: "50%",
      background: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#667eea",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
      fontSize: "2.5rem",
      fontWeight: "bold",
    },
    mainCard: {
      borderRadius: "20px",
      border: "none",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
      background: "white",
      marginBottom: "1.5rem",
    },
    mainCardBody: {
      padding: "2.5rem",
    },
    // Carte fidélité
    loyaltyCard: {
      borderRadius: "20px",
      border: "none",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
      background: "white",
      marginBottom: "1.5rem",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    loyaltyCardHeader: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "1.25rem",
      color: "white",
      borderRadius: "20px 20px 0 0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    loyaltyCardBody: {
      padding: "1.5rem",
    },
    loyaltyBadge: {
      background: "rgba(255, 255, 255, 0.25)",
      color: "white",
      padding: "0.375rem 0.75rem",
      borderRadius: "20px",
      fontSize: "0.75rem",
      fontWeight: "600",
      display: "inline-flex",
      alignItems: "center",
      gap: "0.375rem",
    },
    loyaltyInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
    },
    loyaltyLabel: {
      fontSize: "0.75rem",
      color: "#6c757d",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    loyaltyValue: {
      fontSize: "1rem",
      fontWeight: "700",
      color: "#212529",
      fontFamily: "monospace",
      letterSpacing: "0.5px",
    },
    loyaltyBalance: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#667eea",
    },
    // Actions rapides
    actionsCard: {
      borderRadius: "20px",
      border: "none",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
      background: "white",
      marginBottom: "1.5rem",
    },
    actionButton: {
      borderRadius: "16px",
      border: "none",
      padding: "1rem 1.5rem",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      width: "100%",
      marginBottom: "1rem",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease",
      cursor: "pointer",
      background: "white",
    },
    actionIcon: {
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.5rem",
    },
    button: {
      fontWeight: "600",
      borderRadius: "12px",
      padding: "0.75rem 1.75rem",
      border: "none",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      justifyContent: "center",
      transition: "all 0.3s ease",
      fontSize: "0.95rem",
    },
    primaryButton: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    },
    headerPrimaryButton: {
      background: "white",
      color: "#667eea",
      border: "none",
      padding: "0.6rem 1.25rem",
      borderRadius: "10px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "0.9rem",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease",
    },
    headerOutlineButton: {
      background: "rgba(255, 255, 255, 0.15)",
      color: "white",
      border: "1px solid rgba(255, 255, 255, 0.4)",
      padding: "0.6rem 1.25rem",
      borderRadius: "10px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "0.9rem",
      transition: "all 0.3s ease",
    },
    formGroup: {
      marginBottom: "1.5rem",
    },
    formLabel: {
      fontWeight: "600",
      color: "#495057",
      marginBottom: "0.75rem",
      fontSize: "0.95rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    formControl: {
      borderRadius: "12px",
      border: "1.5px solid #e0e0e0",
      padding: "0.85rem 1.2rem",
      fontSize: "1rem",
      transition: "all 0.3s ease",
    },
    sectionTitle: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#212529",
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
  };

  // Pré-remplissage formulaire
  useEffect(() => {
    if (Userprofile) {
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        try {
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        } catch {
          return "";
        }
      };

      const normalizeSituationFamiliale = (situation) => {
        if (!situation) return "";
        const normalized = situation.toLowerCase().trim();
        const mappings = {
          celibataire: "célibataire",
          "célibataire": "célibataire",
          marie: "marié(e)",
          "marié": "marié(e)",
          mariee: "marié(e)",
          "mariée": "marié(e)",
          "marié(e)": "marié(e)",
          divorce: "divorcé(e)",
          "divorcé": "divorcé(e)",
          divorcee: "divorcé(e)",
          "divorcée": "divorcé(e)",
          "divorcé(e)": "divorcé(e)",
          veuf: "veuf(ve)",
          veuve: "veuf(ve)",
          "veuf(ve)": "veuf(ve)",
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
        code_postal: Userprofile.code_postal || "",
      });
    }
  }, [Userprofile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserLocal(formData));
      await dispatch(updateUserProfile(formData)).unwrap();
      setIsEditing(false);
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error("Update failed:", error);
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
      await dispatch(
        changePassword({
          currentPassword: passwordData.current_password,
          newPassword: passwordData.new_password,
        })
      ).unwrap();
      setIsChangingPassword(false);
      setPasswordData({ current_password: "", new_password: "", new_password_confirmation: "" });
    } catch (error) {
      console.error("Password change failed:", error);
    }
  };

  const cancelEdit = () => {
    if (Userprofile) {
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        try {
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        } catch {
          return "";
        }
      };

      const normalizeSituationFamiliale = (situation) => {
        if (!situation) return "";
        const normalized = situation.toLowerCase().trim();
        const mappings = {
          celibataire: "célibataire",
          "célibataire": "célibataire",
          marie: "marié(e)",
          "marié": "marié(e)",
          mariee: "marié(e)",
          "mariée": "marié(e)",
          "marié(e)": "marié(e)",
          divorce: "divorcé(e)",
          "divorcé": "divorcé(e)",
          divorcee: "divorcé(e)",
          "divorcée": "divorcé(e)",
          "divorcé(e)": "divorcé(e)",
          veuf: "veuf(ve)",
          veuve: "veuf(ve)",
          "veuf(ve)": "veuf(ve)",
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
        code_postal: Userprofile.code_postal || "",
      });
    }
    setIsEditing(false);
  };

  const cancelPasswordChange = () => {
    setPasswordData({ current_password: "", new_password: "", new_password_confirmation: "" });
    setIsChangingPassword(false);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading && !Userprofile) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ textAlign: "center" }}>
          <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} className="mb-3" />
          <p style={{ color: "#495057", fontSize: "1.1rem", fontWeight: "500" }}>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  const hasLoyaltyCard = loyaltyCard && loyaltyCard.loyalty_code;
  const cagnotteBalance = Userprofile?.cagnotte_balance || loyaltyCard?.cagnotte_balance || 0;

  return (
    <div style={styles.container}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} lg={11} xl={10}>
            {/* Header */}
            <Card style={styles.headerCard}>
              <Card.Body style={styles.headerCardBody}>
                <Row className="align-items-center">
                  <Col xs={12} md={8}>
                    <div className="d-flex align-items-center gap-3">
                      <div style={styles.avatar}>{getInitials(formData.nom_et_prenom)}</div>
                      <div>
                        <h3 style={{ marginBottom: "0.5rem", fontWeight: "bold", fontSize: "1.75rem" }}>
                          {formData.nom_et_prenom || "Utilisateur"}
                        </h3>
                        <p
                          style={{
                            marginBottom: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            opacity: 0.95,
                            fontSize: "1rem",
                          }}
                        >
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
                          <Button
                            size="sm"
                            onClick={() => setIsChangingPassword(true)}
                            style={styles.headerOutlineButton}
                          >
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

            <Row>
              {/* Colonne principale */}
              <Col xs={12} lg={8}>
                <Card style={styles.mainCard}>
                  <Card.Body style={styles.mainCardBody}>
                    {isChangingPassword ? (
                      // Formulaire mot de passe
                      <div>
                        <div style={{ marginBottom: "2rem" }}>
                          <h5 style={styles.sectionTitle}>
                            <FiLock size={28} />
                            Changer le mot de passe
                          </h5>
                        </div>

                        <Form onSubmit={handlePasswordSubmit}>
                          {/* Ancien mot de passe */}
                          <Form.Group style={styles.formGroup}>
                            <Form.Label style={styles.formLabel}>
                              <FiLock size={18} />
                              Mot de passe actuel
                            </Form.Label>
                            <InputGroup>
                              <Form.Control
                                type={showPassword.current ? "text" : "password"}
                                name="current_password"
                                value={passwordData.current_password}
                                onChange={handlePasswordChange}
                                placeholder="Entrez votre mot de passe actuel"
                                style={styles.formControl}
                                required
                              />
                              <Button
                                variant="outline-secondary"
                                onClick={() =>
                                  setShowPassword((prev) => ({ ...prev, current: !prev.current }))
                                }
                                style={{
                                  borderRadius: "0 12px 12px 0",
                                  border: "1.5px solid #e0e0e0",
                                  borderLeft: "none",
                                }}
                              >
                                {showPassword.current ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                              </Button>
                            </InputGroup>
                          </Form.Group>

                          {/* Nouveau mot de passe */}
                          <Form.Group style={styles.formGroup}>
                            <Form.Label style={styles.formLabel}>
                              <FiLock size={18} />
                              Nouveau mot de passe
                            </Form.Label>
                            <InputGroup>
                              <Form.Control
                                type={showPassword.new ? "text" : "password"}
                                name="new_password"
                                value={passwordData.new_password}
                                onChange={handlePasswordChange}
                                placeholder="Entrez votre nouveau mot de passe"
                                style={styles.formControl}
                                required
                              />
                              <Button
                                variant="outline-secondary"
                                onClick={() => setShowPassword((prev) => ({ ...prev, new: !prev.new }))}
                                style={{
                                  borderRadius: "0 12px 12px 0",
                                  border: "1.5px solid #e0e0e0",
                                  borderLeft: "none",
                                }}
                              >
                                {showPassword.new ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                              </Button>
                            </InputGroup>
                          </Form.Group>

                          {/* Confirmation */}
                          <Form.Group style={styles.formGroup}>
                            <Form.Label style={styles.formLabel}>
                              <FiLock size={18} />
                              Confirmer le nouveau mot de passe
                            </Form.Label>
                            <InputGroup>
                              <Form.Control
                                type={showPassword.confirm ? "text" : "password"}
                                name="new_password_confirmation"
                                value={passwordData.new_password_confirmation}
                                onChange={handlePasswordChange}
                                placeholder="Confirmez votre nouveau mot de passe"
                                style={styles.formControl}
                                required
                              />
                              <Button
                                variant="outline-secondary"
                                onClick={() =>
                                  setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))
                                }
                                style={{
                                  borderRadius: "0 12px 12px 0",
                                  border: "1.5px solid #e0e0e0",
                                  borderLeft: "none",
                                }}
                              >
                                {showPassword.confirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                              </Button>
                            </InputGroup>
                          </Form.Group>

                          <div className="d-flex gap-2 justify-content-end mt-4">
                            <Button
                              type="button"
                              onClick={cancelPasswordChange}
                              variant="outline-secondary"
                              style={{
                                ...styles.button,
                                background: "white",
                                color: "#6c757d",
                                border: "1.5px solid #e0e0e0",
                              }}
                            >
                              <FiX size={20} />
                              Annuler
                            </Button>
                            <Button
                              type="submit"
                              style={{ ...styles.button, ...styles.primaryButton }}
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <Spinner animation="border" size="sm" />
                                  Enregistrement...
                                </>
                              ) : (
                                <>
                                  <FiSave size={20} />
                                  Enregistrer
                                </>
                              )}
                            </Button>
                          </div>
                        </Form>
                      </div>
                    ) : isEditing ? (
                      // Formulaire édition profil
                      <div>
                        <div style={{ marginBottom: "2rem" }}>
                          <h5 style={styles.sectionTitle}>
                            <FiUser size={28} />
                            Modifier mon profil
                          </h5>
                        </div>

                        <Form onSubmit={handleSubmit}>
                          <Row>
                            {/* Civilité */}
                            <Col md={4}>
                              <Form.Group style={styles.formGroup}>
                                <Form.Label style={styles.formLabel}>
                                  <FiUser size={18} />
                                  Civilité
                                </Form.Label>
                                <Form.Select
                                  name="civilite"
                                  value={formData.civilite}
                                  onChange={handleChange}
                                  style={styles.formControl}
                                >
                                  <option value="">Sélectionner</option>
                                  <option value="M">Monsieur</option>
                                  <option value="Mme">Madame</option>
                                  <option value="Mlle">Mademoiselle</option>
                                </Form.Select>
                              </Form.Group>
                            </Col>

                            {/* Nom */}
                            <Col md={8}>
                              <Form.Group style={styles.formGroup}>
                                <Form.Label style={styles.formLabel}>
                                  <FiUser size={18} />
                                  Nom complet
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  name="nom_et_prenom"
                                  value={formData.nom_et_prenom}
                                  onChange={handleChange}
                                  placeholder="Votre nom complet"
                                  style={styles.formControl}
                                  required
                                />
                              </Form.Group>
                            </Col>

                            {/* Email */}
                            <Col md={6}>
                              <Form.Group style={styles.formGroup}>
                                <Form.Label style={styles.formLabel}>
                                  <FiMail size={18} />
                                  Email
                                </Form.Label>
                                <Form.Control
                                  type="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  placeholder="votre.email@exemple.com"
                                  style={styles.formControl}
                                  required
                                />
                              </Form.Group>
                            </Col>

                            {/* Téléphone */}
                            <Col md={6}>
                              <Form.Group style={styles.formGroup}>
                                <Form.Label style={styles.formLabel}>
                                  <FiPhone size={18} />
                                  Téléphone
                                </Form.Label>
                                <Form.Control
                                  type="tel"
                                  name="tel"
                                  value={formData.tel}
                                  onChange={handleChange}
                                  placeholder="+216 XX XXX XXX"
                                  style={styles.formControl}
                                />
                              </Form.Group>
                            </Col>

                            {/* Date de naissance */}
                            <Col md={6}>
                              <Form.Group style={styles.formGroup}>
                                <Form.Label style={styles.formLabel}>
                                  <FiCalendar size={18} />
                                  Date de naissance
                                </Form.Label>
                                <Form.Control
                                  type="date"
                                  name="date_de_naissance"
                                  value={formData.date_de_naissance}
                                  onChange={handleChange}
                                  style={styles.formControl}
                                />
                              </Form.Group>
                            </Col>

                            {/* Profession */}
                            <Col md={6}>
                              <Form.Group style={styles.formGroup}>
                                <Form.Label style={styles.formLabel}>
                                  <FiBriefcase size={18} />
                                  Profession
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  name="profession"
                                  value={formData.profession}
                                  onChange={handleChange}
                                  placeholder="Votre profession"
                                  style={styles.formControl}
                                />
                              </Form.Group>
                            </Col>

                            {/* Situation familiale */}
                            <Col md={6}>
                              <Form.Group style={styles.formGroup}>
                                <Form.Label style={styles.formLabel}>
                                  <FiHeart size={18} />
                                  Situation familiale
                                </Form.Label>
                                <Form.Select
                                  name="situation_familiale"
                                  value={formData.situation_familiale}
                                  onChange={handleChange}
                                  style={styles.formControl}
                                >
                                  <option value="">Sélectionner</option>
                                  <option value="célibataire">Célibataire</option>
                                  <option value="marié(e)">Marié(e)</option>
                                  <option value="divorcé(e)">Divorcé(e)</option>
                                  <option value="veuf(ve)">Veuf(ve)</option>
                                </Form.Select>
                              </Form.Group>
                            </Col>

                            {/* Adresse */}
                            <Col md={12}>
                              <Form.Group style={styles.formGroup}>
                                <Form.Label style={styles.formLabel}>
                                  <FiHome size={18} />
                                  Adresse
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  name="address"
                                  value={formData.address}
                                  onChange={handleChange}
                                  placeholder="Votre adresse complète"
                                  style={styles.formControl}
                                />
                              </Form.Group>
                            </Col>

                            {/* Ville */}
                            <Col md={4}>
                              <Form.Group style={styles.formGroup}>
                                <Form.Label style={styles.formLabel}>
                                  <FiMapPin size={18} />
                                  Ville
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  name="ville"
                                  value={formData.ville}
                                  onChange={handleChange}
                                  placeholder="Ville"
                                  style={styles.formControl}
                                />
                              </Form.Group>
                            </Col>

                            {/* Gouvernorat */}
                            <Col md={4}>
                              <Form.Group style={styles.formGroup}>
                                <Form.Label style={styles.formLabel}>
                                  <FiGlobe size={18} />
                                  Gouvernorat
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  name="gouvernorat"
                                  value={formData.gouvernorat}
                                  onChange={handleChange}
                                  placeholder="Gouvernorat"
                                  style={styles.formControl}
                                />
                              </Form.Group>
                            </Col>

                            {/* Code postal */}
                            <Col md={4}>
                              <Form.Group style={styles.formGroup}>
                                <Form.Label style={styles.formLabel}>
                                  <FiMapPin size={18} />
                                  Code postal
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  name="code_postal"
                                  value={formData.code_postal}
                                  onChange={handleChange}
                                  placeholder="Code postal"
                                  style={styles.formControl}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <div className="d-flex gap-2 justify-content-end mt-4">
                            <Button
                              type="button"
                              onClick={cancelEdit}
                              variant="outline-secondary"
                              style={{
                                ...styles.button,
                                background: "white",
                                color: "#6c757d",
                                border: "1.5px solid #e0e0e0",
                              }}
                            >
                              <FiX size={20} />
                              Annuler
                            </Button>
                            <Button
                              type="submit"
                              style={{ ...styles.button, ...styles.primaryButton }}
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <Spinner animation="border" size="sm" />
                                  Enregistrement...
                                </>
                              ) : (
                                <>
                                  <FiSave size={20} />
                                  Enregistrer
                                </>
                              )}
                            </Button>
                          </div>
                        </Form>
                      </div>
                    ) : (
                      // Affichage lecture seule
                      <div>
                        <div style={{ marginBottom: "2rem" }}>
                          <h5 style={styles.sectionTitle}>
                            <FiUser size={28} />
                            Informations personnelles
                          </h5>
                        </div>

                        <Row>
                          {/* Civilité */}
                          <Col md={6} style={{ marginBottom: "1.5rem" }}>
                            <div>
                              <p
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#6c757d",
                                  marginBottom: "0.5rem",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <FiUser size={16} />
                                Civilité
                              </p>
                              <p
                                style={{
                                  fontSize: "1.05rem",
                                  color: "#212529",
                                  fontWeight: "500",
                                  marginBottom: 0,
                                }}
                              >
                                {formData.civilite || <span style={{ color: "#adb5bd" }}>Non renseigné</span>}
                              </p>
                            </div>
                          </Col>

                          {/* Nom complet */}
                          <Col md={6} style={{ marginBottom: "1.5rem" }}>
                            <div>
                              <p
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#6c757d",
                                  marginBottom: "0.5rem",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <FiUser size={16} />
                                Nom complet
                              </p>
                              <p
                                style={{
                                  fontSize: "1.05rem",
                                  color: "#212529",
                                  fontWeight: "500",
                                  marginBottom: 0,
                                }}
                              >
                                {formData.nom_et_prenom || (
                                  <span style={{ color: "#adb5bd" }}>Non renseigné</span>
                                )}
                              </p>
                            </div>
                          </Col>

                          {/* Email */}
                          <Col md={6} style={{ marginBottom: "1.5rem" }}>
                            <div>
                              <p
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#6c757d",
                                  marginBottom: "0.5rem",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <FiMail size={16} />
                                Email
                              </p>
                              <p
                                style={{
                                  fontSize: "1.05rem",
                                  color: "#212529",
                                  fontWeight: "500",
                                  marginBottom: 0,
                                }}
                              >
                                {formData.email || <span style={{ color: "#adb5bd" }}>Non renseigné</span>}
                              </p>
                            </div>
                          </Col>

                          {/* Téléphone */}
                          <Col md={6} style={{ marginBottom: "1.5rem" }}>
                            <div>
                              <p
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#6c757d",
                                  marginBottom: "0.5rem",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <FiPhone size={16} />
                                Téléphone
                              </p>
                              <p
                                style={{
                                  fontSize: "1.05rem",
                                  color: "#212529",
                                  fontWeight: "500",
                                  marginBottom: 0,
                                }}
                              >
                                {formData.tel || <span style={{ color: "#adb5bd" }}>Non renseigné</span>}
                              </p>
                            </div>
                          </Col>

                          {/* Date de naissance */}
                          <Col md={6} style={{ marginBottom: "1.5rem" }}>
                            <div>
                              <p
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#6c757d",
                                  marginBottom: "0.5rem",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <FiCalendar size={16} />
                                Date de naissance
                              </p>
                              <p
                                style={{
                                  fontSize: "1.05rem",
                                  color: "#212529",
                                  fontWeight: "500",
                                  marginBottom: 0,
                                }}
                              >
                                {formData.date_de_naissance || (
                                  <span style={{ color: "#adb5bd" }}>Non renseignée</span>
                                )}
                              </p>
                            </div>
                          </Col>

                          {/* Profession */}
                          <Col md={6} style={{ marginBottom: "1.5rem" }}>
                            <div>
                              <p
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#6c757d",
                                  marginBottom: "0.5rem",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <FiBriefcase size={16} />
                                Profession
                              </p>
                              <p
                                style={{
                                  fontSize: "1.05rem",
                                  color: "#212529",
                                  fontWeight: "500",
                                  marginBottom: 0,
                                }}
                              >
                                {formData.profession || (
                                  <span style={{ color: "#adb5bd" }}>Non renseignée</span>
                                )}
                              </p>
                            </div>
                          </Col>

                          {/* Situation familiale */}
                          <Col md={6} style={{ marginBottom: "1.5rem" }}>
                            <div>
                              <p
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#6c757d",
                                  marginBottom: "0.5rem",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <FiHeart size={16} />
                                Situation familiale
                              </p>
                              <p
                                style={{
                                  fontSize: "1.05rem",
                                  color: "#212529",
                                  fontWeight: "500",
                                  marginBottom: 0,
                                }}
                              >
                                {formData.situation_familiale || (
                                  <span style={{ color: "#adb5bd" }}>Non renseignée</span>
                                )}
                              </p>
                            </div>
                          </Col>

                          {/* Adresse */}
                          <Col md={12} style={{ marginBottom: "1.5rem" }}>
                            <div>
                              <p
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#6c757d",
                                  marginBottom: "0.5rem",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <FiHome size={16} />
                                Adresse
                              </p>
                              <p
                                style={{
                                  fontSize: "1.05rem",
                                  color: "#212529",
                                  fontWeight: "500",
                                  marginBottom: 0,
                                }}
                              >
                                {formData.address || (
                                  <span style={{ color: "#adb5bd" }}>Non renseignée</span>
                                )}
                              </p>
                            </div>
                          </Col>

                          {/* Ville */}
                          <Col md={4} style={{ marginBottom: "1.5rem" }}>
                            <div>
                              <p
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#6c757d",
                                  marginBottom: "0.5rem",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <FiMapPin size={16} />
                                Ville
                              </p>
                              <p
                                style={{
                                  fontSize: "1.05rem",
                                  color: "#212529",
                                  fontWeight: "500",
                                  marginBottom: 0,
                                }}
                              >
                                {formData.ville || <span style={{ color: "#adb5bd" }}>Non renseignée</span>}
                              </p>
                            </div>
                          </Col>

                          {/* Gouvernorat */}
                          <Col md={4} style={{ marginBottom: "1.5rem" }}>
                            <div>
                              <p
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#6c757d",
                                  marginBottom: "0.5rem",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <FiGlobe size={16} />
                                Gouvernorat
                              </p>
                              <p
                                style={{
                                  fontSize: "1.05rem",
                                  color: "#212529",
                                  fontWeight: "500",
                                  marginBottom: 0,
                                }}
                              >
                                {formData.gouvernorat || (
                                  <span style={{ color: "#adb5bd" }}>Non renseigné</span>
                                )}
                              </p>
                            </div>
                          </Col>

                          {/* Code postal */}
                          <Col md={4} style={{ marginBottom: "1.5rem" }}>
                            <div>
                              <p
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#6c757d",
                                  marginBottom: "0.5rem",
                                  fontWeight: "600",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <FiMapPin size={16} />
                                Code postal
                              </p>
                              <p
                                style={{
                                  fontSize: "1.05rem",
                                  color: "#212529",
                                  fontWeight: "500",
                                  marginBottom: 0,
                                }}
                              >
                                {formData.code_postal || (
                                  <span style={{ color: "#adb5bd" }}>Non renseigné</span>
                                )}
                              </p>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Colonne secondaire */}
              <Col xs={12} lg={4}>
                {/* Carte fidélité */}
                {hasLoyaltyCard ? (
                  <Card
                    style={styles.loyaltyCard}
                    onClick={() => navigate("/loyalty-card")}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 15px 50px rgba(0, 0, 0, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.15)";
                    }}
                  >
                    <div style={styles.loyaltyCardHeader}>
                      <div className="d-flex alignItems-center gap-2">
                        <FiCreditCard size={24} />
                        <div>
                          <h5 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "700" }}>
                            Ma Carte Fidélité
                          </h5>
                        </div>
                      </div>
                      <div style={styles.loyaltyBadge}>
                        <FiCheckCircle size={14} />
                        Active
                      </div>
                    </div>
                    <Card.Body style={styles.loyaltyCardBody}>
                      <div style={styles.loyaltyInfo}>
                        <div>
                          <p style={styles.loyaltyLabel}>Numéro de carte</p>
                          <p style={styles.loyaltyValue}>{formatLoyaltyCode(loyaltyCard.loyalty_code)}</p>
                        </div>
                        <div>
                          <p style={styles.loyaltyLabel}>Solde Cagnotte</p>
                          <div style={styles.loyaltyBalance}>
                            {parseFloat(cagnotteBalance).toFixed(2)} DT
                          </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mt-2">
                          <p style={{ ...styles.loyaltyLabel, marginBottom: 0 }}>
                            Titulaire: {Userprofile?.nom_et_prenom}
                          </p>
                          <FiChevronRight size={20} color="#667eea" />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ) : (
                  <Card style={styles.actionsCard}>
                    <Card.Body className="p-4">
                      <h5 style={{ fontWeight: "700", marginBottom: "1.5rem", color: "#212529" }}>
                        Carte Fidélité
                      </h5>
                      <p style={{ fontSize: "0.875rem", color: "#6c757d", marginBottom: "1rem" }}>
                        Générez votre carte pour commencer à gagner des points
                      </p>
                      <Button
                        onClick={() => navigate("/loyalty-card")}
                        style={{
                          ...styles.actionButton,
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                        }}
                      >
                        <div
                          style={{
                            ...styles.actionIcon,
                            background: "rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          <FiCreditCard />
                        </div>
                        <div style={{ textAlign: "left", flex: 1 }}>
                          <div style={{ fontWeight: "700" }}>Afficher ma carte</div>
                          <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>Carte de fidélité</div>
                        </div>
                      </Button>
                    </Card.Body>
                  </Card>
                )}

                {/* Actions rapides : Cadeaux / Codes promo / Gratuités / Carte */}
                <Card style={styles.actionsCard}>
                  <Card.Body className="p-4">
                    <h5 style={{ fontWeight: "700", marginBottom: "1.5rem", color: "#212529" }}>
                      Mes avantages
                    </h5>

                    {/* Mes Cadeaux - design amélioré */}
                    <button
                      onClick={() => navigate("/mes-cadeaux")}
                      style={{
                        ...styles.actionButton,
                        background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                        color: "white",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                      }}
                    >
                      <div
                        style={{
                          ...styles.actionIcon,
                          background: "rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <FiGift />
                      </div>
                      <div style={{ textAlign: "left", flex: 1 }}>
                        <div style={{ fontWeight: "700", fontSize: "0.98rem" }}>Mes Cadeaux</div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>
                          Voir tous les cadeaux gagnés
                        </div>
                      </div>
                      <FiChevronRight size={20} />
                    </button>

                    {/* Codes Promo */}
                    <button
                      onClick={() => navigate("/code-promo")}
                      style={{
                        ...styles.actionButton,
                        background: "linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)",
                        color: "white",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                      }}
                    >
                      <div
                        style={{
                          ...styles.actionIcon,
                          background: "rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <FiFlag />
                      </div>
                      <div style={{ textAlign: "left", flex: 1 }}>
                        <div style={{ fontWeight: "700", fontSize: "0.98rem" }}>Codes Promo</div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>
                          Mes codes promotionnels gratuits
                        </div>
                      </div>
                      <FiChevronRight size={20} />
                    </button>

                    {/* Gratuités */}
                    <button
                      onClick={() => navigate("/gratuite")}
                      style={{
                        ...styles.actionButton,
                        background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
                        color: "white",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                      }}
                    >
                      <div
                        style={{
                          ...styles.actionIcon,
                          background: "rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <FiSmile />
                      </div>
                      <div style={{ textAlign: "left", flex: 1 }}>
                        <div style={{ fontWeight: "700", fontSize: "0.98rem" }}>Gratuités</div>
                        <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>
                          Les offres 100% gratuites
                        </div>
                      </div>
                      <FiChevronRight size={20} />
                    </button>

                    {/* Ma Carte Fidélité (si existe) */}
                    {hasLoyaltyCard && (
                      <button
                        onClick={() => navigate("/loyalty-card")}
                        style={{
                          ...styles.actionButton,
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                        }}
                      >
                        <div
                          style={{
                            ...styles.actionIcon,
                            background: "rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          <FiCreditCard />
                        </div>
                        <div style={{ textAlign: "left", flex: 1 }}>
                          <div style={{ fontWeight: "700" }}>Ma Carte Fidélité</div>
                          <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>Gérer ma carte</div>
                        </div>
                        <FiChevronRight size={20} />
                      </button>
                    )}
                  </Card.Body>
                </Card>

                {/* Portefeuille / Solde de cagnotte */}
                <Card style={styles.actionsCard}>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h5 style={{ fontWeight: "700", color: "#212529", marginBottom: 0 }}>
                        Portefeuille
                      </h5>
                      <FiArchive size={22} color="#667eea" />
                    </div>
                    <div className="text-center py-3">
                      <p
                        className="mb-2"
                        style={{
                          fontSize: "0.85rem",
                          color: "#6c757d",
                          fontWeight: "600",
                        }}
                      >
                        Solde de cagnotte
                      </p>
                      <h2
                        style={{
                          fontSize: "2.6rem",
                          fontWeight: "700",
                          color: "#667eea",
                          marginBottom: 0,
                        }}
                      >
                        {parseFloat(cagnotteBalance).toFixed(2)} DT
                      </h2>
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "#6c757d",
                          marginTop: "0.5rem",
                        }}
                      >
                        Utilisable sur vos prochains achats
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;

