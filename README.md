# ShopMind 🛍️

A full-stack AI-native E-commerce platform where natural language is the primary interface — a real product with multiple AI features, a complete shopping flow, and role-based access.

---

## What it does

**For customers:**
- Browse products across categories with product variant selection (size, weight, volume, etc.)
- Search in plain English — *"wireless headphones under ₹5000"* — and get SQL-powered results
- Ask questions about any product and get instant AI answers grounded in the product description (with voice input support)
- Get AI-generated product comparisons — *"Compare this with the Laptop"*
- Use the Budget Optimizer — enter a budget and goal, AI builds the best cart
- Use Occasion-based Shopping — describe an occasion (*"birthday gift for a 10-year-old"*), AI curates a tailored product list with reasons
- Add to cart, adjust quantities, choose a payment method, and place orders
- Receive an HTML e-mail receipt with order summary and tracking status
- Reset forgotten passwords via a secure e-mail link

**For admins:**
- Ask business questions in plain English — *"What is the total revenue from all orders?"* — and get real-time SQL-powered answers
- Full access to all customer features plus the analytics dashboard

**For guests:**
- Browse products and search without creating an account
- Prompted to sign-in only when adding to cart

---

## What makes ShopMind different

Most e-commerce platforms use keyword search and fixed analytics dashboards. ShopMind replaces these with a conversational AI layer:

| Feature | Traditional approach | ShopMind |
|---|---|---|
| **Search** | Keyword matching | Natural language → SQL via LLaMA |
| **Product Q&A** | Crowdsourced human answers | Instant RAG-based answers from product data |
| **Analytics** | Fixed predefined reports | Ask any business question in plain English |
| **Recommendations** | Black-box algorithm | Collaborative filtering + LLM explanation |
| **Comparison** | Manual side-by-side research | AI generates structured comparison instantly |
| **Budget Planning** | Manual cart building | AI curates optimal cart within budget |
| **Gift shopping** | Category browsing | AI understands occasion context and intent |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4, React Router v6 |
| Backend | Python, FastAPI |
| Database | MySQL 8.0 |
| AI / LLM | Groq API (`llama-3.3-70b-versatile`) |
| Embeddings | `sentence-transformers` — `all-MiniLM-L6-v2` |
| Vector store | FAISS |
| Auth | JWT (`python-jose`), bcrypt |
| E-mail | Gmail SMTP (`smtplib`) |
| Voice input | Web Speech API |

---

## How it works

```
User visits ShopMind
        ↓
Auth check
        ├── Guest → browse and search only (prompted to login on cart add)
        └── Login/Register → full access
        ↓
Home page loads
        ├── Collaborative filtering scores user_interactions table
        └── LLaMA generates recommendation explanation → shown on home page
        ↓
User types plain English query into search bar
        ↓
LLaMA converts query to MySQL SELECT statement
        ↓
Safety validator checks for destructive keywords (DROP, DELETE, UPDATE)
        ↓
MySQL executes query → matching products returned as cards
        ↓
User clicks a product → product detail page
        ↓
Variant selector loads (size / weight / volume) → price adjusts dynamically
        ↓
[Optional] User asks a question (typed or voice via Web Speech API)
        ↓
Product description fetched from MySQL → injected into LLaMA prompt (RAG)
        ↓
LLaMA generates grounded answer → displayed below question input
        ↓
[Optional] User compares with another product
        ↓
Both products fetched → LLaMA generates structured comparison
        ↓
User adds to cart → cart_items saved with variant_id and variant_info
        ↓
[Optional] Budget Optimizer → budget + goal → LLaMA curates cart within budget
[Optional] Occasion Shopping → occasion description → LLaMA curates by intent
        ↓
Cart page → quantities adjusted (−/+) → shipping address entered
        ↓
Payment page → UPI / Card / Net Banking / COD selected
        ↓
Pay button → 2-second processing simulation
        ↓
Order placed → orders + order_items written to MySQL
        ↓
E-mail receipt sent via Gmail SMTP in background thread
        ↓
Success screen → redirects to Orders page
        ↓
Orders page → visual timeline (Placed → Processing → Shipped → Delivered)
        ↓
[Admin only] Analytics page → plain English question
        ↓
LLaMA generates multi-table SQL → MySQL executes → results table displayed
```

## Features

