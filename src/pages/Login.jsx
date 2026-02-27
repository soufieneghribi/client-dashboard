import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import axios from 'axios';
import { API_ENDPOINTS } from '../services/api';
import COMPANY_LOGO from "../assets/images/logo_0.png";
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
    } else if (!/\S+@\S+\.\S/.test(credentials.email)) {
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
        toast('Veuillez vérifier votre email avant de vous connecter.', { icon: '📧' });
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

        toast.success(`Bienvenue ${client.nom_et_prenom || 'Client'} !`);

        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        toast.error('Erreur lors de la connexion. Veuillez réessayer.');
        setIsLoading(false);
      }

    } catch (error) {
      if (error.response?.data?.message?.toLowerCase().includes('verify') ||
        error.response?.data?.message?.toLowerCase().includes('vérif')) {

        toast('Votre compte nécessite une vérification.', { icon: '🛡️' });

        setTimeout(() => {
          navigate('/verify-email', {
            state: { email: credentials.email }
          });
        }, 2000);

        setIsLoading(false);
        return;
      }

      if (error.response?.status === 401) {
        toast.error('Email ou mot de passe incorrect.');
      } else if (error.response?.status === 403) {
        toast('Accès refusé. Veuillez vérifier votre email.', { icon: '🚫' });
        setTimeout(() => {
          navigate('/verify-email', {
            state: { email: credentials.email }
          });
        }, 2000);
      } else if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        if (errors) {
          const firstError = Object.values(errors)[0];
          toast.error(typeof firstError === 'string' ? firstError : firstError[0]);
        } else {
          toast.error('Données invalides. Veuillez vérifier vos informations.');
        }
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Une erreur est survenue. Veuillez réessayer plus tard.');
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
          background: #f8fafc;
          display: flex;
          align-items: center;
          padding: 20px 0;
        }
        
        .login-card {
           background: white;
           border-radius: 20px;
           box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
           overflow: hidden;
           padding: 2rem;
        }
        
        .login-header {
           text-align: center;
           margin-bottom: 2rem;
        }
        
        .logo-container {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .logo-container img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        
        .login-header h1 {
           font-size: 1.75rem;
           font-weight: 700;
           color: #1a202c;
           margin-bottom: 0.5rem;
        }
        
        .login-header p {
           color: #718096;
           font-size: 0.95rem;
        }
        
        .form-label {
           font-weight: 600;
           color: #4a5568;
           margin-bottom: 0.5rem;
           font-size: 0.9rem;
        }
        
        .form-control {
           border: 1px solid #e2e8f0;
           border-radius: 12px;
           padding: 0.75rem 1rem;
           font-size: 0.95rem;
           transition: all 0.2s;
        }
        
        .form-control:focus {
           border-color: #667eea;
           box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .btn-primary {
           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
           border: none;
           border-radius: 12px;
           padding: 0.875rem;
           font-weight: 600;
           transition: all 0.3s;
        }
        
        .btn-primary:hover {
           transform: translateY(-1px);
           box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .btn-outline-secondary {
            border-radius: 12px;
            padding: 0.875rem;
            font-weight: 600; 
        }

        .signup-link {
           color: #667eea;
           font-weight: 600;
           text-decoration: none;
        }
        
        .divider {
           display: flex;
           align-items: center;
           text-align: center;
           margin: 1.5rem 0;
        }
        
        .divider::before,
        .divider::after {
           content: '';
           flex: 1;
           border-bottom: 1px solid #e2e8f0;
         }
        
        .divider span {
           padding: 0 1rem;
           color: #a0aec0;
           font-size: 0.875rem;
           font-weight: 600;
        }
      `}</style>
      <div className="login-wrapper">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
              <div className="login-card">
                <div className="login-header">
                  <div className="logo-container">
                    <img src={COMPANY_LOGO} alt="TN360" />
                  </div>
                  <h1>Se connecter</h1>
                  <p>Heureux de vous revoir !</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      name="email"
                      value={credentials.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label mb-0">Mot de passe</label>
                      <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#667eea', textDecoration: 'none' }}>
                        Mot de passe oublié ?
                      </Link>
                    </div>
                    <div className="position-relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="btn position-absolute top-50 end-0 translate-middle-y border-0 text-muted"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ zIndex: 10 }}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                    {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mb-3" disabled={isLoading}>
                    {isLoading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-box-arrow-in-right me-2"></i>}
                    Se connecter
                  </button>

                  <div className="divider">
                    <span>OU explorer sans compte</span>
                  </div>

                  <button type="button" className="btn btn-outline-secondary w-100 mb-4" onClick={handleGuest}>
                    Continuer en tant qu'invité
                  </button>

                  <div className="text-center">
                    <span className="text-muted">Pas encore membre ? </span>
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
    </>
  );
};

export default Login;
