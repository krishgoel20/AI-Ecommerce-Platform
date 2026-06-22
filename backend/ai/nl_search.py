from groq import Groq
from config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

SCHEMA = """
Table: products
Columns: id, name, description, price, stock_qty, rating_avg, rating_count
"""

def validate_sql(sql: str) -> bool:
    sql_upper = sql.upper().strip()
    return (
        sql_upper.startswith("SELECT") and
        "DROP" not in sql_upper and
        "DELETE" not in sql_upper and
        "INSERT" not in sql_upper and
        "UPDATE" not in sql_upper
    )

def generate_search_sql(query: str) -> str:
    prompt = f"""You are a SQL expert. Convert the user's natural language product search into a MySQL SELECT query.

Schema:
{SCHEMA}

Rules:
- Only generate SELECT queries on the products table
- Always select: id, name, description, price, stock_qty, rating_avg, rating_count
- Use LIKE for text searches on name or description
- Use price comparisons for price-related queries
- Limit results to 10
- Return ONLY the raw SQL query, no explanation, no markdown, no backticks

User query: {query}

SQL:"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        temperature=0
    )

    sql = response.choices[0].message.content.strip()
    sql = sql.replace("```sql", "").replace("```", "").strip()

    if not validate_sql(sql):
        raise ValueError("Generated query failed safety check")

    return sql