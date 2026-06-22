from groq import Groq
from config import GROQ_API_KEY
from collections import defaultdict

client = Groq(api_key=GROQ_API_KEY)

def get_recommendations(user_id: int, all_interactions: list, all_products: list) -> list:
    user_products = set()
    product_users = defaultdict(set)

    for interaction in all_interactions:
        uid = interaction["user_id"]
        pid = interaction["product_id"]
        product_users[pid].add(uid)
        if uid == user_id:
            user_products.add(pid)

    similar_users = set()
    for pid in user_products:
        for uid in product_users[pid]:
            if uid != user_id:
                similar_users.add(uid)

    if not similar_users:
        return []

    scores = defaultdict(int)
    weights = {"purchase": 4, "cart": 3, "wishlist": 2, "view": 1}

    for interaction in all_interactions:
        if interaction["user_id"] in similar_users:
            pid = interaction["product_id"]
            if pid not in user_products:
                scores[pid] += weights.get(interaction["interaction_type"], 1)

    recommended_ids = sorted(scores, key=scores.get, reverse=True)[:5]
    products_map = {p["id"]: p for p in all_products}
    recommended_products = [products_map[pid] for pid in recommended_ids if pid in products_map]

    if not recommended_products:
        return []

    product_list = "\n".join([f"- {p['name']} (₹{p['price']})" for p in recommended_products])
    prompt = f"""You are a shopping assistant. Based on a customer's activity, we're recommending:
{product_list}
Write one friendly sentence explaining why these might interest them. Under 30 words."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=60,
        temperature=0.5
    )

    explanation = response.choices[0].message.content.strip()
    return [{"product": p, "explanation": explanation} for p in recommended_products]