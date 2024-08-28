const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const rows = 5;
const cols = 4;
const spacing = 10;
const borderRadius = 8; // Global border radius variable

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;


const tick = new Audio("tick.mp3");


let size = 0;
if (canvas.width / cols < canvas.height / rows) {
  size = (canvas.width - (cols + 1) * spacing) / cols;
} else {
  size = (canvas.height - (rows + 1) * spacing) / rows;
}

canvas.width = cols * size + (cols + 1) * spacing;
canvas.height = rows * size + (rows + 1) * spacing;

class Box {
  static currentId = 1;

  constructor(width, height, color, posX, posY) {
    this.id = Box.currentId++;
    this.width = width;
    this.height = height;
    this.color = color;
    this.posX = posX;
    this.posY = posY;
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
  }

  draw() {
    const x = this.posX * size + (this.posX + 1) * spacing;
    const y = this.posY * size + (this.posY + 1) * spacing;
    const width = size * this.width + (this.width - 1) * spacing;
    const height = size * this.height + (this.height - 1) * spacing;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(x + borderRadius, y);
    ctx.arcTo(x + width, y, x + width, y + height, borderRadius);
    ctx.arcTo(x + width, y + height, x, y + height, borderRadius);
    ctx.arcTo(x, y + height, x, y, borderRadius);
    ctx.arcTo(x, y, x + width, y, borderRadius);
    ctx.closePath();
    ctx.fill();
  }

  isPointInside(x, y) {
    return (
      x >= this.posX * size + (this.posX + 1) * spacing &&
      x <=
        (this.posX + this.width) * size + (this.posX + this.width) * spacing &&
      y >= this.posY * size + (this.posY + 1) * spacing &&
      y <=
        (this.posY + this.height) * size + (this.posY + this.height) * spacing
    );
  }
}

class Board {
  constructor(rows, cols, spacing, boxes = []) {
    this.rows = rows;
    this.cols = cols;
    this.spacing = spacing;
    this.gridMap = Array.from({ length: rows }, () => Array(cols).fill(null));
    this.boxes = boxes;
  }

  addBox(box) {
    this.boxes.push(box);
    this.updateGridMap();
  }

  updateGridMap() {
    this.gridMap.forEach((row) => row.fill(null));
    this.boxes.forEach((box) => {
      for (
        let i = Math.floor(box.posY);
        i < Math.floor(box.posY) + box.height;
        i++
      ) {
        for (
          let j = Math.floor(box.posX);
          j < Math.floor(box.posX) + box.width;
          j++
        ) {
          if (i >= 0 && i < this.rows && j >= 0 && j < this.cols) {
            this.gridMap[i][j] = box.id;
          }
        }
      }
    });
  }

  isPositionValid(box, newPosX, newPosY) {
    for (
      let i = Math.floor(box.posY);
      i < Math.floor(box.posY) + box.height;
      i++
    ) {
      for (
        let j = Math.floor(box.posX);
        j < Math.floor(box.posX) + box.width;
        j++
      ) {
        if (i >= 0 && i < this.rows && j >= 0 && j < this.cols) {
          this.gridMap[i][j] = null;
        }
      }
    }

    for (let i = 0; i < box.height; i++) {
      for (let j = 0; j < box.width; j++) {
        let gridX = Math.floor(newPosX) + j;
        let gridY = Math.floor(newPosY) + i;

        if (
          gridX < 0 ||
          gridX >= this.cols ||
          gridY < 0 ||
          gridY >= this.rows
        ) {
          return false;
        }

        if (
          this.gridMap[gridY][gridX] !== null &&
          this.gridMap[gridY][gridX] !== box.id
        ) {
          return false;
        }
      }
    }

    if (box.posX !== newPosX && box.posY !== newPosY) {
      return false;
    } else {
      if (box.posX == newPosX && Math.abs(box.posY - newPosY) != 1) {
        return false;
      } else if (box.posY == newPosY && Math.abs(box.posX - newPosX) != 1) {
        return false;
      }
    }
    return true;
  }

  draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        ctx.strokeRect(
          j * size + (j + 1) * spacing,
          i * size + (i + 1) * spacing,
          size,
          size
        );
      }
    }

    this.boxes.forEach((box) => box.draw());
  }
}

const board = new Board(rows, cols, spacing);

