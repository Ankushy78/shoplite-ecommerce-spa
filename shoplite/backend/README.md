# E-commerce Backend (Express + SQLite + JWT)

## Quick start
```bash
cd backend
npm install
npm run dev    # starts API on http://localhost:5000
# First run will create data.db automatically
node seed.js   # optional: seeds sample items
```
## Auth
- POST /api/auth/signup  {name,email,password}
- POST /api/auth/login   {email,password}

## Items
- GET /api/items?q=&category=&minPrice=&maxPrice=&page=&limit=
- POST /api/items  (auth required)
- PUT /api/items/:id (auth)
- DELETE /api/items/:id (auth)

## Cart (auth)
- GET /api/cart
- POST /api/cart/add {itemId, qty}
- POST /api/cart/update {itemId, qty}

Set `JWT_SECRET` via `.env` in production.