### AI Features
- **Natural Language Search** — Type queries like *"wireless headphones under ₹5000 with noise cancellation"* and LLaMA generates the SQL query dynamically
- **RAG Product Q&A** — Ask questions about any product and get grounded answers from the actual product description using FAISS + LLaMA. Includes voice input support
- **NL Analytics Dashboard** — Admin asks business questions in plain English; LLaMA generates multi-table SQL and returns real-time results
- **AI Recommendations** — Collaborative filtering surfaces relevant products with a natural language explanation of why they're recommended
- **Comparison Assistant** — Compare any 2 products with AI-generated analysis covering price, features, ratings, and a clear recommendation
- **Budget Optimizer** — Enter a budget and shopping goal; AI curates the best possible cart that maximizes value within the budget
- **Occasion-based Shopping** — Describe an occasion (*"birthday gift for a 10-year old"*, *"housewarming gift"*) and AI selects contextually appropriate products with reasons

### E-commerce Features
- **Category browsing** — 9 product categories with emoji navigation
- **Product variants** — Size, weight, volume, colour selectors with dynamic price adjustment
- **Cart management** — Quantity controls (−/+), real-time badge count, variant info
- **Checkout & Payments** — UPI, Credit/Debit Card, Net Banking, and Cash on Delivery simulation
- **Order tracking** — Visual timeline (Placed → Processing → Shipped → Delivered)
- **E-mail receipts** — HTML order confirmation e-mails with order summary and tracking status via Gmail SMTP
- **Order history** — Full order history with line items and shipping details

### Auth & Access
- **JWT authentication** — 7-day token expiry, role-based access control
- **Role-based access** — Admin (full access) v/s Customer (no Analytics)
- **Guest browsing** — Browse and search without an account
- **Forgot password** — Secure token-based password reset via e-mail

---

## Project Structure

```
ShopMind/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── database.py              # MySQL connection
│   ├── config.py                # Environment variables
│   ├── requirements.txt
│   ├── routers/
│   │   ├── auth.py              # Register, login, forgot/reset password
│   │   ├── products.py          # Product CRUD + variants
│   │   ├── cart.py              # Cart management
│   │   ├── orders.py            # Order placement + history + e-mail
│   │   ├── categories.py        # Category listing
│   │   └── ai.py                # AI endpoints
│   ├── schemas/
│   │   └── models.py            # Pydantic schemas
│   ├── ai/
│   │   ├── nl_search.py         # Natural language → SQL search
│   │   ├── product_qa.py        # FAISS + RAG Q&A
│   │   ├── analytics.py         # NL business analytics
│   │   ├── recommendations.py   # Collaborative filtering
│   │   ├── comparison.py        # AI product comparison
│   │   ├── budget_optimizer.py  # Budget-constrained cart building
│   │   ├── occasion_shopping.py # Occasion-aware product curation
│   └── utils/
│       └── email.py             # Order confirmation + Password reset e-mails
└── frontend/
    └── src/
        ├── api.js               # Centralised API client
        ├── App.jsx              # Routes + role-based access
        ├── components/
        │   ├── Navbar.jsx       # Sticky nav with live cart badge
        │   └── ProductCard.jsx  # Product grid card
        └── pages/
            ├── Home.jsx              # Category browsing + NL search + recommendations
            ├── ProductDetail.jsx     # Product variants + voice Q&A + comparison
            ├── Cart.jsx              # Cart with quantity controls
            ├── Payment.jsx           # Payment methods + order summary
            ├── Orders.jsx            # Order history with tracking timeline
            ├── Analytics.jsx         # Admin NL analytics dashboard
            ├── BudgetOptimizer.jsx   # AI budget-based cart builder
            ├── OccasionShopping.jsx  # AI occasion-aware shopping
            ├── Login.jsx             # Login + guest access
            ├── Register.jsx          # Customer registration
            ├── ForgotPassword.jsx
            └── ResetPassword.jsx
```

---

## Database Schema

12 core tables:

```
users              — customer accounts with role (admin/customer)
categories         — product categories with self-referencing parent
products           — product catalog with rating denormalisation
product_images     — multiple images per product, primary flag
product_variants   — size/weight/volume/colour options with price modifiers
cart               — one cart per user
cart_items         — items in cart with variant reference
orders             — order snapshots with status enum
order_items        — line items with price locked at purchase time
reviews            — one review per user per product
user_interactions  — view/cart/wishlist/purchase events for recommendations
password_reset_tokens — secure token-based password reset
```
 
---

## Setup and Installation

