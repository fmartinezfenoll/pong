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


// ---------------------------------------------------------
// MOTOR DE JUEGO
// ---------------------------------------------------------
const CANVAS_WIDTH = cvs.width;
const CANVAS_HEIGHT = cvs.height;

// Declaramos los objetos del juego
var gameState = gameStateEnum.SYNC;
const players = {};
var ball ={};
var localPlayer = {};
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
    localPlayer= getPlayers(0);
}
// UPDATE HELPERS ---------------------------------------
function newBall(init=false){
    // Si la pelota ya estaba definida ( es un tanto), cambiamos de dirección
    const directionX = init ? getRandomDirection() : (ball.velocityX>0 ? -1 : 1);
    ball={
        x: CANVAS_WIDTH/2,
        y: CANVAS_HEIGHT/2,
        radius: BALL_RADIUS,
        speed: BALL_VELOCITY,
        velocityX: BALL_VELOCITY * directionX,
        velocityY: BALL_VELOCITY * getRandomDirection(),
        color: BALL_COLOR
    }
}
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
            b.left < p.right &&
            b.top < p.bottom;
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
    if(collision(ball, whatPlayer)){
        //calcular el punto de colision con la pala
        var collidePoint = ball.y - (whatPlayer.y + whatPlayer.height/2);
        
        //normalizar el punto de colision
        collidePoint = collidePoint / (whatPlayer.height/2);
        
        //calcular angulo de rebote
        const angleRad = collidePoint * (Math.PI/4);
        
        //calcular el sentido de la pelota en x
        const direction = ball.x < CANVAS_WIDTH/2 ? 1 : -1;
        
        //calcular la velocidad de la pelota en x e y
        //la velocidad se debe plasmar en sus componentes xy
        //para ello se usa el coseno y el seno
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        
  
        //incrementar la velocidad
        ball.speed += BALL_DELTA_VELOCITY;
        
     }

    // Si la pelota se fue por la izquierda...
    if(ball.x - ball.radius < 0){
        console.log('Tanto para el jugador de la derecha');
        getPlayers(1).score++;
        newBall();
    } else if (ball.x+ball.radius > CANVAS_WIDTH){
        console.log('Tanto para el jugador de la izquierda');
        getPlayers(0).score++;
        newBall();
    }
}

function render(){
    if(gameState === gameStateEnum.PAUSE){
        drawText('PAUSA', CANVAS_WIDTH/4, CANVAS_HEIGHT/2, 'GREEN');
        return;
    }
    if(gameState === gameStateEnum.PAUSE){
        drawText('Esperando rival...', CANVAS_WIDTH/4, CANVAS_HEIGHT/2, 'GREEN');
        return;
    }
    drawBoard();
    drawPaddle(getPlayers(0));
    drawPaddle(getPlayers(1));
    drawBall(ball);
    drawScore(players);
    if (gameState === gameStateEnum.END){
        drawText('GAME OVER', CANVAS_WIDTH/3, CANVAS_HEIGHT/2, 'BLUE');
    }
}

function next(){
    // Si ha terminado la partida...
    if(gameState === gameStateEnum.END){
        console.log('Game Over');
        stopGameLoop();
        return;
    }
    if ((getPlayers(0).score>=NUM_BALLS) || (getPlayers(1).score>=NUM_BALLS)){
        gameState = gameStateEnum.END;
    }
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
// cAPTURA LOS MOVIMIENTOS DEL JUGADOR ( A TRAVÉS DEL EJE Y DEL RATÓN)
function initPaddleMovement(){
    cvs.addEventListener("mousemove",(event) =>{
        if (gameState !== gameStateEnum.PLAY){
            return;
        }
        const rect = cvs.getBoundingClientRect();
        localPlayer.y = event.clientY - rect.top - localPlayer.height/2;
    });
}
function init(){
    initGameObjects();
    drawBoard();
    initPaddleMovement();
    initGameLoop();
}

// Inicialización del juego
init();