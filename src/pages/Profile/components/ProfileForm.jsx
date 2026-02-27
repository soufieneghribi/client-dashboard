import React from "react";
import { Form, Row, Col, Button, Spinner } from "react-bootstrap";
import { FiUser, FiMail, FiPhone, FiCalendar, FiBriefcase, FiHeart, FiHome, FiMapPin, FiGlobe, FiX, FiSave } from "react-icons/fi";

const ProfileForm = ({ formData, handleChange, handleSubmit, cancelEdit, loading }) => {
    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h5 className="section-title">
                    <FiUser size={28} />
                    Modifier mon profil
                </h5>
            </div>

            <Form onSubmit={handleSubmit}>
                <Row>
                    {/* Civilité */}
                    <Col md={4}>
                        <Form.Group className="profile-form-group">
                            <Form.Label className="profile-form-label">
                                <FiUser size={18} />
                                Civilité
                            </Form.Label>
                            <Form.Select
                                name="civilite"
                                value={formData.civilite}
                                onChange={handleChange}
                                className="profile-form-control"
                            >
                                <option value="">Sélectionner</option>
                                <option value="M">Monsieur</option>
                                <option value="Mme">Madame</option>
                                <option value="Mlle">Mademoiselle</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/* Nom */}
                    <Col md={8}>
                        <Form.Group className="profile-form-group">
                            <Form.Label className="profile-form-label">
                                <FiUser size={18} />
                                Nom complet
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="nom_et_prenom"
                                value={formData.nom_et_prenom}
                                onChange={handleChange}
                                placeholder="Votre nom complet"
                                className="profile-form-control"
                                required
                            />
                        </Form.Group>
                    </Col>

                    {/* Email */}
                    <Col md={6}>
                        <Form.Group className="profile-form-group">
                            <Form.Label className="profile-form-label">
                                <FiMail size={18} />
                                Email
                            </Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="votre.email@exemple.com"
                                className="profile-form-control"
                                required
                            />
                        </Form.Group>
                    </Col>

                    {/* Téléphone */}
                    <Col md={6}>
                        <Form.Group className="profile-form-group">
                            <Form.Label className="profile-form-label">
                                <FiPhone size={18} />
                                Téléphone
                            </Form.Label>
                            <Form.Control
                                type="tel"
                                name="tel"
                                value={formData.tel}
                                onChange={handleChange}
                                placeholder="+216 XX XXX XXX"
                                className="profile-form-control"
                            />
                        </Form.Group>
                    </Col>

                    {/* Date de naissance */}
                    <Col md={6}>
                        <Form.Group className="profile-form-group">
                            <Form.Label className="profile-form-label">
                                <FiCalendar size={18} />
                                Date de naissance
                            </Form.Label>
                            <Form.Control
                                type="date"
                                name="date_de_naissance"
                                value={formData.date_de_naissance}
                                onChange={handleChange}
                                className="profile-form-control"
                            />
                        </Form.Group>
                    </Col>

                    {/* Profession */}
                    <Col md={6}>
                        <Form.Group className="profile-form-group">
                            <Form.Label className="profile-form-label">
                                <FiBriefcase size={18} />
                                Profession
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="profession"
                                value={formData.profession}
                                onChange={handleChange}
                                placeholder="Votre profession"
                                className="profile-form-control"
                            />
                        </Form.Group>
                    </Col>

                    {/* Situation familiale */}
                    <Col md={6}>
                        <Form.Group className="profile-form-group">
                            <Form.Label className="profile-form-label">
                                <FiHeart size={18} />
                                Situation familiale
                            </Form.Label>
                            <Form.Select
                                name="situation_familiale"
                                value={formData.situation_familiale}
                                onChange={handleChange}
                                className="profile-form-control"
                            >
                                <option value="">Sélectionner</option>
                                <option value="célibataire">Célibataire</option>
                                <option value="marié(e)">Marié(e)</option>
                                <option value="divorcé(e)">Divorcé(e)</option>
                                <option value="veuf(ve)">Veuf(ve)</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/* Adresse */}
                    <Col md={12}>
                        <Form.Group className="profile-form-group">
                            <Form.Label className="profile-form-label">
                                <FiHome size={18} />
                                Adresse
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Votre adresse complète"
                                className="profile-form-control"
                            />
                        </Form.Group>
                    </Col>

                    {/* Ville */}
                    <Col md={4}>
                        <Form.Group className="profile-form-group">
                            <Form.Label className="profile-form-label">
                                <FiMapPin size={18} />
                                Ville
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="ville"
                                value={formData.ville}
                                onChange={handleChange}
                                placeholder="Ville"
                                className="profile-form-control"
                            />
                        </Form.Group>
                    </Col>

                    {/* Gouvernorat */}
                    <Col md={4}>
                        <Form.Group className="profile-form-group">
                            <Form.Label className="profile-form-label">
                                <FiGlobe size={18} />
                                Gouvernorat
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="gouvernorat"
                                value={formData.gouvernorat}
                                onChange={handleChange}
                                placeholder="Gouvernorat"
                                className="profile-form-control"
                            />
                        </Form.Group>
                    </Col>

                    {/* Code postal */}
                    <Col md={4}>
                        <Form.Group className="profile-form-group">
                            <Form.Label className="profile-form-label">
                                <FiMapPin size={18} />
                                Code postal
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="code_postal"
                                value={formData.code_postal}
                                onChange={handleChange}
                                placeholder="Code postal"
                                className="profile-form-control"
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <div className="d-flex gap-2 justify-content-end mt-4">
                    <Button
                        type="button"
                        onClick={cancelEdit}
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

export default ProfileForm;
