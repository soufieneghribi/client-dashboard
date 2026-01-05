import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import { FiMail, FiEdit2, FiLock } from "react-icons/fi";

const ProfileHeader = ({ formData, isEditing, isChangingPassword, setIsEditing, setIsChangingPassword, getInitials }) => {
    return (
        <Card className="profile-header-card">
            <Card.Body className="profile-header-card-body">
                <Row className="align-items-center">
                    <Col xs={12} md={8}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="profile-avatar">{getInitials(formData.nom_et_prenom)}</div>
                            <div>
                                <h3 style={{ marginBottom: "0.5rem", fontWeight: "bold", fontSize: "1.75rem" }}>
                                    {formData.nom_et_prenom || "Utilisateur"}
                                </h3>
                                <p
                                    style={{
                                        marginBottom: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        opacity: 0.95,
                                        fontSize: "1rem",
                                    }}
                                >
                                    <FiMail size={16} />
                                    {formData.email}
                                </p>
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} md={4} className="mt-3 mt-md-0">
                        <div className="d-flex flex-column flex-md-row gap-2 justify-content-md-end">
                            {!isEditing && !isChangingPassword && (
                                <>
                                    <Button size="sm" onClick={() => setIsEditing(true)} className="header-primary-button">
                                        <FiEdit2 size={18} />
                                        <span className="ms-2 d-none d-sm-inline">Modifier</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => setIsChangingPassword(true)}
                                        className="header-outline-button"
                                    >
                                        <FiLock size={18} />
                                        <span className="ms-2 d-none d-sm-inline">Mot de passe</span>
                                    </Button>
                                </>
                            )}
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default ProfileHeader;
