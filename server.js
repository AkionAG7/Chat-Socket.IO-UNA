
// npm install para descargar los paquetes...

// Carga variables de entorno (.env)
require('dotenv').config();


// libreriuas
const validation = require('./libs/unalib');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const { auth, requiresAuth } = require('express-openid-connect'); 

const authConfig = {
  authRequired: false,                 
  auth0Logout: true,                   
  secret: process.env.AUTH0_SECRET,    
  baseURL: process.env.BASE_URL,      
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_URL
};
app.use(auth(authConfig));


// escuchar una conexion por socket
io.on('connection', function(socket){
  // si se escucha "chat message"
  socket.on('Evento-Mensaje-Server', function(msg){

    msg =  validation.validateMessage(msg);
    // volvemos a emitir el mismo mensaje
    io.emit('Evento-Mensaje-Server', msg);
  });
});

http.listen(port, () =>{
  console.log(`listening on ${process.env.BASE_URL}`);
});

// home 
app.get('/home', requiresAuth(), function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// Calculadora
app.get('/calculadora', requiresAuth(), function(req, res){
  res.sendFile(__dirname + '/public/calculadora.html');
});

// Chat
app.get('/chat', requiresAuth(), function(req, res){
  res.sendFile(__dirname + '/public/chat.html');
});