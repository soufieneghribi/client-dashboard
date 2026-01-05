import React from "react";
import { Form, InputGroup, Button, Spinner } from "react-bootstrap";
import { FiLock, FiEyeOff, FiEye, FiX, FiSave } from "react-icons/fi";

const PasswordForm = ({
    passwordData,
    handlePasswordChange,
    handlePasswordSubmit,
    cancelPasswordChange,
    showPassword,
    setShowPassword,
    loading
}) => {
    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h5 className="section-title">
                    <FiLock size={28} />
                    Changer le mot de passe
                </h5>
            </div>

            <Form onSubmit={handlePasswordSubmit}>
                {/* Ancien mot de passe */}
                <Form.Group className="profile-form-group">
                    <Form.Label className="profile-form-label">
                        <FiLock size={18} />
                        Mot de passe actuel
                    </Form.Label>
                    <InputGroup>
                        <Form.Control
                            type={showPassword.current ? "text" : "password"}
                            name="current_password"
                            value={passwordData.current_password}
                            onChange={handlePasswordChange}
                            placeholder="Entrez votre mot de passe actuel"
                            className="profile-form-control"
                            required
                        />
                        <Button
                            variant="outline-secondary"
                            onClick={() =>
                                setShowPassword((prev) => ({ ...prev, current: !prev.current }))
                            }
                            style={{
                                borderRadius: "0 12px 12px 0",
                                border: "1.5px solid #e0e0e0",
                                borderLeft: "none",
                            }}
                        >
                            {showPassword.current ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </Button>
                    </InputGroup>
                </Form.Group>

                {/* Nouveau mot de passe */}
                <Form.Group className="profile-form-group">
                    <Form.Label className="profile-form-label">
                        <FiLock size={18} />
                        Nouveau mot de passe
                    </Form.Label>
                    <InputGroup>
                        <Form.Control
                            type={showPassword.new ? "text" : "password"}
                            name="new_password"
                            value={passwordData.new_password}
                            onChange={handlePasswordChange}
                            placeholder="Entrez votre nouveau mot de passe"
                            className="profile-form-control"
                            required
                        />
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowPassword((prev) => ({ ...prev, new: !prev.new }))}
                            style={{
                                borderRadius: "0 12px 12px 0",
                                border: "1.5px solid #e0e0e0",
                                borderLeft: "none",
                            }}
                        >
                            {showPassword.new ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </Button>
                    </InputGroup>
                </Form.Group>

                {/* Confirmation */}
                <Form.Group className="profile-form-group">
                    <Form.Label className="profile-form-label">
                        <FiLock size={18} />
                        Confirmer le nouveau mot de passe
                    </Form.Label>
                    <InputGroup>
                        <Form.Control
                            type={showPassword.confirm ? "text" : "password"}
                            name="new_password_confirmation"
                            value={passwordData.new_password_confirmation}
                            onChange={handlePasswordChange}
                            placeholder="Confirmez votre nouveau mot de passe"
                            className="profile-form-control"
                            required
                        />
                        <Button
                            variant="outline-secondary"
                            onClick={() =>
                                setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))
                            }
                            style={{
                                borderRadius: "0 12px 12px 0",
                                border: "1.5px solid #e0e0e0",
                                borderLeft: "none",
                            }}
                        >
                            {showPassword.confirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </Button>
                    </InputGroup>
                </Form.Group>

                <div className="d-flex gap-2 justify-content-end mt-4">
                    <Button
                        type="button"
                        onClick={cancelPasswordChange}
                        variant="outline-secondary"
                        className="profile-button"
                        style={{
                            background: "white",
                            color: "#6c757d",
                            border: "1.5px solid #e0e0e0",
                        }}
                    >
                        <FiX size={20} />
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        className="profile-button primary-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" />
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <FiSave size={20} />
                                Enregistrer
                            </>
                        )}
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default PasswordForm;
