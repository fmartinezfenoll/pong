'use strict'

// Constantes básicas del juego
const FRAME_PER_SECOND = 50;

const NUM_BALLS = 5;

const BG_COLOR = 'BLACK';

const FONT_COLOR = 'WHITE';
const FONT_FAMILY = 'impact';
const FONT_SIZE = '45px';

const NET_COLOR = 'WHITE';
const NET_WIDTH = 4;
const NET_HEIGHT = 10;
const NET_PADDING = 15;

const PADDLE_RIGHT_COLOR = 'WHITE';
const PADDLE_LEFT_COLOR = 'WHITE';
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;

const BALL_COLOR = 'WHITE';
const BALL_RADIUS = 10;
const BALL_DELTA_VELOCITY = 0.5;
const BALL_VELOCITY = 5;

const gameStateEnum = {
    SYNC: 0,
    PLAY: 1,
    PAUSE: 2,
    END: 3,
};

//--------------------------------------------
// MOTOR GRÁFICO
//--------------------------------------------
// Recuperar el canvas
const cvs = document.getElementById('pong_canvas');
const ctx = cvs.getContext('2d');

// LAYER 0: BASIC CANVAS DRAW HELPERS ---------------------------------

function drawRect(x,y,w,h,color){
    ctx.fillStyle = color;
    ctx.fillRect(x,y,w,h);
}

function drawCircle(x,y,r,color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,r,0,2*Math.PI,false);
    ctx.closePath();
    ctx.fill();
}
function drawText(text,x,y,color=FONT_COLOR,fontSize=FONT_SIZE,fontFamily=FONT_FAMILY){
    ctx.fillStyle = color;
    ctx.font = `${fontSize} ${fontFamily}`;
    ctx.fillText(text,x,y);
}
// LAYER 1: BASIC PONG HELPERS ---------------------------
function clearCanvas() {
    drawRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT, BG_COLOR);
}
function drawNet(){
    const net = {
        x: CANVAS_WIDTH/2 - NET_WIDTH/2,
        y: 0,
        width: NET_WIDTH,
        height: NET_HEIGHT,
        padding: NET_PADDING,
        color: NET_COLOR
    }
    for(let i=0; i<= CANVAS_HEIGHT;i+=net.padding){
        drawRect(net.x, net.y+i, net.width, net.height, net.color);
    }
}

function drawBoard(){
    clearCanvas();
    drawNet();
}

function drawScore(players){
    for(let id in players){
        drawText(players[id].score, (players[id].x === 0 ? 1 : 3) * CANVAS_WIDTH/4, CANVAS_HEIGHT/5);
    }
}

function drawPaddle(paddle){
    drawRect(paddle.x, paddle.y, paddle.width, paddle.height, paddle.color);
}
function drawBall(ball){
    drawCircle(ball.x,ball.y,ball.radius,ball.color);
}
// ---------------------------------------------------------
// MOTOR DE JUEGO
// ---------------------------------------------------------
const CANVAS_WIDTH = cvs.width;
const CANVAS_HEIGHT = cvs.height;

// Declaramos los objetos del juego
var gameState = gameStateEnum.SYNC;
const players = {};
var ball ={};
// GENERIC HELPERS -------------------------

function getRandomDirection(){
    return Math.floor(Math.random()*2) === 0 ? -1 : 1;
}
function getPlayers(index){
    return players[index];
}
function initGameObjects(){
    players[0] ={
        x:0,
        y:CANVAS_HEIGHT/2 - PADDLE_HEIGHT/2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        color: PADDLE_LEFT_COLOR,
        score: 0
    }
    players[1] ={
        x:CANVAS_WIDTH - PADDLE_WIDTH,
        y:CANVAS_HEIGHT/2 - PADDLE_HEIGHT/2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        color: PADDLE_RIGHT_COLOR,
        score: 0
    }
    ball={
        x: CANVAS_WIDTH/2,
        y: CANVAS_HEIGHT/2,
        radius: BALL_RADIUS,
        speed: BALL_VELOCITY,
        velocityX: BALL_VELOCITY * getRandomDirection(),
        velocityY: BALL_VELOCITY * getRandomDirection(),
        color: BALL_COLOR
    }
}
// UPDATE HELPERS ---------------------------------------

function collision(b,p){
    // Calculamos el collider de la pelota
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    // Calculamos el collider de la pala
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    return b.right > p.left &&
            b.bottom > p.top &&
            b.left > p.right &&
            b.top > p.bottom;
}

// IA del juego
const COMPUTER_LEVEL = 0.1;

function updateNPC(){
    const npc = getPlayers(1);

    npc.y += (ball.y - (npc.y+npc.height/2)) * COMPUTER_LEVEL;
}
function update(){
    // Si no estamos en modo PLAY, saltamos la actualización
    if(gameState != gameStateEnum.PLAY) return;

    // Player: actualizamos la posicioón de la bola
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // IA: actualizamos la posición de la computadora
    updateNPC();

    // Si la poelota golpea los laterales del campo, rebotará...
    if(ball.y+ball.radius > CANVAS_HEIGHT  ||  ball.y-ball.radius < 0){
        ball.velocityY = -ball.velocityY;
    }
    // Verificamos si la pelota golpea alguna pala...
    var whatPlayer = (ball.x < CANVAS_WIDTH/2) ? getPlayers(0) : getPlayers(1);
    if (collision(ball,whatPlayer)){
        // Calculamos donde golpea la pelota en la pala
        var collidePoint = ball.y - (whatPlayer.y+whatPlayer.height/2);
        // Normalizamos el punto de colisión
        collidePoint = collidePoint / (whatPlayer.height/2);
        // Calculamos el ángulo de rebote ( en radianes)
        const angleRad = collidePoint * Math.PI/4;
        // Calculamos el sentido de la pelota en la dirección x
        const direction = (ball.x < CANVAS_WIDTH/2) ? 1 : -1;
        // Calculamos la velocidad de la pelota en los ejes x e y
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sen(angleRad);
        // Cada vez que la bola golpea la pala, se incrementa la velicidad
        ball.speed += BALL_DELTA_VELOCITY;
    }
}

function render(){
    drawBoard();
    drawPaddle(getPlayers(0));
    drawPaddle(getPlayers(1));
    drawBall(ball);
    drawScore(players);
}

function next(){
    console.log('Siguiente estado...');
}


// HELPERS para gestionar el bucle de juego

var gameLoopId; // Identificador del bucle de juego

function gameLoop(){
    update();
    render();
    next();
}

function initGameLoop(){
    gameLoopId = setInterval(gameLoop, 1000/FRAME_PER_SECOND);
    gameState = gameStateEnum.PLAY;
}

function stopGameLoop(){
    clearInterval(gameLoopId);
}

// INICIALIZACIÓN DEL MOTOR DE JUEGO

function init(){
    initGameObjects();
    drawBoard();
    initGameLoop();
}

// Inicialización del juego
init();