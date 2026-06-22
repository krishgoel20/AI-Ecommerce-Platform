import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

const STATUSES = ["pending", "processing", "shipped", "delivered"];

const STATUS_LABELS = {
  pending: "Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

const STATUS_ICONS = {
  pending: "✓",
  processing: "⚙",
  shipped: "📦",
  delivered: "🏠",
};

const statusColor = (status) => {
  const colors = {
    pending: "bg-yellow-50 text-yellow-700",
    processing: "bg-blue-50 text-blue-700",
    shipped: "bg-purple-50 text-purple-700",
    delivered: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
  };
  return colors[status] || "bg-gray-50 text-gray-700";
};

function OrderTimeline({ status }) {
  const currentIndex = STATUSES.indexOf(status);

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center justify-between">
        {STATUSES.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                  i <= currentIndex
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {STATUS_ICONS[s]}
              </div>
              <p
                className={`text-xs mt-1.5 font-medium ${
                  i <= currentIndex ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {STATUS_LABELS[s]}
              </p>
            </div>
            {i < STATUSES.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${
                  i < currentIndex ? "bg-gray-900" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const data = await api.getOrders();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-8 text-sm text-gray-500">
      Loading orders...
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

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Your orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm mb-4">No orders yet</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-gray-700"
          >
            Start shopping
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Order #{order.id}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{order.created_at}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{order.total_amount?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-600 py-1">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{(item.price_at_purchase * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 mt-2 mb-1">
                Ships to: {order.shipping_address}
              </p>

              {order.status !== "cancelled" && (
                <OrderTimeline status={order.status} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}