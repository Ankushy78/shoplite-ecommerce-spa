import db from "./db.js";

// Create tables and insert sample items
async function seed() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      price REAL,
      category TEXT,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      itemId INTEGER,
      quantity INTEGER,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (itemId) REFERENCES items(id)
    );
  `);

  // clear old data
  await db.run(`DELETE FROM items`);

  // sample items that match frontend (Shop.jsx expects title + image)
  const sampleItems = [
    { title: "Laptop", price: 55000, category: "Electronics", image: "https://campaign.ecs.com.tw/images/products/large/MF50AL.png" },
    { title: "Headphones", price: 2500, category: "Electronics", image: "https://m.media-amazon.com/images/I/61x3xPK2UUL.jpg" },
    { title: "Shoes", price: 1999, category: "Fashion", image: "https://rukminim2.flixcart.com/image/704/844/xif0q/shoe/4/6/h/-original-imagz5kfqvh498yd.jpeg?q=90&crop=false" },
    { title: "T-Shirt", price: 499, category: "Fashion", image: "https://chriscross.in/cdn/shop/files/ChrisCrossRoyalblueCottontshirtmen.jpg?v=1740994595&width=2048" },
    { title: "Coffee Maker", price: 3499, category: "Home Appliances", image: "https://pringle.in/cdn/shop/files/51e_Y78ExBL.jpg?v=1729617285" },
  ];

  for (const item of sampleItems) {
    await db.run(
      `INSERT INTO items (title, price, category, image) VALUES (?, ?, ?, ?)`,
      [item.title, item.price, item.category, item.image]
    );
  }

  console.log("✅ Database seeded with sample items!");
}

seed().then(() => process.exit());