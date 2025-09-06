# ShopLite — Single Page E-commerce (JWT Auth, Filters, Cart)

This repo contains:
- **Backend**: Node.js + Express + SQLite + JWT (auth, item CRUD with filters, cart APIs)
- **Frontend**: React (Vite) + Tailwind (SPA with signup/login, listing with filters, cart add/remove; cart persists on server per user)

## Run locally

### 1) Backend
```bash
cd backend
npm install
npm run dev           # starts http://localhost:5000
node seed.js          # optional, to seed sample products
```

### 2) Frontend
```bash
cd frontend
npm install
npm run dev           # opens http://localhost:5173
```
Ensure `frontend/.env` has `VITE_API_URL=http://localhost:5000`

---

## Deploy (free-tier friendly)

### Backend → Render
1. Push `/backend` to a GitHub repo.
2. On Render: **New Web Service** → connect your repo.
3. Build command: `npm install`  
   Start command: `node server.js`
4. Add environment variables:
   - `JWT_SECRET` (strong random)
   - `PORT` = `10000` (Render assigns) or leave blank.
5. After deploy, note the public URL, e.g. `https://your-api.onrender.com`.

### Frontend → Vercel
1. Push `/frontend` to a GitHub repo.
2. On Vercel: **New Project** → import repo.
3. Add env var:
   - `VITE_API_URL` = your Render API URL (e.g., `https://your-api.onrender.com`)
4. Deploy; you'll get a live website link like `https://shoplite-yourname.vercel.app`.

---

## API Summary
**Auth**
- `POST /api/auth/signup` `{name,email,password}` → `{user, token}`
- `POST /api/auth/login`  `{email,password}` → `{user, token}`

**Items (CRUD + filters)**
- `GET /api/items?q=&category=&minPrice=&maxPrice=&page=&limit=`
- `POST /api/items` *(auth required)*
- `PUT /api/items/:id` *(auth)*
- `DELETE /api/items/:id` *(auth)*

**Cart (persists per user on server)**
- `GET /api/cart` *(auth)*
- `POST /api/cart/add` `{itemId, qty}` *(auth)*
- `POST /api/cart/update` `{itemId, qty}` *(auth)*

---

## Notes
- SQLite DB file `backend/data.db` is created on first run. For production persistence on Render, use Render Disks or migrate to PostgreSQL.
- Design is intentionally clean and minimal; tweak Tailwind styles in `frontend/src/styles.css`.
