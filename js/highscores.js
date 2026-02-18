const API_URL = "https://orange-space-potato-5jqj76gxxxr2pp7r-3000.app.github.dev/api/scores";
const API_BASE = "https://orange-space-potato-5jqj76gxxxr2pp7r-3000.app.github.dev";


export const saveHighScore = async (name, score) => {
  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, score })
  });
};

export const getHighScores = async () => {
  const response = await fetch(API_URL);
  return await response.json();
};

export const getPlayerProfile = async (name) => {
  const response = await fetch(`${API_BASE}/api/player/${encodeURIComponent(name)}`);
  return await response.json();
};

export const resetPlayerStats = async (name) => {
  await fetch(`${API_BASE}/api/player/${encodeURIComponent(name)}`, {
    method: "DELETE"
  });
};

