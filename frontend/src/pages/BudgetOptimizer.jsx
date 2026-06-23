import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

const GOAL_SUGGESTIONS = [
  "Home office setup",
  "Gym and fitness",
  "Student essentials",
  "Kitchen and cooking",
  "Reading and learning",
  "Personal care routine",
];

export default function BudgetOptimizer() {
  const navigate = useNavigate();
  const [budget, setBudget] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [addingAll, setAddingAll] = useState(false);
  const [added, setAdded] = useState(false);

  const handleOptimize = async (e) => {
    e.preventDefault();
    if (!budget || !goal.trim()) return;
    if (parseFloat(budget) <= 0) {
      setError("Please enter a valid budget.");
      return;
    }
    setLoading(true);
    setResult(null);
    setError("");
    setAdded(false);
    const res = await api.budgetOptimize(parseFloat(budget), goal);
    if (res.selected && res.selected.length > 0) {
      setResult(res);
    } else {
      setError(res.summary || "Could not find products matching your goal and budget. Try increasing your budget or changing your goal.");
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
          Budget Optimizer
        </h1>
        <p className="text-sm text-gray-500">
          Tell us your budget and what you're shopping for — the AI will build the best cart for you.
        </p>
      </div>

      <form onSubmit={handleOptimize} className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Your budget (₹)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 10000"
              min="1"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              What are you shopping for?
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder='e.g. "home office setup" or "gym equipment for beginners"'
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400"
              required
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {GOAL_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setGoal(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    goal === s
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !budget || !goal.trim()}
            className="bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Optimizing your budget...
              </span>
            ) : (
              "Optimize my budget ✨"
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
            <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
            <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-base font-semibold text-gray-900">₹{result.total?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Remaining</p>
                <p className="text-base font-semibold text-green-600">₹{result.remaining_budget?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Budget</p>
                <p className="text-base font-semibold text-gray-900">₹{parseFloat(budget).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {result.selected.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    {item.quantity > 1 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        ×{item.quantity}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.reason}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">₹{item.price?.toLocaleString()} each</p>
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
              : `Add all ${result.selected.length} items to cart`}
          </button>
        </div>
      )}
    </div>
  );
}