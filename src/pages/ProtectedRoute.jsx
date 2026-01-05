// pages/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import { refreshAuth } from "../store/slices/authSlice";

const getAuthToken = () => {
  try {
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    const localToken = localStorage.getItem("token");
    return cookieToken || localToken;
  } catch (error) {

    return null;
  }
};

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthentication = () => {
      const storedToken = getAuthToken();
      const hasToken = isLoggedIn || token || storedToken;

      if (!hasToken) {
        // 
        sessionStorage.setItem('redirectAfterLogin', location.pathname);
        navigate("/login", { replace: true });
        return;
      }

      if ((!isLoggedIn || !token) && storedToken) {
        dispatch(refreshAuth());
      }

      setIsChecking(false);
    };

    checkAuthentication();
  }, [isLoggedIn, token, dispatch, navigate, location]);

  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn && !token && !getAuthToken()) {
    return null; // Ne rien afficher car la redirection a déjà eu lieu
  }

  return children;
};

export default ProtectedRoute;


