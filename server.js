// npm install para descargar los paquetes...

// Carga variables de entorno (.env)
require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const { auth, requiresAuth } = require("express-openid-connect");
const socketIO = require("socket.io");
const validation = require("./libs/unalib");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = process.env.PORT || 3000;

const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_URL,
};

app.use(auth(authConfig));

// --- RUTAS ---
// Si no está logueado, lo manda a Auth0
app.get("/", (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.oidc.login({ returnTo: "/index" }); // redirige al login
  }
  return res.redirect("/index");
});

// Página principal (index.html)
app.get("/index", requiresAuth(), (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Calculadora
app.get("/calculadora", requiresAuth(), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "calculadora.html"));
});

// Chat
app.get("/chat", requiresAuth(), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));
});

// Logout
app.get("/logout", (req, res) => {
  res.oidc.logout({ returnTo: process.env.BASE_URL });
});

// escuchar una conexion por socket
io.on("connection", function (socket) {
  // si se escucha "chat message"
  socket.on("Evento-Mensaje-Server", function (msg) {
    msg = validation.validateMessage(msg);
    // volvemos a emitir el mismo mensaje
    io.emit("Evento-Mensaje-Server", msg);
  });
});

// home
app.get("/home", requiresAuth(), function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// Calculadora
app.get("/calculadora", requiresAuth(), function (req, res) {
  res.sendFile(__dirname + "/public/calculadora.html");
});

// Chat
app.get("/chat", requiresAuth(), function (req, res) {
  res.sendFile(__dirname + "/public/chat.html");
});

app.get("/health", (req, res) => res.send("ok"));
// Healthcheck: usado por Docker/Orquestadores
app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

const promClient = require("prom-client");
promClient.collectDefaultMetrics();
const register = promClient.register;

const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duración de requests HTTP",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.05, 0.1, 0.3, 0.6, 1, 2, 5],
});

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    end({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
    });
  });
  next();
});

// Exponer /metrics
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// --- HEALTHCHECK ---
app.get("/healthz", (req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/security/canary", (_req, res) => {
  res.set("X-NUCLEI-CANARY", "true");
  res.status(200).send("NUCLEI_CANARY_OK");
});

server.listen(port, () => {
  console.log(`✅ Servidor escuchando en ${process.env.BASE_URL}`);
});
