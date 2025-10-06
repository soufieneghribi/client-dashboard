import React from "react";
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
import "./styles/index.css";
import Contact from "./components/Contact";

import RecipeDetails from "./pages/RecipeDetails";

const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<App/>}>
        {/* Routes publiques */}
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


        {/* Routes protégées */}
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


        <Route path="/contact" element={<Contact />} />


        
        <Route 
          path="/MesDeals" 
          element={<ProtectedRoute><MesDeals /></ProtectedRoute>}
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    )
);

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
      <RouterProvider router={router}/>
   </Provider>
);