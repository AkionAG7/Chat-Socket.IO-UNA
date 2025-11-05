[![Docker Build & Grype Scan](https://github.com/AkionAG7/Chat-Socket.IO-UNA/actions/workflows/grype.yml/badge.svg)](https://github.com/AkionAG7/Chat-Socket.IO-UNA/actions/workflows/grype.yml)

# Chat Socket.IO UNA

Pequeña app Node.js + Express + Socket.IO con calculadora y chat.

## Scripts útiles

- \
pm start\: inicia el servidor (puerto 3000).
- \
pm run build:image\: construye la imagen Docker \chat-una:dev\.
- \
pm run scan:image\: escanea la imagen con Grype y falla en HIGH/CRITICAL.
- \
pm run scan:image:fixed\: escanea mostrando solo vulnerabilidades con fix disponible.
- \
pm run scan:image:sarif\: genera \grype.sarif\ para code scanning.

