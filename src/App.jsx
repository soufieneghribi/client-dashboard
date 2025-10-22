import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import { fetchCategories } from "./store/slices/categorie";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Footer from "./components/Footer";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/styles.css";

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
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div>
      {/* Toast notifications container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Global Header */}
      <Header/>
      
      {/* Route Content */}
      <Outlet/>
      
      {/* Global Footer */}
      <Footer/>
    </div>
  );
}

export default App;