import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const addToCart = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    await api.addToCart({ product_id: product.id, quantity: 1 });
    window.dispatchEvent(new Event("cartUpdated"));
    alert("Added to cart!");
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
    >
      <div className="h-44 overflow-hidden bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
          {product.name}
        </h3>
        {product.rating_count > 0 ? (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-xs text-gray-500">{product.rating_avg}</span>
            <span className="text-xs text-gray-400">({product.rating_count} reviews)</span>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mb-2">No reviews yet</p>
        )}
        <p className="text-lg font-semibold text-gray-900 mb-3">
          ₹{product.price?.toLocaleString()}
        </p>
        <button
          onClick={addToCart}
          className="w-full bg-gray-900 text-white text-sm py-2 rounded-xl hover:bg-gray-700 transition-colors"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}