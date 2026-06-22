from groq import Groq
from config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

ANALYTICS_SCHEMA = """
Tables:
- users: id, name, email, created_at
- products: id, name, price, stock_qty, rating_avg, rating_count, category_id
- orders: id, user_id, total_amount, status, created_at
- order_items: id, order_id, product_id, quantity, price_at_purchase
"""

def generate_analytics_sql(query: str) -> str:
    prompt = f"""You are a SQL expert for an e-commerce business analytics dashboard.
Convert the admin's natural language question into a MySQL SELECT query.

Database schema:
{ANALYTICS_SCHEMA}

Rules:
- Only generate SELECT queries
- Never use DROP, DELETE, INSERT, UPDATE
- Use JOINs when needed across tables
- Use aggregate functions (SUM, COUNT, AVG) for business metrics
- Limit results to 20 rows maximum
- Return ONLY the raw SQL query, no explanation, no markdown, no backticks

Admin question: {query}

SQL:"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300,
        temperature=0
    )

    sql = response.choices[0].message.content.strip()
    sql = sql.replace("```sql", "").replace("```", "").strip()

    sql_upper = sql.upper()
    if not sql_upper.startswith("SELECT"):
        raise ValueError("Only SELECT queries are allowed")
    for keyword in ["DROP", "DELETE", "INSERT", "UPDATE"]:
        if keyword in sql_upper:
            raise ValueError(f"Unsafe keyword detected: {keyword}")

    return sql