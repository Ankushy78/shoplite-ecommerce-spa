import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Open SQLite database using sqlite3 driver
const db = await open({
  filename: "./data.db",
  driver: sqlite3.Database,
});

export default db;
