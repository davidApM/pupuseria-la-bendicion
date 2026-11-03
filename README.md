Aquí tienes la versión de tu `README.md` formateada correctamente en Markdown y ajustada a la arquitectura real que subiste a GitHub:

```markdown
# 🫓 Pupusería La Bendición

Sistema web completo para pupusería: menú digital con pedidos por WhatsApp, panel administrativo, pantalla de cocina (KDS) e integración con API REST en C# (.NET).

---

## ✨ Características

- **Menú digital para clientes:** Selección de productos y envío directo de pedidos por WhatsApp.
- **Panel administrativo:** Gestión e integración de pedidos y productos mediante peticiones `fetch`.
- **KDS (Kitchen Display System):** Pantalla en tiempo real para el área de cocina (`cocina.js`).
- **Backend API REST:** Controladores estructurados en C# para manejar la persistencia de datos.

---

## 📁 Estructura del Proyecto

```text
pupuseria-la-bendicion/
├── backend/                  # API REST en C# (.NET)
│   ├── Controllers/          # Endpoints (PedidosController, ProductosController)
│   ├── Data/                 # Contexto de Base de Datos y Migraciones
│   ├── Models/               # Modelos de datos (Pedido, Producto, etc.)
│   └── Program.cs            # Configuración e inicialización del servidor
└── frontend/                 # Interfaz gráfica de usuario
    ├── css/                  # Estilos (dashboard.css)
    ├── js/                   # Lógica e integración Fetch (dashboard.js, cocina.js, menu-cliente.js)
    ├── dashboard.html        # Panel administrativo y pantalla KDS
    └── index.html            # Menú digital principal

```

---

## 🔌 Endpoints de la API

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `GET` | `/api/productos` | Obtiene el catálogo de productos disponibles. |
| `POST` | `/api/productos` | Agrega un nuevo producto al sistema. |
| `GET` | `/api/pedidos` | Lista los pedidos para el Dashboard y KDS. |
| `POST` | `/api/pedidos` | Registra un nuevo pedido. |

---

## ⚙️ Instalación y Ejecución Local

### 1. Requisitos Previos

* [.NET SDK 8.0 / 10.0](https://dotnet.microsoft.com/)
* Motor de base de datos (SQL Server / PostgreSQL)
* Visual Studio Code con extensión **Live Server** (para el frontend)

### 2. Clonar el Repositorio

```bash
git clone [https://github.com/davidApM/pupuseria-la-bendicion.git](https://github.com/davidApM/pupuseria-la-bendicion.git)
cd pupuseria-la-bendicion

```

### 3. Configurar y Ejecutar el Backend (C#)

```bash
cd backend
dotnet restore
dotnet run

```

> La API estará escuchando peticiones en `http://localhost:5000/api` (o el puerto configurado en Kestrel).

### 4. Ejecutar el Frontend

Sirve la carpeta `frontend/` mediante **Live Server** en VS Code:

* **Dashboard / KDS:** `http://127.0.0.1:5500/frontend/dashboard.html`
* **Menú Cliente:** `http://127.0.0.1:5500/frontend/index.html`

---

## 🌐 Configuración de Entorno (API_URL)

En los archivos JavaScript (`dashboard.js`, `cocina.js` y `menu-cliente.js`), la constante `API_URL` detecta automáticamente si estás trabajando localmente o en servidor remoto:

```javascript
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : '[https://TU-BACKEND-EN-RENDER.onrender.com/api](https://TU-BACKEND-EN-RENDER.onrender.com/api)';

```

---

## 📄 Licencia

Proyecto bajo licencia MIT. Siéntete libre de modificarlo y adaptarlo a tu negocio.

```

---

### Pasos finales para subir el README a GitHub

En tu terminal de PowerShell dentro de `Pupuseria-La-Bendicion`, ejecuta:

```powershell
git add README.md
git commit -m "docs: actualizacion de README.md con soporte para backend C# y endpoints"
git push origin main

```


