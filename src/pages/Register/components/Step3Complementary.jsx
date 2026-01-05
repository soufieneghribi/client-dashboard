import React from 'react';

const Step3Complementary = ({
    user,
    errors,
    changeHandler,
    professions,
    nombreEnfants,
    setNombreEnfants,
    handleNextStep,
    handlePreviousStep
}) => {
    return (
        <div>
            <div className="section-header">
                <div className="section-icon-wrapper">
                    <i className="bi bi-briefcase"></i>
                </div>
                <h2 className="section-title">Compléments</h2>
                <p className="section-subtitle">Dites-nous en plus sur vous</p>
            </div>

            {/* Profession */}
            <div className="mb-3">
                <label className="form-label">
                    <i className="bi bi-briefcase me-2"></i>
                    Profession <span className="text-danger">*</span>
                </label>
                <select
                    name="profession"
                    className={`form-select ${errors.profession ? 'is-invalid' : ''}`}
                    value={user.profession}
                    onChange={changeHandler}
                >
                    <option value="">Sélectionnez votre profession</option>
                    {professions.map((prof) => (
                        <option key={prof} value={prof}>
                            {prof}
                        </option>
                    ))}
                </select>
                {errors.profession && (
                    <div className="invalid-feedback">{errors.profession}</div>
                )}
            </div>

            {/* Situation Familiale */}
            <div className="mb-3">
                <label className="form-label">
                    <i className="bi bi-people me-2"></i>
                    Situation familiale <span className="text-danger">*</span>
                </label>
                <select
                    name="situation_familiale"
                    className={`form-select ${errors.situation_familiale ? 'is-invalid' : ''}`}
                    value={user.situation_familiale}
                    onChange={(e) => {
                        changeHandler(e);
                        // Reset children count when changing marital status
                        if (e.target.value !== 'Marié(e)') {
                            setNombreEnfants(0);
                        }
                    }}
                >
                    <option value="">Sélectionnez votre situation</option>
                    <option value="Célibataire">Célibataire</option>
                    <option value="Marié(e)">Marié(e)</option>
                    <option value="Divorcé(e)">Divorcé(e)</option>
                    <option value="Veuf(ve)">Veuf(ve)</option>
                </select>
                {errors.situation_familiale && (
                    <div className="invalid-feedback">{errors.situation_familiale}</div>
                )}
            </div>

            {/* Children Section - Only show if married */}
            {user.situation_familiale === 'Marié(e)' && (
                <div className="mt-4">
                    <div className="mb-4">
                        <label className="form-label d-flex align-items-center">
                            <i className="bi bi-person-plus me-2"></i>
                            Nombre d'enfants
                        </label>
                        <div className="d-flex gap-2">
                            {[0, 1, 2, 3, 4].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    className={`btn flex-grow-1 py-2 rounded-3 ${nombreEnfants === n ? 'btn-primary shadow-sm' : 'btn-outline-secondary'}`}
                                    onClick={() => setNombreEnfants(n)}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {nombreEnfants > 0 && (
                        <div className="child-details-section">
                            <h4 className="h6 fw-bold mb-3 d-flex align-items-center">
                                <i className="bi bi-stars me-2 text-primary"></i>
                                Détails des enfants
                            </h4>
                            {[...Array(nombreEnfants)].map((_, i) => (
                                <div key={i} className="child-card border rounded-4 p-3 mb-3 bg-white">
                                    <div className="child-header mb-3">
                                        <div className="child-badge">{i + 1}</div>
                                        <span className="fw-bold">Enfant {i + 1}</span>
                                    </div>
                                    <div className="row g-2">
                                        <div className="col-12 col-md-6 mb-2 mb-md-0">
                                            <input
                                                type="text"
                                                className={`form-control rounded-3 ${errors[`nom_enfant_${i + 1}`] ? 'is-invalid' : ''}`}
                                                placeholder="Nom et Prénom"
                                                name={`nom_enfant_${i + 1}`}
                                                value={user[`nom_enfant_${i + 1}`] || ''}
                                                onChange={changeHandler}
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <input
                                                type="date"
                                                className={`form-control rounded-3 ${errors[`date_de_naissance${i + 1}`] ? 'is-invalid' : ''}`}
                                                name={`date_de_naissance${i + 1}`}
                                                value={user[`date_de_naissance${i + 1}`] || ''}
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

export default Step3Complementary;
