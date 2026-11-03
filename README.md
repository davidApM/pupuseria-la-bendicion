# 🫓 Pupusería La Bendición

Sistema web completo para pupusería: menú digital con pedidos por WhatsApp, panel administrativo, pantalla de cocina (KDS) e integración simultánea con API REST en C# (.NET).

---

## ✨ Características

- **Ejecución unificada:** Inicio en simultáneo de Frontend y Backend (.NET) mediante un solo comando (`npm start`).
- **Menú digital para clientes:** Selección de productos y envío directo de pedidos por WhatsApp.
- **Panel administrativo:** Gestión e integración de pedidos y productos mediante peticiones `fetch`.
- **KDS (Kitchen Display System):** Pantalla en tiempo real para el área de cocina (`cocina.js`).
- **Backend API REST:** Controladores estructurados en C# (.NET 10.0) con soporte para PostgreSQL.

---

## 📁 Estructura del Proyecto

```text
Pupuseria-La-Bendicion/            # Repositorio Principal (Frontend & Configuración)
├── frontend/                      # Interfaz gráfica de usuario
│   ├── css/                       # Estilos (dashboard.css, cocina.css)
│   ├── js/                        # Lógica e integración Fetch (dashboard.js, cocina.js)
│   ├── cocina.html                # Pantalla KDS para cocina
│   ├── dashboard.html             # Panel administrativo
│   └── index.html                 # Menú digital principal
├── node_modules/                  # Dependencias de Node.js (concurrently, serve)
├── package.json                   # Script de inicio unificado (npm start)
├── package-lock.json
└── README.md

PupuseriaApi/                      # Repositorio Independiente de Backend (C# .NET)
├── Controllers/                   # Endpoints de la API
├── Data/                          # DbContext y Migraciones de PostgreSQL
├── Models/                        # Modelos de datos (Pedido, DetallePedido, etc.)
└── Program.cs                     # Inicialización del servidor C#
🔌 Endpoints de la APIMétodoEndpointDescripciónGET/api/productosObtiene el catálogo de productos disponibles.POST/api/productosAgrega un nuevo producto al sistema.GET/api/pedidosLista los pedidos para el Dashboard y KDS.POST/api/pedidosRegistra un nuevo pedido en la base de datos.⚙️ Instalación y Ejecución Local1. Requisitos Previos.NET SDK 8.0 / 10.0Node.js (v18+) y npmBase de datos PostgreSQL configurada2. Clonar RepositoriosClona el proyecto principal y el backend en tu entorno local:Bash# Frontend / Proyecto Principal
git clone [https://github.com/davidApM/pupuseria-la-bendicion.git](https://github.com/davidApM/pupuseria-la-bendicion.git)
cd pupuseria-la-bendicion

# Backend (.NET) en su ruta independiente
git clone [https://github.com/QC07003/PupuseriaApi.git](https://github.com/QC07003/PupuseriaApi.git) C:\Users\fredy\PupuseriaApi
3. Instalación de DependenciasDentro de la carpeta Pupuseria-La-Bendicion, instala los paquetes requeridos para la ejecución simultánea:Bashnpm install
🚀 Ejecución con Un Solo Comando (npm start)Para levantar ambos entornos al mismo tiempo (Backend C# y Frontend web), solo debes ejecutar en la raíz de Pupuseria-La-Bendicion:Bashnpm start
¿Qué sucede al ejecutar npm start?Backend (.NET): Arranca automáticamente desde C:\Users\fredy\PupuseriaApi en http://localhost:5246.Frontend: Se sirve a través de serve en http://localhost:5500.🌐 Puertos y Entorno de DesarrolloFrontend: http://localhost:5500Menú Cliente: http://localhost:5500/index.htmlKDS Cocina: http://localhost:5500/cocina.htmlDashboard: http://localhost:5500/dashboard.htmlBackend API (.NET): http://localhost:5246📄 LicenciaProyecto bajo licencia MIT. Siéntete libre de modificarlo y adaptarlo a tu negocio.
