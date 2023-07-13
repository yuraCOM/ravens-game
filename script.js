//
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const CANVAS_WIDTH = (canvas.width = innerWidth);
const CANVAS_HEIGHT = (canvas.height = innerHeight);
//
const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d", {
  willReadFrequently: true,
});
const COLLISION_CANVAS_WIDTH = (collisionCanvas.width = innerWidth);
const COLLISION_CANVAS_HEIGHT = (collisionCanvas.height = innerHeight);

let timeToNextRaven = 0;
let ravenInterval = 900;
let lastTime = 0;

let ravens = [];

let score = 0;
ctx.font = "20px Impact";

//class Raven -----------------------------
class Raven {
  constructor(x, y) {
    this.spriteWidth = 271;
    this.spriteHeight = 194;
    this.sizeModifier = Math.random() * 0.6 + 0.3;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = CANVAS_WIDTH;
    this.y = Math.random() * (CANVAS_HEIGHT - this.height);
    this.directionX = Math.random() * 5 + 3;
    this.directionY = Math.random() * 5 - 2.5;
    this.markerForDelete = false;
    this.image = new Image();
    this.image.src = "raven.png";
    this.frame = 0;
    this.maxFrame = 4;
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 50 + 70;
    this.randomColor = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];

    this.color =
      "rgb(" +
      this.randomColor[0] +
      "," +
      this.randomColor[1] +
      "," +
      this.randomColor[2] +
      ")";
    this.hasTrial = Math.random() > 0.5; // 0.5 дым у половины
  }
  update(deltaTime) {
    if (this.y < 0 || this.y > CANVAS_HEIGHT - this.height) {
      this.directionY = this.directionY * -1;
    }
    this.x -= this.directionX;
    this.y += this.directionY;
    this.x < 0 - this.width ? (this.markerForDelete = true) : false;
    this.timeSinceFlap += deltaTime;

    if (this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxFrame) {
        this.frame = 0;
      } else this.frame++;
      this.timeSinceFlap = 0;
      if (this.hasTrial) {
        for (let i = 0; i < 5; i++) {
          particles.push(new Particle(this.x, this.y, this.width, this.color));
        }
      }
    }
  }
  draw() {
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      this.image,
      this.spriteWidth * this.frame,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

const raven = new Raven();

// explosions ------------------------------------------------
let explosions = [];

class Explosion {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = "boom.png";
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src = "b.mp3";
    this.sound.muted = true;
    this.timeSinceLastFrame = 0;
    this.frameInterval = 200;
    this.markerForDeleteExp = false;
  }
  update(deltaTime) {
    // this.sound.muted = true;
    if (this.frame === 0) {
      this.sound.muted = false;
      this.sound.play();
    }
    this.timeSinceLastFrame += deltaTime;
    if (this.timeSinceLastFrame > this.frameInterval) {
      this.frame++;
      this.timeSinceLastFrame = 0;
      if (this.frame > 5) this.markerForDeleteExp = true;
    }
  }
  draw() {
    ctx.drawImage(
      this.image,
      this.spriteWidth * this.frame,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y - this.size / 4,
      this.size,
      this.size
    );
    ctx.restore();
  }
}
// ----------------------------------

//particles -------------------------
let particles = [];

class Particle {
  constructor(x, y, size, color) {
    this.size = size;
    this.x = x + size / 2 + Math.random() * 50 - 25;
    this.y = y + size / 3 + Math.random() * 50 - 25;
    this.radius = (Math.random() * this.size) / 10;
    this.maxRadius = Math.random() * 20 + 10; // длина дыма с жопы
    this.markerForDeletePar = false;
    this.speedX = Math.random() * 1 + 0.5;
    this.color = color;
  }
  update() {
    this.x += this.speedX;
    this.radius += 0.3;
    if (this.radius > this.maxRadius - 5) this.markerForDeletePar = true;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = 1 - this.radius / this.maxRadius;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.fillText(`Score : ` + score, 50, 75);
  ctx.fillStyle = "white";
  ctx.fillText(`Score : ` + score, 55, 80);
}

window.addEventListener("click", function (event) {
  let detectPixelColor = collisionCtx.getImageData(event.x, event.y, 1, 1);
  let pixColor = detectPixelColor.data;
  ravens.forEach((obj) => {
    if (
      obj.randomColor[0] === pixColor[0] &&
      obj.randomColor[1] === pixColor[1] &&
      obj.randomColor[2] === pixColor[2]
    ) {
      //collision detected
      obj.markerForDelete = true;
      score++;
      //
      explosions.push(new Explosion(obj.x, obj.y, obj.width));
      console.log("explosions: ", explosions);
    }
  });
});

window.addEventListener("touchstart", function (event) {
  let detectPixelColor = collisionCtx.getImageData(event.x, event.y, 1, 1);
  let pixColor = detectPixelColor.data;
  ravens.forEach((obj) => {
    if (
      obj.randomColor[0] === pixColor[0] &&
      obj.randomColor[1] === pixColor[1] &&
      obj.randomColor[2] === pixColor[2]
    ) {
      //collision detected
      obj.markerForDelete = true;
      score++;
      //
      explosions.push(new Explosion(obj.x, obj.y, obj.width));
      console.log("explosions: ", explosions);
    }
  });
});

function animate(timestamp) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  collisionCtx.clearRect(0, 0, COLLISION_CANVAS_WIDTH, COLLISION_CANVAS_HEIGHT);
  // collisionCtx;
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  timeToNextRaven += deltaTime;

  if (timeToNextRaven > ravenInterval) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
    ravens.sort(function (a, b) {
      return a.width - b.width;
    });
  }
  drawScore();

  [...particles, ...ravens, ...explosions].forEach((obj) =>
    obj.update(deltaTime)
  );
  [...particles, ...ravens, ...explosions].forEach((obj) => obj.draw());
  ravens = ravens.filter((obj) => !obj.markerForDelete);
  explosions = explosions.filter((obj) => !obj.markerForDeleteExp);
  particles = particles.filter((obj) => !obj.markerForDeletePar);

  requestAnimationFrame(animate);
}

animate(0);
