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
