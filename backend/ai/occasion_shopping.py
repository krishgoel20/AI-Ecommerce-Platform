from groq import Groq
from config import GROQ_API_KEY
import json

client = Groq(api_key=GROQ_API_KEY)

def occasion_shop(occasion: str, budget: float, products: list) -> dict:
    product_list = "\n".join([
        f"ID:{p['id']} | {p['name']} | ₹{p['price']:,.0f} | Category:{p.get('category_name','Unknown')} | {p.get('description','')[:80] or 'No description'}"
        for p in products if p['stock_qty'] > 0
    ])

    budget_clause = f"Stay within a budget of ₹{budget:,.0f}." if budget > 0 else "No strict budget constraint."

    prompt = f"""You are a thoughtful personal shopping assistant. A customer needs help shopping for this occasion:

"{occasion}"

{budget_clause}

Available products:
{product_list}

Select the most appropriate products for this specific occasion. Consider:
1. Who the occasion is for (age, gender, relationship if mentioned)
2. The sentiment and theme of the occasion
3. Which products would be most meaningful or useful
4. A good mix that covers the occasion well
5. Only include in-stock products

Respond ONLY with valid JSON, no markdown:
{{
  "occasion_title": "<short title for this occasion>",
  "selected": [
    {{"id": <product_id>, "name": "<name>", "price": <price>, "quantity": 1, "reason": "<why this fits the occasion>"}}
  ],
  "total": <total_price>,
  "message": "<warm 2-3 sentence message about why this selection is perfect for the occasion>"
}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=600,
        temperature=0.5
    )

    raw = response.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "occasion_title": occasion,
            "selected": [],
            "total": 0,
            "message": "Could not generate recommendations. Please try describing your occasion differently."
        }