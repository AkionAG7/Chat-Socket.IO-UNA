# Guía de Integración — Gitflow

## ¿Qué es Gitflow?

**Gitflow** es una forma organizada de trabajar con ramas en Git.  
Se usa para que varios desarrolladores puedan colaborar sin chocar entre sí y mantener un flujo claro de cambios en un proyecto.

Piensa en él como un mapa de carreteras: cada camino (rama) tiene un propósito y reglas claras de cómo entrar y salir.

---

## 🧩 Conceptos clave

### **main**
- Es la rama principal.  
- Contiene el código estable y listo para usarse en producción.  
👉 *Piensa en ella como la "versión oficial" del proyecto.*

---

### **develop**
- Rama donde se integran nuevas funcionalidades antes de que pasen a `main`.  
👉 *Es como un laboratorio donde se junta el trabajo en progreso.*

---

### **PR (Pull Request)**
- Es la solicitud para fusionar (*merge*) tu trabajo en otra rama.  
👉 *Es como decir: “Ya terminé, ¿pueden revisar y aprobar mi cambio?”*

---

### **feat/**
- Ramas que empiezan con `feat/` sirven para crear nuevas funcionalidades.  
👉 *Ejemplo:* `feat/login` *(agregar login).*

---

### **fix/**
- Ramas que empiezan con `fix/` sirven para corregir errores pequeños que no rompen producción.  
👉 *Ejemplo:* `fix/ui`.

---

### **hotfix/**
- Ramas para arreglar errores urgentes en producción.  
👉 *Ejemplo:* `hotfix/payment-bug`.

---

### **release/**
- Rama usada para preparar una nueva versión.  
👉 *Ejemplo:* `release/v1.0.0`.  
Aquí se hacen pruebas finales y ajustes antes de enviar a `main`.

---

### **merge**
- Acción de juntar (*fusionar*) el trabajo de una rama en otra.  
👉 *Ejemplo:* pasar lo de `feat/login` a `develop`.

---

## 📌 Resumen gráfico

| Rama | Propósito |
|------|------------|
| **main** | Versión estable. |
| **develop** | Integración de nuevas funciones. |
| **feat/** | Desarrollo de nuevas funcionalidades. |
| **fix/** | Corrección de errores menores. |
| **hotfix/** | Corrección de errores urgentes en producción. |
| **release/** | Preparar nueva versión. |
| **PR** | Solicitud para revisar y fusionar. |
| **merge** | Acción de juntar ramas. |

---

📘 **Consejo:**  
Antes de hacer un merge o PR, asegúrate de que tu código haya pasado los tests, linting y build correctamente.