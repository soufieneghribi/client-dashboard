import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import PivateRoute from "./components/PrivateRoute";
import "./styles/styles.css";
import toast, { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";

function App() {
    return (
        // <Router>
        //     <Header />
        //     <Routes>
        //         <Route path="/login" element={<Login />} />
        //         <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        //         <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
        //         <Route path="*" element={<NotFound />} />
        //     </Routes>
        // </Router>
        <div>
    <Toaster/>
        <Header/>
        
        <Outlet/>
        <Footer/>
       
       </div>
    );
}

export default App;
