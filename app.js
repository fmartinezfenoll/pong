'user strict'
//------------ BIBLIOTECAS
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const port = process.env.PORT || 3000;
//------------ SERVIDOR WEB
//Iniciamos un servidor HTTP para la interfaz(FRONT END)
function initWebServer(){
    app.use(express.static(__dirname + '/public'));
    //Indicamos cual es la página por defecto
    app.get((req,res)=>{
        res.sendFile(__dirname + 'index.html');
    });

    server.listen(port, ()=>{
        console.log(`Game server running on port ${port}`);
    })
}

// Inicialización del servidor de juego: Servidor WEB
function init(){
    initWebServer();
}

//Punto de entrada: Iniacialización del servidor de juego
init();