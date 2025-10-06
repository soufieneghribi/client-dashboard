import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, updateUserProfile, changePassword } from "../store/slices/user";
import jackpotImage from "../assets/jackpotImage.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Container, Row, Col, Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { Userprofile, loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    nom_et_prenom: "",
    email: "",
    tel: "",
    date_de_naissance: "",
    profession: "",
    situation_familiale: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    new_password: "",
    new_password_confirmation: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (Userprofile) {
      setFormData({
        nom_et_prenom: Userprofile.nom_et_prenom || "",
        email: Userprofile.email || "",
        tel: Userprofile.tel || "",
        date_de_naissance: Userprofile.date_de_naissance || "",
        profession: Userprofile.profession || "",
        situation_familiale: Userprofile.situation_familiale || "",
        address: Userprofile.address || "",
      });
    }
  }, [Userprofile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Nettoyer les données
    const cleanedData = {};
    Object.keys(formData).forEach(key => {
      cleanedData[key] = formData[key] === "" ? null : formData[key];
    });
    
    console.log("📤 Données nettoyées envoyées:", cleanedData);
    
    // Essayer différents formats de données
    const dataAttempts = [
      // Format 1: Données nettoyées
      cleanedData,
      // Format 2: Données minimales
      {
        nom_et_prenom: formData.nom_et_prenom,
        email: formData.email
      },
      // Format 3: Format alternatif
      {
        name: formData.nom_et_prenom,
        email: formData.email,
        telephone: formData.tel,
        birth_date: formData.date_de_naissance,
        profession: formData.profession,
        family_situation: formData.situation_familiale,
        address: formData.address
      }
    ];
    
    const attemptUpdate = (attemptData, attemptNumber) => {
      console.log(`🧪 Tentative ${attemptNumber}:`, attemptData);
      
      dispatch(updateUserProfile(attemptData))
        .unwrap()
        .then((response) => {
          console.log(`✅ Tentative ${attemptNumber} réussie:`, response);
          setIsEditing(false);
          toast.success("Profil mis à jour avec succès");
          dispatch(fetchUserProfile());
        })
        .catch((error) => {
          console.error(`❌ Tentative ${attemptNumber} échouée`);
          if (attemptNumber < dataAttempts.length) {
            // Essayer la prochaine tentative après un court délai
            setTimeout(() => attemptUpdate(dataAttempts[attemptNumber], attemptNumber + 1), 500);
          } else {
            console.error("❌ Toutes les tentatives ont échoué");
            toast.error("Impossible de mettre à jour le profil. Vérifiez les données saisies.");
          }
        });
    };
    
    // Commencer avec la première tentative
    attemptUpdate(dataAttempts[0], 1);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }

    dispatch(changePassword(passwordData))
      .unwrap()
      .then(() => {
        setIsChangingPassword(false);
        setPasswordData({
          new_password: "",
          new_password_confirmation: ""
        });
        toast.success("Mot de passe modifié avec succès");
      })
      .catch((error) => {
        console.error("❌ Erreur changement mot de passe:", error);
        toast.error(error || "Erreur lors du changement de mot de passe");
      });
  };

  const cancelEdit = () => {
    if (Userprofile) {
      setFormData({
        nom_et_prenom: Userprofile.nom_et_prenom || "",
        email: Userprofile.email || "",
        tel: Userprofile.tel || "",
        date_de_naissance: Userprofile.date_de_naissance || "",
        profession: Userprofile.profession || "",
        situation_familiale: Userprofile.situation_familiale || "",
        address: Userprofile.address || "",
      });
    }
    setIsEditing(false);
  };

  const cancelPasswordChange = () => {
    setPasswordData({
      new_password: "",
      new_password_confirmation: ""
    });
    setIsChangingPassword(false);
  };

  if (loading && !Userprofile) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Chargement du profil...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={10} xl={8}>
          <Card className="shadow-lg border-0 rounded-3">
            <Card.Header className="bg-white border-bottom py-3">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <h2 className="h4 mb-0 fw-bold">Mon Profil</h2>
                {!isEditing && !isChangingPassword && (
                  <div className="d-flex flex-column flex-sm-row gap-2">
                    <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>
                      <i className="bi bi-pencil me-2"></i>
                      Mettre à jour
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setIsChangingPassword(true)}>
                      <i className="bi bi-key me-2"></i>
                      Changer le mot de passe
                    </Button>
                  </div>
                )}
              </div>
            </Card.Header>

            <Card.Body className="p-3 p-md-4">
              {/* Profile Header - Section responsive */}
              <Row className="mb-4">
                <Col xs={12} md={4} className="text-center mb-3 mb-md-0">
                  <div className="d-flex flex-column align-items-center">
                    <img
                      src={Userprofile?.image || ""}
                      alt="Profile"
                      className="rounded-circle img-fluid shadow"
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        objectFit: 'cover',
                        minWidth: '120px'
                      }}
                      onError={(e) => {
                        e.target.src = "";
                      }}
                    />
                    <h5 className="mt-3 mb-1 text-break">{Userprofile?.nom_et_prenom || "Utilisateur"}</h5>
                    <p className="text-muted small text-break">{Userprofile?.email || ""}</p>
                  </div>
                </Col>

                <Col xs={12} md={8}>
                  <Row className="g-2 g-sm-3">
                    <Col xs={6} sm={4}>
                     
                    </Col>
                   
                    <Col xs={12} sm={4} className="mt-2 mt-sm-0">
                  
                    </Col>
                  </Row>
                </Col>
              </Row>

              <hr />

              <h5 className="text-primary mb-3 mb-md-4">Informations personnelles</h5>

              {/* Change Password Form */}
              {isChangingPassword ? (
                <Form onSubmit={handlePasswordSubmit}>
                  <Row className="g-2 g-md-3">
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-2 mb-md-3">
                        <Form.Label className="fw-medium">Nouveau mot de passe *</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showPassword.new ? "text" : "password"}
                            name="new_password"
                            value={passwordData.new_password}
                            onChange={handlePasswordChange}
                            required
                            minLength="6"
                            placeholder="Nouveau mot de passe"
                            size="sm"
                          />
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                          >
                            <i className={`bi ${showPassword.new ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-2 mb-md-3">
                        <Form.Label className="fw-medium">Confirmer le mot de passe *</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showPassword.confirm ? "text" : "password"}
                            name="new_password_confirmation"
                            value={passwordData.new_password_confirmation}
                            onChange={handlePasswordChange}
                            required
                            minLength="6"
                            placeholder="Confirmer le mot de passe"
                            size="sm"
                          />
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                          >
                            <i className={`bi ${showPassword.confirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-end gap-2 mt-3 mt-md-4">
                    <Button variant="secondary" size="sm" onClick={cancelPasswordChange}>
                      Annuler
                    </Button>
                    <Button variant="primary" size="sm" type="submit" disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : "Changer le mot de passe"}
                    </Button>
                  </div>
                </Form>
              ) : isEditing ? (
                /* Edit Profile Form */
                <Form onSubmit={handleSubmit}>
                  <Row className="g-2 g-md-3">
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-2 mb-md-3">
                        <Form.Label className="fw-medium">Nom et Prénom *</Form.Label>
                        <Form.Control
                          name="nom_et_prenom"
                          value={formData.nom_et_prenom}
                          onChange={handleChange}
                          placeholder="Votre nom complet"
                          required
                          size="sm"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-2 mb-md-3">
                        <Form.Label className="fw-medium">Email *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="votre@email.com"
                          required
                          size="sm"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-2 mb-md-3">
                        <Form.Label className="fw-medium">Téléphone</Form.Label>
                        <Form.Control
                          name="tel"
                          value={formData.tel}
                          onChange={handleChange}
                          placeholder="+216 XX XXX XXX"
                          size="sm"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-2 mb-md-3">
                        <Form.Label className="fw-medium">Date de naissance</Form.Label>
                        <Form.Control
                          type="date"
                          name="date_de_naissance"
                          value={formData.date_de_naissance}
                          onChange={handleChange}
                          size="sm"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-2 mb-md-3">
                        <Form.Label className="fw-medium">Profession</Form.Label>
                        <Form.Control
                          name="profession"
                          value={formData.profession}
                          onChange={handleChange}
                          placeholder="Votre profession"
                          size="sm"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-2 mb-md-3">
                        <Form.Label className="fw-medium">Situation familiale</Form.Label>
                        <Form.Control
                          name="situation_familiale"
                          value={formData.situation_familiale}
                          onChange={handleChange}
                          placeholder="Votre situation familiale"
                          size="sm"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group className="mb-2 mb-md-3">
                        <Form.Label className="fw-medium">Adresse</Form.Label>
                        <Form.Control
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Votre adresse complète"
                          size="sm"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-end gap-2 mt-3 mt-md-4">
                    <Button variant="secondary" size="sm" onClick={cancelEdit}>
                      Annuler
                    </Button>
                    <Button variant="primary" size="sm" type="submit" disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : "Sauvegarder"}
                    </Button>
                  </div>
                </Form>
              ) : (
                /* Display Profile Information - Version responsive */
                <div className="table-responsive">
                  <table className="table table-borderless">
                    <tbody>
                      <tr className="border-bottom">
                        <td className="fw-semibold text-muted" style={{ width: '140px' }}>Nom et Prénom:</td>
                        <td className="text-break">{formData.nom_et_prenom || "Non renseigné"}</td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="fw-semibold text-muted">Email:</td>
                        <td className="text-break">{formData.email || "Non renseigné"}</td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="fw-semibold text-muted">Téléphone:</td>
                        <td className="text-break">{formData.tel || "Non renseigné"}</td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="fw-semibold text-muted">Adresse:</td>
                        <td className="text-break">{formData.address || "Non renseigné"}</td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="fw-semibold text-muted">Date de naissance:</td>
                        <td className="text-break">{formData.date_de_naissance || "Non renseigné"}</td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="fw-semibold text-muted">Profession:</td>
                        <td className="text-break">{formData.profession || "Non renseigné"}</td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Situation familiale:</td>
                        <td className="text-break">{formData.situation_familiale || "Non renseigné"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;