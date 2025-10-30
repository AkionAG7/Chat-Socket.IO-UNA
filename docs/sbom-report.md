# Reporte de Análisis SBOM - Chat-Socket.IO-UNA

## Resumen del SBOM
- **Componentes totales**: 228 dependencias (154 producción, 74 desarrollo, 1 opcional)
- **Dependencias directas principales**: express (4.18.2), socket.io (4.7.2), mocha (10.2.0)
- **Licencias predominantes**: MIT, ISC, Apache-2.0
- **Vulnerabilidades detectadas**: 15 total (7 HIGH, 3 MODERATE, 5 LOW)

## Matriz de riesgo

| Componente | Versión | Licencia | Fuente | Prob(1-5) | Impacto(1-5) | Riesgo | Evidencia | Recomendación |
|------------|---------|----------|---------|-----------|---------------|--------|-----------|---------------|
| express | 4.18.2 | MIT | Directa | 4 | 5 | 20 | CVE: GHSA-rv95-896h-c2vc, GHSA-qw6h-vgh9-j6wx | **CRÍTICO**: Actualizar a ≥4.21.1, aplicar validación entrada |
| socket.io | 4.7.2 | MIT | Directa | 3 | 4 | 12 | Vulnerabilidades en engine.io/ws subyacentes | Actualizar a ≥4.8.0, revisar configuración CORS |
| body-parser | <1.20.3 | MIT | Transitiva | 4 | 4 | 16 | GHSA-qwcr-r2fm-qrc7 (DoS vulnerability) | Actualizar express para obtener body-parser ≥1.20.3 |
| path-to-regexp | ≤0.1.11 | MIT | Transitiva | 5 | 4 | 20 | GHSA-9wv6-86v2-598j, GHSA-rhx6-c78j-4q9w (ReDoS) | **CRÍTICO**: Actualizar express, implementar timeout routing |
| ws | 8.0.0-8.17.0 | MIT | Transitiva | 4 | 3 | 12 | GHSA-3h5v-q93c-6h6q (DoS headers) | Actualizar a ≥8.17.1 |
| braces | <3.0.3 | MIT | Transitiva | 4 | 3 | 12 | GHSA-grv7-fg5c-xmjg (resource consumption) | Actualizar a ≥3.0.3 |
| mocha | 10.2.0 | MIT | Directa | 2 | 2 | 4 | Vulnerabilidades menores en nanoid/serialize-js | Actualizar a ≥10.6.0 cuando disponible |
| nanoid | <3.3.8 | MIT | Transitiva | 3 | 2 | 6 | GHSA-mwcw-c2x4-8c55 (predictable results) | Actualizar mocha para obtener nanoid ≥3.3.8 |

## Matriz de Riesgo – Chat-Socket.IO-UNA
_Fuente: sbom.json + audit.json_

