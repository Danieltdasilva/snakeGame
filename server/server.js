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
// Serve frontend files
app.use(express.static(__dirname));

const path = require("path");
const dbPath = path.join(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath);

// Players table
db.run(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Scores table
db.run(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playerId INTEGER NOT NULL,
    score INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playerId) REFERENCES players(id)
  )
`);

// GET Top 3 Scores
app.get("/api/scores", (req, res) => {
  db.all(
    `
    SELECT players.name, scores.score
    FROM scores
    JOIN players ON scores.playerId = players.id
    ORDER BY scores.score DESC
    LIMIT 3
    `,
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

  if (!name || score === undefined) {
    return res.status(400).json({ error: "Name and score required" });
  }

  //Insert player if it doesn't exist
  db.run(
    "INSERT OR IGNORE INTO players (name) VALUES (?)",
    [name],
    function (err) {
      if (err) return res.status(500).json(err);

      //Get player name
      db.get(
        "SELECT id FROM players WHERE name = ?",
        [name],
        (err, playerRow) => {
          if (err) return res.status(500).json(err);

          // Insert score linked to player named above
          db.run(
            "INSERT INTO scores (playerId, score) VALUES (?, ?)",
            [playerRow.id, score],
            function (err) {
              if (err) return res.status(500).json(err);
              res.json({ success: true });
            }
          );
        }
      );
    }
  );
});

// Fallback to index.html for root
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// GET Player Profile Stats
app.get("/api/player/:name", (req, res) => {
  const { name } = req.params;

  db.get(
    `
    SELECT 
      COUNT(scores.id) as totalGames,
      MAX(scores.score) as highestScore,
      ROUND(AVG(scores.score), 2) as averageScore
    FROM scores
    JOIN players ON scores.playerId = players.id
    WHERE players.name = ?
    `,
    [name],
    (err, row) => {
      if (err) return res.status(500).json(err);

      res.json({
        name,
        totalGames: row?.totalGames || 0,
        highestScore: row?.highestScore || 0,
        averageScore: row?.averageScore || 0
      });
    }
  );
});

// DELETE Player Stats
app.delete("/api/player/:name", (req, res) => {
  const { name } = req.params;

  db.get(
    "SELECT id FROM players WHERE name = ?",
    [name],
    (err, playerRow) => {
      if (err) return res.status(500).json(err);
      if (!playerRow) {
        return res.status(404).json({ error: "Player not found" });
      }

      db.run(
        "DELETE FROM scores WHERE playerId = ?",
        [playerRow.id],
        function (err) {
          if (err) return res.status(500).json(err);

          res.json({
            message: `Stats reset for ${name}`,
            deletedRows: this.changes
          });
        }
      );
    }
  );
});
