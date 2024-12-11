import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, updateUserProfile } from "../store/slices/user";

const Profile = () => {
  const dispatch = useDispatch();
  const { Userprofile, loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if ( Userprofile) {
      setFormData({
        fullName:  Userprofile.nom_et_prenom || "",
        email:  Userprofile.email || "",
        address:  Userprofile.address || "",
      });
    }
  }, [ Userprofile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile(formData));
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10 flex justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl w-full">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">My Profile</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Edit Profile
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <img
                src={ Userprofile?.image }
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mb-4"
              />
              <p className="text-gray-600">Change Profile Picture</p>
              <input type="file" className="text-sm mt-2" />
            </div>

            {/* User Details */}
            <div>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
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
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-2 mt-1"
                    />
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
                <div className="space-y-4">
                  <p>
                    <span className="font-medium text-gray-700">Full Name:</span>{" "}
                    { Userprofile?.fullName}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Email:</span>{" "}
                    { Userprofile?.email}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Address:</span>{" "}
                    { Userprofile?.address || "N/A"}
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
