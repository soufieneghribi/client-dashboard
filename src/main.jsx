import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import store from "./store";
import App from "./App";
import { QueryProvider } from "./config/queryClient.jsx";
import Home from "./pages/Home/Home";
import Login from "./pages/Login";
import Register from "./pages/Register/Register";
import EmailVerification from "./pages/EmailVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import MesDeals from "./pages/Deals/DealsV2";
import Categories from "./pages/Categories";
import Products from "./pages/ProductsBySubCategory";
import ProductDetails from "./pages/ProductDetails";
import SubCategory from "./components/SubCategory";
import Promotions from "./pages/Promotions";
import Cadeaux from "./pages/Gifts/GiftsCatalogue";
import GiftDetailsPage from "./pages/Gifts/GiftDetailsPage";
import MesCadeaux from "./pages/Gifts/MyGifts";
import CartShopping from "./pages/Cart/Cart";
import Favoris from "./pages/Favorites/Favorites";
import Profile from "./pages/Profile/Profile";
import Loyality from "./pages/Loyalty/Loyalty";
import OrderConfirmation from "./pages/OrderConfirmation/OrderConfirmation";
import Orders from "./pages/Commandes";
import SearchResult from "./components/SearchResult";
import ProtectedRoute from "./pages/ProtectedRoute";
import OrderDetails from "./pages/OrderDetails";
import RecipeDetails from "./pages/RecipeDetails";
import Recipes from "./pages/Recipies";

// ⬅️ NOUVEAUX IMPORTS - Produits Gratuits
import Gratuite from "./pages/Gratuite";
import GratuiteDetails from "./pages/GratuiteDetails";
import GratuiteSuccess from "./pages/GratuiteSuccess";
import MesReservations from "./pages/MesReservations";

// ⬅️ NOUVEAUX IMPORTS - Codes Promo
import Codepromo from "./pages/Codepromo";
import Codepromodetails from "./pages/Codepromodetails";
import MescodePromo from "./pages/MescodePromo";

// ⬅️ NOUVEAUX IMPORTS - Réclamations
import Reclamations from "./pages/Reclamations";
import ReclamationForm from "./pages/ReclamationForm";
import ReclamationDetails from "./pages/ReclamationDetails/ReclamationDetails";

// ⬅️ NOUVEAUX IMPORTS - Crédit
import CreditSimulation from "./pages/Credit/CreditSimulation";
import CreditDossier from "./pages/Credit/CreditDossier";
import MesDossiers from "./pages/Credit/MesDossiers";
import DossierDetails from "./pages/Credit/DossierDetails";

// ⬅️ NOUVEAU IMPORT - Toutes les catégories
import AllCategories from "./pages/AllCategories";
import Jeux from "./pages/Home/Jeux";
import Recrutement from "./pages/Recrutement";
import PressSpace from "./pages/PressSpace";
import PressDetails from "./pages/PressDetails";

import "./styles/index.css";
import "./styles/performance.css"; // 🚀 Performance optimizations


