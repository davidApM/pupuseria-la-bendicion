# 🫓 Pupusería La Bendición - Sistema de Gestión, KDS & Menú Digital

Sistema web integral para la administración de comandas en tiempo real, control de comales en cocina (KDS - Kitchen Display System), catálogo de menú y toma de pedidos digitales mediante integración directa con WhatsApp y PostgreSQL.

---

## 🚀 Características Principales

- **Dashboard Administrativo:** Indicadores clave de rendimiento (KPIs), ventas del día por hora, métricas de pupusas más vendidas con Chart.js y gestión integral de comandas.
- **Monitor de Comales (KDS Cocina):** Control de órdenes activas en tiempo real mediante sondeo (*polling* cada 3 segundos), temporizadores automáticos de espera con alertas visuales de tiempo extra y timbres de aviso.
- **Menú Digital para Clientes:** Interfaz web para selección de productos (tipo de masa maíz/arroz, cantidades), cálculo dinámico de totales y envío automático del pedido al WhatsApp del negocio.
- **Facturación / Tickets WhatsApp:** Opción para enviar el detalle de la comanda formateado directamente al número de teléfono del cliente.
- **Autenticación por Roles:** Acceso diferenciado para Administrador y personal de Cocina.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, FontAwesome 6, Chart.js.
- **Backend:** Node.js, Express.js.
- **Base de Datos:** PostgreSQL (Administración de productos, comandas y detalle de items).

---

## 📁 Estructura del Proyecto

```text
pupuseria-la-bendicion/
├── backend/
│   ├── config/
│   │   └── db.js            # Conexión a PostgreSQL
│   ├── server.js            # API REST (Endpoints de login, pedidos y productos)
│   └── package.json
└── frontend/
    ├── css/
    │   └── dashboard.css    # Estilos del panel administrativo
    ├── js/
    │   ├── dashboard.js     # Lógica del dashboard y KDS
    │   └── menu-cliente.js  # Lógica del menú digital e integración con WhatsApp
    ├── dashboard.html       # Interfaz administrativa y KDS
    └── menu.html            # Menú digital para clientes

🔑 Credenciales de PruebaRolUsuarioContraseña.
🛡️ Administradoradmin: 1234
🍳 Cocina KDScocina:1234

⚙️ Instalación y Configuración Local
1. Requisitos Previos
Node.js (v16 o superior)

PostgreSQL (Servidor local o remoto activo)
2. Clonar el Repositorio:
git clone [https://github.com/TU-USUARIO/pupuseria-la-bendicion.git](https://github.com/TU-USUARIO/pupuseria-la-bendicion.git)
cd pupuseria-la-bendicion

3. Configurar Backend e Instalación de Dependencias
cd backend
npm install

Configura tus variables de entorno en un archivo .env o dentro de config/db.js:
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=pupuseria_db
DB_PORT=5432

Inicia el servidor backend:
npm start
# O con nodemon para desarrollo:
npm run dev

El servidor quedará corriendo en: http://localhost:3000/api

4. Ejecutar el Frontend
Puedes servir la carpeta frontend mediante la extensión Live Server de VS Code o abrir directamente los archivos .html en tu navegador:

Dashboard: http://localhost:5000/dashboard.html (o frontend/dashboard.html)

Menú Cliente: http://localhost:5000/menu.html (o frontend/menu.html)

🌐 Configuración para Producción (GitHub Pages + Render)
Dado que GitHub Pages solo aloja archivos estáticos (HTML/CSS/JS) bajo HTTPS, la constante API_URL en dashboard.js y menu-cliente.js detecta automáticamente el entorno:

JavaScript
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : '[https://TU-BACKEND-EN-RENDER.onrender.com/api](https://TU-BACKEND-EN-RENDER.onrender.com/api)';
📄 Licencia
Este proyecto está bajo la licencia MIT. Siéntete libre de modificarlo y adaptarlo a tu negocio.


