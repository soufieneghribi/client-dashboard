import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signUp, fetchEnseignes } from '../../store/slices/user';
import COMPANY_LOGO from "../../assets/images/logo_0.png";


// Constants
import { PROFESSIONS } from '../../Constants/professions';
import { GOUVERNORATS, VILLES_BY_GOUVERNORAT } from '../../Constants/locations';

// Sub-components
import Step1PersonalInfo from './components/Step1PersonalInfo';
import Step2Address from './components/Step2Address';
import Step3Complementary from './components/Step3Complementary';
import Step4Summary from './components/Step4Summary';

// Styles
import './Register.css';

const RECAPTCHA_SITE_KEY = "6LeVfM4rAAAAADvLqwTpxxUKnXJtZOJqguydl-KD";

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enseignes } = useSelector((state) => state.user);

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [nombreEnfants, setNombreEnfants] = useState(0);
    const [selectedEnseigne, setSelectedEnseigne] = useState(null);
    const [user, setUser] = useState({
        nom_et_prenom: '',
        email: '',
        tel: '',
        password: '',
        civilite: '',
        situation_familiale: '',
        date_de_naissance: '',
        profession: '',
        ville: '',
        gouvernorat: '',
        address: '',
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const [isRecaptchaLoaded, setIsRecaptchaLoaded] = useState(false);
    const recaptchaRef = useRef(null);

    useEffect(() => {
        dispatch(fetchEnseignes());
    }, [dispatch]);

    // Load reCAPTCHA
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
    }, []);

    // Render reCAPTCHA on step 4
    useEffect(() => {
        if (isRecaptchaLoaded && currentStep === 4 && recaptchaRef.current && window.grecaptcha && RECAPTCHA_SITE_KEY) {
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
                        setErrors((prev) => ({ ...prev, recaptcha: 'reCAPTCHA expiré' }));
                    },
                    'error-callback': () => {
                        setRecaptchaToken('');
                        setErrors((prev) => ({ ...prev, recaptcha: 'Erreur reCAPTCHA' }));
                    }
                });
            } catch (error) {

            }
        }
    }, [isRecaptchaLoaded, currentStep]);

    const changeHandler = (e) => {
        const { name, value } = e.target;

        if (name === 'tel') {
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length <= 8) {
                setUser({ ...user, [name]: cleaned });
            }
            return;
        }

        if (name === 'gouvernorat') {
            setUser({ ...user, gouvernorat: value, ville: '' });
            setErrors((prev) => ({ ...prev, [name]: undefined, ville: undefined }));
            return;
        }

        setUser({ ...user, [name]: value });
        setErrors((prev) => ({ ...prev, [name]: undefined }));
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
            if (!user.civilite) newErrors.civilite = 'Civilité requise';
            if (!user.date_de_naissance) newErrors.date_de_naissance = 'Date de naissance requise';
        }

        if (step === 2) {
            if (!user.gouvernorat) newErrors.gouvernorat = 'Gouvernorat requis';
            if (!user.ville?.trim()) newErrors.ville = 'Ville requise';
        }

        if (step === 3) {
            if (!user.profession) newErrors.profession = 'Profession requise';
            if (!user.situation_familiale) newErrors.situation_familiale = 'Situation familiale requise';

            if (user.situation_familiale === 'Marié(e)' && nombreEnfants > 0) {
                for (let i = 1; i <= nombreEnfants; i++) {
                    if (!user[`nom_enfant_${i}`]?.trim()) {
                        newErrors[`nom_enfant_${i}`] = `Nom de l'enfant ${i} requis`;
                    }
                    if (!user[`date_de_naissance${i}`]) {
                        newErrors[`date_de_naissance${i}`] = `Date de naissance de l'enfant ${i} requise`;
                    }
                }
            }
        }

        if (step === 4) {
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
            // 
        }
    };

    const handlePreviousStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep(4)) {
            // 
            return;
        }

        try {
            const payload = {
                ...user,
                enseigne_id: selectedEnseigne?.id || null,
                recaptcha_token: recaptchaToken
            };

            const result = await dispatch(signUp({ user: payload })).unwrap();

            if (result.email && result.is_email_verified === false) {
                // 
                setTimeout(() => {
                    navigate('/verify-email', {
                        state: { email: user.email }
                    });
                }, 1500);
            } else if (result.token) {
                // 
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            }

        } catch (error) {

            handleApiErrors(error);
        }
    };

    const handleApiErrors = (error) => {
        let errorMessage = 'Erreur lors de l\'inscription';
        const apiErrors = {};

        if (error.response?.data?.errors) {
            const errorsList = error.response.data.errors;
            if (Array.isArray(errorsList)) {
                errorsList.forEach(err => {
                    if (err.code && err.message) {
                        apiErrors[err.code] = err.message;
                        if (errorMessage === 'Erreur lors de l\'inscription') errorMessage = err.message;
                    }
                });
            } else if (typeof errorsList === 'object') {
                Object.keys(errorsList).forEach(key => {
                    const messages = errorsList[key];
                    apiErrors[key] = Array.isArray(messages) ? messages[0] : messages;
                    if (errorMessage === 'Erreur lors de l\'inscription') errorMessage = apiErrors[key];
                });
            }
            setErrors(apiErrors);
        } else if (error.message) {
            errorMessage = error.message;
        }

        // 

        if (window.grecaptcha && recaptchaRef.current) {
            try {
                window.grecaptcha.reset();
                setRecaptchaToken('');
            } catch (e) {

            }
        }
    };

    return (
        <div className="register-wrapper">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-11 col-md-9 col-lg-7 col-xl-6">
                        <div className="register-card">
                            <div className="register-header">
                                <div className="logo-container">
                                    <img src={COMPANY_LOGO} alt="360TN Logo" />
                                </div>
                                <h1 className="h2 fw-bold mb-2">Créer un compte</h1>
                                <p className="text-muted">Rejoignez-nous en quelques étapes simples</p>
                            </div>

                            <div className="register-body">
                                <div className="step-indicator">
                                    {[1, 2, 3, 4].map((step) => (
                                        <div
                                            key={step}
                                            className={`step-bar ${currentStep >= step ? 'active' : ''}`}
                                        />
                                    ))}
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {currentStep === 1 && (
                                        <Step1PersonalInfo
                                            user={user}
                                            errors={errors}
                                            enseignes={enseignes}
                                            selectedEnseigne={selectedEnseigne}
                                            setSelectedEnseigne={setSelectedEnseigne}
                                            changeHandler={changeHandler}
                                            showPassword={showPassword}
                                            setShowPassword={setShowPassword}
                                            showConfirmPassword={showConfirmPassword}
                                            setShowConfirmPassword={setShowConfirmPassword}
                                            confirmPassword={confirmPassword}
                                            onConfirmPasswordChange={(e) => setConfirmPassword(e.target.value)}
                                            handleNextStep={handleNextStep}
                                        />
                                    )}

                                    {currentStep === 2 && (
                                        <Step2Address
                                            user={user}
                                            errors={errors}
                                            changeHandler={changeHandler}
                                            gouvernorats={GOUVERNORATS}
                                            villesByGouvernorat={VILLES_BY_GOUVERNORAT}
                                            handleNextStep={handleNextStep}
                                            handlePreviousStep={handlePreviousStep}
                                        />
                                    )}

                                    {currentStep === 3 && (
                                        <Step3Complementary
                                            user={user}
                                            errors={errors}
                                            changeHandler={changeHandler}
                                            professions={PROFESSIONS}
                                            nombreEnfants={nombreEnfants}
                                            setNombreEnfants={setNombreEnfants}
                                            handleNextStep={handleNextStep}
                                            handlePreviousStep={handlePreviousStep}
                                        />
                                    )}

                                    {currentStep === 4 && (
                                        <Step4Summary
                                            user={user}
                                            selectedEnseigne={selectedEnseigne}
                                            nombreEnfants={nombreEnfants}
                                            isAgreed={isAgreed}
                                            handleCheckboxChange={(e) => setIsAgreed(e.target.checked)}
                                            errors={errors}
                                            recaptchaRef={recaptchaRef}
                                            handlePreviousStep={handlePreviousStep}
                                        />
                                    )}
                                </form>

                                <div className="text-center mt-4">
                                    <p className="text-muted">
                                        Vous avez déjà un compte ?{' '}
                                        <a href="/login" className="text-decoration-none fw-bold">
                                            Se connecter
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;


