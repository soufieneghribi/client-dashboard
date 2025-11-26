import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  const validate = () => {
    if (!email) {
      setError('Email requis');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email invalide');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);

    try {
      const response = await axios.post(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email: email },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      setEmailSent(true);
      toast.success('✅ Email de réinitialisation envoyé avec succès!', {
        duration: 5000,
        icon: '📧',
      });
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('❌ Aucun compte trouvé avec cette adresse email');
        setError('Aucun compte trouvé avec cette adresse email');
      } else if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        if (errors && errors.email) {
          const errorMsg = Array.isArray(errors.email) ? errors.email[0] : errors.email;
          toast.error(errorMsg);
          setError(errorMsg);
        } else {
          toast.error('Erreur de validation');
          setError('Erreur de validation');
        }
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
        setError(error.response.data.message);
      } else {
        toast.error('Erreur lors de l\'envoi de l\'email');
        setError('Erreur lors de l\'envoi de l\'email');
      }
      
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setEmailSent(false);
    setEmail('');
    setError('');
  };

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css');
        @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');
        
        .forgot-password-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          display: flex;
          align-items: center;
          padding: 20px 0;
        }
        
        .forgot-password-card {
          border: none;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          overflow: hidden;
          background: white;
        }
        
        .forgot-password-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        
        .forgot-password-header h1 {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .forgot-password-header p {
          opacity: 0.95;
          margin: 0;
          font-size: 0.95rem;
        }
        
        .forgot-password-body {
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
        
        .btn-outline-primary {
          border: 2px solid #667eea;
          border-radius: 10px;
          padding: 13px 25px;
          font-weight: 600;
          color: #667eea;
          background: white;
          transition: all 0.3s ease;
        }
        
        .btn-outline-primary:hover:not(:disabled) {
          background: #667eea;
          color: white;
          transform: translateY(-1px);
        }
        
        .back-link {
          color: #667eea;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .back-link:hover {
          color: #764ba2;
        }
        
        .invalid-feedback {
          display: block;
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        
        .success-message {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 30px;
          border-radius: 15px;
          text-align: center;
          margin-bottom: 25px;
        }
        
        .success-message i {
          font-size: 3rem;
          margin-bottom: 15px;
          display: block;
        }
        
        .success-message h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .success-message p {
          margin: 0;
          opacity: 0.95;
          font-size: 0.95rem;
        }
        
        .info-box {
          background: #f0f9ff;
          border: 2px solid #bfdbfe;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 25px;
        }
        
        .info-box i {
          color: #3b82f6;
        }
        
        .info-box p {
          margin: 0;
          color: #1e40af;
          font-size: 0.9rem;
        }
        
        @media (max-width: 576px) {
          .forgot-password-header {
            padding: 30px 20px;
          }
          
          .forgot-password-header h1 {
            font-size: 1.5rem;
          }
          
          .forgot-password-body {
            padding: 30px 20px;
          }
          
          .icon-wrapper {
            width: 70px;
            height: 70px;
          }
          
          .icon-wrapper i {
            font-size: 2rem;
          }
        }
      `}</style>

      <div className="forgot-password-wrapper">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-11 col-md-9 col-lg-7 col-xl-5">
              <div className="forgot-password-card">
                <div className="forgot-password-header">
                  <i className="bi bi-key fs-1 mb-3"></i>
                  <h1>Mot de passe oublié</h1>
                  <p>Réinitialisez votre mot de passe en quelques étapes</p>
                </div>

                <div className="forgot-password-body">
                  {emailSent ? (
                    // ✅ Email envoyé avec succès
                    <>
                      <div className="success-message">
                        <i className="bi bi-check-circle"></i>
                        <h3>Email envoyé !</h3>
                        <p>Vérifiez votre boîte mail pour réinitialiser votre mot de passe</p>
                      </div>

                      <div className="info-box">
                        <i className="bi bi-info-circle me-2"></i>
                        <p>
                          <strong>Conseil :</strong> Si vous ne recevez pas l'email dans les prochaines minutes, 
                          vérifiez votre dossier spam ou courrier indésirable.
                        </p>
                      </div>

                      <div className="d-grid gap-2">
                        <button 
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={handleResend}
                        >
                          <i className="bi bi-arrow-clockwise me-2"></i>
                          Renvoyer l'email
                        </button>
                        
                        <Link to="/login" className="btn btn-primary">
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Retour à la connexion
                        </Link>
                      </div>
                    </>
                  ) : (
                    // 📧 Formulaire d'envoi
                    <>
                      <div className="icon-wrapper">
                        <i className="bi bi-envelope-paper"></i>
                      </div>

                      <div className="text-center mb-4">
                        <h3 style={{ color: '#2d3748', fontSize: '1.2rem', fontWeight: '700' }}>
                          Réinitialisez votre mot de passe
                        </h3>
                        <p style={{ color: '#718096', fontSize: '0.9rem', margin: '10px 0 0 0' }}>
                          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe
                        </p>
                      </div>

                      <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                          <label htmlFor="email" className="form-label">
                            <i className="bi bi-envelope me-2"></i>
                            Adresse e-mail
                          </label>
                          <input
                            type="email"
                            className={`form-control ${error ? 'is-invalid' : ''}`}
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            placeholder="votre@email.com"
                            disabled={isLoading}
                            autoFocus
                          />
                          {error && (
                            <div className="invalid-feedback">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              {error}
                            </div>
                          )}
                        </div>

                        <div className="d-grid gap-2 mb-3">
                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Envoi en cours...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-send me-2"></i>
                                Envoyer le lien de réinitialisation
                              </>
                            )}
                          </button>
                        </div>

                        <div className="text-center">
                          <Link to="/login" className="back-link">
                            <i className="bi bi-arrow-left"></i>
                            Retour à la connexion
                          </Link>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;