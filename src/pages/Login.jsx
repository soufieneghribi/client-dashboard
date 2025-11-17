import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../store/slices/authSlice";
import { forgetPassword } from "../store/slices/user";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Modal, InputGroup } from 'react-bootstrap';

// ==================== API CONFIGURATION ====================
// ✅ Import depuis api.js
import { API_ENDPOINTS } from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [searchMail, setSearchMail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, isLoggedIn } = useSelector((state) => state.auth);

  const setUnifiedAuth = (token, user) => {
    dispatch(loginSuccess({ user, token }));
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    document.cookie = `auth_token=${token}; path=/; max-age=86400; Secure; SameSite=Strict`;
    sessionStorage.setItem('user_id', user.ID_client || user.id);
  };

  useEffect(() => {
    if (isLoggedIn || token) navigate("/");
  }, [isLoggedIn, token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      // ✅ Utilise API_ENDPOINTS.AUTH.LOGIN au lieu de construire l'URL manuellement
      const response = await fetch(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      if (!data.client || !data.token) {
        setErrorMessage("Identifiants de connexion invalides.");
        setLoading(false);
        return;
      }
      setUnifiedAuth(data.token, data.client);
      setTimeout(() => navigate("/"), 100);
    } catch (err) {
      setLoading(false);
      setErrorMessage("Erreur de connexion. Veuillez réessayer.");
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
    } catch {
      setError("Erreur lors de l'envoi du lien de réinitialisation.");
    } finally {
      setLoadingModal(false);
    }
  };

  const handleGuest = () => {
    navigate("/");
  };

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css');
        @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');
        
        .login-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          display: flex;
          align-items: center;
          padding: 20px 0;
        }
        
        .login-card {
          border: none;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          overflow: hidden;
        }
        
        .login-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        
        .login-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .login-header p {
          opacity: 0.95;
          margin: 0;
          font-size: 0.95rem;
        }
        
        .login-body {
          padding: 40px 35px;
          background: white;
        }
        
        .form-label {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 8px;
          font-size: 0.9rem;
        }
        
        .form-control, .form-select {
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 15px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }
        
        .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
        }
        
        .input-group-text {
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-right: none;
          color: #718096;
        }
        
        .input-group .form-control {
          border-left: none;
        }
        
        .input-group .form-control:focus {
          border-left: none;
        }
        
        .input-group:focus-within .input-group-text {
          border-color: #667eea;
          background: #f0f4ff;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          padding: 13px 25px;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        
        .btn-outline-secondary {
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 13px 25px;
          font-weight: 600;
          color: #4a5568;
          transition: all 0.3s ease;
        }
        
        .btn-outline-secondary:hover {
          background: #f7fafc;
          border-color: #cbd5e0;
          color: #2d3748;
        }
        
        .btn-link {
          color: #667eea;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .btn-link:hover {
          color: #764ba2;
        }
        
        .form-check-input:checked {
          background-color: #667eea;
          border-color: #667eea;
        }
        
        .alert {
          border: none;
          border-radius: 10px;
          padding: 12px 15px;
        }
        
        .alert-danger {
          background: #fee;
          color: #c53030;
        }
        
        .alert-success {
          background: #f0fdf4;
          color: #15803d;
        }
        
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 20px 0;
        }
        
        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .divider span {
          padding: 0 15px;
          color: #718096;
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        .signup-link {
          color: #667eea;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .signup-link:hover {
          color: #764ba2;
        }
        
        .modal-content {
          border: none;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        
        .modal-header {
          border-bottom: 1px solid #e2e8f0;
          padding: 20px 25px;
        }
        
        .modal-title {
          font-weight: 700;
          color: #2d3748;
        }
        
        .modal-body {
          padding: 25px;
        }
        
        .modal-footer {
          border-top: 1px solid #e2e8f0;
          padding: 15px 25px;
        }
        
        .password-toggle {
          border: 2px solid #e2e8f0;
          border-left: none;
          background: white;
          color: #718096;
          transition: all 0.3s ease;
        }
        
        .password-toggle:hover {
          background: #f7fafc;
          color: #4a5568;
        }
        
        .input-group:focus-within .password-toggle {
          border-color: #667eea;
        }
        
        @media (max-width: 576px) {
          .login-header {
            padding: 30px 20px;
          }
          
          .login-header h1 {
            font-size: 1.5rem;
          }
          
          .login-body {
            padding: 30px 20px;
          }
        }
      `}</style>

      <div className="login-wrapper">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={11} md={9} lg={7} xl={5}>
              <Card className="login-card">
                <div className="login-header">
                  <i className="bi bi-shield-lock fs-1 mb-3"></i>
                  <h1>Bienvenue !</h1>
                  <p>Connectez-vous pour accéder à votre compte</p>
                </div>

                <div className="login-body">
                  {errorMessage && (
                    <Alert variant="danger" className="mb-4">
                      <i className="bi bi-exclamation-circle me-2"></i>
                      {errorMessage}
                    </Alert>
                  )}

                  <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-3">
                      <Form.Label>Adresse e-mail</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-envelope"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          placeholder="votre@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Mot de passe</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <i className="bi bi-lock"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                          className="password-toggle"
                        >
                          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </Button>
                      </InputGroup>
                    </Form.Group>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Form.Check
                        type="checkbox"
                        label="Se souvenir de moi"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => setIsModalOpen(true)}
                      >
                        Mot de passe oublié ?
                      </Button>
                    </div>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Connexion en cours...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Se connecter
                        </>
                      )}
                    </Button>

                    <div className="divider">
                      <span>OU</span>
                    </div>

                    <Button
                      variant="outline-secondary"
                      className="w-100 mb-4"
                      onClick={handleGuest}
                    >
                      <i className="bi bi-eye me-2"></i>
                      Explorer en tant qu'invité
                    </Button>

                    <div className="text-center">
                      <span className="text-muted">Vous n'avez pas de compte ? </span>
                      <Link to="/inscrire" className="signup-link">
                        Créer un compte
                      </Link>
                    </div>
                  </Form>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* Modal mot de passe oublié */}
        <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="bi bi-key me-2"></i>
              Réinitialiser le mot de passe
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <p className="text-muted mb-4">
                Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              <Form.Group>
                <Form.Label>Adresse e-mail</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-envelope"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    placeholder="votre@email.com"
                    value={searchMail}
                    onChange={(e) => setSearchMail(e.target.value)}
                    required
                  />
                </InputGroup>
              </Form.Group>

              {error && (
                <Alert variant="danger" className="mt-3 mb-0">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {error}
                </Alert>
              )}
              {message && (
                <Alert variant="success" className="mt-3 mb-0">
                  <i className="bi bi-check-circle me-2"></i>
                  {message}
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="outline-secondary" 
                onClick={() => setIsModalOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loadingModal}
              >
                {loadingModal ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-2"></i>
                    Envoyer le lien
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default Login;