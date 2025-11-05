FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# (Opcional) Si quieres mantenerlo puedes dejarlo, pero ya no es necesario para el runtime
RUN npm i -g npm@11.6.2 && npm config set update-notifier false

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Permisos para usuario no-root
RUN chown -R node:node /app

# 🚫 Quitar npm del contenedor de runtime (no se usa en producción)
#    Esto elimina el árbol donde está 'tar@7.5.1' que detecta Grype.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

USER node
CMD ["node", "server.js"]
