import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import { fetchCategories } from "./store/slices/categorie";
import Header from "./components/Header/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from 'react-hot-toast';
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
      {/* Scroll to top component */}
      <ScrollToTop />

      {/* Global Header */}
      <Header />

      {/* Route Content */}
      <Outlet />

      {/* Global Footer */}
      <Footer />

      {/* Global Toast Notifications (Sleek and Modern) */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1f2937',
            padding: '12px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f3f4f6',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
