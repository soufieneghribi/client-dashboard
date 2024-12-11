/* eslint-disable no-unused-vars */
import React from "react";
import ReactDOM, { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, createRoutesFromElements, Route , RouterProvider } from 'react-router-dom';
import store from "./store";
import App from "./App";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Products from "./pages/Products";
import PrivateRoute from "./components/PrivateRoute";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import "./styles/index.css"
import Profile from "./pages/Profile";
import CartShopping from "./pages/CartShopping";
import Favoris from "./pages/Favoris";



const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<App/>}>
         <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path='/inscrire' element={<Register/>}> </Route>
        <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/:id" element={<Profile/>}/>
        <Route path="/favoris" element={<Favoris/>}/>
        <Route path="/cartShopping" element={<CartShopping/>}/>
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  )
  createRoot(document.getElementById('root')).render(
  <Provider store={store}>
      <RouterProvider router={router}/>
   </Provider>
  )