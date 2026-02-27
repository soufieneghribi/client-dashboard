import React from 'react';

const Step1PersonalInfo = ({
    user,
    errors,
    enseignes,
    selectedEnseigne,
    setSelectedEnseigne,
    changeHandler,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    confirmPassword,
    onConfirmPasswordChange,
    handleNextStep
}) => {
    return (
        <div>
            <div className="section-header">
                <div className="section-icon-wrapper">
                    <i className="bi bi-person"></i>
                </div>
                <div>
                    <h2 className="section-title">Informations personnelles</h2>
                    <p className="section-subtitle">Commençons par vos informations de base</p>
                </div>
            </div>

            {/* Tenant Selector */}
            {enseignes && enseignes.length > 0 && (
                <div className="mb-4">
                    <label className="form-label fw-bold small text-uppercase tracking-wider text-muted">
                        <i className="bi bi-shop me-2"></i>
                        Choisir une enseigne (Optionnel)
                    </label>
                    <div className="enseigne-selector">
                        {enseignes.map((enseigne) => (
                            <div
                                key={enseigne.id}
                                className={`enseigne-card ${selectedEnseigne?.id === enseigne.id ? 'active' : ''}`}
                                onClick={() => setSelectedEnseigne(selectedEnseigne?.id === enseigne.id ? null : enseigne)}
                            >
                                <img src={enseigne.logo || '/image/logo_0.png'} alt={enseigne.nom} className="enseigne-logo" />
                                <div className="enseigne-name">{enseigne.nom}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Name */}
            <div className="mb-3">
                <label className="form-label">
                    <i className="bi bi-person me-2"></i>
                    Nom et Prénom <span className="text-danger">*</span>
                </label>
                <input
                    type="text"
                    name="nom_et_prenom"
                    className={`form-control ${errors.nom_et_prenom ? 'is-invalid' : ''}`}
                    placeholder="Entrez votre nom complet"
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
                    placeholder="exemple@email.com"
                    value={user.email}
                    onChange={changeHandler}
                />
                {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                )}
            </div>

            {/* Phone */}
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

            {/* Password */}
            <div className="mb-3 position-relative">
                <label className="form-label">
                    <i className="bi bi-lock me-2"></i>
                    Mot de passe <span className="text-danger">*</span>
                </label>
                <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Minimum 6 caractères"
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

            {/* Confirm Password */}
            <div className="mb-3 position-relative">
                <label className="form-label">
                    <i className="bi bi-lock-fill me-2"></i>
                    Confirmer le mot de passe <span className="text-danger">*</span>
                </label>
                <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Retapez votre mot de passe"
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

            {/* Civilité */}
            <div className="mb-3">
                <label className="form-label">
                    <i className="bi bi-person-badge me-2"></i>
                    Civilité <span className="text-danger">*</span>
                </label>
                <select
                    name="civilite"
                    className={`form-select ${errors.civilite ? 'is-invalid' : ''}`}
                    value={user.civilite}
                    onChange={changeHandler}
                >
                    <option value="">Sélectionner</option>
                    <option value="M.">M.</option>
                    <option value="Mme">Mme</option>
                    <option value="Mlle">Mlle</option>
                </select>
                {errors.civilite && (
                    <div className="invalid-feedback">{errors.civilite}</div>
                )}
            </div>

            {/* Date of Birth */}
            <div className="mb-3">
                <label className="form-label">
                    <i className="bi bi-calendar me-2"></i>
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

            <div className="d-grid mt-4">
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNextStep}
                >
                    Continuer <i className="bi bi-arrow-right ms-2"></i>
                </button>
            </div>
        </div>
    );
};

export default Step1PersonalInfo;
