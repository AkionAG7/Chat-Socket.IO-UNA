// Dependencias
const path = require('path');
const validation = require('./libs/unalib');
const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// ---- Middlewares ----
// Servir archivos estáticos desde /public (css, js, imgs, html)
app.use(express.static(path.join(__dirname, 'public')));

// ---- Rutas HTTP ----
// Página raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Calculadora
app.get('/calculadora', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'calculadora.html'));
});

// Chat
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Healthcheck (para Docker HEALTHCHECK)
app.get('/health', (req, res) => res.status(200).send('ok'));

// ---- Socket.IO ----
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Evento de mensaje
  socket.on('Evento-Mensaje-Server', (msg) => {
    const safeMsg = validation.validateMessage(msg);
    io.emit('Evento-Mensaje-Server', safeMsg);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// ---- Arranque del servidor ----
// MUY IMPORTANTE: 0.0.0.0 para que funcione dentro del contenedor
http.listen(PORT, '0.0.0.0', () => {
  console.log(`listening on http://0.0.0.0:${PORT}`);
});

// Healthcheck: usado por Docker/Orquestadores
app.get('/health', (req, res) => {
  res.status(200).send('ok');
});
