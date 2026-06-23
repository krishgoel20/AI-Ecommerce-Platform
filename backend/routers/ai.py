from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from database import get_connection, get_cursor
from ai.nl_search import generate_search_sql
from ai.product_qa import answer_question
from ai.analytics import generate_analytics_sql
from ai.recommendations import get_recommendations
from ai.comparison import compare_products
from ai.budget_optimizer import optimize_budget
from ai.occasion_shopping import occasion_shop

router = APIRouter()

class SearchQuery(BaseModel):
    query: str

class QARequest(BaseModel):
    product_id: int
    question: str

class AnalyticsQuery(BaseModel):
    query: str

class CompareRequest(BaseModel):
    product_id: int
    compare_with: str
    query: Optional[str] = None

class BudgetRequest(BaseModel):
    budget: float
    goal: str

class OccasionRequest(BaseModel):
    occasion: str
    budget: float = 0

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

@router.post("/compare", summary="Compare Products")
def compare(req: CompareRequest):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute(
            """SELECT p.id, p.name, p.description, p.price, p.stock_qty,
                      p.rating_avg, p.rating_count
               FROM products p
               WHERE p.id = %s""",
            (req.product_id,)
        )
        product_a = cursor.fetchone()
        if not product_a:
            raise HTTPException(status_code=404, detail="Product not found")

        cursor.execute(
            """SELECT p.id, p.name, p.description, p.price, p.stock_qty,
                      p.rating_avg, p.rating_count
               FROM products p
               WHERE p.name LIKE %s
               LIMIT 1""",
            (f"%{req.compare_with}%",)
        )
        product_b = cursor.fetchone()
        if not product_b:
            raise HTTPException(
                status_code=404,
                detail=f"Could not find a product matching '{req.compare_with}'. Try a different name."
            )

        if product_a["id"] == product_b["id"]:
            raise HTTPException(
                status_code=400,
                detail="Please compare with a different product."
            )

        comparison = compare_products(product_a, product_b, req.query or "")
        return {
            "product_a": product_a["name"],
            "product_b": product_b["name"],
            "comparison": comparison
        }
    finally:
        cursor.close()
        conn.close()

@router.post("/budget-optimize", summary="Budget Optimizer")
def budget_optimizer(req: BudgetRequest):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute("""
            SELECT p.id, p.name, p.description, p.price, p.stock_qty,
                   p.rating_avg, pi.image_url
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
        """)
        products = cursor.fetchall()
        result = optimize_budget(req.budget, req.goal, products)
        return result
    finally:
        cursor.close()
        conn.close()

@router.post("/occasion-shop", summary="Occasion Shopping")
def occasion_shopping(req: OccasionRequest):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute("""
            SELECT p.id, p.name, p.description, p.price, p.stock_qty,
                   p.rating_avg, c.name as category_name, pi.image_url
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
        """)
        products = cursor.fetchall()
        result = occasion_shop(req.occasion, req.budget, products)
        return result
    finally:
        cursor.close()
        conn.close()