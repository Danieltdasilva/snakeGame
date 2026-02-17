const canvas = document.querySelector('canvas'); // adding canva
const ctx = canvas.getContext("2d"); //2D effect
const score = document.querySelector(".score--value"); //score of the game
const finalScore = document.querySelector(".final-score > span"); //final score
const menu = document.querySelector(".menu-screen"); //the starting game menu
const buttonPlay = document.querySelector(".btn-play"); //the play button
const audio = new Audio('/assets/audio.mp3'); //the audio
const size = 30; //this is the size of the snake, moving 30pxs inside a 600px canvas

let speed = 300;      // starting delay (ms)
const minSpeed = 60;  // fastest it can get
const speedStep = 10; // how much faster per food

let isPaused = false; //checking if game is paused
let pauseOverlayText = "PAUSED"; //game is paused
let isGameRunning = false; //checking if game is running
let gameTimeoutId = null;

//size of the snake changes as game progresses
let snake = [
  { x: 270, y: 240 }
];

//increasing the score
const incrementScore = () => {
  score.innerText = +score.innerText + 10
  speed = Math.max(minSpeed, speed - speedStep);
}

// random movements of the snake food
const randomNumber = (min, max) => {
  return Math.round(Math.random() * (max - min) + min)
}

const randomPosition = () => {
  const number = randomNumber(0, canvas.width - size)
  return Math.round(number / size) * size
}

// making the food color be random as well
const randomColor = () => {
  const red = randomNumber(0, 255)
  const green = randomNumber(0, 255)
  const blue = randomNumber(0, 255)
  return `rgb(${red}, ${green}, ${blue})`
}

// randomnly positioning the food
const food = {
  x: randomPosition(),
  y: randomPosition(),
  color: randomColor()
}

let direction;


// this is the random food color
const drawFood = () => {
  const { x, y, color } = food
  ctx.shadowColor = color
  ctx.shadowBlur = 6
  ctx.fillStyle = color
  ctx.fillRect(x, y, size, size)
  ctx.shadowBlur = 0
}

// random size of the snake
const drawSnake = () => {
  ctx.fillStyle = "#ddd"

  snake.forEach((position, index) => {

    if (index === snake.length - 1) {
      ctx.fillStyle = "white"
    }


    ctx.fillRect(position.x, position.y, size, size)
  })
}

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
  if (!direction) return
  const head = snake[snake.length - 1]

  if (direction == "right") {
    snake.push({ x: head.x + size, y: head.y })
  }
  if (direction == "left") {
    snake.push({ x: head.x - size, y: head.y })
  }
  if (direction == "down") {
    snake.push({ x: head.x, y: head.y + size })
  }
  if (direction == "up") {
    snake.push({ x: head.x, y: head.y - size })
  }


  snake.shift()
}

// drawing lines in the canvas
const drawGrid = () => {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#191919";

  for (let i = 30; i < canvas.width; i += 30) {
    ctx.beginPath()
    ctx.lineTo(i, 0)
    ctx.lineTo(i, 600)
    ctx.stroke()

    ctx.beginPath()
    ctx.lineTo(0, i)
    ctx.lineTo(600, i)
    ctx.stroke()
  }

}

// making the food position move after snake eats it
const checkEat = () => {
  const head = snake[snake.length - 1]
  if (head.x == food.x && head.y == food.y) {
    incrementScore()
    snake.push({ x: head.x, y: head.y })
    audio.play()

    let x = randomPosition()
    let y = randomPosition()

    while (snake.find((position) => position.x == x && position.y == y)) {
      x = randomPosition()
      y = randomPosition()
    }

    food.x = x
    food.y = y
    food.color = randomColor()
  }
}

//checking the collision to either wall or itself before game over
const checkCollision = () => {
  const head = snake[snake.length - 1]
  const canvasLimit = canvas.width - size;
  const neckIndex = snake.length - 2;

  const wallCollision = head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit;

  const selfCollision = snake.find((position, index) => {
    return index < neckIndex && position.x == head.x && position.y == head.y
  })

  if (wallCollision || selfCollision) {
    gameOver()
  }

};

//making sure game over is properly working
const gameOver = () => {
  isGameRunning = false;

  if (gameTimeoutId) {
    clearTimeout(gameTimeoutId);
    gameTimeoutId = null;
  }

  direction = undefined;
  menu.style.display = "flex";
  finalScore.innerText = score.innerText;
  canvas.style.filter = "blur(2px)";
};



// game loop - where the heart of the game is
const gameLoop = () => {
  if (!isGameRunning) return;

if (isPaused) {
  drawPaused();
  return;
}

  ctx.clearRect(0, 0, 600, 600);

  checkCollision();
  drawGrid();
  drawFood();
  moveSnake();
  drawSnake();
  checkEat();

  gameTimeoutId = setTimeout(gameLoop, speed);
};


//arrows to move the snake - event listener
document.addEventListener("keydown", ({ key }) => {
  if (key === "p" || key === "P") {
  isPaused = !isPaused;

  if (!isPaused && isGameRunning) {
    gameLoop(); // resume
  }
  return;
}
  if (key == "ArrowRight" && direction != "left") {
    direction = "right"
  }
  if (key == "ArrowLeft" && direction != "right") {
    direction = "left"
  }
  if (key == "ArrowDown" && direction != "up") {
    direction = "down"
  }
  if (key == "ArrowUp" && direction != "down") {
    direction = "up"
  }
})

// Show start menu on first load
menu.style.display = "flex";
canvas.style.filter = "blur(2px)";

//play button
buttonPlay.addEventListener("click", () => {
  isPaused = false;
  score.innerText = "00";
  speed = 300;
  menu.style.display = "none";
  canvas.style.filter = "none";

  snake = [{ x: 270, y: 240 }];
  direction = undefined;

  isGameRunning = true;
  gameLoop();
});
