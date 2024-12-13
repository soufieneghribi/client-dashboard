import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, loginSuccess } from "../store/slices/authSlice";
import { Link } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';

const Header = () => {
    const auth = useSelector((state) => state.auth);
    const user = useSelector((state)=>state.user)
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
        <>
          <header className="w-full bg-gray-100">
        <div className="container flex flex-row flex-wrap items-center justify-between  mx-auto md:flex-row max-w-7xl">
            <div className="relative">
                 <Link to="/" > <img src="../src/assets/image/logo_0.png"  width="150px"></img></Link> 
                   
            </div>
            <div className="relative mt-3">
                <input className="py-3 px-3 outline-gray-200  focus:border-gray-400 text-xs w-[500px] h-12 lg:block md:block pl-10" 
                placeholder="Search for ...."
                />
                <button>
                <i className="fas fa-search absolute right-3 top-1/3 transform -translate-y-1/2 text-white bg-orange-360 p-2 "></i>
                </button>
                </div>
    
            <div className="inline-flex items-center ml-5 space-x-6 lg:justify-end"> 
              {auth.isLoggedIn && auth.user ? (
                <div className="user-info flex flex-row gap-3 items-end">
                  <p>Welcome, {auth.user.nom_et_prenom || "User"}</p>
                 <Link to={`/profile`}> <i class="fa-regular fa-user"></i></Link>
                 <Link to={`/favoris`} ><i class="fa-regular fa-heart"></i></Link>
                 <Link to={`/cartShopping`}><i class="fa-solid fa-cart-shopping"></i></Link>
                  <button className="text-base font-medium leading-6 text-orange-360 whitespace-no-wrap transition duration-150 ease-in-out"  onClick={handleLogout}>Logout</button>

                </div>
               ) : (
               <div>
                <Link className="text-base font-medium leading-6 text-gray-600 whitespace-no-wrap transition duration-150 ease-in-out hover:text-gray-900"to="/login">
                    Se connecter
                    </Link>
                
                <Link to="/inscrire" className="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 text-white whitespace-no-wrap bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600">
                    S'inscrire
                </Link>
                </div>
               )}
            </div> 
        </div>
  
  
 
</header>
</>

    );
};

export default Header;
