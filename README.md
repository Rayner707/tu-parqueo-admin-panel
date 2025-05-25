# 🅿️ Tu Parqueo - Panel Administrativo

Este repositorio contiene la base del **panel administrativo web** del proyecto **Tu Parqueo**, una solución para gestionar parqueos en tiempo real mediante Firebase.

---

## 🚀 Tecnologías

- ⚛️ **React + TypeScript**
- ⚡ **Vite** como entorno de desarrollo rápido
- 🎨 **Tailwind CSS v4** con PostCSS
- 🔥 **Firebase** (Auth, Firestore, Hosting)
- 🧭 **React Router DOM** (por integrar)
- 🧩 Arquitectura modular escalable

---

## 📁 Estructura del proyecto

```bash
tu-parqueo-admin-panel/
├── public/
├── src/
│   ├── assets/           # Íconos e imágenes
│   ├── components/       # Componentes reutilizables
│   ├── pages/            # Páginas como Login, Dashboard, etc.
│   ├── services/         # Conexiones a Firebase, lógica de negocio
│   ├── types/            # Tipos y modelos TypeScript
│   └── utils/            # Utilidades generales
├── postcss.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 🔧 Instalación

1. Clona este repositorio:

  ```bash
  git clone https://github.com/tu-usuario/tu-parqueo-admin-panel.git
  cd tu-parqueo-admin-panel
  ```

2. Instala las dependencias:

  ```bash
  npm install
  ```

3. Inicia el entorno de desarrollo:

  ```bash
  npm run dev
  ```

---

## 🔐 Configuración de Firebase

Este proyecto espera conectarse a una base de datos Firestore con la siguiente estructura(Pudo cambiar fijarse con la estrutura actual que tiene firestore database):

- **users**
  - `userId`, `email`, `name`, `role`: `'admin' | 'client'`
- **parqueos**
  - `nombre`, `ubicacion`, `precioPorHora`, `capacidad`, `tipo`, `estado`, `adminId`
- **reservations**
  - `userId`, `parqueoId`, `vehiculoId`, `horaInicio`, `horaFin`, `estado`, `totalPagado`
- **vehicles**
  - `userId`, `placa`, `tipo`

Recuerda configurar tu archivo `.env` con las credenciales de Firebase.

---

## 📦 Despliegue

Este panel está pensado para ser desplegado en Firebase Hosting:

```bash
npm run build
firebase deploy
```

Asegúrate de configurar correctamente los archivos `firebase.json` y `.firebaserc` para el despliegue.

---

## ✅ Próximas tareas recomendadas

- Integrar **react-router-dom**
- Implementar login con **Firebase Auth**
- Proteger rutas privadas
- CRUD de parqueos
- Vista de historial de reservas
- Dashboard con métricas

---

¡Contribuciones y sugerencias son bienvenidas!
