import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

dotenv.config();

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// Open or create DB
let db;
(async () => {
  db = await open({
    filename: './data.db',
    driver: sqlite3.Database
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT,
      image TEXT
    );
    CREATE TABLE IF NOT EXISTS carts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      qty INTEGER NOT NULL DEFAULT 1,
      UNIQUE(user_id, item_id),
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(item_id) REFERENCES items(id)
    );
  `);
})();

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const hash = bcrypt.hashSync(password, 10);
    try {
      const result = await db.run('INSERT INTO users (name, email, password_hash) VALUES (?,?,?)', [name, email, hash]);
      const user = { id: result.lastID, name, email };
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
      res.json({ user, token });
    } catch (err) {
      if (String(err).includes('UNIQUE')) return res.status(409).json({ error: 'Email already in use' });
      throw err;
    }
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email=?', [email]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const payload = { id: user.id, name: user.name, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: payload, token });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Items CRUD + filters
app.get('/api/items', async (req, res) => {
  const { q, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
  let where = [];
  let params = [];
  if (q) {
    where.push('(title LIKE ? OR description LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (category) {
    where.push('category = ?');
    params.push(category);
  }
  if (minPrice) {
    where.push('price >= ?');
    params.push(Number(minPrice));
  }
  if (maxPrice) {
    where.push('price <= ?');
    params.push(Number(maxPrice));
  }
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const offset = (Number(page) - 1) * Number(limit);
  try {
    const items = await db.all(`SELECT * FROM items ${whereSql} LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
    const { count } = await db.get(`SELECT COUNT(*) as count FROM items ${whereSql}`, params);
    res.json({ items, total: count });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/items', authMiddleware, async (req, res) => {
  const { title, description, price, category, image } = req.body;
  if (!title || price == null) return res.status(400).json({ error: 'Missing title/price' });
  try {
    const r = await db1.run('INSERT INTO items (title, description, price, category, image) VALUES (?,?,?,?,?)',
      [title, description || '', Number(price), category || '', image || '']);
    const item = await db.get('SELECT * FROM items WHERE id=?', [r.lastID]);
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/items/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, description, price, category, image } = req.body;
  try {
    const current = await db.get('SELECT * FROM items WHERE id=?', [id]);
    if (!current) return res.status(404).json({ error: 'Not found' });
    const t = title ?? current.title;
    const d = description ?? current.description;
    const p = price != null ? Number(price) : current.price;
    const c = category ?? current.category;
    const i = image ?? current.image;
    await db.run('UPDATE items SET title=?, description=?, price=?, category=?, image=? WHERE id=?',
      [t, d, p, c, i, id]);
    const updated = await db.get('SELECT * FROM items WHERE id=?', [id]);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/items/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await db.run('DELETE FROM items WHERE id=?', [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Cart
app.get('/api/cart', authMiddleware, async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT c.item_id as itemId, c.qty, i.title, i.price, i.image, i.category
      FROM carts c JOIN items i ON c.item_id = i.id
      WHERE c.user_id = ?
    `, [req.user.id]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/cart/add', authMiddleware, async (req, res) => {
  const { itemId, qty = 1 } = req.body;
  if (!itemId) return res.status(400).json({ error: 'Missing itemId' });
  try {
    const existing = await db.get('SELECT * FROM carts WHERE user_id=? AND item_id=?', [req.user.id, itemId]);
    if (existing) {
      const newQty = existing.qty + Number(qty);
      await db.run('UPDATE carts SET qty=? WHERE id=?', [newQty, existing.id]);
    } else {
      await db.run('INSERT INTO carts (user_id, item_id, qty) VALUES (?,?,?)', [req.user.id, itemId, Number(qty)]);
    }
    const cart = await db.all('SELECT * FROM carts WHERE user_id=?', [req.user.id]);
    res.json({ success: true, cart });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/cart/update', authMiddleware, async (req, res) => {
  const { itemId, qty } = req.body;
  if (!itemId || qty == null) return res.status(400).json({ error: 'Missing itemId/qty' });
  try {
    if (Number(qty) <= 0) {
      await db.run('DELETE FROM carts WHERE user_id=? AND item_id=?', [req.user.id, itemId]);
    } else {
      await db.run('UPDATE carts SET qty=? WHERE user_id=? AND item_id=?', [Number(qty), req.user.id, itemId]);
    }
    const cart = await db.all('SELECT * FROM carts WHERE user_id=?', [req.user.id]);
    res.json({ success: true, cart });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log('API running on port', PORT);
});
