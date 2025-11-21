import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../services/api';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Support email depuis state OU URL
  const urlParams = new URLSearchParams(window.location.search);
  const emailFromUrl = urlParams.get('email');
  const emailFromState = location.state?.email;
  const email = emailFromState || emailFromUrl || '';
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Redirection si pas d'email
  useEffect(() => {
    if (!email) {
      toast.error('Adresse email manquante');
      setTimeout(() => navigate('/inscrire'), 2000);
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.every(char => /\d/.test(char))) {
      const newCode = [...code];
      pastedData.forEach((char, index) => {
        if (index < 6) newCode[index] = char;
      });
      setCode(newCode);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  // Vérification du code
  const handleVerify = async (e) => {
    e.preventDefault();
    
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      toast.error('Veuillez entrer le code complet');
      return;
    }

    setIsLoading(true);
    
    const payload = {
      email: String(email).trim(),
      otp: String(verificationCode).trim()
    };

    try {
      const response = await axios.post(
        API_ENDPOINTS.AUTH.VERIFY_EMAIL, 
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.message || response.data.is_email_verified) {
        toast.success('Email vérifié avec succès! Redirection...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (error) {
      console.error('Erreur de vérification:', error.response?.data);
      
      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        if (errors) {
          const firstError = Object.values(errors)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          toast.error(error.response?.data?.message || 'Erreur de validation');
        }
      } else if (error.response?.status === 400) {
        toast.error('Code invalide ou expiré');
      } else if (error.response?.status === 404) {
        toast.error('Utilisateur non trouvé');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erreur lors de la vérification');
      }
      
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Renvoyer le code
  const handleResendCode = async () => {
    if (!canResend) return;

    setIsResending(true);

    try {
      const response = await axios.post(
        API_ENDPOINTS.AUTH.RESEND_OTP,
        { email: email },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.success || response.data.message) {
        toast.success('Un nouveau code a été envoyé à votre email');
        setTimer(600);
        setCanResend(false);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erreur lors de l\'envoi du code');
      }
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              {/* Icône */}
              <div className="text-center mb-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3">
                  <svg width="48" height="48" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                    <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/>
                  </svg>
                </div>
              </div>

              {/* Titre */}
              <h2 className="text-center mb-2 fw-bold">Vérification Email</h2>
              <p className="text-center text-muted mb-4">
                Nous avons envoyé un code à 6 chiffres à<br />
                <strong className="text-dark">{email}</strong>
              </p>

              {/* Formulaire */}
              <form onSubmit={handleVerify}>
                <div className="mb-4">
                  <label className="form-label text-center w-100 mb-3">
                    Entrez le code de vérification
                  </label>
                  <div className="d-flex justify-content-center gap-2">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        className="form-control text-center fs-4 fw-bold"
                        style={{
                          width: '50px',
                          height: '60px',
                          fontSize: '24px'
                        }}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </div>

                {/* Timer */}
                {timer > 0 && (
                  <div className="text-center mb-3">
                    <small className="text-muted">
                      Code valable pendant : <span className="fw-bold text-primary">{formatTime(timer)}</span>
                    </small>
                  </div>
                )}

                {/* Bouton Vérifier */}
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3"
                  disabled={isLoading || code.join('').length !== 6}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Vérification...
                    </>
                  ) : (
                    'Vérifier le code'
                  )}
                </button>

                {/* Renvoyer le code */}
                <div className="text-center">
                  <p className="text-muted mb-2">Vous n'avez pas reçu le code ?</p>
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none"
                    onClick={handleResendCode}
                    disabled={!canResend || isResending}
                  >
                    {isResending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Envoi...
                      </>
                    ) : (
                      canResend ? 'Renvoyer le code' : `Renvoyer disponible dans ${formatTime(timer)}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;