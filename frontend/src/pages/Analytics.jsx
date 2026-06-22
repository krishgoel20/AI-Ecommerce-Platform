import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

const SAMPLE_QUERIES = [
  "What is the total revenue from all orders?",
  "Which products have the highest stock quantity?",
  "How many orders have been placed?",
  "What is the average order value?",
];

export default function Analytics() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    const data = await api.nlAnalytics(query);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate("/")}
        className="text-sm text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1"
      >
        ← Home
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Analytics Dashboard
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Ask business questions in plain English
      </p>

      <form onSubmit={handleQuery} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. What is the total revenue from all orders?"
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? "Running..." : "Run"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mb-8">
        {SAMPLE_QUERIES.map((q, i) => (
          <button
            key={i}
            onClick={() => setQuery(q)}
            className="text-xs border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:bg-gray-50"
          >
            {q}
          </button>
        ))}
      </div>

      {result && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-1">SQL generated</p>
            <code className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 block text-gray-700 overflow-x-auto">
              {result.sql_generated}
            </code>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-2">Results</p>
            {result.results?.length === 0 ? (
              <p className="text-sm text-gray-500">No results found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {Object.keys(result.results[0]).map((key) => (
                        <th key={key} className="text-left text-xs text-gray-400 font-medium pb-2 pr-4">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map((row, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="py-2 pr-4 text-gray-700">
                            {val?.toString()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}