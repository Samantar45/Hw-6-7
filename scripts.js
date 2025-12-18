/* Tetris game (vanilla JS)
   Features:
   - 10x20 board
   - score/lines/level, high score persisted in localStorage
   - next piece preview and hold
   - soft/hard drop, rotate, move, pause, restart
*/

const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const preview = document.getElementById('preview').getContext('2d');
const hold = document.getElementById('hold').getContext('2d');

const scale = 20; // each cell size (px) for main canvas (10*20=200, 20*20=400)
context.scale(scale, scale);

const COLORS = {
  0: '#061226',
  I: '#00f0f0',
  J: '#0000f0',
  L: '#f0a000',
  O: '#f0f000',
  S: '#00f000',
  T: '#a000f0',
  Z: '#f00000'
};

const arenaWidth = 10;
const arenaHeight = 20;

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

const TETROMINOS = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  J: [[2,0,0],[2,2,2],[0,0,0]],
  L: [[0,0,3],[3,3,3],[0,0,0]],
  O: [[4,4],[4,4]],
  S: [[0,5,5],[5,5,0],[0,0,0]],
  T: [[0,6,0],[6,6,6],[0,0,0]],
  Z: [[7,7,0],[0,7,7],[0,0,0]]
};

function createPiece(type){
  const matrix = TETROMINOS[type];
  // return deep copy
  return matrix.map(row => row.slice());
}

function drawMatrix(ctx, matrix, offset, cellSize=1){
  ctx.save();
  ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = COLORS[0];
  ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);
  for (let y=0;y<matrix.length;y++){
    for (let x=0;x<matrix[y].length;x++){
      const cell = matrix[y][x];
      if (cell){
        ctx.fillStyle = COLORS[Object.keys(COLORS)[cell] || getColorByIndex(cell)];
        ctx.fillRect(x*cellSize, y*cellSize, cellSize-0.08, cellSize-0.08);
      }
    }
  }
  ctx.restore();
}

function getColorByIndex(i){
  // fallback numeric -> pick a color
  const map = {1:'I',2:'J',3:'L',4:'O',5:'S',6:'T',7:'Z'};
  return COLORS[map[i]] || '#999';
}

function draw(){
  context.fillStyle = COLORS[0];
  context.fillRect(0,0,arenaWidth,arenaHeight);

  drawMatrixMain(arena, {x:0,y:0});
  drawMatrixMain(player.matrix, player.pos);
}

function drawMatrixMain(matrix, offset){
  for(let y=0;y<matrix.length;y++){
    for(let x=0;x<matrix[y].length;x++){
      const val = matrix[y][x];
      if (val){
        context.fillStyle = getColorByIndex(val);
        context.fillRect(x + offset.x, y + offset.y, 1-0.03, 1-0.03);
      }
    }
  }
}

function merge(arena, player){
  player.matrix.forEach((row,y)=>{
    row.forEach((val,x)=>{
      if(val){
        arena[y + player.pos.y][x + player.pos.x] = val;
      }
    });
  });
}

function collide(arena, player){
  const m = player.matrix;
  for(let y=0;y<m.length;y++){
    for(let x=0;x<m[y].length;x++){
      if (m[y][x] && (arena[y + player.pos.y] && arena[y + player.pos.y][x + player.pos.x]) !== 0){
        return true;
      }
    }
  }
  return false;
}

