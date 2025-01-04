import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, loginSuccess } from "../store/slices/authSlice";
import { Link } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';

const Header = () => {
  const [show, setShow] = useState(false);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const parsedUser = user !== "undefined" ? JSON.parse(user) : null;

        if (parsedUser && !auth.isLoggedIn) {
          dispatch(loginSuccess({ token, user: parsedUser }));
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        localStorage.removeItem("user"); // Optionally clear invalid user data
      }
    }
  }, [dispatch, auth.isLoggedIn]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const showHandler = () => {
    setShow(!show);
  };

  return (
    <>
      <header className="w-full bg-gray-100">
        <div className="container flex flex-row flex-wrap items-center justify-between mx-auto md:flex-row max-w-7xl">
          <div className="relative">
            <Link to="/">
              <img src="../src/assets/image/logo_0.png" width="150px" alt="Company Logo" />
            </Link>
          </div>

          <div className="relative mt-3">
            <input
              className="py-3 px-3 outline-gray-200 focus:border-gray-400 text-xs w-[500px] h-12 lg:block md:block pl-10"
              placeholder="Search for ...."
            />
            <button>
              <i className="fas fa-search absolute right-3 top-1/3 transform -translate-y-1/2 text-white bg-orange-360 p-2"></i>
            </button>
          </div>

          <div className="inline-flex items-center ml-5 space-x-6 lg:justify-end">
            {auth.isLoggedIn && auth.user ? (
              <div className="user-info flex flex-row gap-3 items-end">
                <p>Welcome, {auth.user.nom_et_prenom || "User"}</p>
                <i className="fa-regular fa-user" onMouseEnter={showHandler}></i>
                {show && (
                  <div className="absolute w-60 h-auto top-14 bg-white border border-gray-200 rounded-md shadow-xl">
                    <div className="grid">
                      <Link to="/profile" className="hover:bg-blue-360 hover:text-white p-1 rounded">
                        <i className="fa-solid fa-user pr-1"></i> Profile
                      </Link>
                      <Link to="/profile" className="hover:bg-blue-360 hover:text-white p-1 rounded">
                        <i className="fa-solid fa-gear pr-1"></i> Parametres
                      </Link>
                      <Link to="/profile" className="hover:bg-blue-360 hover:text-white p-1 rounded">
                        <i className="fa-solid fa-bag-shopping pr-1"></i> Mes commandes
                      </Link>
                      <Link to="/" className="hover:bg-blue-360 hover:text-white p-1 rounded" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket pr-1"></i>Deconnexion
                      </Link>
                    </div>
                  </div>
                )}
                <Link to={`/favoris`}>
                  <i className="fa-regular fa-heart"></i>
                </Link>
                <Link to={`/cart-Shopping`}>
                  <i className="fa-solid fa-cart-shopping"></i>
                </Link>
              </div>
            ) : (
              <div>
                <div className="hidden lg:flex space-x-4">
                  <Link to="/login" className="px-4 py-2 bg-blue-360 text-white rounded-md hover:bg-blue-700">
                    Se connecter
                  </Link>
                  <Link to="/register" className="px-4 py-2 bg-orange-360 text-white rounded-md hover:bg-orange-600">
                    S'inscrire
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
