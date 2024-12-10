/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, loginSuccess } from "../store/slices/authSlice";
import { Link } from "react-router-dom";
import '../styles/Header.css';  // Import Home styles


const Header = () => {
    const auth = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
        try {
            // Ensure user data is not undefined and properly formatted
            const parsedUser = user !== "undefined" ? JSON.parse(user) : null;

            if (parsedUser && !auth.isLoggedIn) {
                dispatch(loginSuccess({ token, user: parsedUser }));
            }
        } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
            // Optionally clear invalid user data from localStorage
            localStorage.removeItem("user");
        }
    }
}, [dispatch, auth.isLoggedIn]);


    const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};


    return (
        <header>
  <Link to="/" className="logo">
    360TN
  </Link>
  {auth.isLoggedIn && auth.user ? (
    <div className="user-info">
      <p>Welcome, {auth.user.nom_et_prenom || "User"}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  ) : (
    <p>Please log in.</p>
  )}
</header>

    );
};

export default Header;