function rotate(matrix, dir){
  for (let y=0;y<matrix.length;y++){
    for (let x=0;x<y;x++){
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) matrix.forEach(row => row.reverse());
  else matrix.reverse();
}

function sweep(){
  let rowCount = 0;
  outer: for (let y = arena.length -1; y>=0; --y){
    for (let x=0;x<arena[y].length;x++){
      if (arena[y][x] === 0) continue outer;
    }
    const row = arena.splice(y,1)[0].fill(0);
    arena.unshift(row);
    ++y;
    rowCount++;
  }
  if (rowCount > 0){
    const scoring = [0,40,100,300,1200];
    player.score += scoring[rowCount] * (player.level + 1);
    player.lines += rowCount;
    player.level = Math.floor(player.lines / 10);
    updateStats();
    // speed up
    dropInterval = Math.max(100, 1000 - player.level * 80);
  }
}

function playerReset(){
  const pieces = 'TJLOSZI';
  if (player.next.length === 0){
    // fill bag
    player.next = shuffle(pieces.split('')).map(createPiece);
  }
  player.matrix = player.next.shift();
  player.pos.y = 0;
  player.pos.x = Math.floor((arenaWidth - player.matrix[0].length) / 2);
  player.canHold = true;

  if (collide(arena, player)){
    // game over
    arena.forEach(row => row.fill(0));
    if (player.score > highScore.get()){
      highScore.set(player.score);
      alert(`Game Over! New High Score: ${player.score}`);
    } else {
      alert('Game Over!');
    }
    player.score = 0;
    player.lines = 0;
    player.level = 0;
    dropInterval = 1000;
    updateStats();
  }
  drawPreview();
  drawHold();
}

function playerDrop(){
  player.pos.y++;
  if (collide(arena, player)){
    player.pos.y--;
    merge(arena, player);
    sweep();
    playerReset();
  }
  dropCounter = 0;
}

function playerMove(dir){
  player.pos.x += dir;
  if (collide(arena, player)){
    player.pos.x -= dir;
  }
}

function playerRotate(dir){
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)){
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length){
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function hardDrop(){
  while(!collide(arena, player)){
    player.pos.y++;
  }
  player.pos.y--;
  merge(arena, player);
  sweep();
  playerReset();
}

function shuffle(arr){
  for (let i = arr.length -1; i>0; i--){
    const j = Math.floor(Math.random() * (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function update(time = 0){
  if (isPaused) {
    lastTime = time;
    requestAnimationFrame(update);
    return;
  }
  const delta = time - lastTime;
  dropCounter += delta;
  if (dropCounter > dropInterval){
    playerDrop();
  }
  lastTime = time;
  draw();
  drawPreview();
  requestAnimationFrame(update);
}

function drawPreview(){
  const s = 20;
  preview.save();
  preview.clearRect(0,0, preview.canvas.width, preview.canvas.height);
  preview.fillStyle = '#061226';
  preview.fillRect(0,0, preview.canvas.width, preview.canvas.height);

  preview.scale(s, s);

  // draw next (first in next)
  const nextMatrix = player.next[0] || createPiece('T');
  const offset = {x: Math.floor((5 - nextMatrix[0].length)/2), y: Math.floor((5 - nextMatrix.length)/2)};
  for (let y=0;y<nextMatrix.length;y++){
    for (let x=0;x<nextMatrix[y].length;x++){
      const val = nextMatrix[y][x];
      if(val){
        preview.fillStyle = getColorByIndex(val);
        preview.fillRect(x + offset.x, y + offset.y, 1-0.06, 1-0.06);
      }
    }
  }
  preview.setTransform(1,0,0,1,0,0);
  preview.restore();
}

function drawHold(){
  const s = 20;
  hold.save();
  hold.clearRect(0,0, hold.canvas.width, hold.canvas.height);
  hold.fillStyle = '#061226';
  hold.fillRect(0,0, hold.canvas.width, hold.canvas.height);
  hold.scale(s, s);

  const matrix = player.hold || [[0]];
  const offset = {x: Math.floor((5 - matrix[0].length)/2), y: Math.floor((5 - matrix.length)/2)};
  for (let y=0;y<matrix.length;y++){
    for (let x=0;x<matrix[y].length;x++){
      const val = matrix[y][x];
      if(val){
        hold.fillStyle = getColorByIndex(val);
        hold.fillRect(x + offset.x, y + offset.y, 1-0.06, 1-0.06);
      }
    }
  }
  hold.setTransform(1,0,0,1,0,0);
  hold.restore();
}

function updateStats(){
  document.getElementById('score').innerText = player.score;
  document.getElementById('lines').innerText = player.lines;
  document.getElementById('level').innerText = player.level;
  document.getElementById('highscore').innerText = highScore.get();
}

function holdPiece(){
  if (!player.canHold) return;
  if (!player.hold){
    player.hold = player.matrix;
    playerReset();
  } else {
    const temp = player.matrix;
    player.matrix = player.hold;
    player.hold = temp;
    player.pos.x = Math.floor((arenaWidth - player.matrix[0].length) / 2);
    player.pos.y = 0;
    if (collide(arena, player)){
      player.matrix = temp; // revert
    }
  }
  player.canHold = false;
  drawHold();
}

function restartGame(){
  arena.forEach(row => row.fill(0));
  player.score = 0;
  player.lines = 0;
  player.level = 0;
  player.next = [];
  player.hold = null;
  playerReset();
  updateStats();
  isPaused = false;
}

// high score helper
const highScore = {
  key: 'tetris_highscore_chatgpt',
  get(){ return Number(localStorage.getItem(this.key) || 0); },
  set(v){ localStorage.setItem(this.key, String(v)); return v; }
};

const arena = createMatrix(arenaWidth, arenaHeight);

const player = {
  pos: {x:0,y:0},
  matrix: null,
  next: [],
  hold: null,
  score: 0,
  lines: 0,
  level: 0,
  canHold: true
};

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let isPaused = false;

document.addEventListener('keydown', event => {
  // Check if the pressed key is one of the game controls
  if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) {
    event.preventDefault(); // Stop the screen from moving
  }

  if (event.key === 'ArrowLeft') playerMove(-1);
  else if (event.key === 'ArrowRight') playerMove(1);
  else if (event.key === 'ArrowDown') playerDrop();
  else if (event.key === 'ArrowUp') playerRotate(1);
  else if (event.code === 'Space') hardDrop(); // Removed the redundant preventDefault here since it's handled above
  else if (event.key === 'c' || event.key === 'C') holdPiece();
  else if (event.key === 'p' || event.key === 'P') togglePause();
  else if (event.key === 'r' || event.key === 'R') restartGame();

  draw();
});

document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('restartBtn').addEventListener('click', restartGame);

function togglePause(){
  isPaused = !isPaused;
  document.getElementById('pauseBtn').innerText = isPaused ? 'Resume' : 'Pause';
}

function init(){
  player.next = shuffle(['I','J','L','O','S','T','Z']).map(createPiece);
  player.score = 0;
  player.lines = 0;
  player.level = 0;
  dropInterval = 1000;
  playerReset();
  updateStats();
  lastTime = performance.now();
  update();
}

window.addEventListener('load', () => {
  document.getElementById('highscore').innerText = highScore.get();
  init();
});
