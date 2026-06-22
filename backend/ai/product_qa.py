from groq import Groq
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)
embedder = SentenceTransformer("all-MiniLM-L6-v2")

_index = None
_product_docs = []

def build_index(products: list):
    global _index, _product_docs
    _product_docs = []
    texts = []
    for p in products:
        doc = f"Product: {p['name']}. Description: {p['description'] or 'No description'}. Price: {p['price']}. Rating: {p['rating_avg']}."
        _product_docs.append({"text": doc, "product": p})
        texts.append(doc)
    embeddings = embedder.encode(texts, convert_to_numpy=True)
    dim = embeddings.shape[1]
    _index = faiss.IndexFlatL2(dim)
    _index.add(embeddings.astype(np.float32))

def answer_question(question: str, product: dict) -> str:
    context = f"Product: {product['name']}. Description: {product['description'] or 'No description available'}. Price: ₹{product['price']}. Rating: {product['rating_avg']}/5."

    prompt = f"""You are a helpful shopping assistant. Answer the customer's question about this specific product using only the information provided below.

Product information:
{context}

Customer question: {question}

Answer concisely and helpfully:"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        temperature=0.3
    )
    return response.choices[0].message.content.strip()