/**
 * Suppress non-critical warnings from google-map-react library
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
 */
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      {/* ==================== PUBLIC ROUTES ==================== */}
      <Route path="/" element={<Home />} />
      <Route path='/inscrire' element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/promotions" element={<Promotions />} />
      <Route path="/cadeaux" element={<Cadeaux />} />
      <Route path="/cadeaux/:id" element={<GiftDetailsPage />} />

      {/* ⬅️ NOUVELLES ROUTES - CODES PROMO (Publiques) */}
      <Route path="/code-promo" element={<Codepromo />} />
      <Route path="/code-promo/:id" element={<Codepromodetails />} />

      <Route path="/categories" element={<Categories />} />
      <Route path="/all-categories" element={<AllCategories />} />
      <Route path="/subcategory/:id" element={<SubCategory />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/search" element={<SearchResult />} />
      <Route path="/recipe/:id" element={<RecipeDetails />} />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/recrutement" element={<Recrutement />} />
      <Route path="/espace-presse" element={<PressSpace />} />
      <Route path="/espace-presse/:slug" element={<PressDetails />} />
      <Route path="/jeux" element={<ProtectedRoute><Jeux /></ProtectedRoute>} />
      <Route path="/MesDeals" element={<ProtectedRoute><MesDeals /></ProtectedRoute>} />

      {/* ==================== PROTECTED ROUTES ==================== */}
      <Route
        path="/profile"
        element={<ProtectedRoute><Profile /></ProtectedRoute>}
      />

      {/* Carte de fidélité */}
      <Route
        path="/loyalty-card"
        element={<ProtectedRoute><Loyality /></ProtectedRoute>}
      />

      <Route
        path="/favoris"
        element={<ProtectedRoute><Favoris /></ProtectedRoute>}
      />

      <Route
        path="/cart-shopping"
        element={<ProtectedRoute><CartShopping /></ProtectedRoute>}
      />

      <Route
        path="/order-confirmation"
        element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>}
      />

      <Route
        path="/Mes-Commandes"
        element={<ProtectedRoute><Orders /></ProtectedRoute>}
      />

      <Route
        path="/order/:orderId"
        element={<ProtectedRoute><OrderDetails /></ProtectedRoute>}
      />

      <Route
        path="/mes-cadeaux"
        element={<ProtectedRoute><MesCadeaux /></ProtectedRoute>}
      />

      {/* ⬅️ NOUVELLES ROUTES - CODES PROMO (Protégées) */}
      <Route
        path="/mes-code-promo"
        element={<ProtectedRoute><MescodePromo /></ProtectedRoute>}
      />

      {/* ⬅️ NOUVELLES ROUTES - PRODUITS GRATUITS */}

      {/* Liste des produits gratuits - Accessible à tous */}
      <Route
        path="/gratuite"
        element={<Gratuite />}
      />

      {/* Détails d'un produit gratuit - Accessible à tous */}
      <Route
        path="/gratuite/:id"
        element={<GratuiteDetails />}
      />

      {/* Page de succès après réservation - Protégée */}
      <Route
        path="/gratuite/success"
        element={<ProtectedRoute><GratuiteSuccess /></ProtectedRoute>}
      />

      {/* Mes réservations de produits gratuits - Protégée */}
      <Route
        path="/mes-reservations"
        element={<ProtectedRoute><MesReservations /></ProtectedRoute>}
      />

      {/* ⬅️ NOUVELLES ROUTES - RÉCLAMATIONS (Protégées) */}
      <Route
        path="/reclamations"
        element={<ProtectedRoute><Reclamations /></ProtectedRoute>}
      />
      <Route
        path="/reclamations/new"
        element={<ProtectedRoute><ReclamationForm /></ProtectedRoute>}
      />
      <Route
        path="/reclamations/:id"
        element={<ProtectedRoute><ReclamationDetails /></ProtectedRoute>}
      />

      {/* ⬅️ NOUVELLES ROUTES - CRÉDIT (Protégées) */}
      <Route
        path="/credit"
        element={<ProtectedRoute><MesDossiers /></ProtectedRoute>}
      />
      <Route
        path="/credit/simulation"
        element={<ProtectedRoute><CreditSimulation /></ProtectedRoute>}
      />
      <Route
        path="/credit/dossier"
        element={<ProtectedRoute><CreditDossier /></ProtectedRoute>}
      />
      <Route
        path="/credit/mes-dossiers"
        element={<ProtectedRoute><MesDossiers /></ProtectedRoute>}
      />
      <Route
        path="/credit/dossier/:id"
        element={<ProtectedRoute><DossierDetails /></ProtectedRoute>}
      />

      {/* ==================== 404 FALLBACK ==================== */}
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

/**
 * Root render
 */
createRoot(document.getElementById('root')).render(
  <QueryProvider>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </QueryProvider>
);
