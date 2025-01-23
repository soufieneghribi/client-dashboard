import React from "react";
import ReactDOM, { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, createRoutesFromElements, Route , RouterProvider } from 'react-router-dom';
import store from "./store";
import App from "./App";
import Home from "./pages/Home";
import Login from "./pages/Login";
<<<<<<< HEAD
import Products from "./components/ProductsBySubCategory";
import PrivateRoute from "./components/PrivateRoute";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import ProductDetails from "./components/ProductDetails";
import Deals from "./components/Deals";
import MesDeals from "./pages/MesDeals";
import Categories from "./components/Categories";
import SubCategory from "./components/SubCategory";
import Catalogue from "./pages/Catalogue";
=======
import Products from "./pages/Products";
import PrivateRoute from "./components/PrivateRoute";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
>>>>>>> 06d2071aedc2d640779f181a96887cf7422a4cc9
import "./styles/index.css"

import CartShopping from "./pages/CartShopping";
import Favoris from "./pages/Favoris";
import Profile from "./pages/Profile";
<<<<<<< HEAD
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Commandes";
=======
>>>>>>> 06d2071aedc2d640779f181a96887cf7422a4cc9


const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<App/>}>
         <Route path="/" element={<Home />} />
        <Route path='/inscrire' element={<Register/>}> </Route>
        <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/favoris" element={<Favoris/>}/>
        <Route path="/cartShopping" element={<CartShopping/>}/>
<<<<<<< HEAD
        <Route path="/cart-shopping" element={<CartShopping />} />
        <Route path="/order-confirmation" element={<OrderConfirmation/>}/>
        <Route path="/Mes-Commandes" element={<Orders/>}/>
        <Route path="/deals" element={<Deals />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/sub-category" element={<SubCategory />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
=======
>>>>>>> 06d2071aedc2d640779f181a96887cf7422a4cc9
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  )
  createRoot(document.getElementById('root')).render(
  <Provider store={store}>
      <RouterProvider router={router}/>
   </Provider>
  )