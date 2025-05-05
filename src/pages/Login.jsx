import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../store/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { forgetPassword } from "../store/slices/user";
import splash from "../assets/images/Splash.png";
const Login = () => {
  const [email, setEmail] = useState(""); // Input for email
  const [searchMail, setSearchMail] = useState(""); // For searching email during password reset
  const [password, setPassword] = useState(""); // Input for password
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for password reset
  const [loading, setLoading] = useState(false); // Loading state for login
  const [loadingModal, setLoadingModal] = useState(false); // Loading state for password reset
  const [message, setMessage] = useState(""); // Success message
  const [error, setError] = useState(""); // Error message
  const [errorMessage, setErrorMessage] = useState(null); // For error handling during login

  const dispatch = useDispatch(); // Hook to dispatch Redux actions
  const navigate = useNavigate(); // React Router hook to navigate
  const { token, isLoggedIn } = useSelector((state) => state.auth); // Redux state

  useEffect(() => {
    // Redirect user if already logged in
    if (isLoggedIn || token) {
      navigate("/"); // Redirect to home or dashboard
    }
  }, [isLoggedIn, token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    setErrorMessage(null); // Clear any previous error messages

    try {
      // Make the login API call
      const response = await axios.post(
        "https://tn360-122923924979.europe-west1.run.app/api/v1/auth/login",
        { email, password }
      );

      const { client, token } = response.data;

      // Ensure client and token are present
      if (!client || !token) {
        setErrorMessage("Invalid login credentials.");
        setLoading(false);
        return;
      }

      // Dispatch login success action
      dispatch(loginSuccess({ user: client, token }));

      // Store token and user in localStorage for persistence
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(client));

      // Redirect to home page after successful login
      navigate("/");

    } catch (error) {
      setLoading(false); // Stop loading in case of error

      // Handle errors from API or network
      if (error.response) {
        setErrorMessage(
          error.response.data.errors?.[0]?.message || "Invalid login credentials."
        );
      } else if (error.request) {
        setErrorMessage("No response from the server. Please try again later.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingModal(true);
    setError("");
    setMessage("");

    if (!searchMail) {
      setError("Veuillez entrer une adresse e-mail valide.");
      setLoadingModal(false); // Stop loading
      return;
    }

    dispatch(forgetPassword({email:searchMail}))
    setSearchMail("")
    setLoadingModal(false); // Stop loading in both cases
    setIsModalOpen(false)
    
  };
  return (
    <>
      <div className="min-h-screen text-gray-900 flex justify-center">
        <div className="max-w-screen-xl m-0 sm:m-10 sm:rounded-lg flex justify-center">
          <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
            <div className="mt-12 flex flex-col items-center">
              <h1 className="text-2xl xl:text-3xl font-extrabold font-limon-milk text-center">
                Connectez-vous à votre compte
              </h1>

              <form onSubmit={handleLogin} className="w-full mt-8">
                <div className="relative">
                  <input
                    className="w-full px-8 py-2 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <i className="fa-solid fa-user absolute left-3 top-1/3 text-orange-360"></i>
                </div>

                <div className="relative mt-3">
                  <input
                    className="w-full px-8 py-2 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    type="password"
                    placeholder="Mot de passe"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <i className="fa-solid fa-lock absolute left-3 top-1/3 text-orange-360"></i>
                </div>

                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    className="text-stone-500 font-limon-milk"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Mot de passe oublié
                  </button>
                </div>
                {errorMessage && <p className="error">{errorMessage}</p>}
                <button
                  type="submit"
                  className="mt-3 tracking-wide font-semibold bg-blue-360 text-gray-100 w-full h-12 py-2 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                  disabled={loading}
                >
                  {loading ? "Connexion..." : "Connexion"}
                </button>
               
              </form>
              <a href="/inscrire" className="text-blue-360 underline"> Créer un compte</a>

              {/* Modal for Password Reset */}
              {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-5">
                    <div className="flex justify-between items-center">
                      <h2 className="font-semibold text-xl text-gray-800">
                        Mot de Passe oublié
                      </h2>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-500"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="px-3 py-3 flex flex-col">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 py-3"
                        >
                          Adresse e-mail
                        </label>
                        <input
                          className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                          type="email"
                          placeholder="Email"
                          name="email"
                          value={searchMail}
                          onChange={(e) => setSearchMail(e.target.value)}
                        />
                      </div>
                      {error && <p className="text-red-500 text-sm">{error}</p>}
                      {message && <p className="text-green-500 text-sm">{message}</p>}
                      <div className="flex justify-between">
                        <button
                          type="button"
                          className="px-4 py-2 bg-orange-360 text-white rounded-md"
                          onClick={() => {
                            setIsModalOpen(false);
                            setLoadingModal(false);
                          }}
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-360 text-white rounded-md"
                          disabled={loadingModal}
                        >
                          {loadingModal ? "Envoi en cours..." : "Envoyer le lien"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 text-center hidden lg:flex">
            <div className="m-12 xl:m-16 bg-contain">
              <img src={splash} alt="Splash" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
