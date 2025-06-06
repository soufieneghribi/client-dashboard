import React from "react";
import ReactDOM, { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, createRoutesFromElements, Route , RouterProvider } from 'react-router-dom';
import store from "./store";
import App from "./App";
import Home from "./pages/Home";
import Login from "./pages/Login";

import Products from "./components/ProductsBySubCategory";
import PrivateRoute from "./components/PrivateRoute";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import ProductDetails from "./components/ProductDetails";
import MesDeals from "./pages/MesDeals";
import Categories from "./components/Categories";
import SubCategory from "./components/SubCategory";
import Catalogue from "./pages/Catalogue";
import "./styles/index.css"
import CartShopping from "./pages/CartShopping";
import Favoris from "./pages/Favoris";
import Profile from "./pages/Profile";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Commandes";
import SearchResult from "./components/SearchResult";



const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<App/>}>
         <Route path="/" element={<Home />} />
        <Route path='/inscrire' element={<Register/>}> </Route>
        <Route path="/products" element={<Products />}/>
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/favoris" element={<Favoris/>}/>
        <Route path="/cartShopping" element={<CartShopping/>}/>
        <Route path="/cart-shopping" element={<CartShopping />} />
        <Route path="/order-confirmation" element={<OrderConfirmation/>}/>
        <Route path="/Mes-Commandes" element={<Orders/>}/>
        <Route path="/MesDeals" element={<MesDeals />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/sub-category" element={<SubCategory />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/search" element={<SearchResult />} />


        <Route path="*" element={<NotFound />} />
      </Route>
    )
  )
  createRoot(document.getElementById('root')).render(
  <Provider store={store}>
      <RouterProvider router={router}/>
   </Provider>
  )