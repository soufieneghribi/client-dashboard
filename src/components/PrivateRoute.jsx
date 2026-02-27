/* eslint-disable no-unused-vars */
import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const { token, isLoggedIn } = useSelector((state) => state.auth);
    const location = useLocation();

    // If the user is not logged in, redirect them to the login page
    if (!isLoggedIn || !token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};


PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PrivateRoute;
