import { useState, useEffect } from "react";
import { api } from "../api";
import ProductCard from "../components/ProductCard";

const CATEGORY_ICONS = {
  "Electronics": "🔌",
  "Groceries": "🛒",
  "Books & Stationery": "📚",
  "Health & Medicines": "💊",
  "Furniture & Home": "🛋️",
  "Fashion & Clothing": "👗",
  "Sports & Fitness": "🏋️",
  "Beauty & Personal Care": "✨",
  "Toys & Games": "🎮",
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    loadCategories();
    loadProducts();
    loadRecommendations();
  }, []);

  useEffect(() => {
    if (!searching) loadProducts(selectedCategory);
  }, [selectedCategory]);

  const loadCategories = async () => {
    const data = await fetch("http://127.0.0.1:8000/api/categories/").then(r => r.json());
    setCategories(Array.isArray(data) ? data : []);
  };

  const loadProducts = async (categoryId = null) => {
    setLoading(true);
    const url = categoryId
      ? `http://127.0.0.1:8000/api/products/?category_id=${categoryId}`
      : `http://127.0.0.1:8000/api/products/`;
    const data = await fetch(url).then(r => r.json());
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const loadRecommendations = async () => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) return;
    const data = await api.getRecommendations(user_id);
    if (data.recommendations) setRecommendations(data.recommendations);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setSelectedCategory(null);
      return loadProducts();
    }
    setSearching(true);
    setSelectedCategory(null);
    const data = await api.nlSearch(query);
    setProducts(Array.isArray(data.results) ? data.results : []);
    setSearching(false);
  };

  const clearSearch = () => {
    setQuery("");
    setSearching(false);
    loadProducts(selectedCategory);
  };

  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* Hero search */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-3xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to ShopMind</h1>
        <p className="text-gray-300 mb-6 text-sm">AI-powered shopping — search in plain English</p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try "wireless headphones under ₹5000" or "healthy snacks"'
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 outline-none focus:bg-white/20"
          />
          <button
            type="submit"
            disabled={searching}
            className="bg-white text-gray-900 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 disabled:opacity-50"
          >
            {searching ? "Searching..." : "Search"}
          </button>
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="border border-white/20 text-white px-4 py-3 rounded-xl text-sm hover:bg-white/10"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Categories */}
      {!query && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop by category</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                selectedCategory === null
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              <span className="text-2xl">🏪</span>
              <span className="text-xs font-medium">All</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                  selectedCategory === cat.id
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                <span className="text-2xl">{CATEGORY_ICONS[cat.name] || "📦"}</span>
                <span className="text-xs font-medium text-center leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {!query && !selectedCategory && recommendations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">✨ Recommended for you</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map((rec, i) => (
              <ProductCard key={i} product={rec.product} />
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {query
            ? `Results for "${query}"`
            : selectedCategoryName
            ? `${CATEGORY_ICONS[selectedCategoryName] || "📦"} ${selectedCategoryName}`
            : "All products"}
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}