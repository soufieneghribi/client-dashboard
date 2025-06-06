import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, updateUserProfile } from "../store/slices/user";
import jackpotImage from "../assets/jackpotImage.png";
import { useNavigate } from "react-router-dom";

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
    image: "",
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
        image: Userprofile.image || "",
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
    <div className=" w-full min-h-screen flex justify-center items-center p-6">
      <div className="bg-white shadow-xl rounded-3xl p-8 w-full md:w-2/3 lg:w-1/2 border border-gray-200">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-blue-360 to-orange-360 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-md transform hover:scale-105"
            >
              Mettre à jour le profil
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500 text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row items-center justify-between mb-2 space-y-4 md:space-y-0">
              <div className="flex flex-col items-center text-center gap-4">

                <img
                  src={`https://tn360-lqd25ixbvq-ew.a.run.app/uploads/${Userprofile?.image}`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover shadow-xl "
                  onError={(e) =>
                    (e.target.src =
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZXNuwvzjUvZEQzX5xm0TJllYkRjXwOUlirQ&s")
                  }
                />
                <div>
                  <p className="text-lg font-semibold text-gray-800">{Userprofile?.nom_et_prenom}</p>
                  <p className="text-gray-600 text-lg">{Userprofile?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 object-fill md:w-3/4 ">
                <div className="flex flex-col items-center">
                  <div
                    className="border rounded-3xl shadow-xl bg-blue-360 bg-contain md:bg-cover bg-no-repeat w-full h-32 flex items-end justify-center transition-all duration-300 ease-in-out transform hover:scale-105"
                    style={{ backgroundImage: `url(${jackpotImage})` }}
                  >
                    <p className="text-white text-lg font-bold">{Userprofile?.cagnotte_balance}</p>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <img
                    className="border rounded-3xl shadow-xl bg-contain md:bg-cover bg-no-repeat w-full h-32  transition-all duration-300 ease-in-out transform hover:scale-105  bg-orange-360"
                    src="./src/assets/levelup.png"
                    alt="Level Up"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <img
                    className="border rounded-3xl shadow-xl bg-contain md:bg-cover bg-no-repeat w-full h-32 transition-all duration-300 ease-in-out transform hover:scale-105 bg-blue-360"
                    src="./src/assets/superdeals.png"
                    alt="Super Deals"
                    onClick={() => navigate("/MesDeals")}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-blue-360 text-lg font-bold mb-6">Informations personnelles</p>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <label htmlFor="nom_et_prenom" className="text-gray-700 font-medium">Nom et Prénom</label>
                      <input
                        id="nom_et_prenom"
                        name="nom_et_prenom"
                        value={formData.nom_et_prenom}
                        onChange={handleChange}
                        className="px-4 py-3 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="email" className="text-gray-700 font-medium">Email</label>
                      <input
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email"
                        className="px-4 py-3 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="tel" className="text-gray-700 font-medium">Télèphone</label>
                      <input
                        id="tel"
                        name="tel"
                        value={formData.tel}
                        onChange={handleChange}
                        className="px-4 py-3 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="date_de_naissance" className="text-gray-700 font-medium">Date de naissance</label>
                      <input
                        id="date_de_naissance"
                        name="date_de_naissance"
                        value={formData.date_de_naissance}
                        onChange={handleChange}
                        type="date"
                        className="px-4 py-3 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="address" className="text-gray-700 font-medium">Address</label>
                      <input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="px-4 py-3 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-6 mt-8">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-orange-360 text-white font-bold px-6 py-3 rounded-xl transition duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-360 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-360 transition duration-300"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <p>
                    <span className="font-medium">Nom et Prénom:</span>{" "}
                    {formData?.nom_et_prenom}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {formData?.email}
                  </p>
                  <p>
                    <span className="font-medium">Télèphone:</span>{" "}
                    {formData?.tel}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {formData?.address}
                  </p>
                  <p>
                    <span className="font-medium">Date de naissance:</span>{" "}
                    {formData?.date_de_naissance}
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
