const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

const db = new sqlite3.Database("./database.sqlite");

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS highscores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// GET Top 10 Scores
app.get("/api/scores", (req, res) => {
  db.all(
    "SELECT * FROM highscores ORDER BY score DESC LIMIT 10",
    [],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// POST New Score
app.post("/api/scores", (req, res) => {
  const { name, score } = req.body;

  if (typeof name !== "string" || typeof score !== "number") {
    return res.status(400).json({ error: "Name and score required" });
  }

  db.run(
    "INSERT INTO highscores (name, score) VALUES (?, ?)",
    [name, score],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
