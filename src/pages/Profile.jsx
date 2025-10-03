import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, updateUserProfile, changePassword } from "../store/slices/user";
import jackpotImage from "../assets/jackpotImage.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { Userprofile, loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    nom_et_prenom: "",
    email: "",
    tel: "",
    date_de_naissance: "",
    profession: "",
    situation_familiale: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    new_password: "",
    new_password_confirmation: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (Userprofile) {
      setFormData({
        nom_et_prenom: Userprofile.nom_et_prenom || "",
        email: Userprofile.email || "",
        tel: Userprofile.tel || "",
        date_de_naissance: Userprofile.date_de_naissance || "",
        profession: Userprofile.profession || "",
        situation_familiale: Userprofile.situation_familiale || "",
        address: Userprofile.address || "",
      });
    }
  }, [Userprofile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Remove empty fields and image field (don't update image through this form)
    const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value !== "" && value !== null && key !== "image") {
        acc[key] = value;
      }
      return acc;
    }, {});

    console.log("Sending profile data:", cleanedData);
    
    dispatch(updateUserProfile(cleanedData))
      .unwrap()
      .then(() => {
        setIsEditing(false);
        toast.success("Profil mis à jour avec succès");
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        toast.error(error || "Erreur lors de la mise à jour du profil");
      });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }

    dispatch(changePassword(passwordData))
      .unwrap()
      .then(() => {
        setIsChangingPassword(false);
        setPasswordData({
          new_password: "",
          new_password_confirmation: ""
        });
        toast.success("Mot de passe modifié avec succès");
      })
      .catch((error) => {
        console.error("Error changing password:", error);
        toast.error(error || "Erreur lors du changement de mot de passe");
      });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (Userprofile) {
      setFormData({
        nom_et_prenom: Userprofile.nom_et_prenom || "",
        email: Userprofile.email || "",
        tel: Userprofile.tel || "",
        date_de_naissance: Userprofile.date_de_naissance || "",
        profession: Userprofile.profession || "",
        situation_familiale: Userprofile.situation_familiale || "",
        address: Userprofile.address || "",
      });
    }
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      new_password: "",
      new_password_confirmation: ""
    });
  };

  if (loading && !Userprofile) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-360 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-6">
      <div className="bg-white shadow-xl rounded-3xl p-8 w-full md:w-2/3 lg:w-1/2 border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">Mon Profil</h2>
          <div className="flex space-x-4">
            {!isEditing && !isChangingPassword && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-360 to-orange-360 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-md transform hover:scale-105"
                >
                  Mettre à jour le profil
                </button>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-md transform hover:scale-105"
                >
                  Changer le mot de passe
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div>
          {/* Profile Header Section */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
            {/* User Info */}
            <div className="flex flex-col items-center text-center gap-4">
              <img
                src={
                  Userprofile?.image
                    ? `https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${Userprofile.image}`
                    : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZXNuwvzjUvZEQzX5xm0TJllYkRjXwOUlirQ&s"
                }
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover shadow-xl"
                onError={(e) =>
                  (e.target.src =
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZXNuwvzjUvZEQzX5xm0TJllYkRjXwOUlirQ&s")
                }
              />
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {Userprofile?.nom_et_prenom || "Utilisateur"}
                </p>
                <p className="text-gray-600 text-lg">{Userprofile?.email || ""}</p>
              </div>
            </div>

            {/* Cards Section */}
            <div className="grid grid-cols-3 gap-2 md:w-3/4">
              <div className="flex flex-col items-center">
                <div
                  className="border rounded-3xl shadow-xl bg-blue-360 bg-contain md:bg-cover bg-no-repeat w-full h-32 flex items-end justify-center transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                  style={{ backgroundImage: `url(${jackpotImage})` }}
                >
                  <p className="text-white text-lg font-bold mb-2">
                    {Userprofile?.cagnotte_balance || 0}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <img
                  className="border rounded-3xl shadow-xl bg-contain md:bg-cover bg-no-repeat w-full h-32 transition-all duration-300 ease-in-out transform hover:scale-105 bg-orange-360 cursor-pointer"
                  src="./src/assets/levelup.png"
                  alt="Level Up"
                />
              </div>
              <div className="flex flex-col items-center">
                <img
                  className="border rounded-3xl shadow-xl bg-contain md:bg-cover bg-no-repeat w-full h-32 transition-all duration-300 ease-in-out transform hover:scale-105 bg-blue-360 cursor-pointer"
                  src="./src/assets/superdeals.png"
                  alt="Super Deals"
                  onClick={() => navigate("/MesDeals")}
                />
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div>
            <p className="text-blue-360 text-lg font-bold mb-6">
              Informations personnelles
            </p>

            {/* Change Password Form */}
            {isChangingPassword ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* New Password */}
                  <div className="flex flex-col">
                    <label htmlFor="new_password" className="text-gray-700 font-medium mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        id="new_password"
                        name="new_password"
                        type={showPassword.new ? "text" : "password"}
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                        required
                        minLength="6"
                        placeholder="Entrez votre nouveau mot de passe"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.new ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="new_password_confirmation"
                      className="text-gray-700 font-medium mb-2"
                    >
                      Confirmer le nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        id="new_password_confirmation"
                        name="new_password_confirmation"
                        type={showPassword.confirm ? "text" : "password"}
                        value={passwordData.new_password_confirmation}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                        required
                        minLength="6"
                        placeholder="Confirmez votre nouveau mot de passe"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.confirm ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={cancelPasswordChange}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-xl transition duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-360 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "En cours..." : "Changer le mot de passe"}
                  </button>
                </div>
              </form>
            ) : isEditing ? (
              /* Edit Profile Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label htmlFor="nom_et_prenom" className="text-gray-700 font-medium mb-2">
                      Nom et Prénom
                    </label>
                    <input
                      id="nom_et_prenom"
                      name="nom_et_prenom"
                      value={formData.nom_et_prenom}
                      onChange={handleChange}
                      className="px-4 py-3 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="email" className="text-gray-700 font-medium mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      className="px-4 py-3 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="tel" className="text-gray-700 font-medium mb-2">
                      Téléphone
                    </label>
                    <input
                      id="tel"
                      name="tel"
                      value={formData.tel}
                      onChange={handleChange}
                      className="px-4 py-3 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                      placeholder="+216 XX XXX XXX"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="date_de_naissance" className="text-gray-700 font-medium mb-2">
                      Date de naissance
                    </label>
                    <input
                      id="date_de_naissance"
                      name="date_de_naissance"
                      value={formData.date_de_naissance}
                      onChange={handleChange}
                      type="date"
                      className="px-4 py-3 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                    />
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <label htmlFor="address" className="text-gray-700 font-medium mb-2">
                      Adresse
                    </label>
                    <input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="px-4 py-3 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                      placeholder="Votre adresse complète"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-xl transition duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-360 to-orange-360 text-white font-bold px-6 py-3 rounded-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "En cours..." : "Sauvegarder"}
                  </button>
                </div>
              </form>
            ) : (
              /* Display Profile Information */
              <div className="space-y-4">
                <div className="flex border-b pb-3">
                  <span className="font-medium text-gray-700 w-48">Nom et Prénom:</span>
                  <span className="text-gray-900">{formData.nom_et_prenom || "Non renseigné"}</span>
                </div>
                <div className="flex border-b pb-3">
                  <span className="font-medium text-gray-700 w-48">Email:</span>
                  <span className="text-gray-900">{formData.email || "Non renseigné"}</span>
                </div>
                <div className="flex border-b pb-3">
                  <span className="font-medium text-gray-700 w-48">Téléphone:</span>
                  <span className="text-gray-900">{formData.tel || "Non renseigné"}</span>
                </div>
                <div className="flex border-b pb-3">
                  <span className="font-medium text-gray-700 w-48">Adresse:</span>
                  <span className="text-gray-900">{formData.address || "Non renseigné"}</span>
                </div>
                <div className="flex border-b pb-3">
                  <span className="font-medium text-gray-700 w-48">Date de naissance:</span>
                  <span className="text-gray-900">
                    {formData.date_de_naissance || "Non renseigné"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;