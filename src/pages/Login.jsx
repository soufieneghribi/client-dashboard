import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import axios from 'axios';
import { API_ENDPOINTS } from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!credentials.email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!credentials.password) {
      newErrors.password = 'Mot de passe requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);

    try {
      const response = await axios.post(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          email: credentials.email,
          password: credentials.password
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const { client, token, is_email_verified } = response.data;

      // ⭐ VÉRIFICATION STRICTE : Email non vérifié
      if (
        is_email_verified === false || 
        is_email_verified === 0 || 
        is_email_verified === "0" || 
        is_email_verified === "false"
      ) {
        toast.error('⚠️ Veuillez vérifier votre email avant de vous connecter', {
          duration: 4000,
          icon: '📧',
        });
        
        setIsLoading(false);
        
        setTimeout(() => {
          navigate('/verify-email', { 
            state: { email: credentials.email }
          });
        }, 2000);
        
        return;
      }

      // ✅ Email vérifié : Connexion réussie
      if (token && client) {
        dispatch(loginSuccess({
          user: client,
          token: token
        }));
        
        toast.success('✅ Connexion réussie!', {
          icon: '🎉',
        });
        
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        toast.error('Erreur: Données de connexion incomplètes');
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Erreur de connexion:', error.response?.data);
      
      if (error.response?.data?.message?.toLowerCase().includes('verify') || 
          error.response?.data?.message?.toLowerCase().includes('vérif')) {
        toast.error('⚠️ Veuillez vérifier votre email avant de vous connecter', {
          duration: 4000,
        });
        
        setTimeout(() => {
          navigate('/verify-email', { 
            state: { email: credentials.email }
          });
        }, 2000);
        
        setIsLoading(false);
        return;
      }
      
      if (error.response?.status === 401) {
        toast.error('❌ Email ou mot de passe incorrect');
      } else if (error.response?.status === 403) {
        toast.error('⚠️ Accès refusé. Vérifiez votre email.');
        setTimeout(() => {
          navigate('/verify-email', { 
            state: { email: credentials.email }
          });
        }, 2000);
      } else if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        if (errors) {
          const firstError = Object.values(errors)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          toast.error('Erreur de validation');
        }
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erreur lors de la connexion');
      }
      
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    navigate('/');
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
        
        .form-control {
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 15px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }
        
        .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
          outline: none;
        }
        
        .form-control.is-invalid {
          border-color: #dc3545;
        }
        
        .form-control.is-invalid:focus {
          border-color: #dc3545;
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }
        
        /* Fix pour le champ mot de passe avec input-group */
        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .password-input-wrapper .form-control {
          padding-right: 45px;
        }
        
        .password-toggle-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #718096;
          cursor: pointer;
          padding: 5px 8px;
          transition: all 0.2s ease;
          z-index: 10;
        }
        
        .password-toggle-btn:hover:not(:disabled) {
          color: #4a5568;
        }
        
        .password-toggle-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
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
          background: white;
          transition: all 0.3s ease;
        }
        
        .btn-outline-secondary:hover:not(:disabled) {
          background: #f7fafc;
          border-color: #cbd5e0;
          color: #2d3748;
          transform: translateY(-1px);
        }
        
        .btn-link {
          color: #667eea;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
          background: none;
          border: none;
          padding: 0;
        }
        
        .btn-link:hover {
          color: #764ba2;
        }
        
        .invalid-feedback {
          display: block;
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 25px 0;
        }
        
        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .divider span {
          padding: 0 15px;
          color: #a0aec0;
          font-size: 0.875rem;
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
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-11 col-md-9 col-lg-7 col-xl-5">
              <div className="login-card">
                <div className="login-header">
                  <i className="bi bi-shield-lock fs-1 mb-3"></i>
                  <h1>Bienvenue !</h1>
                  <p>Connectez-vous pour accéder à votre compte</p>
                </div>

                <div className="login-body">
                  <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        <i className="bi bi-envelope me-2"></i>
                        Adresse e-mail
                      </label>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        name="email"
                        value={credentials.email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        disabled={isLoading}
                      />
                      {errors.email && (
                        <div className="invalid-feedback">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.email}
                        </div>
                      )}
                    </div>

                    {/* Mot de passe */}
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        <i className="bi bi-lock me-2"></i>
                        Mot de passe
                      </label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          id="password"
                          name="password"
                          value={credentials.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} fs-5`}></i>
                        </button>
                      </div>
                      {errors.password && (
                        <div className="invalid-feedback">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.password}
                        </div>
                      )}
                    </div>

                    {/* Mot de passe oublié */}
                    <div className="mb-4 text-end">
                      <Link to="/forgot-password" className="btn-link">
                        Mot de passe oublié ?
                      </Link>
                    </div>

                    {/* Bouton de connexion */}
                    <button 
                      type="submit" 
                      className="btn btn-primary w-100 mb-3"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Connexion en cours...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Se connecter
                        </>
                      )}
                    </button>

                    <div className="divider">
                      <span>OU</span>
                    </div>

                    {/* Bouton Explorer en tant qu'invité */}
                    <button 
                      type="button"
                      className="btn btn-outline-secondary w-100 mb-4"
                      onClick={handleGuest}
                      disabled={isLoading}
                    >
                      <i className="bi bi-eye me-2"></i>
                      Explorer en tant qu'invité
                    </button>

                    {/* Lien inscription */}
                    <div className="text-center">
                      <span className="text-muted">Vous n'avez pas de compte ? </span>
                      <Link to="/inscrire" className="signup-link">
                        Créer un compte
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;