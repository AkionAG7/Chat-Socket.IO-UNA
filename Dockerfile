FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Instala dependencias en capa de build
COPY package*.json ./
RUN npm ci --omit=dev

# Copia el código
COPY . .

# (Opcional pero recomendado) eliminar npm global para reducir superficie y
# evitar que Grype encuentre cross-spawn dentro de npm del sistema
RUN rm -rf /usr/local/lib/node_modules/npm

EXPOSE 3000

# Healthcheck simple con busybox wget
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

# Ejecutar como no-root
USER node

CMD ["node", "server.js"]
