
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, loginSuccess } from "../store/slices/authSlice";
import { Link } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';

const Header = () => {

  const [show, setShow] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
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
        localStorage.removeItem("user");
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

  const toggleMobileMenu = () => {
    setMobileMenu(!mobileMenu);
  };

  return (
    <header className="w-full bg-gradient-to-r from-orange-360 to-blue-360 shadow-lg">
      <div className="container flex flex-wrap items-center justify-between mx-auto p-4 max-w-7xl">


          {/* Mobile Hamburger Menu */}
          <div className="lg:hidden flex items-start px-5">
          <button onClick={toggleMobileMenu} className="text-white text-2xl">
            <i className={`fas ${mobileMenu ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>

        {/* Logo */}
        <div className="relative flex-1">
          <Link to="/">
            <img src="../src/assets/images/logo_0.png" width="150px" alt="Company Logo" />
          </Link>
        </div>

      

        {/* Search Bar */}
        <div className="relative mt-3 flex items-center space-x-3">
          <input
            className="py-2 px-3 outline-none border-2 border-gray-300 rounded-md w-72 lg:w-96 xl:w-[500px] focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Search for ...."
          />
          <button className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <i className="fas fa-search text-white bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-all"></i>
          </button>
        </div>

        {/* User/Cart Section */}
        <div className="hidden  lg:inline-flex items-center ml-5 space-x-6 lg:justify-end">
          {auth.isLoggedIn && auth.user ? (
            <div className="user-info flex flex-row gap-3 items-center relative">
              <p className="text-white font-medium hidden lg:block">Welcome, {auth.user.nom_et_prenom || "User"}</p>
              <i className="fa-regular fa-user text-white text-2xl cursor-pointer" onClick={showHandler}></i>
              {show && (
                <div className="absolute w-60 bg-white border border-gray-200 rounded-md shadow-xl mt-52">
                  <div className="grid gap-1">
                    <Link to="/profile" className="hover:bg-blue-500 hover:text-white p-2 rounded-md transition-all">
                      <i className="fa-solid fa-user pr-1"></i> Profile
                    </Link>
                    <Link to="/profile" className="hover:bg-blue-500 hover:text-white p-2 rounded-md transition-all">
                      <i className="fa-solid fa-gear pr-1"></i> Parametres
                    </Link>
                    <Link to="/Mes-Commandes" className="hover:bg-blue-500 hover:text-white p-2 rounded-md transition-all">
                      <i className="fa-solid fa-bag-shopping pr-1"></i> Mes commandes
                    </Link>
                    <Link to="/" className="hover:bg-blue-500 hover:text-white p-2 rounded-md transition-all" onClick={handleLogout}>
                      <i className="fa-solid fa-right-from-bracket pr-1"></i> Deconnexion
                    </Link>
                  </div>
                </div>
              )}
              
            </div>
          ) : (
            <div className="hidden lg:flex space-x-4">
              <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all">
              <i className="fa-solid fa-user pr-1"></i> Se connecter
              </Link>
              <Link to="/inscrire" className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-all">
                S'inscrire
              </Link>
            </div>
          )}
          <Link to={`/favoris`} className="text-white text-xl">
                <i className="fa-regular fa-heart"></i>
              </Link>
              <Link to={`/cart-Shopping`} className="text-white text-xl">
                <i className="fa-solid fa-cart-shopping"></i>
              </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="lg:hidden bg-white p-4 shadow-md">
          {auth.isLoggedIn ? (
            <>
              <Link to="/profile" className="block py-2 text-gray-700 hover:bg-gray-200 rounded-md"><i className="fa-solid fa-user pr-1"></i> Profile</Link>
              <Link to="/Mes-Commandes" className="block py-2 text-gray-700 hover:bg-gray-200 rounded-md">
               <i className="fa-solid fa-bag-shopping pr-1"></i> Mes commandes</Link>
              <Link to="/" className="block py-2 text-gray-700 hover:bg-gray-200 rounded-md" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket pr-1"></i>Deconnexion</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-gray-700 hover:bg-gray-200 rounded-md">Se connecter</Link>
              <Link to="/register" className="block py-2 text-gray-700 hover:bg-gray-200 rounded-md">S'inscrire</Link>
            </>
          )}
        </div>
      )}
    </header>
  );

};





export default Header;
