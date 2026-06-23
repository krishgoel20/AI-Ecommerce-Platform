# ShopMind 🛍️

A full-stack AI-native E-commerce platform where natural language is the primary interface — search, product Q&A, business analytics and recommendations are all powered by LLMs instead of traditional keyword matching.

---

## What makes ShopMind different

Most E-commerce platforms use keyword search and fixed analytics dashboards. ShopMind replaces these with a conversational AI layer:

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

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI (Python) |
| Database | MySQL 8.0 |
| Vector store | FAISS |
| Embeddings | sentence-transformers (`all-MiniLM-L6-v2`) |
| LLM provider | Groq API (`llama-3.3-70b-versatile`) |
| Auth | JWT via `python-jose`, bcrypt |
| E-mail | Gmail SMTP (`smtplib`) |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| Voice input | Web Speech API |

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
│   │   └── ai.py                # All 7 AI endpoints
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
│       └── email.py             # Order confirmation + password reset e-mails
└── frontend/
    └── src/
        ├── api.js               # Centralised API client
        ├── App.jsx              # Routes + role-based access
        ├── components/
        │   ├── Navbar.jsx       # Sticky nav with live cart badge
        │   └── ProductCard.jsx  # Product grid card
        └── pages/
            ├── Home.jsx              # Category browsing + NL search + recommendations
            ├── ProductDetail.jsx     # Product page + variants + voice Q&A + comparison
            ├── Cart.jsx              # Cart with quantity controls
            ├── Payment.jsx           # Payment methods + order summary
            ├── Orders.jsx            # Order history + tracking timeline
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

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db

SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

GROQ_API_KEY=your_groq_api_key
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

Run the database schema:

```bash
mysql -u root -p < backend/ecommerce_schema.sql
```

Start the server:

```bash
uvicorn main:app --reload
```

API docs available at `http://127.0.0.1:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

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

## Credentials (Demo)

| Role | E-mail | Password |
|---|---|---|
| Admin | admin@shopmind.com | Admin@123 |
| Customer | (register via /register) | — |

---
