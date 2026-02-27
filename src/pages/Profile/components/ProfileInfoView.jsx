import React from "react";
import { Row, Col } from "react-bootstrap";
import { FiUser, FiMail, FiPhone, FiCalendar, FiBriefcase, FiHeart, FiHome, FiMapPin, FiGlobe } from "react-icons/fi";

const ProfileInfoView = ({ formData }) => {
    const infoItems = [
        { label: "Civilité", value: formData.civilite, icon: <FiUser size={16} />, md: 6 },
        { label: "Nom complet", value: formData.nom_et_prenom, icon: <FiUser size={16} />, md: 6 },
        { label: "Email", value: formData.email, icon: <FiMail size={16} />, md: 6 },
        { label: "Téléphone", value: formData.tel, icon: <FiPhone size={16} />, md: 6 },
        { label: "Date de naissance", value: formData.date_de_naissance, icon: <FiCalendar size={16} />, md: 6 },
        { label: "Profession", value: formData.profession, icon: <FiBriefcase size={16} />, md: 6 },
        { label: "Situation familiale", value: formData.situation_familiale, icon: <FiHeart size={16} />, md: 6 },
        { label: "Adresse", value: formData.address, icon: <FiHome size={16} />, md: 12 },
        { label: "Ville", value: formData.ville, icon: <FiMapPin size={16} />, md: 4 },
        { label: "Gouvernorat", value: formData.gouvernorat, icon: <FiGlobe size={16} />, md: 4 },
        { label: "Code postal", value: formData.code_postal, icon: <FiMapPin size={16} />, md: 4 },
    ];

    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h5 className="section-title">
                    <FiUser size={28} />
                    Informations personnelles
                </h5>
            </div>

            <Row>
                {infoItems.map((item, index) => (
                    <Col key={index} md={item.md} style={{ marginBottom: "1.5rem" }}>
                        <div>
                            <p className="profile-info-label">
                                {item.icon}
                                {item.label}
                            </p>
                            <p className="profile-info-value">
                                {item.value || <span style={{ color: "#adb5bd" }}>Non renseigné</span>}
                            </p>
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default ProfileInfoView;
