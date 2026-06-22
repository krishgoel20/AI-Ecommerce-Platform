import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState({});
  const [selectedVariants, setSelectedVariants] = useState({});
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [adding, setAdding] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    api.getProduct(id).then(setProduct);
    api.getProductVariants(id).then((data) => {
      setVariants(data.variants || {});
    });
  }, [id]);

  const variantTypes = Object.keys(variants);
  const allSelected =
    variantTypes.length === 0 ||
    variantTypes.every((type) => selectedVariants[type]);

  const getAdjustedPrice = () => {
    if (!product) return 0;
    const modifier = Object.values(selectedVariants).reduce(
      (sum, v) => sum + (v.price_modifier || 0),
      0
    );
    return product.price + modifier;
  };

  const getVariantInfo = () => {
    return Object.entries(selectedVariants)
      .map(([type, v]) => `${type}: ${v.variant_value}`)
      .join(", ");
  };

  const addToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    if (!allSelected) {
      alert("Please select all options before adding to cart");
      return;
    }
    if (product.stock_qty === 0) {
      alert("This product is out of stock.");
      return;
    }
    setAdding(true);
    const selectedList = Object.values(selectedVariants);
    const variantId =
      selectedList.length > 0
        ? selectedList[selectedList.length - 1].id
        : null;
    const variantInfo = getVariantInfo() || null;
    await api.addToCart({
      product_id: product.id,
      quantity: 1,
      variant_id: variantId,
      variant_info: variantInfo,
    });
    setAdding(false);
    window.dispatchEvent(new Event("cartUpdated"));
    alert("Added to cart!");
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in your browser. Please use Chrome."
      );
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    setListening(true);
    recognition.start();
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      const capitalized = transcript.charAt(0).toUpperCase() + transcript.slice(1);
      setQuestion(capitalized);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  const askQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setAnswer("");
    const res = await api.productQA(product.id, question);
    setAnswer(res.answer || "Could not get an answer.");
    setAsking(false);
  };

  if (!product)
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-sm text-gray-500">
        Loading...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-100 rounded-2xl h-72 overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>

        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 mb-3">
            {product.rating_count > 0 ? (
              <>
                <span className="text-yellow-400">★</span>
                <span className="text-sm text-gray-500">
                  {product.rating_avg}
                </span>
                <span className="text-sm text-gray-400">
                  ({product.rating_count} reviews)
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-400">No reviews yet</span>
            )}
          </div>

          <p className="text-2xl font-bold text-gray-900 mb-1">
            ₹{getAdjustedPrice().toLocaleString()}
          </p>
          {Object.values(selectedVariants).some(
            (v) => v.price_modifier !== 0
          ) && (
            <p className="text-xs text-gray-400 mb-2">
              Base price: ₹{product.price?.toLocaleString()}
            </p>
          )}
          <p className="text-sm text-gray-500 mb-4">
            In stock: {product.stock_qty}
          </p>

          {product.description && (
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {product.description}
            </p>
          )}

          {variantTypes.map((type) => (
            <div key={type} className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">{type}</p>
              <div className="flex flex-wrap gap-2">
                {variants[type].map((option) => (
                  <button
                    key={option.id}
                    onClick={() =>
                      setSelectedVariants((prev) => ({
                        ...prev,
                        [type]: option,
                      }))
                    }
                    className={`px-3 py-1.5 text-sm border rounded-lg transition-all ${
                      selectedVariants[type]?.id === option.id
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {option.variant_value}
                    {option.price_modifier > 0 && (
                      <span className="text-xs ml-1 opacity-70">
                        +₹{option.price_modifier}
                      </span>
                    )}
                    {option.price_modifier < 0 && (
                      <span className="text-xs ml-1 opacity-70">
                        -₹{Math.abs(option.price_modifier)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={addToCart}
            disabled={adding || !allSelected || product.stock_qty === 0}
            className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-50 mt-2"
          >
            {adding
              ? "Adding..."
              : product.stock_qty === 0
              ? "Out of stock"
              : !allSelected
              ? "Select options above"
              : "Add to cart"}
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Ask about this product
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Get AI-powered answers based on the product description
        </p>
        <form onSubmit={askQuestion} className="flex gap-2 mb-4">
          <div className="flex-1 flex border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:border-gray-400">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Is this good for beginners? What material is it made of?"
              className="flex-1 px-4 py-2.5 text-sm outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={startListening}
              title="Speak your question"
              className={`px-3 border-l border-gray-200 transition-colors ${
                listening
                  ? "text-red-500 animate-pulse"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              🎤
            </button>
          </div>
          <button
            type="submit"
            disabled={asking}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            {asking ? "Asking..." : "Ask"}
          </button>
        </form>
        {answer && (
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
            {answer}
          </div>
        )}
      </div>
    </div>
  );
}