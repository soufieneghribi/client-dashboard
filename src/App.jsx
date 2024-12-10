import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import "./styles/styles.css";

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;
