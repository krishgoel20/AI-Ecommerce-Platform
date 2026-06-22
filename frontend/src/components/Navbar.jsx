import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    const t = localStorage.getItem("token");
    if (!t) { setCartCount(0); return; }
    try {
      const res = await fetch("http://127.0.0.1:8000/api/cart/", {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        setToken(null);
        setCartCount(0);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setCartCount(data.reduce((sum, item) => sum + item.quantity, 0));
      }
    } catch (e) {
      console.error("Cart fetch error:", e);
    }
  };

  useEffect(() => {
    fetchCartCount();
    window.addEventListener("cartUpdated", fetchCartCount);
    window.addEventListener("userLoggedIn", () => {
      setToken(localStorage.getItem("token"));
      fetchCartCount();
    });
    return () => {
      window.removeEventListener("cartUpdated", fetchCartCount);
      window.removeEventListener("userLoggedIn", fetchCartCount);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    setToken(null);
    setCartCount(0);
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-xl font-semibold text-gray-900">
        ShopMind
      </Link>
      <div className="flex items-center gap-4">
        {token ? (
          <>
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link to="/cart" className="text-sm text-gray-600 hover:text-gray-900 relative">
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-3 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
            <Link to="/orders" className="text-sm text-gray-600 hover:text-gray-900">
              Orders
            </Link>
            {localStorage.getItem("role") === "admin" && (
              <Link to="/analytics" className="text-sm text-gray-600 hover:text-gray-900">
                Analytics
              </Link>
            )}
            <button
              onClick={logout}
              className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-gray-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link to="/register" className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-gray-700">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}