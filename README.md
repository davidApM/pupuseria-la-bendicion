# 🫓 Pupusería La Bendición

Sistema web para pupusería: menú digital con pedidos por WhatsApp, panel administrativo y pantalla de cocina (KDS).

## ✨ Características
- Menú digital para clientes con envío de pedido por WhatsApp
- Panel administrativo (productos y pedidos)
- KDS (Kitchen Display System) para la cocina
- Autenticación por roles

## 📁 Estructura del proyecto
```
pupuseria-la-bendicion/
├── backend/
│   ├── config/
│   │   └── db.js            # Conexión a PostgreSQL
│   ├── server.js            # API REST (login, pedidos y productos)
│   └── package.json
└── frontend/
    ├── css/
    │   └── dashboard.css    # Estilos del panel administrativo
    ├── js/
    │   ├── dashboard.js     # Lógica del dashboard y KDS
    │   └── menu-cliente.js  # Menú digital e integración con WhatsApp
    ├── dashboard.html       # Interfaz administrativa y KDS
    └── menu.html            # Menú digital para clientes
```

## 🔑 Credenciales de prueba (solo desarrollo local)

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| 🛡️ Administrador | `admin` | `1234` |
| 🍳 Cocina KDS | `cocina` | `1234` |

> ⚠️ Cambia estas credenciales antes de desplegar en producción.

## ⚙️ Instalación local

### 1. Requisitos
- Node.js v16 o superior
- PostgreSQL activo

### 2. Clonar el repositorio
```bash
git clone https://github.com/TU-USUARIO/pupuseria-la-bendicion.git
cd pupuseria-la-bendicion
```

### 3. Base de datos
```bash
createdb pupuseria_db
psql -d pupuseria_db -f backend/schema.sql
```

### 4. Backend
```bash
cd backend
npm install
```
Crea un archivo `.env` (puedes copiar `.env.example`):
```
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=pupuseria_db
DB_PORT=5432
```
Inicia el servidor:
```bash
npm start
# o en desarrollo:
npm run dev
```
API disponible en `http://localhost:3000/api`

### 5. Frontend
Sirve la carpeta `frontend` con la extensión **Live Server** de VS Code:
- Dashboard: `http://localhost:5500/dashboard.html`
- Menú cliente: `http://localhost:5500/menu.html`

## 🌐 Producción (GitHub Pages + Render)

GitHub Pages solo aloja archivos estáticos, así que el backend se despliega en Render. La constante `API_URL` en `dashboard.js` y `menu-cliente.js` detecta el entorno automáticamente:

```javascript
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : 'https://TU-BACKEND-EN-RENDER.onrender.com/api';
```

> ℹ️ En el plan gratuito de Render el servidor se suspende por inactividad; la primera petición puede tardar hasta 1 minuto.

## 📄 Licencia
Proyecto bajo licencia MIT. Siéntete libre de modificarlo y adaptarlo a tu negocio.


