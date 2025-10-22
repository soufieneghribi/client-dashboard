import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../store/slices/user';
import { FormUtils } from '../utils/Utils';
import { FORM_CONFIG, FORM_OPTIONS, INITIAL_STATE, TERMS_CONDITIONS } from '../Constants/Constants';
import toast from 'react-hot-toast';
import axios from 'axios';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState({
    ...INITIAL_STATE.USER,
    phoneCode: '+216'
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isAgreed, setIsAgreed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [geoConsent, setGeoConsent] = useState(false);
  const [geoStatus, setGeoStatus] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isRecaptchaLoaded, setIsRecaptchaLoaded] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const recaptchaRef = useRef(null);
  const googleButtonRef = useRef(null);

  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      console.error('VITE_RECAPTCHA_SITE_KEY is not defined in environment variables');
    }
    if (!GOOGLE_CLIENT_ID) {
      console.error('VITE_GOOGLE_CLIENT_ID is not defined in environment variables');
    }
  }, []);

  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha) {
        setIsRecaptchaLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
      script.async = true;
      script.defer = true;
      window.onRecaptchaLoad = () => setIsRecaptchaLoaded(true);
      document.head.appendChild(script);
    };
    
    if (RECAPTCHA_SITE_KEY) {
      loadRecaptcha();
    }
    
    return () => { if (window.onRecaptchaLoad) delete window.onRecaptchaLoad; };
  }, [RECAPTCHA_SITE_KEY]);

  useEffect(() => {
    if (isRecaptchaLoaded && currentStep === 3 && recaptchaRef.current && window.grecaptcha && RECAPTCHA_SITE_KEY) {
      try {
        if (recaptchaRef.current.innerHTML) recaptchaRef.current.innerHTML = '';
        window.grecaptcha.render(recaptchaRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: (token) => {
            setRecaptchaToken(token);
            setErrors((prev) => ({ ...prev, recaptcha: undefined }));
          },
          'expired-callback': () => {
            setRecaptchaToken('');
            setErrors((prev) => ({ ...prev, recaptcha: 'reCAPTCHA expiré, veuillez le refaire' }));
          },
          'error-callback': () => {
            setRecaptchaToken('');
            setErrors((prev) => ({ ...prev, recaptcha: 'Erreur reCAPTCHA, veuillez réessayer' }));
          }
        });
      } catch (error) {
        console.error('Error rendering reCAPTCHA:', error);
      }
    }
  }, [isRecaptchaLoaded, currentStep, RECAPTCHA_SITE_KEY]);

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google && window.google.accounts && GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: false,
          context: 'signup'
        });
        setIsGoogleLoaded(true);
      } else if (GOOGLE_CLIENT_ID) {
        setTimeout(initializeGoogle, 100);
      }
    };

    if (document.readyState === 'complete') {
      initializeGoogle();
    } else {
      window.addEventListener('load', initializeGoogle);
    }

    return () => {
      window.removeEventListener('load', initializeGoogle);
    };
  }, [GOOGLE_CLIENT_ID]);

  useEffect(() => {
    if (isGoogleLoaded && currentStep === 1 && googleButtonRef.current && window.google && GOOGLE_CLIENT_ID) {
      try {
        if (googleButtonRef.current.innerHTML) {
          googleButtonRef.current.innerHTML = '';
        }
        
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            width: 300,
            text: 'signup_with',
            shape: 'pill',
            logo_alignment: 'left'
          }
        );
      } catch (error) {
        console.error('Error rendering Google button:', error);
      }
    }
  }, [isGoogleLoaded, currentStep, GOOGLE_CLIENT_ID]);

  const handleGoogleSignIn = async (response) => {
    if (response.credential) {
      try {
        await handleGoogleRegister(response.credential);
      } catch (error) {
        console.error('Google Sign-In error:', error);
        toast.error('Erreur lors de l\'inscription avec Google');
      }
    }
  };

  const handleGoogleRegister = async (googleToken) => {
    try {
      const response = await axios.post('http://localhost:8000/api/v1/auth/google-register', {
        token: googleToken
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.client));
        
        dispatch({ 
          type: 'auth/loginSuccess', 
          payload: { 
            user: response.data.client,
            token: response.data.token
          } 
        });
        
        toast.success('Inscription avec Google réussie!');
        navigate('/');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('Cet email est déjà utilisé. Veuillez vous connecter.');
        navigate('/login');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erreur lors de l\'inscription avec Google');
      }
    }
  };

  const changeHandler = (e) => {
    const { name, value } = e.target;
    
    // Validation pour le téléphone
    if (name === 'tel') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 8) {
        setUser({ ...user, [name]: cleaned });
      }
      return;
    }
    
    setUser({ ...user, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };
  
  const onConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
  };
  
  const handleCheckboxChange = (e) => {
    setIsAgreed(e.target.checked);
    setErrors((prev) => ({ ...prev, terms: undefined }));
  };
  
  const handleGeoConsent = async (e) => {
    const checked = e.target.checked;
    setGeoConsent(checked);
    FormUtils.handleGeolocationConsent(checked, setGeoStatus);
  };
  
  const validateStep1 = () => {
    const newErrors = FormUtils.validateStep1(user, confirmPassword);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateBeforeSubmit = () => {
    const step1Valid = validateStep1();
    let hasErrors = false;
    const newErrors = { ...errors };
    
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      newErrors.recaptcha = 'Veuillez compléter le reCAPTCHA';
      hasErrors = true;
    }
    
    setErrors(newErrors);
    return step1Valid && !hasErrors;
  };
  
  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep < FORM_CONFIG.STEPS.TOTAL) setCurrentStep(currentStep + 1);
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateBeforeSubmit()) return;
    if (!isAgreed) {
      setErrors((prev) => ({ ...prev, terms: 'Vous devez accepter les conditions' }));
      return;
    }
    
    const fullPhoneNumber = `${user.phoneCode}${user.tel}`;
    const payload = { 
      ...user, 
      tel: fullPhoneNumber,
      ...(RECAPTCHA_SITE_KEY && recaptchaToken && { recaptcha_token: recaptchaToken })
    };
    
    try {
      await dispatch(signUp({ user: payload, navigate })).unwrap();
      
      setCurrentStep(1);
      setUser({ ...INITIAL_STATE.USER, phoneCode: '+216' });
      setConfirmPassword('');
      setRecaptchaToken('');
      setIsAgreed(false);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };
  
  const handleShowModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const renderPasswordStrength = () => {
    const { score, label } = FormUtils.getPasswordStrength(user.password);
    const colors = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-info', 'bg-success'];
    const widths = ['25%', '40%', '60%', '80%', '100%'];
    
    return user.password && (
      <div className="mt-2">
        <div className="progress" style={{ height: '6px' }}>
          <div 
            className={`progress-bar ${colors[score]}`}
            style={{ width: widths[score] }}
          ></div>
        </div>
        <small className="text-muted d-block mt-1">
          Force: <strong>{label}</strong>
        </small>
        <small className="text-muted d-block">
          <i className="bi bi-info-circle me-1"></i>
          8+ caractères, 1 majuscule, 1 chiffre, 1 symbole
        </small>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css');
        @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');
        
        .register-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 40px 15px;
        }
        
        .register-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .register-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        
        .register-header h2 {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0;
        }
        
        .register-body {
          padding: 35px;
        }
        
        .step-indicator {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 35px;
          gap: 15px;
        }
        
        .step-circle {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }
        
        .step-circle.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .step-circle.completed {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .step-circle.inactive {
          background: #e9ecef;
          color: #6c757d;
        }
        
        .step-line {
          width: 60px;
          height: 3px;
          background: #e9ecef;
          transition: all 0.3s ease;
        }
        
        .step-line.completed {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        
        .form-control:focus, .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
        }
        
        .form-control.is-valid {
          border-color: #28a745;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%2328a745' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right calc(0.375em + 0.1875rem) center;
          background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
          padding-right: calc(1.5em + 0.75rem);
        }
        
        .form-control.is-invalid {
          border-color: #dc3545;
        }
        
        .input-group-text {
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-right: none;
          color: #718096;
          font-weight: 500;
        }
        
        .input-group .form-control {
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
          padding: 12px 30px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        
        .btn-outline-secondary {
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 30px;
          font-weight: 600;
          color: #4a5568;
          background: white;
        }
        
        .btn-outline-secondary:hover {
          background: #f7fafc;
          border-color: #cbd5e0;
          color: #2d3748;
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
        }
        
        .input-group:focus-within .password-toggle {
          border-color: #667eea;
        }
        
        .info-card {
          background: #f0f4ff;
          border: 2px solid #e0e7ff;
          border-radius: 12px;
          padding: 20px;
        }
        
        .form-check-input:checked {
          background-color: #667eea;
          border-color: #667eea;
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
        
        .modal-content {
          border: none;
          border-radius: 15px;
        }
        
        .modal-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom: none;
          border-radius: 15px 15px 0 0;
        }
        
        .modal-header .btn-close {
          filter: brightness(0) invert(1);
        }
        
        @media (max-width: 768px) {
          .register-body {
            padding: 25px 20px;
          }
          
          .step-line {
            width: 40px;
          }
          
          .step-circle {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }
        }
      `}</style>

      <div className="register-wrapper">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 col-xl-9">
              <div className="register-card">
                <div className="register-header">
                  <i className="bi bi-person-plus-fill fs-1 mb-2"></i>
                  <h2>Créez votre compte</h2>
                  <p className="mb-0">Rejoignez-nous en quelques étapes simples</p>
                </div>

                <div className="register-body">
                  {/* Step Indicator */}
                  <div className="step-indicator">
                    <div className={`step-circle ${currentStep >= 1 ? (currentStep > 1 ? 'completed' : 'active') : 'inactive'}`}>
                      {currentStep > 1 ? <i className="bi bi-check-lg"></i> : '1'}
                    </div>
                    <div className={`step-line ${currentStep > 1 ? 'completed' : ''}`}></div>
                    <div className={`step-circle ${currentStep >= 2 ? (currentStep > 2 ? 'completed' : 'active') : 'inactive'}`}>
                      {currentStep > 2 ? <i className="bi bi-check-lg"></i> : '2'}
                    </div>
                    <div className={`step-line ${currentStep > 2 ? 'completed' : ''}`}></div>
                    <div className={`step-circle ${currentStep >= 3 ? 'active' : 'inactive'}`}>
                      3
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {/* STEP 1 */}
                    {currentStep === 1 && (
                      <div>
                        <h4 className="text-center mb-4 fw-bold">Informations personnelles</h4>
                        
                        {/* Google Sign-In */}
                        {GOOGLE_CLIENT_ID && (
                          <>
                            <div className="d-flex justify-content-center mb-3">
                              {!isGoogleLoaded && (
                                <div className="text-center py-3">
                                  <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                                  <span className="text-muted">Chargement...</span>
                                </div>
                              )}
                              <div ref={googleButtonRef}></div>
                            </div>
                            
                            <div className="divider">
                              <span>OU</span>
                            </div>
                          </>
                        )}

                        <div className="row g-3">
                          {/* Nom et Prénom */}
                          <div className="col-md-6">
                            <label className="form-label">
                              Nom et Prénom <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <i className="bi bi-person"></i>
                              </span>
                              <input
                                type="text"
                                name="nom_et_prenom"
                                className={`form-control ${user.nom_et_prenom?.trim() && !errors.nom_et_prenom ? 'is-valid' : errors.nom_et_prenom ? 'is-invalid' : ''}`}
                                placeholder="Ex: Ahmed Ben Ali"
                                value={user.nom_et_prenom}
                                onChange={changeHandler}
                                required
                              />
                            </div>
                            {errors.nom_et_prenom && (
                              <div className="invalid-feedback d-block">{errors.nom_et_prenom}</div>
                            )}
                          </div>

                          {/* Email */}
                          <div className="col-md-6">
                            <label className="form-label">
                              Email <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <i className="bi bi-envelope"></i>
                              </span>
                              <input
                                type="email"
                                name="email"
                                className={`form-control ${FormUtils.isValidEmail(user.email) && !errors.email ? 'is-valid' : errors.email ? 'is-invalid' : ''}`}
                                placeholder="exemple@email.com"
                                value={user.email}
                                onChange={changeHandler}
                                required
                              />
                            </div>
                            <small className="text-muted">
                              <i className="bi bi-info-circle me-1"></i>
                              Doit contenir @ et un domaine valide
                            </small>
                            {errors.email && (
                              <div className="invalid-feedback d-block">{errors.email}</div>
                            )}
                          </div>

                          {/* Téléphone */}
                          <div className="col-md-6">
                            <label className="form-label">
                              Téléphone <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">+216</span>
                              <input
                                type="tel"
                                name="tel"
                                className={`form-control ${user.tel?.length === 8 && !errors.tel ? 'is-valid' : errors.tel ? 'is-invalid' : ''}`}
                                placeholder="12 345 678"
                                value={user.tel}
                                onChange={changeHandler}
                                maxLength="8"
                                pattern="[0-9]{8}"
                                required
                              />
                            </div>
                            <small className="text-muted">
                              <i className="bi bi-info-circle me-1"></i>
                              Exactement 8 chiffres
                            </small>
                            {errors.tel && (
                              <div className="invalid-feedback d-block">{errors.tel}</div>
                            )}
                          </div>

                          {/* Civilité */}
                          <div className="col-md-6">
                            <label className="form-label">
                              Civilité <span className="text-danger">*</span>
                            </label>
                            <select
                              name="civilite"
                              className={`form-select ${user.civilite && !errors.civilite ? 'is-valid' : ''}`}
                              value={user.civilite}
                              onChange={changeHandler}
                              required
                            >
                              <option value="">Sélectionnez</option>
                              {FORM_OPTIONS.CIVILITY.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Mot de passe */}
                          <div className="col-md-6">
                            <label className="form-label">
                              Mot de passe <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <i className="bi bi-lock"></i>
                              </span>
                              <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className={`form-control ${user.password && !errors.password ? 'is-valid' : errors.password ? 'is-invalid' : ''}`}
                                placeholder="••••••••"
                                value={user.password}
                                onChange={changeHandler}
                                required
                              />
                              <button
                                type="button"
                                className="btn password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                              </button>
                            </div>
                            {renderPasswordStrength()}
                          </div>

                          {/* Confirmer mot de passe */}
                          <div className="col-md-6">
                            <label className="form-label">
                              Confirmer le mot de passe <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <i className="bi bi-lock-fill"></i>
                              </span>
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                className={`form-control ${confirmPassword && user.password === confirmPassword && !errors.confirmPassword ? 'is-valid' : errors.confirmPassword ? 'is-invalid' : ''}`}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={onConfirmPasswordChange}
                                required
                              />
                              <button
                                type="button"
                                className="btn password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                              </button>
                            </div>
                            {errors.confirmPassword && (
                              <div className="invalid-feedback d-block">{errors.confirmPassword}</div>
                            )}
                          </div>

                          {/* Date de naissance */}
                          <div className="col-12">
                            <label className="form-label">
                              Date de naissance <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <i className="bi bi-calendar"></i>
                              </span>
                              <input
                                type="date"
                                name="dateN"
                                className="form-control"
                                value={user.dateN}
                                onChange={changeHandler}
                                max={FormUtils.getTodayDate()}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 2 */}
                    {currentStep === 2 && (
                      <div>
                        <h4 className="text-center mb-4 fw-bold">Informations complémentaires</h4>
                        
                        <div className="row g-3">
                          {/* Adresse */}
                          <div className="col-md-6">
                            <label className="form-label">
                              Gouvernorat <span className="text-danger">*</span>
                            </label>
                            <select
                              name="adresse"
                              className={`form-select ${user.adresse && !errors.adresse ? 'is-valid' : ''}`}
                              value={user.adresse}
                              onChange={changeHandler}
                              required
                            >
                              <option value="">Sélectionnez votre gouvernorat</option>
                              {FORM_OPTIONS.GOVERNORATES.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Profession */}
                          <div className="col-md-6">
                            <label className="form-label">
                              Profession <span className="text-danger">*</span>
                            </label>
                            <select
                              name="profession"
                              className={`form-select ${user.profession && !errors.profession ? 'is-valid' : ''}`}
                              value={user.profession}
                              onChange={changeHandler}
                              required
                            >
                              <option value="">Sélectionnez votre profession</option>
                              {FORM_OPTIONS.PROFESSIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Situation familiale */}
                          <div className="col-md-6">
                            <label className="form-label">
                              Situation familiale <span className="text-danger">*</span>
                            </label>
                            <select
                              name="situation_familiale"
                              className={`form-select ${user.situation_familiale && !errors.situation_familiale ? 'is-valid' : ''}`}
                              value={user.situation_familiale}
                              onChange={changeHandler}
                              required
                            >
                              <option value="">Sélectionnez</option>
                              {FORM_OPTIONS.FAMILY_STATUS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Nombre d'enfants */}
                          {user.situation_familiale && user.situation_familiale !== "Célibataire" && (
                            <div className="col-md-6">
                              <label className="form-label">
                                Nombre d'enfants <span className="text-danger">*</span>
                              </label>
                              <select
                                name="enfants"
                                className={`form-select ${user.enfants && !errors.enfants ? 'is-valid' : ''}`}
                                value={user.enfants}
                                onChange={changeHandler}
                                required
                              >
                                <option value="">Sélectionnez</option>
                                {FORM_OPTIONS.CHILDREN_COUNT.map((option) => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Noms des enfants - Affiché après sélection du nombre */}
                          {user.situation_familiale !== "Célibataire" && user.enfants && parseInt(user.enfants) > 0 && (
                            <div className="col-12">
                              <div className="info-card mt-2">
                                <h5 className="fw-bold mb-3">
                                  <i className="bi bi-people-fill me-2"></i>
                                  Noms des enfants
                                </h5>
                                <div className="row g-3">
                                  {Array.from({ length: parseInt(user.enfants) }, (_, index) => (
                                    <div key={index} className="col-md-6">
                                      <label className="form-label">
                                        Enfant {index + 1} <span className="text-danger">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        name={`nom_enfant_${index + 1}`}
                                        className="form-control"
                                        placeholder={`Prénom de l'enfant ${index + 1}`}
                                        onChange={changeHandler}
                                        required
                                      />
                                      {errors[`nom_enfant_${index + 1}`] && (
                                        <div className="invalid-feedback d-block">
                                          {errors[`nom_enfant_${index + 1}`]}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STEP 3 */}
                    {currentStep === 3 && (
                      <div>
                        <h4 className="text-center mb-4 fw-bold">Confirmation</h4>

                        {/* Conditions générales */}
                        <div className="info-card mb-3">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="termsCheck"
                              checked={isAgreed}
                              onChange={handleCheckboxChange}
                            />
                            <label className="form-check-label" htmlFor="termsCheck">
                              J'accepte les{' '}
                              <button
                                type="button"
                                className="btn btn-link p-0 text-decoration-underline"
                                onClick={handleShowModal}
                              >
                                conditions générales
                              </button>
                              <span className="text-danger">*</span>
                            </label>
                          </div>
                          {errors.terms && (
                            <div className="text-danger small mt-2">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              {errors.terms}
                            </div>
                          )}
                        </div>

                        {/* Géolocalisation */}
                        <div className="info-card mb-3">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="geoCheck"
                              checked={geoConsent}
                              onChange={handleGeoConsent}
                            />
                            <label className="form-check-label" htmlFor="geoCheck">
                              <i className="bi bi-geo-alt me-2"></i>
                              Autoriser la géolocalisation
                              {geoConsent && geoStatus && (
                                <small className="d-block text-muted mt-1">
                                  <i className="bi bi-check-circle me-1"></i>
                                  {geoStatus}
                                </small>
                              )}
                            </label>
                          </div>
                        </div>

                        {/* reCAPTCHA */}
                        {RECAPTCHA_SITE_KEY && (
                          <div className="info-card mb-3">
                            <h5 className="fw-bold text-center mb-3">
                              <i className="bi bi-shield-check me-2"></i>
                              Vérification de sécurité
                            </h5>
                            <div className="d-flex justify-content-center">
                              <div ref={recaptchaRef}></div>
                            </div>
                            {errors.recaptcha && (
                              <div className="text-danger small text-center mt-2">
                                <i className="bi bi-exclamation-circle me-1"></i>
                                {errors.recaptcha}
                              </div>
                            )}
                            {recaptchaToken && (
                              <div className="text-success small text-center mt-2">
                                <i className="bi bi-check-circle me-1"></i>
                                Vérification réussie
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                      {currentStep > 1 && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handlePreviousStep}
                        >
                          <i className="bi bi-arrow-left me-2"></i>
                          Précédent
                        </button>
                      )}
                      
                      {currentStep < FORM_CONFIG.STEPS.TOTAL ? (
                        <button
                          type="button"
                          className="btn btn-primary ms-auto"
                          onClick={handleNextStep}
                        >
                          Suivant
                          <i className="bi bi-arrow-right ms-2"></i>
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="btn btn-primary ms-auto"
                          disabled={!isAgreed}
                        >
                          <i className="bi bi-check-circle me-2"></i>
                          Créer mon compte
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Already have account */}
              <div className="text-center mt-4">
                <p className="text-muted">
                  Vous avez déjà un compte ?{' '}
                  <a href="/login" className="text-decoration-none fw-bold" style={{ color: '#667eea' }}>
                    Se connecter
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Terms & Conditions */}
        {isModalOpen && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-file-text me-2"></i>
                    {TERMS_CONDITIONS.TITLE}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="text-muted">{TERMS_CONDITIONS.INTRODUCTION}</p>
                  
                  {TERMS_CONDITIONS.CONTENT.map((section, index) => (
                    <div key={index} className="mb-4">
                      <h6 className="fw-bold text-dark">{section.title}</h6>
                      <p className="text-muted">{section.text}</p>
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCloseModal}
                  >
                    <i className="bi bi-check-lg me-2"></i>
                    {TERMS_CONDITIONS.CLOSE_BUTTON_TEXT}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Register;