import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

const OCCASION_SUGGESTIONS = [
  "🎂 Birthday gift for a 10-year-old",
  "💼 First day at a new job",
  "🏠 Housewarming gift",
  "🎓 Graduation gift",
  "💪 Starting a fitness journey",
  "📚 Back to school essentials",
  "❤️ Anniversary gift for partner",
  "🧘 Self-care Sunday",
];

export default function OccasionShopping() {
  const navigate = useNavigate();
  const [occasion, setOccasion] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [addingAll, setAddingAll] = useState(false);
  const [added, setAdded] = useState(false);

  const handleShop = async (e) => {
    e.preventDefault();
    if (!occasion.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    setAdded(false);
    const res = await api.occasionShop(occasion, parseFloat(budget) || 0);
    if (res.selected && res.selected.length > 0) {
      setResult(res);
    } else {
      setError(res.message || "Could not find suitable products. Try describing your occasion differently.");
    }
    setLoading(false);
  };

  const addAllToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setAddingAll(true);
    for (const item of result.selected) {
      await api.addToCart({ product_id: item.id, quantity: item.quantity });
    }
    window.dispatchEvent(new Event("cartUpdated"));
    setAddingAll(false);
    setAdded(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate("/")}
        className="text-sm text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1"
      >
        ← Home
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Occasion Shopping
        </h1>
        <p className="text-sm text-gray-500">
          Describe the occasion and the AI will curate the perfect selection for you.
        </p>
      </div>

      <form onSubmit={handleShop} className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              What's the occasion?
            </label>
            <input
              type="text"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder='e.g. "birthday gift for my 8-year-old nephew who loves sports"'
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400"
              required
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {OCCASION_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setOccasion(s.split(" ").slice(1).join(" "))}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    occasion === s.split(" ").slice(1).join(" ")
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Budget (₹) <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Leave blank for no budget limit"
              min="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !occasion.trim()}
            className="bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Curating for your occasion...
              </span>
            ) : (
              "Shop for this occasion ✨"
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              {result.occasion_title}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">{result.message}</p>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">{result.selected?.length} items selected</span>
              <span className="text-sm font-semibold text-gray-900">
                Total: ₹{result.total?.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {result.selected?.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4 cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => navigate(`/product/${item.id}`)}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">{item.name}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.reason}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-gray-400">×{item.quantity}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addAllToCart}
            disabled={addingAll || added}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
              added
                ? "bg-green-600 text-white"
                : "bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50"
            }`}
          >
            {added
              ? "✓ All items added to cart!"
              : addingAll
              ? "Adding to cart..."
              : `Add all ${result.selected?.length} items to cart`}
          </button>
        </div>
      )}
    </div>
  );
}