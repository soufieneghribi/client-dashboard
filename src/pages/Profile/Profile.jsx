import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, updateUserProfile, changePassword, updateUserLocal } from "../../store/slices/user";
import { getLoyaltyCard } from "../../store/slices/loyaltyCardSlice";

import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import "./Profile.css";

// Sub-components
import ProfileHeader from "./components/ProfileHeader";
import LoyaltyCardSection from "./components/LoyaltyCardSection";
import ProfileInfoView from "./components/ProfileInfoView";
import ProfileForm from "./components/ProfileForm";
import PasswordForm from "./components/PasswordForm";
import AdvantagesSection from "./components/AdvantagesSection";
import WalletSection from "./components/WalletSection";
import ClaimsSection from "./components/ClaimsSection";

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { Userprofile, loading } = useSelector((state) => state.user);
    const { loyaltyCard } = useSelector((state) => state.loyaltyCard);

    const [formData, setFormData] = useState({
        nom_et_prenom: "",
        email: "",
        tel: "",
        date_de_naissance: "",
        profession: "",
        situation_familiale: "",
        address: "",
        civilite: "",
        ville: "",
        gouvernorat: "",
        code_postal: "",
    });

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

    useEffect(() => {
        dispatch(fetchUserProfile());
        dispatch(getLoyaltyCard());
    }, [dispatch]);

    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        try {
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "";
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        } catch {
            return "";
        }
    };

    const normalizeSituationFamiliale = (situation) => {
        if (!situation) return "";
        const normalized = situation.toLowerCase().trim();
        const mappings = {
            celibataire: "célibataire",
            "célibataire": "célibataire",
            marie: "marié(e)",
            "marié": "marié(e)",
            mariee: "marié(e)",
            "mariée": "marié(e)",
            "marié(e)": "marié(e)",
            divorce: "divorcé(e)",
            "divorcé": "divorcé(e)",
            divorcee: "divorcé(e)",
            "divorcée": "divorcé(e)",
            "divorcé(e)": "divorcé(e)",
            veuf: "veuf(ve)",
            veuve: "veuf(ve)",
            "veuf(ve)": "veuf(ve)",
        };
        return mappings[normalized] || situation;
    };

    useEffect(() => {
        if (Userprofile) {
            setFormData({
                nom_et_prenom: Userprofile.nom_et_prenom || "",
                email: Userprofile.email || "",
                tel: Userprofile.tel || "",
                date_de_naissance: formatDateForInput(Userprofile.date_de_naissance),
                profession: Userprofile.profession || "",
                situation_familiale: normalizeSituationFamiliale(Userprofile.situation_familiale),
                address: Userprofile.address || "",
                civilite: Userprofile.civilite || "",
                ville: Userprofile.ville || "",
                gouvernorat: Userprofile.gouvernorat || "",
                code_postal: Userprofile.code_postal || "",
            });
        }
    }, [Userprofile]);

    const formatLoyaltyCode = (code) => {
        if (!code) return "";
        const formatted = code.replace(/(\d{3})(\d{9})(\d{2})/, "$1-$2-$3");
        return formatted.substring(0, 17) + "...";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            dispatch(updateUserLocal(formData));
            await dispatch(updateUserProfile(formData)).unwrap();
            setIsEditing(false);
            // 
        } catch (error) {

            dispatch(fetchUserProfile());
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!passwordData.current_password) {
            // 
            return;
        }
        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            // 
            return;
        }
        if (passwordData.new_password.length < 6) {
            // 
            return;
        }
        try {
            await dispatch(
                changePassword({
                    currentPassword: passwordData.current_password,
                    newPassword: passwordData.new_password,
                })
            ).unwrap();
            setIsChangingPassword(false);
            setPasswordData({ current_password: "", new_password: "", new_password_confirmation: "" });
        } catch (error) {

        }
    };

    const cancelEdit = () => {
        if (Userprofile) {
            setFormData({
                nom_et_prenom: Userprofile.nom_et_prenom || "",
                email: Userprofile.email || "",
                tel: Userprofile.tel || "",
                date_de_naissance: formatDateForInput(Userprofile.date_de_naissance),
                profession: Userprofile.profession || "",
                situation_familiale: normalizeSituationFamiliale(Userprofile.situation_familiale),
                address: Userprofile.address || "",
                civilite: Userprofile.civilite || "",
                ville: Userprofile.ville || "",
                gouvernorat: Userprofile.gouvernorat || "",
                code_postal: Userprofile.code_postal || "",
            });
        }
        setIsEditing(false);
    };

    const cancelPasswordChange = () => {
        setPasswordData({ current_password: "", new_password: "", new_password_confirmation: "" });
        setIsChangingPassword(false);
    };

    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (loading && !Userprofile) {
        return (
            <div className="profile-loading-container">
                <div style={{ textAlign: "center" }}>
                    <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} className="mb-3" />
                    <p style={{ color: "#495057", fontSize: "1.1rem", fontWeight: "500" }}>Chargement du profil...</p>
                </div>
            </div>
        );
    }

    const hasLoyaltyCard = loyaltyCard && loyaltyCard.loyalty_code;
    const cagnotteBalance = Userprofile?.cagnotte_balance || loyaltyCard?.cagnotte_balance || 0;

    return (
        <div className="profile-container">
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} lg={11} xl={10}>
                        <ProfileHeader
                            formData={formData}
                            isEditing={isEditing}
                            isChangingPassword={isChangingPassword}
                            setIsEditing={setIsEditing}
                            setIsChangingPassword={setIsChangingPassword}
                            getInitials={getInitials}
                        />

                        <Row className="g-3 g-md-4">
                            <Col xs={12} lg={8} className="mb-3 mb-lg-0">
                                <Card className="profile-main-card">
                                    <Card.Body className="profile-main-card-body p-3 p-md-4">
                                        {isChangingPassword ? (
                                            <PasswordForm
                                                passwordData={passwordData}
                                                handlePasswordChange={handlePasswordChange}
                                                handlePasswordSubmit={handlePasswordSubmit}
                                                cancelPasswordChange={cancelPasswordChange}
                                                showPassword={showPassword}
                                                setShowPassword={setShowPassword}
                                                loading={loading}
                                            />
                                        ) : isEditing ? (
                                            <ProfileForm
                                                formData={formData}
                                                handleChange={handleChange}
                                                handleSubmit={handleSubmit}
                                                cancelEdit={cancelEdit}
                                                loading={loading}
                                            />
                                        ) : (
                                            <ProfileInfoView formData={formData} />
                                        )}
                                    </Card.Body>
                                </Card>

                                <div className="mt-4">
                                    <ClaimsSection />
                                </div>
                            </Col>

                            <Col xs={12} lg={4}>
                                <LoyaltyCardSection
                                    loyaltyCard={loyaltyCard}
                                    Userprofile={Userprofile}
                                    formatLoyaltyCode={formatLoyaltyCode}
                                    cagnotteBalance={cagnotteBalance}
                                    hasLoyaltyCard={hasLoyaltyCard}
                                />

                                <AdvantagesSection hasLoyaltyCard={hasLoyaltyCard} />

                                <WalletSection cagnotteBalance={cagnotteBalance} />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Profile;


