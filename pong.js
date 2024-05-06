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
    drawRect(paddle.x,paddle.y,paddle.width,paddle.height,paddle.color);
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
function getPlayers(index){
    return players[index];
}
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
    velocityX: BALL_DELTA_VELOCITY,
    velocityY: BALL_VELOCITY,
    color: BALL_COLOR
}


drawBoard();
drawPaddle(getPlayers[0]);
drawPaddle(getPlayers[1]);
drawBall(ball);
drawScore(players);
