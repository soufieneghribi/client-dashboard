import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../store/slices/user';
import toast from 'react-hot-toast';

// Liste des gouvernorats tunisiens
const GOUVERNORATS = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 
  'Nabeul', 'Zaghouan', 'Bizerte', 'Béja', 
  'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 
  'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 
  'Kasserine', 'Sidi Bouzid', 'Gabès', 'Medenine', 
  'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'
];

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState({
    nom_et_prenom: '',
    email: '',
    tel: '',
    password: '',
    civilite: '',
    situation_familiale: '',
    date_de_naissance: '',
    profession: '',
    ville: '', // ✅ Ajouté
    gouvernorat: '', // ✅ Ajouté
    address: '', // ✅ Ajouté
    code_postal: '',
    nom_enfant_1: '',
    nom_enfant_2: '',
    nom_enfant_3: '',
    nom_enfant_4: '',
    date_de_naissance1: '',
    date_de_naissance2: '',
    date_de_naissance3: '',
    date_de_naissance4: '',
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isAgreed, setIsAgreed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [geoConsent, setGeoConsent] = useState(false);
  const [geoStatus, setGeoStatus] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState(''); // ⚠️ NE PAS stocker dans localStorage
  const [isRecaptchaLoaded, setIsRecaptchaLoaded] = useState(false);
  const recaptchaRef = useRef(null);

  // ⭐ TOKEN RECAPTCHA INTÉGRÉ DIRECTEMENT POUR ÉVITER LES PROBLÈMES EN PRODUCTION
  const RECAPTCHA_SITE_KEY = "6LeVfM4rAAAAADvLqwTpxxUKnXJtZOJqguydl-KD";

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      console.error('VITE_RECAPTCHA_SITE_KEY is not defined');
    }
  }, []);

  // Chargement de reCAPTCHA
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
    
    return () => { 
      if (window.onRecaptchaLoad) delete window.onRecaptchaLoad; 
    };
  }, [RECAPTCHA_SITE_KEY]);

  // Rendu de reCAPTCHA
  useEffect(() => {
    if (isRecaptchaLoaded && currentStep === 3 && recaptchaRef.current && window.grecaptcha && RECAPTCHA_SITE_KEY) {
      try {
        if (recaptchaRef.current.innerHTML) recaptchaRef.current.innerHTML = '';
        window.grecaptcha.render(recaptchaRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: (token) => {
            // ⚠️ NE PAS stocker dans localStorage - juste dans state
            setRecaptchaToken(token);
            setErrors((prev) => ({ ...prev, recaptcha: undefined }));
          },
          'expired-callback': () => {
            setRecaptchaToken('');
            setErrors((prev) => ({ ...prev, recaptcha: 'reCAPTCHA expiré' }));
          },
          'error-callback': () => {
            setRecaptchaToken('');
            setErrors((prev) => ({ ...prev, recaptcha: 'Erreur reCAPTCHA' }));
          }
        });
      } catch (error) {
        console.error('Error rendering reCAPTCHA:', error);
      }
    }
  }, [isRecaptchaLoaded, currentStep, RECAPTCHA_SITE_KEY]);

  // ✅ LOGIQUE DE GÉOLOCALISATION DE L'ANCIEN CODE
  const handleGeoConsent = async (e) => {
    const checked = e.target.checked;
    setGeoConsent(checked);
    
    if (checked) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            toast.success('Géolocalisation activée avec succès');
            
            // Optionnel: Stocker les coordonnées dans l'état user
            setUser(prev => ({
              ...prev,
              latitude: latitude.toString(),
              longitude: longitude.toString()
            }));
          },
          (error) => {
            let errorMessage = 'Erreur de géolocalisation';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Permission de géolocalisation refusée';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Position indisponible';
                break;
              case error.TIMEOUT:
                errorMessage = 'Timeout de la géolocalisation';
                break;
              default:
                errorMessage = 'Erreur inconnue de géolocalisation';
                break;
            }
            setGeoStatus(errorMessage);
            toast.error(errorMessage);
            setGeoConsent(false); // Décocher la case en cas d'erreur
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      } else {
        setGeoStatus('Géolocalisation non supportée par ce navigateur');
        toast.error('Votre navigateur ne supporte pas la géolocalisation');
        setGeoConsent(false);
      }
    } else {
      setGeoStatus(null);
      // Optionnel: Supprimer les coordonnées de l'état user
      setUser(prev => {
        const { latitude, longitude, ...rest } = prev;
        return rest;
      });
    }
  };

  const changeHandler = (e) => {
    const { name, value } = e.target;
    
    // Validation pour le téléphone (8 chiffres max)
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
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!user.nom_et_prenom?.trim()) newErrors.nom_et_prenom = 'Nom complet requis';
      if (!user.email?.trim()) {
        newErrors.email = 'Email requis';
      } else if (!/\S+@\S+\.\S+/.test(user.email)) {
        newErrors.email = 'Email invalide';
      }
      if (!user.tel?.trim()) {
        newErrors.tel = 'Téléphone requis';
      } else if (user.tel.length !== 8) {
        newErrors.tel = 'Le numéro doit contenir 8 chiffres';
      }
      if (!user.password) {
        newErrors.password = 'Mot de passe requis';
      } else if (user.password.length < 6) {
        newErrors.password = 'Minimum 6 caractères';
      }
      if (user.password !== confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    if (step === 2) {
      if (!user.civilite) newErrors.civilite = 'Civilité requise';
      if (!user.situation_familiale) newErrors.situation_familiale = 'Situation familiale requise';
      if (!user.date_de_naissance) newErrors.date_de_naissance = 'Date de naissance requise';
      
      // ✅ Validation des nouveaux champs
      if (!user.ville?.trim()) newErrors.ville = 'Ville requise';
      if (!user.gouvernorat) newErrors.gouvernorat = 'Gouvernorat requis';
      if (!user.address?.trim()) newErrors.address = 'Adresse requise';
    }

    if (step === 3) {
      if (!isAgreed) newErrors.terms = 'Vous devez accepter les conditions';
      if (!recaptchaToken) newErrors.recaptcha = 'Veuillez compléter le reCAPTCHA';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      toast.error('Veuillez corriger les erreurs');
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleShowModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(3)) {
      toast.error('Veuillez corriger les erreurs');
      return;
    }

    try {
      // Payload complet avec tous les champs
      const payload = {
        nom_et_prenom: user.nom_et_prenom,
        email: user.email,
        tel: user.tel,
        password: user.password,
        civilite: user.civilite,
        situation_familiale: user.situation_familiale,
        date_de_naissance: user.date_de_naissance,
        profession: user.profession || '',
        ville: user.ville,
        gouvernorat: user.gouvernorat,
        address: user.address,
        code_postal: user.code_postal || '',
        nom_enfant_1: user.nom_enfant_1 || '',
        nom_enfant_2: user.nom_enfant_2 || '',
        nom_enfant_3: user.nom_enfant_3 || '',
        nom_enfant_4: user.nom_enfant_4 || '',
        date_de_naissance1: user.date_de_naissance1 || '',
        date_de_naissance2: user.date_de_naissance2 || '',
        date_de_naissance3: user.date_de_naissance3 || '',
        date_de_naissance4: user.date_de_naissance4 || '',
        // ✅ Inclure les coordonnées GPS si disponibles
        ...(geoConsent && user.latitude && user.longitude && {
          latitude: user.latitude,
          longitude: user.longitude
        }),
        // ⚠️ Token reCAPTCHA envoyé mais JAMAIS stocké
        recaptcha_token: recaptchaToken
      };

      // Appel Redux
      const result = await dispatch(signUp({ user: payload })).unwrap();

      // ✅ L'API retourne is_email_verified = false après inscription
      if (result.email && result.is_email_verified === false) {
        toast.success('📧 Inscription réussie ! Un code a été envoyé à votre email.');
        
        // Redirection vers la page de vérification
        setTimeout(() => {
          navigate('/verify-email', { 
            state: { email: user.email }
          });
        }, 1500);
      } else if (result.token) {
        // Si email déjà vérifié (rare)
        toast.success('✅ Inscription réussie !');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }

    } catch (error) {
      console.error('Erreur inscription:', error);
      
      // Gestion des erreurs API
      if (error.response?.data?.errors) {
        const apiErrors = {};
        
        if (Array.isArray(error.response.data.errors)) {
          error.response.data.errors.forEach(err => {
            if (err.code && err.message) {
              apiErrors[err.code] = err.message;
            }
          });
        } else if (typeof error.response.data.errors === 'object') {
          // Format Laravel validation
          Object.keys(error.response.data.errors).forEach(key => {
            const messages = error.response.data.errors[key];
            apiErrors[key] = Array.isArray(messages) ? messages[0] : messages;
          });
        }
        
        setErrors(apiErrors);
        
        // Afficher le premier message d'erreur
        const firstError = Object.values(apiErrors)[0];
        if (firstError) {
          toast.error(firstError);
        }
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || 'Erreur lors de l\'inscription');
      }
      
      // Réinitialiser reCAPTCHA en cas d'erreur
      if (window.grecaptcha && recaptchaRef.current) {
        try {
          window.grecaptcha.reset();
          setRecaptchaToken('');
        } catch (e) {
          console.error('Erreur reset reCAPTCHA:', e);
        }
      }
    }
  };

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css');
        @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');
        
        .register-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 40px 0;
        }
        
        .register-card {
          border: none;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          overflow: hidden;
        }
        
        .register-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        
        .register-body {
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
          transition: all 0.3s ease;
        }
        
        .form-control:focus, .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
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
        
        .step-indicator {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
          gap: 10px;
        }
        
        .step-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #e2e8f0;
          transition: all 0.3s;
        }
        
        .step-dot.active {
          background: #667eea;
          width: 30px;
          border-radius: 6px;
        }
        
        .password-toggle-btn {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #718096;
          cursor: pointer;
        }
        
        .invalid-feedback {
          display: block;
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .geo-status {
          font-size: 0.8rem;
          margin-top: 5px;
        }

        .geo-success {
          color: #28a745;
        }

        .geo-error {
          color: #dc3545;
        }
      `}</style>

      <div className="register-wrapper">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-11 col-md-9 col-lg-7 col-xl-6">
              <div className="register-card">
                <div className="register-header">
                  <i className="bi bi-person-plus fs-1 mb-3"></i>
                  <h1 className="h2 fw-bold mb-2">Créer un compte</h1>
                  <p className="mb-0 opacity-90">Rejoignez TN360 dès aujourd'hui</p>
                </div>

                <div className="register-body">
                  {/* Step Indicator */}
                  <div className="step-indicator">
                    {[1, 2, 3].map((step) => (
                      <div 
                        key={step}
                        className={`step-dot ${currentStep === step ? 'active' : ''}`}
                      />
                    ))}
                  </div>

                  <form onSubmit={handleSubmit}>
                    {/* ÉTAPE 1 - Informations de base */}
                    {currentStep === 1 && (
                      <div>
                        <h4 className="text-center mb-4 fw-bold">Informations de base</h4>

                        {/* Nom complet */}
                        <div className="mb-3">
                          <label className="form-label">
                            <i className="bi bi-person me-2"></i>
                            Nom complet <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="nom_et_prenom"
                            className={`form-control ${errors.nom_et_prenom ? 'is-invalid' : ''}`}
                            placeholder="Votre nom complet"
                            value={user.nom_et_prenom}
                            onChange={changeHandler}
                          />
                          {errors.nom_et_prenom && (
                            <div className="invalid-feedback">{errors.nom_et_prenom}</div>
                          )}
                        </div>

                        {/* Email */}
                        <div className="mb-3">
                          <label className="form-label">
                            <i className="bi bi-envelope me-2"></i>
                            Email <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="votre@email.com"
                            value={user.email}
                            onChange={changeHandler}
                          />
                          {errors.email && (
                            <div className="invalid-feedback">{errors.email}</div>
                          )}
                        </div>

                        {/* Téléphone */}
                        <div className="mb-3">
                          <label className="form-label">
                            <i className="bi bi-telephone me-2"></i>
                            Téléphone <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">+216</span>
                            <input
                              type="tel"
                              name="tel"
                              className={`form-control ${errors.tel ? 'is-invalid' : ''}`}
                              placeholder="12345678"
                              maxLength="8"
                              value={user.tel}
                              onChange={changeHandler}
                            />
                          </div>
                          {errors.tel && (
                            <div className="invalid-feedback">{errors.tel}</div>
                          )}
                        </div>

                        {/* Mot de passe */}
                        <div className="mb-3 position-relative">
                          <label className="form-label">
                            <i className="bi bi-lock me-2"></i>
                            Mot de passe <span className="text-danger">*</span>
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            placeholder="••••••••"
                            value={user.password}
                            onChange={changeHandler}
                          />
                          <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                          {errors.password && (
                            <div className="invalid-feedback">{errors.password}</div>
                          )}
                        </div>

                        {/* Confirmation mot de passe */}
                        <div className="mb-3 position-relative">
                          <label className="form-label">
                            <i className="bi bi-lock-fill me-2"></i>
                            Confirmer le mot de passe <span className="text-danger">*</span>
                          </label>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={onConfirmPasswordChange}
                          />
                          <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                          {errors.confirmPassword && (
                            <div className="invalid-feedback">{errors.confirmPassword}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ÉTAPE 2 - Informations personnelles */}
                    {currentStep === 2 && (
                      <div>
                        <h4 className="text-center mb-4 fw-bold">Informations personnelles</h4>

                        {/* Civilité */}
                        <div className="mb-3">
                          <label className="form-label">
                            Civilité <span className="text-danger">*</span>
                          </label>
                          <select
                            name="civilite"
                            className={`form-select ${errors.civilite ? 'is-invalid' : ''}`}
                            value={user.civilite}
                            onChange={changeHandler}
                          >
                            <option value="">Sélectionner</option>
                            <option value="Monsieur">Monsieur</option>
                            <option value="Madame">Madame</option>
                            <option value="Mademoiselle">Mademoiselle</option>
                          </select>
                          {errors.civilite && (
                            <div className="invalid-feedback">{errors.civilite}</div>
                          )}
                        </div>

                        {/* Date de naissance */}
                        <div className="mb-3">
                          <label className="form-label">
                            Date de naissance <span className="text-danger">*</span>
                          </label>
                          <input
                            type="date"
                            name="date_de_naissance"
                            className={`form-control ${errors.date_de_naissance ? 'is-invalid' : ''}`}
                            value={user.date_de_naissance}
                            onChange={changeHandler}
                          />
                          {errors.date_de_naissance && (
                            <div className="invalid-feedback">{errors.date_de_naissance}</div>
                          )}
                        </div>

                        {/* Situation familiale */}
                        <div className="mb-3">
                          <label className="form-label">
                            Situation familiale <span className="text-danger">*</span>
                          </label>
                          <select
                            name="situation_familiale"
                            className={`form-select ${errors.situation_familiale ? 'is-invalid' : ''}`}
                            value={user.situation_familiale}
                            onChange={changeHandler}
                          >
                            <option value="">Sélectionner</option>
                            <option value="Célibataire">Célibataire</option>
                            <option value="Marié(e)">Marié(e)</option>
                            <option value="Divorcé(e)">Divorcé(e)</option>
                            <option value="Veuf(ve)">Veuf(ve)</option>
                          </select>
                          {errors.situation_familiale && (
                            <div className="invalid-feedback">{errors.situation_familiale}</div>
                          )}
                        </div>

                        {/* Profession */}
                        <div className="mb-3">
                          <label className="form-label">Profession</label>
                          <input
                            type="text"
                            name="profession"
                            className="form-control"
                            placeholder="Votre profession"
                            value={user.profession}
                            onChange={changeHandler}
                          />
                        </div>

                        {/* ✅ GOUVERNORAT */}
                        <div className="mb-3">
                          <label className="form-label">
                            <i className="bi bi-geo-alt me-2"></i>
                            Gouvernorat <span className="text-danger">*</span>
                          </label>
                          <select
                            name="gouvernorat"
                            className={`form-select ${errors.gouvernorat ? 'is-invalid' : ''}`}
                            value={user.gouvernorat}
                            onChange={changeHandler}
                          >
                            <option value="">Sélectionner un gouvernorat</option>
                            {GOUVERNORATS.map((gov) => (
                              <option key={gov} value={gov}>
                                {gov}
                              </option>
                            ))}
                          </select>
                          {errors.gouvernorat && (
                            <div className="invalid-feedback">{errors.gouvernorat}</div>
                          )}
                        </div>

                        {/* ✅ VILLE */}
                        <div className="mb-3">
                          <label className="form-label">
                            <i className="bi bi-building me-2"></i>
                            Ville <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="ville"
                            className={`form-control ${errors.ville ? 'is-invalid' : ''}`}
                            placeholder="Votre ville"
                            value={user.ville}
                            onChange={changeHandler}
                          />
                          {errors.ville && (
                            <div className="invalid-feedback">{errors.ville}</div>
                          )}
                        </div>

                        {/* ✅ ADRESSE */}
                        <div className="mb-3">
                          <label className="form-label">
                            <i className="bi bi-house me-2"></i>
                            Adresse <span className="text-danger">*</span>
                          </label>
                          <textarea
                            name="address"
                            className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                            placeholder="Votre adresse complète"
                            rows="2"
                            value={user.address}
                            onChange={changeHandler}
                          ></textarea>
                          {errors.address && (
                            <div className="invalid-feedback">{errors.address}</div>
                          )}
                        </div>

                        {/* Code postal */}
                        <div className="mb-3">
                          <label className="form-label">
                            <i className="bi bi-mailbox me-2"></i>
                            Code postal
                          </label>
                          <input
                            type="text"
                            name="code_postal"
                            className="form-control"
                            placeholder="Code postal"
                            value={user.code_postal}
                            onChange={changeHandler}
                          />
                        </div>

                        {/* ENFANTS */}
                        {user.situation_familiale === 'Marié(e)' && (
                          <div className="mt-4">
                            <h5 className="fw-bold mb-3">
                              <i className="bi bi-people me-2"></i>
                              Informations sur les enfants
                            </h5>
                            
                            {[1, 2, 3, 4].map((index) => (
                              <div key={index} className="mb-3">
                                <div className="row g-2">
                                  <div className="col-md-6">
                                    <label className="form-label">
                                      Prénom enfant {index}
                                    </label>
                                    <input
                                      type="text"
                                      name={`nom_enfant_${index}`}
                                      className="form-control"
                                      placeholder={`Prénom de l'enfant ${index}`}
                                      value={user[`nom_enfant_${index}`]}
                                      onChange={changeHandler}
                                    />
                                  </div>
                                  <div className="col-md-6">
                                    <label className="form-label">
                                      Date de naissance enfant {index}
                                    </label>
                                    <input
                                      type="date"
                                      name={`date_de_naissance${index}`}
                                      className="form-control"
                                      value={user[`date_de_naissance${index}`]}
                                      onChange={changeHandler}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ÉTAPE 3 - Confirmation */}
                    {currentStep === 3 && (
                      <div>
                        <h4 className="text-center mb-4 fw-bold">Confirmation</h4>

                        {/* Conditions générales */}
                        <div className="mb-4">
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

                        {/* ✅ GÉOLOCALISATION - LOGIQUE DE L'ANCIEN CODE */}
                        <div className="mb-4">
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
                            </label>
                          </div>
                          {geoStatus && (
                            <div className={`geo-status ${geoStatus.includes('Position') ? 'geo-success' : 'geo-error'}`}>
                              <i className={`bi ${geoStatus.includes('Position') ? 'bi-check-circle' : 'bi-exclamation-circle'} me-1`}></i>
                              {geoStatus}
                            </div>
                          )}
                        </div>

                        {/* reCAPTCHA */}
                        {RECAPTCHA_SITE_KEY && (
                          <div className="mb-4">
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

                    {/* Navigation */}
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
                      
                      {currentStep < 3 ? (
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

              {/* Lien connexion */}
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

        {/* Modal Conditions */}
        {isModalOpen && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Conditions Générales</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>En créant un compte sur TN360, vous acceptez nos conditions d'utilisation...</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCloseModal}
                  >
                    J'ai compris
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