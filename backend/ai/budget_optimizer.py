from groq import Groq
from config import GROQ_API_KEY
import json

client = Groq(api_key=GROQ_API_KEY)

def optimize_budget(budget: float, goal: str, products: list) -> dict:
    product_list = "\n".join([
        f"ID:{p['id']} | {p['name']} | ₹{p['price']:,.0f} | Stock:{p['stock_qty']} | {p.get('description','')[:80] or 'No description'}"
        for p in products if p['stock_qty'] > 0
    ])

    prompt = f"""You are a smart shopping assistant. A customer has a budget of ₹{budget:,.0f} and wants to buy: "{goal}".

Available products:
{product_list}

Select the best combination of products that:
1. Stays within the total budget of ₹{budget:,.0f}
2. Best matches the customer's goal
3. Maximizes value for money
4. Only includes in-stock products

Respond ONLY with a valid JSON object in this exact format, no markdown, no explanation:
{{
  "selected": [
    {{"id": <product_id>, "name": "<name>", "price": <price>, "quantity": <quantity>, "reason": "<why this product fits the goal>"}}
  ],
  "total": <total_price>,
  "remaining_budget": <budget_minus_total>,
  "summary": "<2-3 sentence explanation of why this combination is ideal for the goal>"
}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=600,
        temperature=0.3
    )

    raw = response.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "selected": [],
            "total": 0,
            "remaining_budget": budget,
            "summary": "Could not generate a recommendation. Please try a different goal or budget."
        }