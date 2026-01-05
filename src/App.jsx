import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import { fetchCategories } from "./store/slices/categorie";
import Header from "./components/Header/Header";
import Footer from "./components/Footer";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/styles.css";
import Modal from "react-modal";

/**
 * Main App Component
 * Root layout component that wraps all routes
 * Loads categories on mount and provides global layout structure
 */
function App() {
  const dispatch = useDispatch();

  /**
   * Load categories on application startup
   */
  useEffect(() => {
    Modal.setAppElement('#root');
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div>
      {/* Global Header */}
      <Header />

      {/* Route Content */}
      <Outlet />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default App;
