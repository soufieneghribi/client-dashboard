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
    phoneCode: '+216' // Default phone code
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isAgreed, setIsAgreed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [geoConsent, setGeoConsent] = useState(false);
  const [geoStatus, setGeoStatus] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isRecaptchaLoaded, setIsRecaptchaLoaded] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const recaptchaRef = useRef(null);
  const googleButtonRef = useRef(null);

  // Utiliser les variables d'environnement
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Vérification des variables d'environnement
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      console.error('VITE_RECAPTCHA_SITE_KEY is not defined in environment variables');
    }
    if (!GOOGLE_CLIENT_ID) {
      console.error('VITE_GOOGLE_CLIENT_ID is not defined in environment variables');
    }
  }, []);

  // Load reCAPTCHA script
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
    
    // Ne charger reCAPTCHA que si la clé est définie
    if (RECAPTCHA_SITE_KEY) {
      loadRecaptcha();
    }
    
    return () => { if (window.onRecaptchaLoad) delete window.onRecaptchaLoad; };
  }, [RECAPTCHA_SITE_KEY]);

  // Render reCAPTCHA when loaded and on step 3
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

  // Google OAuth Integration
  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google && window.google.accounts && GOOGLE_CLIENT_ID) {
        console.log('Google API is loaded');
        
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: false,
          context: 'signup'
        });

        setIsGoogleLoaded(true);
      } else if (GOOGLE_CLIENT_ID) {
        console.log('Google API not yet loaded, retrying...');
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

  // Render Google button when ready and on step 1
  useEffect(() => {
    if (isGoogleLoaded && currentStep === 1 && googleButtonRef.current && window.google && GOOGLE_CLIENT_ID) {
      try {
        if (googleButtonRef.current.innerHTML) {
          googleButtonRef.current.innerHTML = '';
        }
        
        console.log('Rendering Google Sign-In button');
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

  // Handle Google Sign-In for registration
  const handleGoogleSignIn = async (response) => {
    console.log('Google Sign-In response:', response);
    
    if (response.credential) {
      try {
        // Appel direct à l'API Google Register
        await handleGoogleRegister(response.credential);
      } catch (error) {
        console.error('Google Sign-In error:', error);
        toast.error('Erreur lors de l\'inscription avec Google');
      }
    }
  };

  // Nouvelle fonction pour l'inscription Google
  const handleGoogleRegister = async (googleToken) => {
    try {
      const response = await axios.post('http://localhost:8000/api/v1/auth/google-register', {
        token: googleToken
      });

      if (response.data.success) {
        // Sauvegarder le token et les infos utilisateur
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.client));
        
        // Dispatch une action pour mettre à jour l'état Redux
        dispatch({ 
          type: 'auth/loginSuccess', 
          payload: { 
            user: response.data.client,
            token: response.data.token
          } 
        });
        
        toast.success('Inscription avec Google réussie!');
        navigate('/'); // Redirection vers la page d'accueil
      }
    } catch (error) {
      // Gérer les erreurs spécifiques
      if (error.response?.status === 409) {
        // Email déjà existant
        toast.error('Cet email est déjà utilisé. Veuillez vous connecter.');
        navigate('/login');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erreur lors de l\'inscription avec Google');
      }
    }
  };

  // Generate random password for Google signup
  const generateRandomPassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  // Handlers
  const changeHandler = (e) => {
    const { name, value } = e.target;
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
    
    // Ne valider reCAPTCHA que si la clé est définie
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
    
    // Combine phone code and phone number for submission
    const fullPhoneNumber = `${user.phoneCode}${user.tel}`;
    const payload = { 
      ...user, 
      tel: fullPhoneNumber,
      ...(RECAPTCHA_SITE_KEY && recaptchaToken && { recaptcha_token: recaptchaToken })
    };
    
    try {
      // Dispatch signUp action
      await dispatch(signUp({ user: payload, navigate })).unwrap();
      
      // Reset form and redirect on success
      setCurrentStep(1);
      setUser({ ...INITIAL_STATE.USER, phoneCode: '+216' });
      setConfirmPassword('');
      setRecaptchaToken('');
      setIsAgreed(false);
      
      // Navigation will be handled by the signUp thunk
    } catch (error) {
      // Error handling is done in the thunk
      console.error('Registration error:', error);
    }
  };
  
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const handleShowModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Render password strength
  const renderPasswordStrength = () => {
    const { score, label } = FormUtils.getPasswordStrength(user.password);
    const widthClass = FORM_CONFIG.PASSWORD_STRENGTH.WIDTHS[score];
    const colorClass = FORM_CONFIG.PASSWORD_STRENGTH.COLORS[score];
    return (
      <div className="mt-2">
        <div className="h-1.5 w-full bg-gray-200 rounded">
          <div className={`h-1.5 ${widthClass} ${colorClass} rounded transition-all`}></div>
        </div>
        <p className="text-xs text-gray-600 mt-1">Sécurité: <span className="font-medium">{label}</span></p>
        <p className="text-[11px] text-gray-500">8+ caractères, 1 majuscule, 1 chiffre, 1 symbole.</p>
      </div>
    );
  };

  // Reusable inputs
  const renderInputField = (fieldName, label, type="text", placeholder, validationFn, showCheck=true) => {
    const isValid = validationFn ? validationFn(user[fieldName]) : user[fieldName]?.trim();
    return (
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <div className="relative">
          <input
            type={type}
            name={fieldName}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
            placeholder={placeholder}
            value={user[fieldName]}
            onChange={changeHandler}
          />
          {showCheck && isValid && !errors[fieldName] && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">✓</span>
          )}
        </div>
        {errors[fieldName] && <p className="text-red-600 text-xs mt-1">{errors[fieldName]}</p>}
      </div>
    );
  };

  // Special phone input with code selector
  const renderPhoneField = () => {
    const isValid = FormUtils.isValidPhone(user.tel);
    return (
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
        <div className="relative flex">
          {/* Phone Code Selector */}
          <select
            name="phoneCode"
            value={user.phoneCode}
            onChange={changeHandler}
            className="px-3 py-3 rounded-l-xl border-2 border-r-0 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition bg-white text-sm min-w-[120px]"
          >
            {FORM_OPTIONS.PHONE_CODES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Phone Number Input */}
          <div className="relative flex-1">
            <input
              type="text"
              name="tel"
              required
              className="w-full px-4 py-3 rounded-r-xl border-2 border-l-0 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              placeholder="XX XXX XXX"
              value={user.tel}
              onChange={changeHandler}
            />
            {isValid && !errors.tel && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">✓</span>
            )}
          </div>
        </div>
        {errors.tel && <p className="text-red-600 text-xs mt-1">{errors.tel}</p>}
      </div>
    );
  };
  
  const renderSelectField = (fieldName, label, options, showValid=true) => (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <select
        name={fieldName}
        required
        value={user[fieldName]}
        onChange={changeHandler}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition bg-white"
      >
        <option value="">Sélectionnez</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {showValid && user[fieldName] && !errors[fieldName] && <p className="text-green-600 text-xs mt-1">Sélection valide</p>}
      {errors[fieldName] && <p className="text-red-600 text-xs mt-1">{errors[fieldName]}</p>}
    </div>
  );

  // Steps UI
  const renderStep1 = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Inscrivez-vous</h1>
      <p className="text-center text-gray-600">Créez votre compte</p>
      
      {/* Google Sign-In Button - Seulement si GOOGLE_CLIENT_ID est défini */}
      {GOOGLE_CLIENT_ID && (
        <>
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              {!isGoogleLoaded && (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Chargement Google...</span>
                </div>
              )}
              <div ref={googleButtonRef} className="flex justify-center"></div>
            </div>
          </div>
          
          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-600">ou</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
        </>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        {renderInputField('nom_et_prenom','Nom et Prénom','text','Votre nom',v=>v?.trim())}
        {renderPhoneField()}
        {renderInputField('email','Email','email','votre@email.com',FormUtils.isValidEmail)}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
          <div className="relative">
            <input
              type={showPassword ? "text":"password"}
              name="password"
              required
              className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              placeholder="••••••••"
              value={user.password}
              onChange={changeHandler}
            />
            <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showPassword?'🙈':'👁️'}</button>
          </div>
          {renderPasswordStrength()}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmer le mot de passe</label>
          <input
            type="password"
            name="confirmPassword"
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
          />
          {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>
        {renderSelectField('civilite','Civilité',FORM_OPTIONS.CIVILITY)}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date de naissance</label>
          <input
            type="date"
            name="dateN"
            required
            value={user.dateN}
            onChange={changeHandler}
            max={FormUtils.getTodayDate()}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
          />
        </div>
      </div>
    </div>
  );
  
  const renderStep2 = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Informations Complémentaires</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {renderSelectField('adresse','Adresse',FORM_OPTIONS.GOVERNORATES,false)}
        {renderSelectField('profession','Profession',FORM_OPTIONS.PROFESSIONS,false)}
        {renderSelectField('situation_familiale','Situation familiale',FORM_OPTIONS.FAMILY_STATUS,false)}
        {user.situation_familiale!=="Célibataire" && user.situation_familiale!=="" && renderSelectField('enfants',"Nombre d'enfants",FORM_OPTIONS.CHILDREN_COUNT,false)}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Confirmation
      </h1>
  
      {/* Champs enfants */}
      {user.situation_familiale !== "Célibataire" &&
        user.enfants &&
        parseInt(user.enfants) > 0 && (
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Nom des enfants</h3>
            <div className="grid gap-3">
              {Array.from({ length: parseInt(user.enfants) }, (_, index) => (
                <div key={index} className="group">
                  <input
                    type="text"
                    name={`nom_enfant_${index + 1}`}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 outline-none bg-white text-sm"
                    placeholder={`Enfant ${index + 1}`}
                    onChange={changeHandler}
                  />
                  {errors[`nom_enfant_${index + 1}`] && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors[`nom_enfant_${index + 1}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
  
      {/* Conditions */}
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <label className="flex space-x-2 items-start">
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={handleCheckboxChange}
            className="mt-1"
          />
          <span>
            J'accepte les{" "}
            <button
              type="button"
              onClick={handleShowModal}
              className="text-blue-600 underline"
            >
              conditions générales
            </button>
          </span>
        </label>
        {errors.terms && <p className="text-red-600 text-xs">{errors.terms}</p>}
      </div>
  
      {/* Géolocalisation */}
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <label className="flex space-x-2 items-start">
          <input
            type="checkbox"
            checked={geoConsent}
            onChange={handleGeoConsent}
            className="mt-1"
          />
          <span>
            Autoriser la géolocalisation{" "}
            {geoConsent && <em className="text-xs">({geoStatus || "en cours..."})</em>}
          </span>
        </label>
      </div>
  
      {/* reCAPTCHA - Seulement si RECAPTCHA_SITE_KEY est défini */}
      {RECAPTCHA_SITE_KEY && (
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
          <div className="text-center mb-3">
            <h3 className="font-semibold text-indigo-700">Vérification de sécurité</h3>
          </div>
          <div className="flex justify-center">
            <div ref={recaptchaRef}></div>
          </div>
          {errors.recaptcha && (
            <p className="text-red-600 text-xs mt-2 text-center">{errors.recaptcha}</p>
          )}
          {recaptchaToken && (
            <p className="text-green-600 text-xs text-center">Vérification réussie ✓</p>
          )}
        </div>
      )}
    </div>
  );

  // Progress
  const renderProgressBar = () => (
    <div className="flex items-center justify-center mb-8">
      {[1,2,3].map(step=>(
        <React.Fragment key={step}>
          <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${currentStep>=step?'bg-gradient-to-r from-blue-500 to-indigo-600 text-white':'bg-gray-200 text-gray-500'}`}>{currentStep>step?'✓':step}</div>
          {step<3 && <div className={`w-16 h-1 ${currentStep>step?'bg-gradient-to-r from-blue-500 to-indigo-600':'bg-gray-200'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  const renderNavigationButtons = () => (
    <div className="flex justify-between pt-8">
      {currentStep>1 && <button type="button" onClick={handlePreviousStep} className="px-6 py-3 bg-gray-100 rounded-xl">← Précédent</button>}
      {currentStep<FORM_CONFIG.STEPS.TOTAL
        ?<button type="button" onClick={handleNextStep} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl">Suivant →</button>
        :<button type="submit" className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl">Créer mon compte</button>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8">
        {renderProgressBar()}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {currentStep===1&&renderStep1()}
          {currentStep===2&&renderStep2()}
          {currentStep===3&&renderStep3()}
          {renderNavigationButtons()}
        </form>
      </div>
      {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {TERMS_CONDITIONS.TITLE}
      </h2>
      
      <div className="text-gray-600 space-y-4 max-h-96 overflow-y-auto">
        <p>{TERMS_CONDITIONS.INTRODUCTION}</p>
        
        {TERMS_CONDITIONS.CONTENT.map((section, index) => (
          <div key={index}>
            <h3 className="font-semibold text-gray-800">{section.title}</h3>
            <p>{section.text}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleCloseModal}
        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
      >
        {TERMS_CONDITIONS.CLOSE_BUTTON_TEXT}
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default Register;