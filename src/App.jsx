import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import { fetchCategories } from "./store/slices/categorie";
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from "./components/Header";
import Footer from "./components/Footer";
import toast, { Toaster } from "react-hot-toast";
import "./styles/styles.css";

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        // Charger les catégories dès le démarrage de l'application
        dispatch(fetchCategories());
    }, [dispatch]);

    return (
        <div>
            <Toaster/>
            <Header/>
            <Outlet/>
            <Footer/>
        </div>
    );
}

export default App;