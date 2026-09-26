
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("./quotes.db");

db.run(`
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get a random quote from public API
app.get("/api/quote", async (req, res) => {
  try {
    const response = await fetch("https://dummyjson.com/quotes/random");
    const data = await response.json();

    res.json({
      quote: data.quote,
      author: data.author
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quote" });
  }
});

// Save favorite quote
app.post("/api/favorites", (req, res) => {
  const { quote, author } = req.body;

  if (!quote || !author) {
    return res.status(400).json({ error: "Quote and author are required" });
  }

  db.run(
    "INSERT INTO favorites (quote, author) VALUES (?, ?)",
    [quote, author],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to save favorite" });
      }

      res.json({
        message: "Quote saved to favorites",
        id: this.lastID
      });
    }
  );
});

// Get favorite history
app.get("/api/favorites", (req, res) => {
  db.all(
    "SELECT * FROM favorites ORDER BY id DESC",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Failed to load favorites" });
      }

      res.json(rows);
    }
  );
});

// Delete favorite
app.delete("/api/favorites/:id", (req, res) => {
  db.run(
    "DELETE FROM favorites WHERE id = ?",
    [req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to delete favorite" });
      }

      res.json({ message: "Favorite deleted" });
    }
  );
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Quote Generator running on port ${PORT}`);
});
