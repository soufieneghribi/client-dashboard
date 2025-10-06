import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../store/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { forgetPassword } from "../store/slices/user";
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Modal, InputGroup } from 'react-bootstrap';

const Login = () => {
  const [email, setEmail] = useState("");
  const [searchMail, setSearchMail] = useState("");
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [show, setShow] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, isLoggedIn } = useSelector((state) => state.auth);

  const setUnifiedAuth = (token, user) => {
    try {
      dispatch(loginSuccess({ user, token }));
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      const oneDay = 60 * 60 * 24;
      document.cookie = `auth_token=${token}; path=/; max-age=${oneDay}; Secure; SameSite=Lax`;
      sessionStorage.setItem('user_id', user.ID_client || user.id);
    } catch (error) {
      console.error('Erreur lors du stockage unifié:', error);
      throw new Error('Erreur d\'authentification');
    }
  };

  useEffect(() => {
    if (isLoggedIn || token) {
      navigate("/");
    }
  }, [isLoggedIn, token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await axios.post(
        "https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/auth/login",
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const { client, token } = response.data;

      if (!client || !token) {
        setErrorMessage("Identifiants de connexion invalides.");
        setLoading(false);
        return;
      }

      setUnifiedAuth(token, client);
      
      setTimeout(() => {
        navigate("/");
      }, 100);
      
    } catch (error) {
      setLoading(false);
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          setErrorMessage("Email ou mot de passe incorrect.");
        } else if (status === 422) {
          setErrorMessage("Données de connexion invalides.");
        } else if (status === 500) {
          setErrorMessage("Erreur serveur. Veuillez réessayer plus tard.");
        } else {
          setErrorMessage(
            data.errors?.[0]?.message ||
            data.message ||
            "Erreur d'authentification. Veuillez réessayer."
          );
        }
      } else if (error.request) {
        setErrorMessage("Erreur de connexion au serveur. Vérifiez votre connexion internet.");
      } else {
        setErrorMessage("Une erreur inattendue est survenue.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingModal(true);
    setError("");
    setMessage("");

    if (!searchMail) {
      setError("Veuillez entrer une adresse e-mail valide.");
      setLoadingModal(false);
      return;
    }

    try {
      await dispatch(forgetPassword({ email: searchMail })).unwrap();
      setMessage("Un lien de réinitialisation a été envoyé à votre e-mail.");
      setTimeout(() => {
        setSearchMail("");
        setIsModalOpen(false);
      }, 2000);
    } catch (error) {
      setError("Erreur lors de l'envoi du lien de réinitialisation.");
    } finally {
      setLoadingModal(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center py-4">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="shadow border-0 rounded-3">
              <Card.Body className="p-4 p-md-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <h1 className="h3 fw-bold mb-2">Connexion</h1>
                  <p className="text-muted small">Connectez-vous à votre compte</p>
                </div>

                {/* Form */}
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold">Adresse e-mail</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-envelope text-muted"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-start-0"
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold">Mot de passe</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-lock text-muted"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type={show ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-start-0 border-end-0"
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShow(!show)}
                        className="border-start-0"
                      >
                        <i className={`bi ${show ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Se souvenir"
                      className="small"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <Button
                      variant="link"
                      className="text-decoration-none p-0 small"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Mot de passe oublié ?
                    </Button>
                  </div>

                  {errorMessage && (
                    <Alert variant="danger" className="py-2 small">
                      <i className="bi bi-exclamation-circle me-2"></i>
                      {errorMessage}
                    </Alert>
                  )}

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-2 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Connexion...
                      </>
                    ) : (
                      "Se connecter"
                    )}
                  </Button>

                  <div className="text-center">
                    <span className="text-muted small">Pas de compte ? </span>
                    <Link to="/inscrire" className="fw-semibold text-decoration-none small">
                      S'inscrire
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Back to Home Link */}
            <div className="text-center mt-3">
              <Link to="/" className="text-muted text-decoration-none small">
                <i className="bi bi-arrow-left me-2"></i>
                Retour au site
              </Link>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modal Mot de passe oublié */}
      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5">Mot de passe oublié</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <p className="text-muted small mb-3">
              Entrez votre adresse e-mail pour recevoir un lien de réinitialisation
            </p>
            <Form.Group>
              <Form.Label className="small fw-semibold">Adresse e-mail</Form.Label>
              <Form.Control
                type="email"
                placeholder="votre@email.com"
                value={searchMail}
                onChange={(e) => setSearchMail(e.target.value)}
                required
              />
            </Form.Group>

            {error && (
              <Alert variant="danger" className="mt-3 py-2 small mb-0">
                {error}
              </Alert>
            )}

            {message && (
              <Alert variant="success" className="mt-3 py-2 small mb-0">
                {message}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={loadingModal}>
              {loadingModal ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Envoi...
                </>
              ) : (
                "Envoyer"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Login;