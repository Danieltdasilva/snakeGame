import {
  saveHighScore,
  getHighScores,
  getPlayerProfile,
  resetPlayerStats
} from "./highscores.js";

/* =========================
   DOM ELEMENT REFERENCES
========================= */

const canvas = document.querySelector("canvas"); // adding canva
const ctx = canvas.getContext("2d"); //2D effect

const score = document.querySelector(".score--value"); //score of the game
const finalScore = document.querySelector(".final-score > span"); //final score
const menu = document.querySelector(".menu-screen"); //the starting game menu
const buttonPlay = document.querySelector(".btn-play"); //the play button
const leaderboardList = document.querySelector(".leaderboard-list"); //the scores list

// player profile elements
const profileName = document.querySelector(".profile-name");
const profileGames = document.querySelector(".profile-games");
const profileHigh = document.querySelector(".profile-high");
const profileAverage = document.querySelector(".profile-average");
const resetButton = document.querySelector(".btn-reset");
const changePlayerButton = document.querySelector(".btn-change-player");
const playerInput = document.querySelector(".player-name-input");
const setPlayerButton = document.querySelector(".btn-set-player");
const activePlayerName = document.querySelector(".active-player-name");

const audio = new Audio("/assets/audio.mp3"); //the audio
const size = 30; //this is the size of the snake, moving 30pxs inside a 600px canvas

/* =========================
   GAME STATE VARIABLES
========================= */

let speed = 300; // starting delay (ms)
const minSpeed = 60; // fastest it can get
const speedStep = 10; // how much faster per food

let isPaused = false; //checking if game is paused
let pauseOverlayText = "PAUSED"; //game is paused
let isGameRunning = false; //checking if game is running
let gameTimeoutId = null;

let obstacles = [];

const obstacleSpawnEvery = 50; // points (50 = every 5 foods if +10 each)
const maxObstacles = 12;

let snake = [{ x: 270, y: 240 }]; //size of the snake changes as game progresses

let direction;

/* =========================
   PLAYER MANAGEMENT
========================= */

let currentPlayer = localStorage.getItem("playerName");

const askForPlayerName = () => {
  let nameInput = "";

  while (!nameInput || nameInput.trim() === "" || nameInput === "null") {
    nameInput = prompt("Enter your name:");
    if (nameInput === null) continue;
  }

  currentPlayer = nameInput.trim();
  localStorage.setItem("playerName", currentPlayer);
};

if (!currentPlayer || currentPlayer === "null") {
  askForPlayerName();
}

if (currentPlayer) {
  playerInput.value = currentPlayer;
}

/* =========================
   PLAYER PROFILE RENDER
========================= */

const renderPlayerProfile = async () => {
  if (!currentPlayer) return;

  const profile = await getPlayerProfile(currentPlayer);
  if (!profile) return;

  activePlayerName.textContent = currentPlayer;
  profileGames.textContent = profile.totalGames ?? 0;
  profileHigh.textContent = profile.highestScore ?? 0;
  profileAverage.textContent = profile.averageScore ?? 0;
};

setPlayerButton.addEventListener("click", async () => {
  const name = playerInput.value.trim();
  if (!name) return;

  currentPlayer = name;
  localStorage.setItem("playerName", name);

  await renderHighScores();
  await renderPlayerProfile();
});

resetButton.addEventListener("click", async () => {
  if (!currentPlayer) return;

  const confirmReset = confirm("Are you sure you want to reset your stats?");
  if (!confirmReset) return;

  await resetPlayerStats(currentPlayer);
  await renderHighScores();
  await renderPlayerProfile();
});

changePlayerButton.addEventListener("click", async () => {
  localStorage.removeItem("playerName");
  askForPlayerName();

  await renderHighScores();
  await renderPlayerProfile();
});

/* =========================
   GAME LOGIC
========================= */

//increasing the score
const incrementScore = () => {
  score.innerText = +score.innerText + 10;
  speed = Math.max(minSpeed, speed - speedStep);
};

// random movements of the snake food
const randomNumber = (min, max) =>
  Math.round(Math.random() * (max - min) + min);

const randomPosition = () => {
  const number = randomNumber(0, canvas.width - size);
  return Math.round(number / size) * size;
};

// making the food color be random as well
const randomColor = () => {
  const red = randomNumber(0, 255);
  const green = randomNumber(0, 255);
  const blue = randomNumber(0, 255);
  return `rgb(${red}, ${green}, ${blue})`;
};

const food = {
  x: randomPosition(),
  y: randomPosition(),
  color: randomColor()
};

// drawing food
const drawFood = () => {
  const { x, y, color } = food;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
  ctx.shadowBlur = 0;
};

// random size of the snake
const drawSnake = () => {
  ctx.fillStyle = "#ddd";

  snake.forEach((position, index) => {
    if (index === snake.length - 1) {
      ctx.fillStyle = "white";
    }
    ctx.fillRect(position.x, position.y, size, size);
  });
};

