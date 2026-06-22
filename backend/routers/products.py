from fastapi import APIRouter, HTTPException
from schemas.models import ProductCreate, ProductResponse
from database import get_connection, get_cursor
from typing import List

router = APIRouter()

PRODUCT_SELECT = """
    SELECT p.id, p.name, p.description, p.price, p.stock_qty,
           p.category_id, p.rating_avg, p.rating_count,
           pi.image_url
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
"""

@router.get("/", response_model=List[ProductResponse])
def get_products(category_id: int = None):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        if category_id:
            cursor.execute(PRODUCT_SELECT + " WHERE p.category_id = %s", (category_id,))
        else:
            cursor.execute(PRODUCT_SELECT)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute(PRODUCT_SELECT + " WHERE p.id = %s", (product_id,))
        product = cursor.fetchone()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    finally:
        cursor.close()
        conn.close()

@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(product: ProductCreate):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute(
            """INSERT INTO products (name, description, price, stock_qty, category_id)
               VALUES (%s, %s, %s, %s, %s)""",
            (product.name, product.description, product.price, product.stock_qty, product.category_id)
        )
        conn.commit()
        product_id = cursor.lastrowid
        cursor.execute(PRODUCT_SELECT + " WHERE p.id = %s", (product_id,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

@router.get("/{product_id}/variants")
def get_product_variants(product_id: int):
    conn = get_connection()
    cursor = get_cursor(conn)
    try:
        cursor.execute(
            """SELECT id, product_id, variant_type, variant_value,
                      price_modifier, stock_qty
               FROM product_variants
               WHERE product_id = %s
               ORDER BY variant_type, id""",
            (product_id,)
        )
        variants = cursor.fetchall()
        grouped = {}
        for v in variants:
            vtype = v["variant_type"]
            if vtype not in grouped:
                grouped[vtype] = []
            grouped[vtype].append(v)
        return {"product_id": product_id, "variants": grouped}
    finally:
        cursor.close()
        conn.close()