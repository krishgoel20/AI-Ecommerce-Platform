import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Analytics from "./pages/Analytics";
import Payment from "./pages/Payment";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import BudgetOptimizer from "./pages/BudgetOptimizer";
import OccasionShopping from "./pages/OccasionShopping";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" />;
  if (role !== "admin") return <Navigate to="/" />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route
            path="/cart"
            element={<ProtectedRoute><Cart /></ProtectedRoute>}
          />
          <Route
            path="/orders"
            element={<ProtectedRoute><Orders /></ProtectedRoute>}
          />
          <Route
            path="/analytics"
            element={<AdminRoute><Analytics /></AdminRoute>}
          />
          <Route
            path="/payment"
            element={<ProtectedRoute><Payment /></ProtectedRoute>}
          />
          <Route
            path="/budget-optimizer"
            element={<ProtectedRoute><BudgetOptimizer /></ProtectedRoute>}
          />
          <Route
            path="/occasion-shopping"
            element={<ProtectedRoute><OccasionShopping /></ProtectedRoute>}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}