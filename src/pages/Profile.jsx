import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, updateUserProfile } from "../store/slices/user";

import {useNavigate} from "react-router-dom";


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

  const [isEditing, setIsEditing] = useState(false);

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
        image:Userprofile.image || "",
      });
    }
  }, [Userprofile]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile(formData));
    setIsEditing(false);

    dispatch(fetchUserProfile());

  };

  return (
    <div className="bg-gray-100 w-full">

      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">My Profile</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-360 font-limon-milk px-4 py-2 rounded-full text-xl text-white"
            >
              Mettre à jour le profil
            </button>
          )}

        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (

          <div className="grid">
            {/* Profile Picture */}
            <div className="flex flex-row items-center justify-items-center justify-between gap-2 rounded-2xl p-5 text-black text-center font-limon-milk text-2xl shadow-lg">
              <div className="grid align-middle">
                <img
                  src={
                    formData.image === ""? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZXNuwvzjUvZEQzX5xm0TJllYkRjXwOUlirQ&s": formData.image
                  }
                  alt="Profile"
                  className="mx-5 w-32 h-32 rounded-full object-cover mb-4"
                />
                <div className="text-center">
                  <p>{Userprofile?.nom_et_prenom}</p>
                  <p>{Userprofile?.email}</p>
                </div>
              </div>
              <div className="grid align-middle grid-cols-3" >
             
                  <div className="flex flex-row w-32 h-36 mx-5 gap-4">
                   <img className="border rounded-3xl shadow-xl bg-blue-360" src="./src/assets/jackpotImage.png"/>
                   <span className="relative top-3/4 -left-3/4 text-white font-medium">0.0</span>
                   <img className="border rounded-3xl shadow-xl bg-orange-360" src="./src/assets/levelup.png"/>
                   <span className="relative top-3/4 -left-3/4 text-white font-medium"></span>
                   <img className="border rounded-3xl shadow-xl bg-blue-360" src="./src/assets/superdeals.png"onClick={()=>navigate("/MesDeals")} />
                   <span className="relative top-3/4 -left-3/4 text-white font-medium"></span>

                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="flex flex-col">
              <p className="text-blue-360 text-2xl font-limon-milk font-bold my-10 py-8">
                Informations personnelles
              </p>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nom et prénom :
                      </label>
                      <input
                        type="text"
                        name="nom_et_prenom"
                        value={formData.nom_et_prenom}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2 mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Télèphone :
                      </label>
                      <input
                        type="text"
                        name="tel"
                        value={formData.tel}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2 mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Date de naissance :
                      </label>
                      <input
                        type="date"
                        name="date_de_naissance"
                        value={formData.date_de_naissance}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2 mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Profession :
                      </label>
                      <select
                        name="profession"
                        id="profession"
                        className="w-full border border-gray-300 rounded-md p-2 mt-1"
                        value={formData.profession}
                        onChange={handleChange}
                        required
                      >
                        <option value=""></option>
                        <option value="Agriculture / Arisans">Agriculture / Arisans</option>
                        <option value="Commerçant">Commerçant</option>
                        <option value="Chef d'entreprise">Chef d'entreprise</option>
                        <option value="Profession libérale">Profession libérale</option>
                        <option value="Cadre supérieur">Cadre supérieur</option>
                        <option value="Cadre moyen">Cadre moyen</option>
                        <option value="Enseignant, Professeur, Professions scientifique">
                          Enseignant, Professeur, Professions scientifique
                        </option>
                        <option value="Ingénieurs / Cadre technique d'entreprise">
                          Ingénieurs / Cadre technique d'entreprise
                        </option>
                        <option value="Technicien / Agent de maîtrise">Technicien / Agent de maîtrise</option>
                        <option value="Policier / Militaire">Policier / Militaire</option>
                        <option value="Fonction publique">Fonction publique</option>
                        <option value="Employés administratifs d'entreprise">
                          Employés administratifs d'entreprise
                        </option>
                        <option value="Ouvriers / Chauffeur">Ouvriers / Chauffeur</option>
                        <option value="Femme au foyer">Femme au foyer</option>
                        <option value="Elèves, Etudiants">Elèves, Etudiants</option>
                        <option value="Sans emploi">Sans emploi</option>
                        <option value="Autres">Autres</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Situation Familiale:
                      </label>
                      <select
                        name="situation_familiale"
                        id="situation_familiale"
                        className="w-full border border-gray-300 rounded-md p-2 mt-1"
                        required
                        value={formData.situation_familiale}
                        onChange={handleChange}
                      >
                        <option value="Célebataire">Célebataire</option>
                        <option value="Marié"> Marié </option>
                        <option value="Divorce">Divorce</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address :</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2 mt-1"
                      />
                    </div>

                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (

                <div className="space-y-4 grid grid-cols-3">
                  <p>
                    <span className="font-medium">Nom et Prénom:</span> {formData?.nom_et_prenom}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {formData?.email}
                  </p>
                  <p>
                    <span className="font-medium">Télèphone:</span> {formData?.tel}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span> {formData?.address}
                  </p>
                  <p>
                    <span className="font-medium">Date de naissance:</span> {formData?.date_de_naissance}
                  </p>

                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;