| **Componente** | **Versión** | **Tipo** | **Prob. (1–5)** | **Impacto (1–5)** | **Riesgo (P×I)** | **Evidencia (CVE Advisory** | **Acción Recomendada** |
--------------------------------|-------------------------|
| **express** | ≤4.21.0 | Directa (prod) | 4 | 5 | 🔴 **20** | [GHSA-rv95-896h-c2vc](https://github.com/advisories/GHSA-rv95-896h-c2vc), [GHSA-qw6h-vgh9-j6wx](https://github.com/advisories/GHSA-qw6h-vgh9-j6wx) | Actualizar a ≥4.21.1. Revisar `res.redirect()` y sanitización de URLs. |
| **path-to-regexp** | ≤0.1.11 | Transitiva | 5 | 4 | 🔴 **20** | [GHSA-9wv6-86v2-598j](https://github.com/advisories/GHSA-9wv6-86v2-598j), [GHSA-rhx6-c78j-4q9w](https://github.com/advisories/GHSA-rhx6-c78j-4q9w) | Actualizar `express` para traer versión ≥0.1.12. Implementar timeouts. |
| **body-parser** | <1.20.3 | Transitiva | 4 | 4 | 🟠 **16** | [GHSA-qwcr-r2fm-qrc7](https://github.com/advisories/GHSA-qwcr-r2fm-qrc7) | Subir `express` para incluir `body-parser` ≥1.20.3. Validar tamaños de payload. |
| **engine.io** | ≤6.6.1 | Transitiva | 4 | 4 | 🟠 **16** | Vía `cookie` y `ws` | Actualizar `socket.io` ≥4.7.6. Revisar CORS y límites de conexión. |
| **ws** | <8.17.1 | Transitiva | 4 | 3 | 🟡 **12** | [GHSA-3h5v-q93c-6h6q](https://github.com/advisories/GHSA-3h5v-q93c-6h6q) | Actualizar a ≥8.17.1 (arrastrado por `socket.io`). |
| **socket.io-adapter** | 2.5.2–2.5.4 | Transitiva | 3 | 3 | 🟡 **9** | Vulnerable vía `ws` | Actualizar `socket.io` (arrastra adapter fijo). |
| **cookie** | <0.7.0 | Transitiva | 2 | 2 | 🟢 **4** | [GHSA-pxg6-pf52-xh8x](https://github.com/advisories/GHSA-pxg6-pf52-xh8x) | Actualizar `cookie` ≥0.7.0. |
| **send** | <0.19.0 | Transitiva | 2 | 2 | 🟢 **4** | [GHSA-m6fv-jmcg-4jfg](https://github.com/advisories/GHSA-m6fv-jmcg-4jfg) | Actualizar `send` ≥0.19.0 (vía `express`). |
| **serve-static** | ≤1.16.0 | Transitiva | 2 | 2 | 🟢 **4** | [GHSA-cm22-4g7w-348p](https://github.com/advisories/GHSA-cm22-4g7w-348p) | Actualizar `express` para obtener `serve-static` seguro. |
| **braces** | <3.0.3 | Transitiva | 3 | 3 | 🟡 **9** | [GHSA-grv7-fg5c-xmjg](https://github.com/advisories/GHSA-grv7-fg5c-xmjg) | Actualizar dependencias que usan `braces` ≥3.0.3. |
| **brace-expansion** | 1.0.0–1.1.11 / 2.0.0–2.0.1 | Transitiva (dev) | 2 | 2 | 🟢 **4** | [GHSA-v6h2-p8h4-qcjw](https://github.com/advisories/GHSA-v6h2-p8h4-qcjw) | Actualizar a ≥1.1.12 / ≥2.0.2. |
| **mocha** | 10.2.0 | Directa (dev) | 2 | 1 | 🟢 **2** | Vulnerabilidades menores vía `nanoid`/`serialize-javascript` | Actualizar mocha a ≥10.6.0. Bajo impacto (entorno de prueba). |
| **nanoid** | <3.3.8 | Transitiva (dev) | 2 | 1 | 🟢 **2** | [GHSA-mwcw-c2x4-8c55](https://github.com/advisories/GHSA-mwcw-c2x4-8c55) | Actualizar vía `mocha`. |
| **serialize-javascript** | 6.0.0–6.0.1 | Transitiva (dev) | 2 | 1 | 🟢 **2** | [GHSA-76p7-773f-r4q5](https://github.com/advisories/GHSA-76p7-773f-r4q5) | Actualizar a ≥6.0.2. |

---

## Conclusión

- **Umbral de tolerancia:** Riesgo ≥ **8** → **Inaceptable**.  
- **Componentes críticos:** `express`, `path-to-regexp`, `body-parser`, `engine.io` → requieren actualización inmediata.  
- **Acciones prioritarias:**  
  1. Actualizar `express` ≥4.21.1 y `socket.io` ≥4.7.6.  
  2. Ejecutar `npm audit fix` y verificar con `npm audit --production`.  
  3. Implementar mitigaciones temporales: validación de entrada, limitación de tamaño y timeouts.  
  4. Establecer revisión mensual de dependencias y pipeline automático de auditoría.

1. **Inmediata**: Actualizar express a versión ≥4.21.1 para resolver vulnerabilidades XSS y Open Redirect
2. **Alta prioridad**: Actualizar socket.io a ≥4.8.0 y configurar headers de seguridad apropiados
3. **Monitoreo**: Implementar npm audit en CI/CD y revisiones mensuales de dependencias
4. **Mitigación**: Aplicar rate limiting, validación estricta de entrada y timeouts en routing hasta completar actualizaciones
