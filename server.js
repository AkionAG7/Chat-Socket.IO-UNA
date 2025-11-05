
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

app.get('/health', (req, res) => res.send('ok'));
// Healthcheck: usado por Docker/Orquestadores
app.get('/health', (req, res) => {
  res.status(200).send('ok');
});

const promClient = require('prom-client');      
promClient.collectDefaultMetrics();              
const register = promClient.register;             

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de requests HTTP',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.6, 1, 2, 5]
});

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({
      method: req.method,
      route: req.route?.path || req.path,  
      status_code: res.statusCode
    });
  });
  next();
});

// Exponer /metrics
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// --- HEALTHCHECK ---
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true });
});

app.get('/security/canary', (_req, res) => {
  res.set('X-NUCLEI-CANARY', 'true');
  res.status(200).send('NUCLEI_CANARY_OK');
});