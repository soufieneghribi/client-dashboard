import React from 'react';

const Step4Summary = ({
    user,
    selectedEnseigne,
    nombreEnfants,
    isAgreed,
    handleCheckboxChange,
    errors,
    recaptchaRef,
    handlePreviousStep
}) => {
    return (
        <div>
            <div className="section-header">
                <div className="section-icon-wrapper">
                    <i className="bi bi-check-circle"></i>
                </div>
                <h2 className="section-title">Confirmation</h2>
                <p className="section-subtitle">Vérifiez vos données avant de valider</p>
            </div>

            <div className="summary-card">
                <h4 className="h6 fw-bold mb-3">Résumé du profil</h4>
                <div className="summary-item">
                    <span className="summary-label">Nom</span>
                    <span className="summary-value">{user.nom_et_prenom}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Email</span>
                    <span className="summary-value text-break">{user.email}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Enseigne</span>
                    <span className="summary-value">{selectedEnseigne?.nom || '360TN'}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Ville</span>
                    <span className="summary-value">{user.ville}, {user.gouvernorat}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Situation</span>
                    <span className="summary-value">{user.situation_familiale}</span>
                </div>
                {nombreEnfants > 0 && (
                    <div className="summary-item">
                        <span className="summary-label">Enfants</span>
                        <span className="summary-value">{nombreEnfants}</span>
                    </div>
                )}
            </div>

            {/* Terms and Conditions */}
            <div className="mb-3">
                <div className="form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="terms"
                        checked={isAgreed}
                        onChange={handleCheckboxChange}
                    />
                    <label className="form-check-label" htmlFor="terms">
                        J'accepte les{' '}
                        <a href="#" className="text-decoration-none" onClick={(e) => e.preventDefault()}>
                            conditions d'utilisation
                        </a>{' '}
                        et la{' '}
                        <a href="#" className="text-decoration-none" onClick={(e) => e.preventDefault()}>
                            politique de confidentialité
                        </a>
                    </label>
                </div>
                {errors.terms && (
                    <div className="invalid-feedback d-block">{errors.terms}</div>
                )}
            </div>

            {/* reCAPTCHA */}
            <div className="mb-3">
                <div ref={recaptchaRef}></div>
                {errors.recaptcha && (
                    <div className="invalid-feedback d-block">{errors.recaptcha}</div>
                )}
            </div>

            <div className="row g-2 mt-4">
                <div className="col-6">
                    <button
                        type="button"
                        className="btn btn-secondary w-100"
                        onClick={handlePreviousStep}
                    >
                        <i className="bi bi-arrow-left me-2"></i> Retour
                    </button>
                </div>
                <div className="col-6">
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                    >
                        <i className="bi bi-check-circle me-2"></i> Créer le compte
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step4Summary;