### Pre-requisites
- Python 3.11+
- Node.js 18+
- MySQL 8.0
- Groq API key ([console.groq.com](https://console.groq.com))
- Gmail account with App Password enabled

### 1. Clone the repository

```bash
git clone https://github.com/krishgoel20/AI-Ecommerce-Platform.git
cd AI-Ecommerce-Platform
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file inside the `backend/` folder:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db

SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

GROQ_API_KEY=your_groq_api_key
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
```

### 4. Run the backend

Run the database schema:

```bash
mysql -u root -p < ecommerce_schema.sql
```

Start the backend:

```bash
uvicorn main:app --reload
```

API runs at `http://127.0.0.1:8000` - interactive docs available at `/docs`.

### 5. Open the frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

### 6. Demo Credentials

| Role | E-mail | Password |
|---|---|---|
| Admin | admin@shopmind.com | Admin@123 |
| Customer | Register at `/register` | — |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new customer |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/forgot-password` | Send password reset e-mail |
| POST | `/api/auth/reset-password` | Reset password with token |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products/` | List all products (optional `?category_id=`) |
| GET | `/api/products/{id}` | Single product with image |
| POST | `/api/products/` | Create product (admin) |
| GET | `/api/products/{id}/variants` | Product variants grouped by type |

### Cart & Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cart/` | Get cart items |
| POST | `/api/cart/` | Add item with optional variant |
| PUT | `/api/cart/{product_id}` | Update quantity |
| DELETE | `/api/cart/{product_id}` | Remove item |
| POST | `/api/orders/` | Place order + send e-mail receipt |
| GET | `/api/orders/` | Order history |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/search` | NL product search |
| POST | `/api/ai/index-products` | Build FAISS index |
| POST | `/api/ai/qa` | RAG product Q&A |
| POST | `/api/ai/analytics` | NL business analytics (admin only) |
| GET | `/api/ai/recommendations` | Collaborative filtering recommendations |
| POST | `/api/ai/compare` | AI product comparison |
| POST | `/api/ai/budget-optimize` | Budget-constrained cart building |
| POST | `/api/ai/occasion-shop` | Occasion-aware product curation |

---

## Key Concepts Demonstrated

- **RAG (Retrieval-Augmented Generation)** — Product Q&A fetches the actual product description from the database and injects it as context into the LLM prompt, ensuring answers are grounded in real data rather than hallucinated from training knowledge.
- **Text-to-SQL** — Both NL Search and the Analytics Dashboard convert natural language to MySQL queries using LLaMA. A safety validator strips non-SELECT statements before execution. The analytics endpoint handles multi-table joins spanning orders, products and users.
- **Collaborative Filtering** — `user_interactions` tracks every meaningful engagement event. The recommendation engine finds users with similar interaction histories and scores products they've engaged with that the target user hasn't seen.
- **JWT Role-based Access Control** — Tokens carry a `role` field (`admin` or `customer`). The frontend decodes this client-side to conditionally render navigation. The backend enforces it server-side via a `require_admin` FastAPI dependency.
- **Structured LLM Output** — Budget Optimizer and Occasion Shopping prompt LLaMA to return strict JSON with product IDs, quantities and reasons. The backend parses and validates this before returning it to the frontend, enabling dynamic UI rendering from AI output.
- **Background Threading** — Order confirmation e-mails are sent in a `daemon=True` background thread so the payment response returns immediately without waiting for SMTP.
- **Secure Password Reset** — Reset tokens are generated with `secrets.token_urlsafe(32)`, stored with a 1-hour expiry and a `used` boolean. Once consumed, the token cannot be reused.
- **Product Variants with Price Modifiers** — The `product_variants` table stores `price_modifier` values that adjust the base price dynamically. The cart and order system correctly stores and displays the variant-adjusted price at purchase time.

---

## Limitations

- **No real payment processing** — The payment flow is simulated. No actual money moves. Integrating Razorpay or Stripe would require business verification.
- **No cloud deployment** — The app runs locally only. Backend and frontend both require local servers to be running.
- **Product images are stock photos** — Images are sourced from Unsplash and don't represent actual products. A production app would use manufacturer-provided or studio-photographed images.
- **Collaborative filtering requires data** — The recommendation engine needs meaningful `user_interactions` data to surface results. With a fresh database, it returns empty recommendations.
- **FAISS index is in-memory** — The product Q&A vector index is built at runtime and lost on server restart. Calling `/api/ai/index-products` rebuilds it. A production system would persist the index to disk.
- **LLM responses are non-deterministic** — SQL generated by LLaMA may occasionally produce unexpected queries. The safety validator blocks destructive operations but edge cases in query structure are possible.
- **No order cancellation or returns** — The order status enum supports `cancelled` but no cancellation flow is implemented in the frontend.

---
