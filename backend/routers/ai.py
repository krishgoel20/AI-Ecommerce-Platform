from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_connection, get_cursor
from ai.nl_search import generate_search_sql
from ai.product_qa import answer_question
from ai.analytics import generate_analytics_sql
from ai.recommendations import get_recommendations

router = APIRouter()

class SearchQuery(BaseModel):
    query: str

class QARequest(BaseModel):
    product_id: int
    question: str

class AnalyticsQuery(BaseModel):
    query: str

@router.post("/search", summary="NL Search")
def nl_search(search: SearchQuery):
    try:
        sql = generate_search_sql(search.query)
        conn = get_connection()
        cursor = get_cursor(conn)
        try:
            cursor.execute(sql)
            results = cursor.fetchall()
            return {
                "query": search.query,
                "sql_generated": sql,
                "results": results
            }
        finally:
            cursor.close()
            conn.close()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/index-products", summary="Index Products")
def index_products():
    from ai.product_qa import build_index
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute("SELECT id, name, description, price, rating_avg FROM products")
        products = cursor.fetchall()
        build_index(products)
        return {"message": f"Indexed {len(products)} products successfully"}
    finally:
        cursor.close()
        conn.close()

@router.post("/qa", summary="Product Q&A")
def product_qa(req: QARequest):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute(
            "SELECT id, name, description, price, rating_avg FROM products WHERE id = %s",
            (req.product_id,)
        )
        product = cursor.fetchone()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        answer = answer_question(req.question, product)
        return {
            "product": product["name"],
            "question": req.question,
            "answer": answer
        }
    finally:
        cursor.close()
        conn.close()

from routers.auth import require_admin

@router.post("/analytics", summary="NL Analytics")
def nl_analytics(req: AnalyticsQuery, admin_id: int = Depends(require_admin)):
    try:
        sql = generate_analytics_sql(req.query)
        conn = get_connection()
        cursor = get_cursor(conn)
        try:
            cursor.execute(sql)
            results = cursor.fetchall()
            return {
                "query": req.query,
                "sql_generated": sql,
                "results": results
            }
        finally:
            cursor.close()
            conn.close()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations", summary="AI Recommendations")
def recommendations(user_id: int):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute("SELECT user_id, product_id, interaction_type FROM user_interactions")
        all_interactions = cursor.fetchall()

        cursor.execute("SELECT id, name, price, description FROM products")
        all_products = cursor.fetchall()

        recs = get_recommendations(user_id, all_interactions, all_products)

        if not recs:
            return {"message": "Not enough interaction data yet for recommendations", "recommendations": []}

        return {"user_id": user_id, "recommendations": recs}
    finally:
        cursor.close()
        conn.close()