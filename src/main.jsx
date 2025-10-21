import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import store from "./store";
import App from "./App";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Products from "./components/ProductsBySubCategory";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProductDetails from "./components/ProductDetails";
import MesDeals from "./pages/MesDeals";
import Categories from "./components/Categories";
import SubCategory from "./components/SubCategory";
import Catalogue from "./pages/Catalogue";
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
import "./styles/index.css";

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
      <Route path="/catalogue" element={<Catalogue />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/subcategory/:id" element={<SubCategory />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/search" element={<SearchResult />} />
      <Route path="/recipe/:id" element={<RecipeDetails />} />
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