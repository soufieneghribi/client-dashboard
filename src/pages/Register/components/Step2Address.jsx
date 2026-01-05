import React from 'react';

const Step2Address = ({
    user,
    errors,
    changeHandler,
    gouvernorats,
    villesByGouvernorat,
    handleNextStep,
    handlePreviousStep
}) => {
    return (
        <div>
            <div className="section-header">
                <div className="section-icon-wrapper">
                    <i className="bi bi-geo-alt"></i>
                </div>
                <h2 className="section-title">Adresse</h2>
                <p className="section-subtitle">Où vous trouvez-vous ?</p>
            </div>

            {/* Gouvernorat */}
            <div className="mb-3">
                <label className="form-label">
                    <i className="bi bi-map me-2"></i>
                    Gouvernorat <span className="text-danger">*</span>
                </label>
                <select
                    name="gouvernorat"
                    className={`form-select ${errors.gouvernorat ? 'is-invalid' : ''}`}
                    value={user.gouvernorat}
                    onChange={changeHandler}
                >
                    <option value="">Sélectionnez votre gouvernorat</option>
                    {gouvernorats.map((gov) => (
                        <option key={gov} value={gov}>
                            {gov}
                        </option>
                    ))}
                </select>
                {errors.gouvernorat && (
                    <div className="invalid-feedback">{errors.gouvernorat}</div>
                )}
            </div>

            {/* Ville */}
            <div className="mb-3">
                <label className="form-label">
                    <i className="bi bi-building me-2"></i>
                    Ville <span className="text-danger">*</span>
                </label>
                {user.gouvernorat ? (
                    <select
                        name="ville"
                        className={`form-select ${errors.ville ? 'is-invalid' : ''}`}
                        value={user.ville}
                        onChange={changeHandler}
                    >
                        <option value="">Sélectionnez votre ville</option>
                        {(villesByGouvernorat[user.gouvernorat] || []).map((ville) => (
                            <option key={ville} value={ville}>
                                {ville}
                            </option>
                        ))}
                    </select>
                ) : (
                    <div className="form-control ville-disabled">
                        <i className="bi bi-info-circle me-2"></i>
                        Sélectionnez d'abord un gouvernorat
                    </div>
                )}
                {errors.ville && (
                    <div className="invalid-feedback">{errors.ville}</div>
                )}
            </div>

            {/* Address */}
            <div className="mb-3">
                <label className="form-label">
                    <i className="bi bi-house me-2"></i>
                    Adresse
                </label>
                <textarea
                    name="address"
                    className="form-control"
                    placeholder="Votre adresse complète"
                    rows="2"
                    value={user.address}
                    onChange={changeHandler}
                ></textarea>
            </div>

            {/* Postal Code */}
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
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={handleNextStep}
                    >
                        Continuer <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step2Address;
