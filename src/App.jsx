import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Navbar from "./compenent/Navbar/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Product from "./compenent/Products";
import Wishlist from "./pages/Wishlist";
import Payment from "./pages/Payment";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";


import Dashboard from "./admin/Dashboard";
import AdminProducts from "./admin/AdminProducts";
import AdminAddProducts from "./admin/AdminAddProducts";
import AdminEditProduct from "./admin/AdminEditProduct";
import AdminOrders from "./admin/AdminOrders";
import AdminUsers from "./admin/AdminUsers";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    setLoading(false);
  }, []);

  const AdminProtected = ({ children }) => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    return admin ? children : <Navigate to="/admin-login" />;
  };

  const ProtectedRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user ? (
      <>
        <Navbar />
        {children}
      </>
    ) : (
      <Navigate to="/login" replace />
    );
  };

  const PublicRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user ? <Navigate to="/" replace /> : children;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/admin"
          element={
            <AdminProtected>
              <Dashboard />
            </AdminProtected>
          }
        />

        <Route
          path="/admin/products"
          element={
            <AdminProtected>
              <AdminProducts />
            </AdminProtected>
          }
        />

        <Route
          path="/admin/products/add"
          element={
            <AdminProtected>
              <AdminAddProducts />
            </AdminProtected>
          }
        />

        <Route
          path="/admin/products/edit/:id"
          element={
            <AdminProtected>
              <AdminEditProduct />
            </AdminProtected>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <AdminProtected>
              <AdminOrders />
            </AdminProtected>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminProtected>
              <AdminUsers />
            </AdminProtected>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

    
    
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/admin-login" element={<Navigate to="/login" replace />} />

      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;