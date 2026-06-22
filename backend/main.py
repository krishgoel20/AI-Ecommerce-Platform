from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, products, cart, orders, ai, categories

app = FastAPI(
    title="ShopMind API",
    description="AI-powered e-commerce platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(cart.router, prefix="/api/cart", tags=["Cart"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])

@app.get("/")
def root():
    return {"message": "ShopMind API is running"}