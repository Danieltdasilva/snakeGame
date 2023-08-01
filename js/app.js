const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");

const size = 30; //this is the size of the snake, moving 30pxs inside a 600px canvas

const snake = [{ x: 270, y: 240 }];

const randomNum = () => {
  return Math.round(Math.random() * (10 - 5) + 5)
}

const food = {
  x: 90,
  y: 90,
  color: "yellow"
}


let direction, loopId;


const drawFood = () => {
  const { x, y, color } = food
  ctx.shadowColor = color
  ctx.shadowBlur = 50
  ctx.fillStyle = color
  ctx.fillRect(food.x, food.y, size, size)
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



// game loop where the heart of the game is
const gameLoop = () => {
  clearInterval(loopId)

  ctx.clearRect(0, 0, 600, 600)

  drawGrid()
  drawFood()
  moveSnake()
  drawSnake()

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