name: Grype Image Scan

on:
  push:
    branches: [ main ]
  pull_request:
  workflow_dispatch:

jobs:
  scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # (Opcional) cache de capas para acelerar builds
      - name: Set up Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build image (chat-una:dev)
        run: |
          docker build -t chat-una:dev .

      # Escaneo FAIL si encuentra HIGH (como pediste)
      - name: Scan with Grype (fail on HIGH)
        run: |
          docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            anchore/grype:latest \
            --fail-on high \
            chat-una:dev

      # (Opcional) generar y subir reporte SARIF a Code Scanning
      - name: Generate SARIF
        run: |
          docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            anchore/grype:latest \
            -o sarif \
            chat-una:dev > grype.sarif

      - name: Upload SARIF
        if: always() # sube aunque falle el paso anterior
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: grype.sarif
