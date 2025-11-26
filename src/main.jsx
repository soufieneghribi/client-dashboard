import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import store from "./store";
import App from "./App";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailVerification from "./pages/EmailVerification"; // ⭐ NOUVEAU - Vérification Email
import ForgotPassword from "./pages/ForgotPassword"; // ⭐ NOUVEAU - Mot de passe oublié
import ResetPassword from "./pages/ResetPassword"; // ⭐ NOUVEAU - Réinitialisation mot de passe
import NotFound from "./pages/NotFound";
import MesDeals from "./pages/MesDeals";
import Categories from "./pages/Categories";
import Products from "./pages/ProductsBySubCategory";
import ProductDetails from "./pages/ProductDetails";
import SubCategory from "./components/SubCategory";
import Catalogue from "./pages/Catalogue";
import Promotions from "./pages/Promotions";
import Cadeaux from "./pages/Cadeaux";
import CartShopping from "./pages/CartShopping";
import Favoris from "./pages/Favoris";
import Profile from "./pages/Profile";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Commandes";
import SearchResult from "./components/SearchResult";
import ProtectedRoute from "./pages/ProtectedRoute";
import Contact from "./components/Contact";
import OrderDetails from "./pages/OrderDetails";
import RecipeDetails from "./pages/RecipeDetails";
import Recipes from "./pages/Recipies";
import "./styles/index.css";

/**
 * Suppress non-critical warnings from google-map-react library
 * These warnings don't affect functionality but clutter the console
 */
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Invalid attribute name') ||
     args[0].includes('findDOMNode is deprecated') ||
     args[0].includes('React does not recognize the') ||
     (args[0].includes('Received `') && args[0].includes('for a non-boolean attribute')))
  ) {
    return;
  }
  originalError.apply(console, args);
};

const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('findDOMNode')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

/**
 * Application Router Configuration
 * Note: StrictMode is disabled to avoid warnings from google-map-react
 * which is not fully compatible with React 18's StrictMode
 */
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App/>}>
      {/* ==================== PUBLIC ROUTES ==================== */}
      <Route path="/" element={<Home />} />
      <Route path='/inscrire' element={<Register/>} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<EmailVerification />} /> {/* ⭐ NOUVEAU */}
      <Route path="/forgot-password" element={<ForgotPassword />} /> {/* ⭐ NOUVEAU - Mot de passe oublié */}
      <Route path="/reset-password" element={<ResetPassword />} /> {/* ⭐ NOUVEAU - Réinitialisation */}
      <Route path="/catalogue" element={<Catalogue />} />
      <Route path="/promotions" element={<Promotions />} />
      <Route path="/cadeaux" element={<Cadeaux />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/subcategory/:id" element={<SubCategory />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/search" element={<SearchResult />} />
      <Route path="/recipe/:id" element={<RecipeDetails />} />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/MesDeals" element={<ProtectedRoute><MesDeals /></ProtectedRoute>} />

      {/* ==================== PROTECTED ROUTES ==================== */}
      <Route 
        path="/profile" 
        element={<ProtectedRoute><Profile/></ProtectedRoute>}
      />
      
      <Route 
        path="/favoris" 
        element={<ProtectedRoute><Favoris/></ProtectedRoute>}
      />
      
      <Route 
        path="/cart-shopping" 
        element={<ProtectedRoute><CartShopping /></ProtectedRoute>}
      />
      
      <Route 
        path="/order-confirmation" 
        element={<ProtectedRoute><OrderConfirmation/></ProtectedRoute>}
      />
      
      <Route 
        path="/Mes-Commandes" 
        element={<ProtectedRoute><Orders/></ProtectedRoute>}
      />

      <Route 
        path="/order/:orderId" 
        element={<ProtectedRoute><OrderDetails/></ProtectedRoute>} 
      />

      {/* ==================== 404 FALLBACK ==================== */}
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

/**
 * Root render without StrictMode
 * This eliminates warnings from google-map-react library
 */
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <RouterProvider router={router}/>
  </Provider>
);