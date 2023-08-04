const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");

const audio = new Audio('/assets/audio.mp3');

const size = 30; //this is the size of the snake, moving 30pxs inside a 600px canvas

const snake = [{ x: 270, y: 240 }];

// random movements of the food
const randomNumber = (min, max) => {
  return Math.round(Math.random() * (max - min) + min)
}

const randomPosition = () => {
  const number = randomNumber(0, canvas.width - size)
  return Math.round(number / 30) * 30
}

// making the food color be random as well
const randomColor = () => {
  const red = randomNumber(0, 255)
  const green = randomNumber(0, 255)
  const blue = randomNumber(0, 255)
  return `rgb(${red}, ${green}, ${blue})`
}



const food = {
  x: randomPosition(),
  y: randomPosition(),
  color: randomColor()
}

let direction, loopId;

// this is for the snake food
const drawFood = () => {
  const { x, y, color } = food
  ctx.shadowColor = color
  ctx.shadowBlur = 6
  ctx.fillStyle = color
  ctx.fillRect(x, y, size, size)
  ctx.shadowBlur = 0
}

// drawing of the snake
const drawSnake = () => {
  ctx.fillStyle = "#ddd"

  snake.forEach((position, index) => {

    if (index === snake.length - 1) {
      ctx.fillStyle = "white"
    }


    ctx.fillRect(position.x, position.y, size, size)
  })
}

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
    snake.push(head)
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

const checkCollision = () => {
  const head = snake[snake.length - 1]
  if (head.x < 0 || head.x > 570 || head.y < 0 || head.y > 570) {
    alert("GAME OVER!")
  }
}


// game loop where the heart of the game is
const gameLoop = () => {
  clearInterval(loopId)

  ctx.clearRect(0, 0, 600, 600)

  drawGrid()
  drawFood()
  moveSnake()
  drawSnake()
  checkEat()
  checkCollision()

  loopId = setTimeout(() => {
    gameLoop()
  }, 300)

}
gameLoop();


//arrows to move the snake
document.addEventListener("keydown", ({ key }) => {
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