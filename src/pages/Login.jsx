/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState(""); // Input for email
  const [password, setPassword] = useState(""); // Input for password
  const [errorMessage, setErrorMessage] = useState(null); // For error handling
  const [loading, setLoading] = useState(false); // Button loading state

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
    setLoading(true);  // Start loading
    setErrorMessage(null);  // Clear any previous error messages

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
        setLoading(false);  // Stop loading
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
      setLoading(false);  // Stop loading in case of error

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

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
