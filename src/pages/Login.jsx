/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { loginSuccess } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize navigate

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("https://tn360-122923924979.europe-west1.run.app/api/v1/auth/login", {
                email,
                password,
            });
            const { client, token } = response.data;

            // Dispatch login success action
            dispatch(loginSuccess({ user: client, token }));

            // Redirect to home page after successful login
            navigate("/"); // Redirects to the home page

        } catch (err) {
            setError("Login failed. Check your credentials.");
        }
    };

    return (
        <div>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit">Login</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
};

export default Login;
