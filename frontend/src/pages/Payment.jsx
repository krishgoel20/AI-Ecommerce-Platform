import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const shipping_address = location.state?.shipping_address || "";

  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [bank, setBank] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (!shipping_address) { navigate("/cart"); return; }
    api.getCart().then(data => { if (Array.isArray(data)) setCart(data); });
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePayment = async () => {
    if (paymentMethod === "upi" && !upiId.trim()) {
      alert("Please enter your UPI ID"); return;
    }
    if (paymentMethod === "card") {
      if (!card.number || !card.name || !card.expiry || !card.cvv) {
        alert("Please fill in all card details"); return;
      }
    }
    if (paymentMethod === "netbanking" && !bank) {
      alert("Please select a bank"); return;
    }
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const res = await api.placeOrder({ shipping_address });
    setProcessing(false);
    if (res.id) {
      setOrderId(res.id);
      setSuccess(true);
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      alert(res.detail || "Payment failed. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Payment successful!</h1>
        <p className="text-gray-500 text-sm mb-2">Order #{orderId} has been placed.</p>
        <p className="text-gray-400 text-xs mb-8">Ships to: {shipping_address}</p>
        <button
          onClick={() => navigate("/orders")}
          className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 mb-3"
        >
          View order
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl text-sm hover:bg-gray-50"
        >
          Continue shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate("/cart")}
        className="text-sm text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1"
      >
        ← Back to cart
      </button>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Payment</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Payment methods */}
        <div>
          <h2 className="text-base font-medium text-gray-900 mb-4">Select payment method</h2>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[
              { id: "upi", label: "UPI", icon: "📱" },
              { id: "card", label: "Card", icon: "💳" },
              { id: "netbanking", label: "Net Banking", icon: "🏦" },
              { id: "cod", label: "COD", icon: "📦" },
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all ${
                  paymentMethod === method.id
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                <span className="text-lg">{method.icon}</span>
                {method.label}
              </button>
            ))}
          </div>

          {paymentMethod === "upi" && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400"
              />
              <p className="text-xs text-gray-400 mt-2">Supported: GPay, PhonePe, Paytm, BHIM</p>
            </div>
          )}

          {paymentMethod === "card" && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Card number</label>
                <input
                  type="text"
                  value={card.number}
                  onChange={e => setCard({...card, number: e.target.value.replace(/\D/g,"").slice(0,16)})}
                  placeholder="1234 5678 9012 3456"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Name on card</label>
                <input
                  type="text"
                  value={card.name}
                  onChange={e => setCard({...card, name: e.target.value})}
                  placeholder="Krish Goel"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Expiry</label>
                  <input
                    type="text"
                    value={card.expiry}
                    onChange={e => setCard({...card, expiry: e.target.value})}
                    placeholder="MM/YY"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">CVV</label>
                  <input
                    type="password"
                    value={card.cvv}
                    onChange={e => setCard({...card, cvv: e.target.value.slice(0,3)})}
                    placeholder="•••"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "netbanking" && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Select bank</label>
              <select
                value={bank}
                onChange={e => setBank(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 bg-white"
              >
                <option value="">Choose your bank</option>
                <option>State Bank of India</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>Kotak Mahindra Bank</option>
                <option>Punjab National Bank</option>
                <option>Bank of Baroda</option>
                <option>Yes Bank</option>
              </select>
            </div>
          )}

          {paymentMethod === "cod" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800 font-medium mb-1">Cash on Delivery</p>
              <p className="text-xs text-yellow-700">Pay in cash when your order arrives. No extra charges.</p>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div>
          <h2 className="text-base font-medium text-gray-900 mb-4">Order summary</h2>
          <div className="bg-gray-50 rounded-2xl p-5">
            <div className="flex flex-col gap-3 mb-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-900 font-medium">{item.name}</p>
                    {item.variant_info && (
                      <p className="text-xs text-blue-600">{item.variant_info}</p>
                    )}
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-gray-900 font-medium">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3 mb-1">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Delivery</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-2">
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Ships to: {shipping_address}</p>
          </div>

          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 mt-4"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Processing payment...
              </span>
            ) : (
              `Pay ₹${total.toLocaleString()}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}