//pausing the game
const drawPaused = () => {
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText(pauseOverlayText, canvas.width / 2, canvas.height / 2);
};

// movements of the snake
const moveSnake = () => {
  if (!direction) return;

  const head = snake[snake.length - 1];

  if (direction === "right") snake.push({ x: head.x + size, y: head.y });
  if (direction === "left") snake.push({ x: head.x - size, y: head.y });
  if (direction === "down") snake.push({ x: head.x, y: head.y + size });
  if (direction === "up") snake.push({ x: head.x, y: head.y - size });

  snake.shift();
};

const samePos = (a, b) => a.x === b.x && a.y === b.y;

//adding obstacles
const spawnObstacle = () => {
  if (obstacles.length >= maxObstacles) return;

  let pos = { x: randomPosition(), y: randomPosition() };

  while (
    snake.some(s => samePos(s, pos)) ||
    samePos(food, pos) ||
    obstacles.some(o => samePos(o, pos))
  ) {
    pos = { x: randomPosition(), y: randomPosition() };
  }

  obstacles.push(pos);
};

const drawObstacles = () => {
  ctx.fillStyle = "#444";
  obstacles.forEach(o => {
    ctx.fillRect(o.x, o.y, size, size);
  });
};

// making the food position move after snake eats it
const checkEat = () => {
  const head = snake[snake.length - 1];

  if (head.x === food.x && head.y === food.y) {
    incrementScore();

    const currentScore = Number(score.innerText);
    if (currentScore % obstacleSpawnEvery === 0) {
      spawnObstacle();
    }

    snake.push({ x: head.x, y: head.y });
    audio.play();

    let x = randomPosition();
    let y = randomPosition();

    while (snake.some(p => p.x === x && p.y === y)) {
      x = randomPosition();
      y = randomPosition();
    }

    food.x = x;
    food.y = y;
    food.color = randomColor();
  }
};

//checking collision
const checkCollision = () => {
  const head = snake[snake.length - 1];

  const canvasLimitX = canvas.width - size;
  const canvasLimitY = canvas.height - size;
  const neckIndex = snake.length - 2;

  const wallCollision =
    head.x < 0 || head.x > canvasLimitX ||
    head.y < 0 || head.y > canvasLimitY;

  const selfCollision = snake.some((position, index) =>
    index < neckIndex &&
    position.x === head.x &&
    position.y === head.y
  );

  const obstacleCollision = obstacles.some(
    o => o.x === head.x && o.y === head.y
  );

  if (wallCollision || selfCollision || obstacleCollision) {
    gameOver();
  }
};

//render leaderboard
const renderHighScores = async () => {
  const scores = await getHighScores();
  leaderboardList.innerHTML = "";

  scores.forEach(score => {
    const li = document.createElement("li");
    li.textContent = `${score.name} - ${score.score}`;
    leaderboardList.appendChild(li);
  });
};

//making sure game over is properly working
const gameOver = async () => {
  isGameRunning = false;

  if (currentPlayer) {
    await saveHighScore(currentPlayer, Number(score.innerText));
  }

  clearTimeout(gameTimeoutId);
  gameTimeoutId = null;

  direction = undefined;
  menu.style.display = "flex";
  finalScore.innerText = score.innerText;
  canvas.style.filter = "blur(2px)";

  await renderHighScores();
  await renderPlayerProfile();
};

// game loop
const gameLoop = () => {
  if (!isGameRunning) return;

  if (isPaused) {
    drawPaused();
    return;
  }

  ctx.clearRect(0, 0, 600, 600);

  drawFood();
  drawObstacles();
  moveSnake();
  drawSnake();
  checkEat();
  checkCollision();

  gameTimeoutId = setTimeout(() => {
    requestAnimationFrame(gameLoop);
  }, speed);
};

//keyboard controls
document.addEventListener("keydown", (event) => {
  const { key } = event;

  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(key)) {
    event.preventDefault();
  }

  if (key === "p" || key === "P") {
    isPaused = !isPaused;
    if (!isPaused && isGameRunning) gameLoop();
    return;
  }

  if (key === "ArrowRight" && direction !== "left") direction = "right";
  if (key === "ArrowLeft" && direction !== "right") direction = "left";
  if (key === "ArrowDown" && direction !== "up") direction = "down";
  if (key === "ArrowUp" && direction !== "down") direction = "up";
});

// Show start menu on first load
menu.style.display = "flex";
canvas.style.filter = "blur(2px)";

//play button
buttonPlay.addEventListener("click", () => {
  isPaused = false;
  obstacles = [];
  score.innerText = "00";
  speed = 300;

  menu.style.display = "none";
  canvas.style.filter = "none";

  snake = [{ x: 270, y: 240 }];
  direction = undefined;

  isGameRunning = true;
  gameLoop();
});

//initial render
renderHighScores();
renderPlayerProfile();
