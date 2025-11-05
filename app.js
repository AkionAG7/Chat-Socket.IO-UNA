const path = require('path');
const express = require('express');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.get('/home', (_,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.get('/chat', (_,res)=>res.sendFile(path.join(__dirname,'public','chat.html')));
app.get('/calculadora', (_,res)=>res.sendFile(path.join(__dirname,'public','calculadora.html')));

module.exports = app;