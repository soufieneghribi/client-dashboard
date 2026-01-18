import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, updateUserProfile } from "../../store/slices/user";
import { getLoyaltyCard } from "../../store/slices/loyaltyCardSlice";
import { authService } from "../../services/api";
import {
    FaUser, FaEnvelope, FaPhone, FaCalendar, FaBriefcase, FaUsers,
    FaMapMarkerAlt, FaCity, FaGlobe, FaPen, FaLock, FaCreditCard,
    FaChevronRight, FaGift, FaTicketAlt, FaStar, FaWallet, FaFileAlt, FaPlus, FaSave
} from "react-icons/fa";
import { Spinner } from "react-bootstrap";
import { toast } from 'react-hot-toast';
import PasswordForm from "./components/PasswordForm";
import "./Profile.css";

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { Userprofile, loading } = useSelector((state) => state.user);
    const { loyaltyCard } = useSelector((state) => state.loyaltyCard);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    // Password Change State
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Fetch data on mount
    useEffect(() => {
        dispatch(fetchUserProfile());
        dispatch(getLoyaltyCard());
    }, [dispatch]);

    // Update local form state when Userprofile changes
    useEffect(() => {
        if (Userprofile) {
            // Function to ensure date is in YYYY-MM-DD format for input[type="date"]
            const formatDateForInput = (dateString) => {
                if (!dateString) return "";
                // If it contains "T" (ISO) or " " (SQL timestamp), take the first part
                return dateString.split('T')[0].split(' ')[0];
            };

            setFormData({
                civilite: Userprofile.civilite || "Madame",
                nom_et_prenom: Userprofile.nom_et_prenom || "",
                email: Userprofile.email || "",
                tel: Userprofile.tel || "",
                date_de_naissance: formatDateForInput(Userprofile.date_de_naissance),
                profession: Userprofile.profession || "",
                situation_familiale: Userprofile.situation_familiale || "",
                // Check both potential keys for address
                address: Userprofile.address || Userprofile.adresse || "",
                ville: Userprofile.ville || "",
                gouvernorat: Userprofile.gouvernorat || "",
                code_postal: Userprofile.code_postal || "",
            });
        }
    }, [Userprofile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        try {
            const resultAction = await dispatch(updateUserProfile(formData));
            if (updateUserProfile.fulfilled.match(resultAction)) {
                toast.success("Profil mis à jour avec succès !");
                setIsEditing(false);
            } else {
                toast.error("Erreur lors de la mise à jour : " + (resultAction.payload || "Inconnue"));
            }
        } catch (error) {
            toast.error("Une erreur est survenue.");
        }
    };

    // Password Handlers
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordLoading(true);

        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            toast.error("Les nouveaux mots de passe ne correspondent pas");
            setPasswordLoading(false);
            return;
        }

        try {
            const response = await authService.changePassword(passwordData);
            // Si pas d'erreur, on considère que c'est bon (axios lance une exception pour les codes erreurs)
            toast.success(response.data.message || "Mot de passe modifié avec succès");
            setShowPasswordForm(false);
            setPasswordData({
                current_password: "",
                new_password: "",
                new_password_confirmation: "",
            });
        } catch (error) {
            console.error("Password change error:", error);
            const message = error.response?.data?.message || "Erreur lors du changement de mot de passe";
            toast.error(message);
        } finally {
            setPasswordLoading(false);
        }
    };

    const cancelPasswordChange = () => {
        setShowPasswordForm(false);
        setPasswordData({
            current_password: "",
            new_password: "",
            new_password_confirmation: "",
        });
    };

    const getInitials = (name) => {
        if (!name) return "ME";
        const parts = name.split(" ");
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    if (loading && !Userprofile) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div className="profile-page-wrapper">
            {/* Header Banner */}
            <div className="profile-header-banner">
                <div className="profile-user-info">
                    <div className="avatar-circle">
                        {getInitials(Userprofile?.nom_et_prenom)}
                    </div>
                    <div className="user-text">
                        <h1>{Userprofile?.nom_et_prenom || "Utilisateur"}</h1>
                        <p>{Userprofile?.email}</p>
                    </div>
                </div>
                <div className="header-actions">
                    {!isEditing && !showPasswordForm && (
                        <button className="btn-modify" onClick={() => setIsEditing(true)}>
                            <FaPen size={12} /> Modifier
                        </button>
                    )}
                    {!showPasswordForm && (
                        <button className="btn-password" onClick={() => {
                            setShowPasswordForm(true);
                            setIsEditing(false); // Close edit mode if open
                        }}>
                            <FaLock size={12} /> Mot de passe
                        </button>
                    )}
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Left Column: Form / Info */}
                <div className="left-column">
                    <div className="dashboard-card">
                        {showPasswordForm ? (
                            <PasswordForm
                                passwordData={passwordData}
                                handlePasswordChange={handlePasswordChange}
                                handlePasswordSubmit={handlePasswordSubmit}
                                cancelPasswordChange={cancelPasswordChange}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                                loading={passwordLoading}
                            />
                        ) : (
                            <>
                                <div className="card-heading">
                                    <FaUser /> {isEditing ? "Modifier mon profil" : "Informations personnelles"}
                                </div>

                                <div className="info-display-grid">
                                    {/* Field: Civilité */}
                                    <div className="info-field">
                                        <label><FaUser /> Civilité</label>
                                        {isEditing ? (
                                            <select name="civilite" value={formData.civilite} onChange={handleInputChange}>
                                                <option value="Monsieur">Monsieur</option>
                                                <option value="Madame">Madame</option>
                                            </select>
                                        ) : (
                                            <div className="value">{Userprofile?.civilite || "Non renseigné"}</div>
                                        )}
                                    </div>

                                    {/* Field: Nom */}
                                    <div className="info-field">
                                        <label><FaUser /> Nom complet</label>
                                        {isEditing ? (
                                            <input type="text" name="nom_et_prenom" value={formData.nom_et_prenom} onChange={handleInputChange} />
                                        ) : (
                                            <div className="value">{Userprofile?.nom_et_prenom}</div>
                                        )}
                                    </div>

                                    {/* Field: Email */}
                                    <div className="info-field">
                                        <label><FaEnvelope /> Email</label>
                                        {isEditing ? (
                                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled />
                                        ) : (
                                            <div className="value">{Userprofile?.email}</div>
                                        )}
                                    </div>

                                    {/* Field: Tel */}
                                    <div className="info-field">
                                        <label><FaPhone /> Téléphone</label>
                                        {isEditing ? (
                                            <input type="text" name="tel" value={formData.tel} onChange={handleInputChange} />
                                        ) : (
                                            <div className="value">{Userprofile?.tel}</div>
                                        )}
                                    </div>

                                    {/* Field: Date Naissance */}
                                    <div className="info-field">
                                        <label><FaCalendar /> Date de naissance</label>
                                        {isEditing ? (
                                            <input type="date" name="date_de_naissance" value={formData.date_de_naissance} onChange={handleInputChange} />
                                        ) : (
                                            <div className="value">{Userprofile?.date_de_naissance}</div>
                                        )}
                                    </div>

                                    {/* Field: Profession */}
                                    <div className="info-field">
                                        <label><FaBriefcase /> Profession</label>
                                        {isEditing ? (
                                            <input type="text" name="profession" value={formData.profession} onChange={handleInputChange} />
                                        ) : (
                                            <div className="value">{Userprofile?.profession}</div>
                                        )}
                                    </div>

                                    {/* Field: Situation */}
                                    <div className="info-field">
                                        <label><FaUsers /> Situation familiale</label>
                                        {isEditing ? (
                                            <input type="text" name="situation_familiale" value={formData.situation_familiale} onChange={handleInputChange} />
                                        ) : (
                                            <div className="value">{Userprofile?.situation_familiale}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Address Section (Full Width) */}
                                <div className="info-field mt-4">
                                    <label><FaMapMarkerAlt /> Adresse</label>
                                    {isEditing ? (
                                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Votre adresse complète" />
                                    ) : (
                                        <div className="value">{Userprofile?.address || "Non renseigné"}</div>
                                    )}
                                </div>

                                <div className="info-display-grid mt-3">
                                    <div className="info-field">
                                        <label><FaCity /> Ville</label>
                                        {isEditing ? (
                                            <input type="text" name="ville" value={formData.ville} onChange={handleInputChange} />
                                        ) : (
                                            <div className="value">{Userprofile?.ville}</div>
                                        )}
                                    </div>
                                    <div className="info-field">
                                        <label><FaGlobe /> Gouvernorat</label>
                                        {isEditing ? (
                                            <input type="text" name="gouvernorat" value={formData.gouvernorat} onChange={handleInputChange} />
                                        ) : (
                                            <div className="value">{Userprofile?.gouvernorat}</div>
                                        )}
                                    </div>
                                    <div className="info-field">
                                        <label><FaMapMarkerAlt /> Code postal</label>
                                        {isEditing ? (
                                            <input type="text" name="code_postal" value={formData.code_postal} onChange={handleInputChange} />
                                        ) : (
                                            <div className="value">{Userprofile?.code_postal}</div>
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="edit-actions">
                                        <button className="btn-cancel" onClick={() => setIsEditing(false)}>Annuler</button>
                                        <button className="btn-save" onClick={handleSaveProfile}>
                                            <FaSave /> Enregistrer
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Reclamations Section */}
                    {!showPasswordForm && (
                        <div className="dashboard-card">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="card-heading mb-0">
                                    <FaFileAlt /> Mes Réclamations
                                    <span className="text-sm text-gray-500 font-normal ml-2 block">Suivez vos demandes</span>
                                </div>
                                <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md flex items-center gap-2" onClick={() => navigate('/reclamations/new')}>
                                    <FaPlus size={10} /> Nouvelle
                                </button>
                            </div>

                            <div className="reclamations-empty">
                                <div className="empty-icon">📋</div>
                                <p>Aucune réclamation</p>
                                <small>Créez votre première réclamation</small>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Widgets */}
                <div className="right-column">
                    <div className="loyalty-card-widget">
                        <h5>Carte Fidélité</h5>
                        <p className="text-sm text-gray-500 mb-3">Générez votre carte pour commencer à gagner des points</p>
                        <button className="loyalty-btn" onClick={() => navigate('/loyalty-card')}>
                            <FaCreditCard />
                            <div>
                                <div className="text-xs font-normal opacity-80 text-left">Afficher ma carte</div>
                                <div className="text-sm text-left">Carte de fidélité</div>
                            </div>
                        </button>
                    </div>

                    <div className="dashboard-card pt-4 pb-4">
                        <h5 className="mb-4 font-bold text-gray-800">Mes avantages</h5>
                        <div className="advantages-stack">
                            <div className="advantage-card orange" onClick={() => navigate('/mes-cadeaux')}>
                                <div className="d-flex gap-3 align-items-center">
                                    <div className="adv-icon"><FaGift /></div>
                                    <div className="adv-content">
                                        <h4>Mes Cadeaux</h4>
                                        <p>Voir tous les cadeaux gagnés</p>
                                    </div>
                                </div>
                                <FaChevronRight />
                            </div>

                            <div className="advantage-card blue" onClick={() => navigate('/mes-code-promo')}>
                                <div className="d-flex gap-3 align-items-center">
                                    <div className="adv-icon"><FaTicketAlt /></div>
                                    <div className="adv-content">
                                        <h4>Codes Promo</h4>
                                        <p>Mes codes promotionnels gratuits</p>
                                    </div>
                                </div>
                                <FaChevronRight />
                            </div>

                            <div className="advantage-card green" onClick={() => navigate('/mes-reservations')}>
                                <div className="d-flex gap-3 align-items-center">
                                    <div className="adv-icon"><FaStar /></div>
                                    <div className="adv-content">
                                        <h4>Gratuités</h4>
                                        <p>Les offres 100% gratuites</p>
                                    </div>
                                </div>
                                <FaChevronRight />
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card wallet-widget">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="font-bold text-gray-800 m-0">Portefeuille</h5>
                            <FaWallet className="text-indigo-500" />
                        </div>

                        <div className="text-center mt-4">
                            <span className="text-xs uppercase font-bold text-gray-400">Solde de cagnotte</span>
                            <div className="wallet-amount">{Userprofile?.cagnotte_balance || "0.00"} DT</div>
                            <div className="wallet-sub">Utilisable sur vos prochains achats</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