let box1 = new Box(1, 2, "#00A3FF", 0, 0);
let box2 = new Box(2, 1, "#23FF89", 1, 0);
let box3 = new Box(1, 2, "#00A3FF", 3, 0);
let box4 = new Box(1, 1, "#FFE248", 1, 1);
let box5 = new Box(1, 1, "#FFE248", 2, 1);
let box6 = new Box(2, 2, "#FF5050", 0, 2);
let box7 = new Box(1, 2, "#00A3FF", 3, 2);  
let box8 = new Box(1, 1, "#FFE248", 0, 4);
let box9 = new Box(1, 1, "#FFE248", 1, 4);
let box10 = new Box(2, 1, "#23FF89", 2, 4);

board.addBox(box1);
board.addBox(box2);
board.addBox(box3);
board.addBox(box4);
board.addBox(box5);
board.addBox(box6);
board.addBox(box7);
board.addBox(box8);
board.addBox(box9);
board.addBox(box10);

function onPointerDown(e) {
  let x =
    e.clientX || e.touches[0].clientX - canvas.getBoundingClientRect().left;
  let y =
    e.clientY || e.touches[0].clientY - canvas.getBoundingClientRect().top;

  board.boxes.forEach((box) => {
    if (box.isPointInside(x, y)) {
      box.isDragging = true;
      box.dragOffsetX = x - (box.posX * size + (box.posX + 1) * spacing);
      box.dragOffsetY = y - (box.posY * size + (box.posY + 1) * spacing);

      // Clear the grid map at the current box position
      for (
        let i = Math.floor(box.posY);
        i < Math.floor(box.posY) + box.height;
        i++
      ) {
        for (
          let j = Math.floor(box.posX);
          j < Math.floor(box.posX) + box.width;
          j++
        ) {
          board.gridMap[i][j] = null;
        }
      }
    }
  });
}

function onPointerMove(e) {
  let x =
    e.clientX || e.touches[0].clientX - canvas.getBoundingClientRect().left;
  let y =
    e.clientY || e.touches[0].clientY - canvas.getBoundingClientRect().top;

  board.boxes.forEach((box) => {
    if (box.isDragging) {
      let newPosX = Math.round(
        (x - box.dragOffsetX - spacing) / (size + spacing)
      );
      let newPosY = Math.round(
        (y - box.dragOffsetY - spacing) / (size + spacing)
      );

      // Constrain the box within the grid
      newPosX = Math.max(0, Math.min(newPosX, cols - box.width));
      newPosY = Math.max(0, Math.min(newPosY, rows - box.height));

      if (board.isPositionValid(box, newPosX, newPosY)) {
        tick.play();
        box.posX = newPosX;
        box.posY = newPosY;
        board.updateGridMap();
      }
    }
  });
}

function onMouseDown(e) {
  let x = e.clientX - canvas.getBoundingClientRect().left;
  let y = e.clientY - canvas.getBoundingClientRect().top;

  board.boxes.forEach((box) => {
    if (box.isPointInside(x, y)) {
      box.isDragging = true;
      box.dragOffsetX = x - (box.posX * size + (box.posX + 1) * spacing);
      box.dragOffsetY = y - (box.posY * size + (box.posY + 1) * spacing);

      // Clear the grid map at the current box position
      for (
        let i = Math.floor(box.posY);
        i < Math.floor(box.posY) + box.height;
        i++
      ) {
        for (
          let j = Math.floor(box.posX);
          j < Math.floor(box.posX) + box.width;
          j++
        ) {
          board.gridMap[i][j] = null;
        }
      }
    }
  });
}

function onMouseMove(e) {
  let x = e.clientX - canvas.getBoundingClientRect().left;
  let y = e.clientY - canvas.getBoundingClientRect().top;

  board.boxes.forEach((box) => {
    if (box.isDragging) {
      let newPosX = Math.round(
        (x - box.dragOffsetX - spacing) / (size + spacing)
      );
      let newPosY = Math.round(
        (y - box.dragOffsetY - spacing) / (size + spacing)
      );

      // Constrain the box within the grid
      newPosX = Math.max(0, Math.min(newPosX, cols - box.width));
      newPosY = Math.max(0, Math.min(newPosY, rows - box.height));

      if (board.isPositionValid(box, newPosX, newPosY)) {
        tick.play();
        box.posX = newPosX;
        box.posY = newPosY;
        board.updateGridMap();
      }
    }
  });
}


function onPointerUp(e) {
    
  board.boxes.forEach((box) => {
    box.isDragging = false;
    board.updateGridMap();
  });
}

window.addEventListener("mousedown", onMouseDown);
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("mouseup", onPointerUp);
window.addEventListener("touchstart", onPointerDown);
window.addEventListener("touchmove", onPointerMove);
window.addEventListener("touchend", onPointerUp);

setInterval(() => board.draw(), 1000/30);
