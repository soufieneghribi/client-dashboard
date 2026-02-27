import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../services/api';


const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    token: '',
    password: '',
    password_confirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    // Récupérer l'email et le token depuis l'URL
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      setTokenValid(false);
      // 
    } else {
      setFormData(prev => ({
        ...prev,
        email: email,
        token: token
      }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Confirmation requise';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
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
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        {
          email: formData.email,
          token: formData.token,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );



      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {


      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        if (errors) {
          const newErrors = {};
          Object.keys(errors).forEach(key => {
            newErrors[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
          });
          setErrors(newErrors);

          const firstError = Object.values(errors)[0];
          // ? firstError[0] : firstError);
        }
      } else if (error.response?.status === 400 || error.response?.status === 404) {
        // 
        setTokenValid(false);
      } else if (error.response?.data?.message) {
        // 
      } else {
        // 
      }

      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <>
        <style>{`
          @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css');
          @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');
          
          .reset-password-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            display: flex;
            align-items: center;
            padding: 20px 0;
          }
          
          .reset-password-card {
            border: none;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            overflow: hidden;
            background: white;
            padding: 40px;
          }
          
          .error-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 25px;
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 20px rgba(220, 53, 69, 0.3);
          }
          
          .error-icon i {
            color: white;
            font-size: 2.5rem;
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 10px;
            padding: 13px 25px;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          }
        `}</style>

        <div className="reset-password-wrapper">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 col-sm-11 col-md-9 col-lg-7 col-xl-5">
                <div className="reset-password-card text-center">
                  <div className="error-icon">
                    <i className="bi bi-x-circle"></i>
                  </div>

                  <h2 style={{ color: '#2d3748', fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' }}>
                    Lien invalide ou expiré
                  </h2>

                  <p style={{ color: '#718096', fontSize: '0.95rem', marginBottom: '30px' }}>
                    Ce lien de réinitialisation n'est plus valide.
                    Veuillez demander un nouveau lien de réinitialisation.
                  </p>

                  <div className="d-grid gap-2">
                    <Link to="/forgot-password" className="btn btn-primary">
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Demander un nouveau lien
                    </Link>

                    <Link
                      to="/login"
                      style={{
                        color: '#667eea',
                        textDecoration: 'none',
                        fontWeight: '500',
                        marginTop: '10px'
                      }}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Retour à la connexion
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css');
        @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');
        
        .reset-password-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          display: flex;
          align-items: center;
          padding: 20px 0;
        }
        
        .reset-password-card {
          border: none;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          overflow: hidden;
          background: white;
        }
        
        .reset-password-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        
        .reset-password-header h1 {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .reset-password-header p {
          opacity: 0.95;
          margin: 0;
          font-size: 0.95rem;
        }
        
        .reset-password-body {
          padding: 40px 35px;
        }
        
        .icon-wrapper {
          width: 80px;
          height: 80px;
          margin: 0 auto 25px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }
        
        .icon-wrapper i {
          color: white;
          font-size: 2.5rem;
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
        
        .invalid-feedback {
          display: block;
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        
        .email-display {
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 15px;
          margin-bottom: 25px;
          text-align: center;
          color: #4a5568;
          font-weight: 500;
        }
        
        .password-requirements {
          background: #f0f9ff;
          border: 2px solid #bfdbfe;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .password-requirements p {
          margin: 0 0 8px 0;
          color: #1e40af;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .password-requirements ul {
          margin: 0;
          padding-left: 20px;
          color: #1e40af;
        }
        
        .password-requirements li {
          font-size: 0.85rem;
          margin-bottom: 4px;
        }
        
        @media (max-width: 576px) {
          .reset-password-header {
            padding: 30px 20px;
          }
          
          .reset-password-header h1 {
            font-size: 1.5rem;
          }
          
          .reset-password-body {
            padding: 30px 20px;
          }
        }
      `}</style>

      <div className="reset-password-wrapper">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-11 col-md-9 col-lg-7 col-xl-5">
              <div className="reset-password-card">
                <div className="reset-password-header">
                  <i className="bi bi-shield-lock fs-1 mb-3"></i>
                  <h1>Nouveau mot de passe</h1>
                  <p>Créez un nouveau mot de passe sécurisé</p>
                </div>

                <div className="reset-password-body">
                  <div className="icon-wrapper">
                    <i className="bi bi-key"></i>
                  </div>

                  <div className="email-display">
                    <i className="bi bi-envelope me-2"></i>
                    {formData.email}
                  </div>

                  <form onSubmit={handleSubmit}>
                    {/* Nouveau mot de passe */}
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        <i className="bi bi-lock me-2"></i>
                        Nouveau mot de passe
                      </label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          id="password"
                          name="password"
                          value={formData.password}
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

                    {/* Confirmer mot de passe */}
                    <div className="mb-3">
                      <label htmlFor="password_confirmation" className="form-label">
                        <i className="bi bi-lock-fill me-2"></i>
                        Confirmer le mot de passe
                      </label>
                      <div className="password-input-wrapper">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
                          id="password_confirmation"
                          name="password_confirmation"
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          placeholder="••••••••"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                        >
                          <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'} fs-5`}></i>
                        </button>
                      </div>
                      {errors.password_confirmation && (
                        <div className="invalid-feedback">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.password_confirmation}
                        </div>
                      )}
                    </div>

                    {/* Exigences du mot de passe */}
                    <div className="password-requirements">
                      <p>
                        <i className="bi bi-info-circle me-2"></i>
                        Exigences du mot de passe :
                      </p>
                      <ul>
                        <li>Au moins 6 caractères</li>
                        <li>Les deux mots de passe doivent correspondre</li>
                      </ul>
                    </div>

                    {/* Bouton de réinitialisation */}
                    <div className="d-grid gap-2 mb-3">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Réinitialisation en cours...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Réinitialiser le mot de passe
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-center">
                      <Link
                        to="/login"
                        style={{
                          color: '#667eea',
                          textDecoration: 'none',
                          fontWeight: '500'
                        }}
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Retour à la connexion
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

export default ResetPassword;


