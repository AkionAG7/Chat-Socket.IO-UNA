# 🛡️ Guía de Estándar de Desarrollo Seguro

---

## 🚀 Objetivo
Asegurar que todo el equipo mantenga un **nivel constante de calidad y seguridad** en cada desarrollo, desde el código hasta la gestión de dependencias.

---

## 🧭 Flujo básico obligatorio

1. ✅ **BDD (Behavior-Driven Development)**  
   Usa el formato `Given/When/Then` en tus pruebas (`describe/it` o equivalente).

2. ✅ **Linting local**  
   Ejecuta `npm lint` **no debe haber errores bloqueantes**.

3. ✅ **Build local**  
   Asegura que `npm build` **compile sin errores** antes de hacer commit.

4. ✅ **Pruebas**  
   Ejecuta `npm test` y verifica que todas pasen al 100 %.

5. ✅ **Commits**  
   Usa la convención:  
   `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, etc.

6. ✅ **Ramas**  
   Sigue el formato `tipo/descripcion-corta` →  
   Ejemplo: `feat/login-bdd`.

> 💡 *Ningún Pull Request se aprueba si falla cualquiera de los pasos anteriores.*

---

## 🤖 Reglas para uso de Agentes IA

- Se permite su uso **solo para acelerar tareas o refactorizar**.  
- **Revisar siempre** el código generado para evitar:  
  - credenciales expuestas  
  - validaciones omitidas  
  - dependencias inseguras  
- ❌ **Nunca incluir secretos reales** en prompts.  
- Si se agregan nuevas dependencias sugeridas por IA, **evaluar el riesgo** (ver matriz).

> 🧠 *Cita el prompt o fuente en el PR si la IA contribuyó al cambio.*

---

## 💻 Convenciones de código

- **Lenguaje:** TypeScript / JavaScript  
- **Nomenclatura:**  
  - Variables → `camelCase`  
  - Componentes → `PascalCase`  
  - Archivos → `kebab-case`
- **Errores:** usar tipos específicos; no exponer información sensible.  
- **Validaciones:** nunca confiar en el cliente.  
- **Secretos:** usar `.env` y ejemplo de configuración (`.env.example`).

---

## ✅ Checklist de revisión antes de aprobar PR

- [ ] Pruebas BDD agregadas o actualizadas  
- [ ] Lint pasa sin errores  
- [ ] Build compila correctamente  
- [ ] No hay secretos ni credenciales  
- [ ] SBOM actualizado (si hubo nuevas dependencias)  
- [ ] Riesgo de dependencias ≤ 6  

## 📦 SBOM — *Software Bill of Materials*

Archivo: `docs/security/sbom.json`  
Debe incluir:

- Bibliotecas y módulos externos  
- Frameworks usados  
- Versiones y licencias  
- Riesgo de seguridad asociado  

🧩 **Actualizarlo** con cada release o al añadir dependencias.