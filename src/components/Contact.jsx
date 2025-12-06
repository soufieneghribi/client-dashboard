import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    sujet: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Configuration EmailJS directement dans le code
  const EMAILJS_CONFIG = {
    SERVICE_ID: "service_60v3alr",
    TEMPLATE_ID: "template_48zl4cb",
    PUBLIC_KEY: "0YmLQD1WzpZY2u4nj"
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "telephone") {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length <= 8) setFormData({ ...formData, [name]: cleaned });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = "Email invalide";
    if (formData.telephone && !/^\d{8}$/.test(formData.telephone)) newErrors.telephone = "Le numéro doit contenir 8 chiffres";
    if (!formData.sujet.trim()) newErrors.sujet = "Le sujet est requis";
    if (!formData.message.trim()) newErrors.message = "Le message est requis";
    else if (formData.message.trim().length < 10) newErrors.message = "Le message doit contenir au moins 10 caractères";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setSuccess(false);
    try {
      // Mapper les champs du formulaire aux variables du template EmailJS
      const templateParams = {
        from_name: formData.nom,
        from_email: formData.email,
        telephone: formData.telephone || 'Non renseigné',
        sujet: formData.sujet,
        message: formData.message
      };
      
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      setSuccess(true);
      setFormData({ nom: "", email: "", telephone: "", sujet: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi du message, veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
        }
        
        .contact-page {
          min-height: 100vh;
          padding: 60px 0;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
        }
        
        .contact-header {
          text-align: center;
          margin-bottom: 50px;
        }
        
        .contact-header h1 {
          font-size: 2.8rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 15px;
        }
        
        .contact-header p {
          font-size: 1.15rem;
          color: #7f8c8d;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .info-card {
          background: white;
          border-radius: 15px;
          padding: 25px;
          margin-bottom: 20px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          border: none;
        }
        
        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.12);
        }
        
        .info-card-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 15px;
        }
        
        .icon-blue { background: #e3f2fd; color: #2196f3; }
        .icon-green { background: #e8f5e9; color: #4caf50; }
        .icon-orange { background: #fff3e0; color: #ff9800; }
        .icon-purple { background: #f3e5f5; color: #9c27b0; }
        
        .info-card h5 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
        }
        
        .info-card p {
          color: #7f8c8d;
          margin-bottom: 0;
          font-size: 0.95rem;
        }
        
        .form-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          border: none;
        }
        
        .form-label {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
          font-size: 0.95rem;
        }
        
        .form-control, .form-select {
          border: 2px solid #e9ecef;
          border-radius: 10px;
          padding: 12px 15px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }
        
        .form-control:focus, .form-select:focus {
          border-color: #2196f3;
          box-shadow: 0 0 0 0.2rem rgba(33, 150, 243, 0.15);
        }
        
        .input-group-text {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-right: none;
          border-radius: 10px 0 0 10px;
          font-weight: 600;
          color: #495057;
        }
        
        .input-group .form-control {
          border-left: none;
          border-radius: 0 10px 10px 0;
        }
        
        .btn-submit {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          padding: 14px 30px;
          font-size: 1.05rem;
          font-weight: 600;
          color: white;
          transition: all 0.3s ease;
          width: 100%;
        }
        
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .alert-success-custom {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          border: none;
          border-radius: 12px;
          padding: 16px 20px;
          color: #155724;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .alert-success-custom i {
          font-size: 1.3rem;
        }
        
        .invalid-feedback {
          display: block;
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 5px;
        }
        
        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
          border-width: 0.15em;
        }
        
        @media (max-width: 768px) {
          .contact-header h1 {
            font-size: 2rem;
          }
          
          .form-card {
            padding: 25px;
          }
          
          .contact-page {
            padding: 30px 0;
          }
        }
      `}</style>

      <div className="contact-page">
        <div className="container">
          {/* Header */}
          <div className="contact-header">
            <h1><i className="fas fa-envelope me-3"></i>Contactez-nous</h1>
            <p>Notre équipe est à votre écoute. N'hésitez pas à nous contacter pour toute question ou demande d'information.</p>
          </div>

          <div className="row g-4">
            {/* Informations de contact */}
            <div className="col-lg-4">
              <div className="info-card">
                <div className="info-card-icon icon-blue">
                  <i className="fas fa-phone"></i>
                </div>
                <h5>Téléphone</h5>
                <p>22 578 815</p>
              </div>

              <div className="info-card">
                <div className="info-card-icon icon-green">
                  <i className="fas fa-envelope"></i>
                </div>
                <h5>Email</h5>
                <p>contact.tn360@gmail.com</p>
              </div>

              <div className="info-card">
                <div className="info-card-icon icon-orange">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <h5>Adresse</h5>
                <p>Rue du lac leman, MakCrown<br/>Tunis 1053</p>
              </div>

              <div className="info-card">
                <div className="info-card-icon icon-purple">
                  <i className="fas fa-clock"></i>
                </div>
                <h5>Horaires d'ouverture</h5>
                <p>Lundi - Vendredi: 9h - 18h<br/>Samedi: 9h - 13h</p>
              </div>
            </div>

            {/* Formulaire de contact */}
            <div className="col-lg-8">
              <div className="form-card">
                {success && (
                  <div className="alert-success-custom">
                    <i className="fas fa-check-circle"></i>
                    <span><strong>Succès !</strong> Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* Nom */}
                    <div className="col-md-6">
                      <label className="form-label">Nom complet <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="nom"
                        className={`form-control ${errors.nom ? 'is-invalid' : ''}`}
                        value={formData.nom}
                        onChange={handleChange}
                        placeholder="Votre nom complet"
                      />
                      {errors.nom && <div className="invalid-feedback">{errors.nom}</div>}
                    </div>

                    {/* Email */}
                    <div className="col-md-6">
                      <label className="form-label">Email <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        name="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>

                    {/* Téléphone */}
                    <div className="col-md-6">
                      <label className="form-label">Téléphone</label>
                      <div className="input-group">
                        <span className="input-group-text">+216</span>
                        <input
                          type="text"
                          name="telephone"
                          className={`form-control ${errors.telephone ? 'is-invalid' : ''}`}
                          value={formData.telephone}
                          onChange={handleChange}
                          placeholder="12345678"
                          maxLength="8"
                        />
                      </div>
                      {errors.telephone && <div className="invalid-feedback">{errors.telephone}</div>}
                    </div>

                    {/* Sujet */}
                    <div className="col-md-6">
                      <label className="form-label">Sujet <span className="text-danger">*</span></label>
                      <select
                        name="sujet"
                        className={`form-select ${errors.sujet ? 'is-invalid' : ''}`}
                        value={formData.sujet}
                        onChange={handleChange}
                      >
                        <option value="">Sélectionnez un sujet</option>
                        <option value="information">Demande d'information</option>
                        <option value="support">Support technique</option>
                        <option value="partenariat">Partenariat</option>
                        <option value="reclamation">Réclamation</option>
                        <option value="autre">Autre</option>
                      </select>
                      {errors.sujet && <div className="invalid-feedback">{errors.sujet}</div>}
                    </div>

                    {/* Message */}
                    <div className="col-12">
                      <label className="form-label">Message <span className="text-danger">*</span></label>
                      <textarea
                        name="message"
                        className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                        value={formData.message}
                        onChange={handleChange}
                        rows="5"
                        placeholder="Décrivez votre demande en détail..."
                      ></textarea>
                      {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                    </div>

                    {/* Bouton submit */}
                    <div className="col-12">
                      <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i>
                            Envoyer le message
                          </>
                        )}
                      </button>
                    </div>
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

export default Contact;