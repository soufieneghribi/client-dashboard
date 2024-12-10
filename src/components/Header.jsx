/* eslint-disable no-unused-vars */
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";

const Header = () => {
   const auth = useSelector((state) => state.auth);
   const dispatch = useDispatch();

   const handleLogout = () => {
       dispatch(logout());
   };

   return (
       <header>
           {auth.isLoggedIn ? (
               <div>
                   <p>Welcome, {auth.user.nom_et_prenom}</p>
                   <button onClick={handleLogout}>Logout</button>
               </div>
           ) : (
               <p>Please log in.</p>
           )}
       </header>
   );
};

export default Header;
