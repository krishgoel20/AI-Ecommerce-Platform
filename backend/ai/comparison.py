from groq import Groq
from config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def compare_products(product_a: dict, product_b: dict, user_query: str = "") -> str:
    def format_product(p):
        return f"""
Name: {p['name']}
Price: ₹{p['price']:,.0f}
Description: {p.get('description') or 'No description available'}
Rating: {p.get('rating_avg', 0)}/5 ({p.get('rating_count', 0)} reviews)
In stock: {p.get('stock_qty', 0)} units
"""

    prompt = f"""You are a helpful shopping assistant. A customer wants to compare two products.

Product A:
{format_product(product_a)}

Product B:
{format_product(product_b)}

{"Customer's specific question: " + user_query if user_query else ""}

Write a clear, helpful comparison covering:
1. Price difference and value for money
2. Key differences based on their descriptions
3. Ratings and popularity
4. Who each product is better suited for
5. Your recommendation

Be concise, friendly and specific. Use the actual product names throughout."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400,
        temperature=0.4
    )
    return response.choices[0].message.content.strip()