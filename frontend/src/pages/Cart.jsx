import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    const data = await api.getCart();
    setCart(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const updateQuantity = async (item, newQty) => {
    setUpdating(item.product_id);
    if (newQty === 0) {
      await api.removeFromCart(item.product_id);
    } else {
      await api.updateCartItem(item.product_id, newQty);
    }
    window.dispatchEvent(new Event("cartUpdated"));
    await loadCart();
    setUpdating(null);
  };

  const proceedToPayment = () => {
    if (!address.trim()) return alert("Please enter a shipping address");
    navigate("/payment", { state: { shipping_address: address } });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-8 text-sm text-gray-500">
      Loading cart...
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate("/")}
        className="text-sm text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1"
      >
        ← Home
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Your cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-gray-700"
          >
            Browse products
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 mb-6">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  {item.variant_info && (
                    <p className="text-xs text-blue-600 mt-0.5">{item.variant_info}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5">
                    ₹{item.price?.toLocaleString()} each
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {/* Minus button */}
                    <button
                      onClick={() => updateQuantity(item, item.quantity - 1)}
                      disabled={updating === item.product_id}
                      className="w-7 h-7 rounded-full border border-gray-200 inline-flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 select-none"
                    >
                      <svg width="10" height="2" viewBox="0 0 10 2" fill="currentColor">
                        <rect width="10" height="2" rx="1"/>
                      </svg>
                    </button>
                    <span className="text-sm font-medium w-5 text-center">
                      {updating === item.product_id ? "..." : item.quantity}
                    </span>
                    {/* Plus button */}
                    <button
                      onClick={() => updateQuantity(item, item.quantity + 1)}
                      disabled={updating === item.product_id}
                      className="w-7 h-7 rounded-full border border-gray-200 inline-flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 select-none"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                        <rect x="4" y="0" width="2" height="10" rx="1"/>
                        <rect x="0" y="4" width="10" height="2" rx="1"/>
                      </svg>
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-gray-900 w-20 text-right">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex justify-between mb-4">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-lg font-semibold text-gray-900">
                ₹{total.toLocaleString()}
              </span>
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter shipping address"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 bg-white mb-3"
            />
            <button
              onClick={proceedToPayment}
              className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700"
            >
              Proceed to payment
            </button>
          </div>
        </>
      )}
    </div>
  );
}