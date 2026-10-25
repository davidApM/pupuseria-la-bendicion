// CONFIGURACIÓN DE CONEXIÓN CON EL BACKEND
const API_URL = 'http://10.239.185.123:3000/api';

let usuarioActual = null;
let filtroEstadoActual = 'Todos';
let pedidos = [];
let productosMenu = [];
let chartVentas = null;
let chartPupusas = null;

// INICIALIZACIÓN Y SINCRONIZACIÓN AUTOMÁTICA
document.addEventListener('DOMContentLoaded', () => {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        dateEl.innerText = new Date().toLocaleDateString('es-SV', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    // Carga de datos inicial
    renderizarTodo();

    // Actualización continua de temporizadores KDS y sincronización con PostgreSQL (cada 3s)
    setInterval(() => {
        // Incrementar segundos en comal para las tarjetas activas
        pedidos.forEach(p => {
            if (p.estado === 'En Comal') p.segundos = (p.segundos || 0) + 1;
        });

        // Si la sección de cocina está visible, refrescar temporizadores del KDS
        const cocinaSec = document.getElementById('section-cocina');
        if (cocinaSec && !cocinaSec.classList.contains('d-none')) {
            renderizarKDSCocina();
        }

        // Consultar PostgreSQL en segundo plano para mantener los datos al día
        obtenerPedidosDesdeBD().then(() => {
            renderizarKPIs();
            renderizarTablaPedidos();
        });
    }, 3000);
});

// AUTENTICACIÓN CON BACKEND Y BASE DE DATOS
async function autenticarUsuario(e) {
    e.preventDefault();
    const u = document.getElementById('login-user').value.trim().toLowerCase();
    const p = document.getElementById('login-pass').value.trim();
    const alertBox = document.getElementById('login-alert');

    try {
        const respuesta = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: u, password: p })
        });

        const data = await respuesta.json();

        if (respuesta.ok && data.ok) {
            usuarioActual = { 
                username: data.usuario.usuario, 
                role: data.usuario.rol === 'admin' ? 'Administrador' : 'Cocina KDS' 
            };

            const overlay = document.getElementById('login-overlay');
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.visibility = 'hidden';
                document.getElementById('main-app').style.display = 'flex';
                configurarVistaPorRol();
                renderizarTodo();
            }, 400);
        } else {
            alertBox.innerText = data.mensaje || 'Usuario o contraseña incorrectos.';
            alertBox.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Error al autenticar:', error);
        alertBoxPara resolver los dos problemas que mencionas (**que no carga datos desde el inicio y que no actualiza la vista en tiempo real**), se deben realizar dos correcciones puntuales en `dashboard.js`:

1. **Cargar datos inmediatamente:** Al iniciar (`DOMContentLoaded`), debemos llamar a `renderizarTodo()` sin esperar a que el usuario presione el botón de login.
2. **Sincronización en tiempo real (Polling):** Debemos añadir un intervalo (`setInterval`) que consulte a PostgreSQL cada 3 segundos y actualice la interfaz sin necesidad de refrescar el navegador.

---

### 📄 Código Completo y Corregido de `frontend/js/dashboard.js`

Reemplaza todo el contenido de tu archivo `dashboard.js` con esta versión optimizada:

```javascript
// CONFIGURACIÓN DE CONEXIÓN CON EL BACKEND
const API_URL = '[http://10.239.185.123:3000/api](http://10.239.185.123:3000/api)';

let usuarioActual = null;
let filtroEstadoActual = 'Todos';
let pedidos = [];
let productosMenu = [];
let chartVentas = null;
let chartPupusas = null;

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        dateEl.innerText = new Date().toLocaleDateString('es-SV', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    // 1. CARGA INICIAL DE DATOS AL ENTRAR A LA PÁGINA
    renderizarTodo();

    // 2. SINCRONIZACIÓN CONTINUA EN TIEMPO REAL (Cada 3 segundos)
    setInterval(async () => {
        // Incrementar temporizadores de pedidos en comal
        pedidos.forEach(p => {
            if (p.estado === 'En Comal') p.segundos = (p.segundos || 0) + 1;
        });

        // Actualizar datos desde la base de datos PostgreSQL
        await obtenerPedidosDesdeBD();
        renderizarKPIs();
        renderizarTablaPedidos();

        const cocinaSec = document.getElementById('section-cocina');
        if (cocinaSec && !cocinaSec.classList.contains('d-none')) {
            renderizarKDSCocina();
        }
    }, 3000);
});

// AUTENTICACIÓN CON BACKEND Y BASE DE DATOS
async function autenticarUsuario(e) {
    e.preventDefault();
    const u = document.getElementById('login-user').value.trim().toLowerCase();
    const p = document.getElementById('login-pass').value.trim();
    const alertBox = document.getElementById('login-alert');

    try {
        const respuesta = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: u, password: p })
        });

        const data = await respuesta.json();

        if (respuesta.ok && data.ok) {
            usuarioActual = { 
                username: data.usuario.usuario, 
                role: data.usuario.rol === 'admin' ? 'Administrador' : 'Cocina KDS' 
            };

            const overlay = document.getElementById('login-overlay');
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.visibility = 'hidden';
                document.getElementById('main-app').style.display = 'flex';
                configurarVistaPorRol();
                renderizarTodo();
            }, 400);
        } else {
            alertBox.innerText = data.mensaje || 'Usuario o contraseña incorrectos.';
            alertBox.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Error al autenticar:', error);
        alertBox.innerText = 'No se pudo conectar con el servidor de PostgreSQL.';
        alertBox.classList.remove('d-none');
    }
}

function cerrarSesion() {
    const overlay = document.getElementById('login-overlay');
    overlay.style.visibility = 'visible';
    overlay.style.opacity = '1';
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('form-login').reset();
    document.getElementById('login-alert').classList.add('d-none');
    usuarioActual = null;
}

function configurarVistaPorRol() {
    document.getElementById('user-role-badge').innerText = usuarioActual.role;
    if (usuarioActual.username === 'cocina') {
        navegarA('cocina');
        document.getElementById('nav-dashboard').style.display = 'none';
        document.getElementById('nav-menu').style.display = 'none';
    } else {
        document.getElementById('nav-dashboard').style.display = 'block';
        document.getElementById('nav-menu').style.display = 'block';
        navegarA('dashboard');
    }
}

// NAVEGACIÓN ENTRE VISTAS
function navegarA(seccion) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('d-none'));
    document.querySelectorAll('#sidebar ul li').forEach(el => el.classList.remove('active'));

    const targetSec = document.getElementById(`section-${seccion}`);
    const targetNav = document.getElementById(`nav-${seccion}`);
    
    if (targetSec) targetSec.classList.remove('d-none');
    if (targetNav) targetNav.classList.add('active');

    const titulos = {
        'dashboard': 'Dashboard General de Ventas',
        'pedidos': 'Gestión Integral de Pedidos',
        'cocina': 'Monitor de Comales (KDS Cocina)',
        'menu': 'Administración del Catálogo de Menú'
    };
    document.getElementById('page-title').innerText = titulos[seccion] || 'Panel de Control';

    if (seccion === 'dashboard') inicializarGraficos();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// OBTENCIÓN Y RENDERIZADO DE DATOS DESDE POSTGRESQL
async function renderizarTodo() {
    await obtenerPedidosDesdeBD();
    await obtenerProductosMenuBD();
    renderizarKPIs();
    renderizarTablaPedidos();
    renderizarKDSCocina();
    renderizarCatalogoMenu();
}

async function obtenerPedidosDesdeBD() {
    try {
        const res = await fetch(`${API_URL}/comandas`);
        if (res.ok) {
            const comandasBD = await res.json();
            pedidos = comandasBD.map(c => {
                const inicio = c.creado_en ? new Date(c.creado_en) : new Date();
                const diffSeg = Math.floor((new Date() - inicio) / 1000);

                return {
                    id: c.id,
                    cliente: c.cliente,
                    entrega: c.tipo_entrega,
                    estado: c.estado,
                    total: parseFloat(c.total || 0),
                    segundos: diffSeg > 0 ? diffSeg : 0,
                    items: c.items ? c.items.map(i => ({
                        cant: i.cantidad,
                        prod: i.producto,
                        masa: i.tipo_masa || ''
                    })) : []
                };
            });
        }
    } catch (error) {
        console.error("Error al obtener comandas desde PostgreSQL:", error);
    }
}

async function obtenerProductosMenuBD() {
    try {
        const res = await fetch(`${API_URL}/productos`);
        if (res.ok) {
            productosMenu = await res.json();
        }
    } catch (error) {
        console.error("Error al obtener menú:", error);
    }
}

function renderizarKPIs() {
    const totalVentas = pedidos.filter(p => p.estado !== 'Cancelado').reduce((sum, p) => sum + p.total, 0);
    const activos = pedidos.filter(p => p.estado === 'En Comal').length;

    document.getElementById('kpi-ventas').innerText = `$${totalVentas.toFixed(2)}`;
    document.getElementById('kpi-pedidos').innerText = pedidos.length;
    document.getElementById('kpi-activos').innerText = activos;
}

function renderizarTablaPedidos() {
    const tbody = document.getElementById('tabla-pedidos-body');
    if (!tbody) return;

    const searchVal = document.getElementById('filter-search')?.value.toLowerCase() || '';

    const pedidosFiltrados = pedidos.filter(p => {
        const matchSearch = p.cliente.toLowerCase().includes(searchVal) || p.id.toString().includes(searchVal);
        const matchEstado = filtroEstadoActual === 'Todos' || p.estado === filtroEstadoActual;
        return matchSearch && matchEstado;
    });

    tbody.innerHTML = pedidosFiltrados.map(p => {
        const badgeClass = p.estado === 'En Comal' ? 'badge-comal' : p.estado === 'Listo' ? 'badge-listo' : p.estado === 'Entregado' ? 'badge-entregado' : 'badge-cancelado';
        const detalleStr = p.items.map(i => `${i.cant}x ${i.prod} ${i.masa ? '('+i.masa+')' : ''}`).join(', ');

        return `
            <tr>
                <td class="fw-bold">#${p.id}</td>
                <td>${p.cliente}</td>
                <td><small class="text-muted fw-semibold">${detalleStr}</small></td>
                <td><span class="badge bg-light text-dark border">${p.entrega}</span></td>
                <td class="fw-bold text-success">$${p.total.toFixed(2)}</td>
                <td><span class="badge ${badgeClass}">${p.estado}</span></td>
                <td>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle btn-action" data-bs-toggle="dropdown">Estado</button>
                        <ul class="dropdown-menu dropdown-menu-end shadow">
                            <li><a class="dropdown-item" href="#" onclick="cambiarEstadoPedido(${p.id}, 'En Comal')">🔥 En Comal</a></li>
                            <li><a class="dropdown-item" href="#" onclick="cambiarEstadoPedido(${p.id}, 'Listo')">✅ Listo</a></li>
                            <li><a class="dropdown-item" href="#" onclick="cambiarEstadoPedido(${p.id}, 'Entregado')">🛵 Entregado</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="cambiarEstadoPedido(${p.id}, 'Cancelado')">❌ Cancelar</a></li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function cambiarEstadoPedido(id, nuevoEstado) {
    try {
        await fetch(`${API_URL}/pedidos/${id}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        renderizarTodo();
    } catch (error) {
        alert('No se pudo actualizar el estado del pedido.');
    }
}

function filtrarEstadoTabla(estado) {
    filtroEstadoActual = estado;
    document.querySelectorAll('[id^="btn-filter-"]').forEach(btn => btn.classList.remove('active'));
    renderizarTablaPedidos();
}

function filtrarTablaPedidos() {
    renderizarTablaPedidos();
}

function renderizarKDSCocina() {
    const container = document.getElementById('kds-container');
    const counter = document.getElementById('kds-counter');
    if (!container) return;

    const enComal = pedidos.filter(p => p.estado === 'En Comal' || p.estado === 'Listo');
    if (counter) counter.innerText = `${enComal.filter(p => p.estado === 'En Comal').length} Pendientes`;

    if (enComal.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted py-5">
                <i class="fa-solid fa-circle-check fs-1 text-success mb-2"></i>
                <h5>¡Comales limpios! No hay órdenes activas.</h5>
            </div>`;
        return;
    }

    container.innerHTML = enComal.map(p => {
        const mins = Math.floor(p.segundos / 60);
        const isOvertime = mins >= 15 && p.estado === 'En Comal';
        const isListo = p.estado === 'Listo';

        return `
            <div class="col-xl-3 col-lg-4 col-md-6">
                <div class="card kds-card p-3 ${isOvertime ? 'overtime' : ''} ${isListo ? 'border-top-color-success' : ''}">
                    <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                        <h3 class="fw-extrabold m-0">#${p.id}</h3>
                        <span class="badge ${isOvertime ? 'bg-danger' : 'bg-secondary'}">
                            <i class="fa-regular fa-clock me-1"></i>${mins} min
                        </span>
                    </div>
                    <div class="mb-2">
                        <strong class="fs-5">${p.cliente}</strong>
                        <div><span class="badge bg-light text-dark border">${p.entrega}</span></div>
                    </div>
                    <div class="my-3">
                        ${p.items.map(i => `
                            <div class="d-flex justify-content-between align-items-center py-1 border-bottom border-dashed">
                                <span class="fw-bold fs-5 text-danger">${i.cant}x ${i.prod}</span>
                                ${i.masa ? `<span class="badge ${i.masa === 'Maíz' ? 'bg-warning text-dark' : 'bg-success'}">${i.masa}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                    ${p.estado === 'En Comal' ? `
                        <button class="btn btn-success w-100 kds-btn shadow-sm" onclick="cambiarEstadoPedido(${p.id}, 'Listo')">
                            <i class="fa-solid fa-check me-1"></i> LISTO
                        </button>
                    ` : `
                        <button class="btn btn-primary w-100 kds-btn shadow-sm" onclick="cambiarEstadoPedido(${p.id}, 'Entregado')">
                            <i class="fa-solid fa-box-check me-1"></i> DESPACHAR
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function renderizarCatalogoMenu() {
    const container = document.getElementById('menu-catalog-container');
    if (!container) return;

    container.innerHTML = productosMenu.map(p => `
        <div class="col-md-3 col-sm-6">
            <div class="card border-0 shadow-sm h-100 p-3 text-center">
                <h6 class="fw-bold text-dark m-0 mb-1">${p.nombre}</h6>
                <p class="text-muted small mb-2">${p.descripcion || 'Especialidad de la casa'}</p>
                <div class="fw-bold text-success fs-5 mb-2">$${parseFloat(p.precio).toFixed(2)}</div>
            </div>
        </div>
    `).join('');
}

function reproducirAlertaCocina() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
        console.log("Audio interactúe con la pantalla primero");
    }
}

function inicializarGraficos() {
    const ctxVentas = document.getElementById('chart-ventas');
    const ctxPupusas = document.getElementById('chart-pupusas');

    if (ctxVentas && !chartVentas) {
        chartVentas = new Chart(ctxVentas, {
            type: 'line',
            data: {
                labels: ['04 PM', '05 PM', '06 PM', '07 PM', '08 PM', '09 PM'],
                datasets: [{
                    label: 'Ventas ($)',
                    data: [15, 35, 60, 95, 120, 80],
                    borderColor: '#d35400',
                    backgroundColor: 'rgba(211, 84, 0, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            }
        });
    }

    if (ctxPupusas && !chartPupusas) {
        chartPupusas = new Chart(ctxPupusas, {
            type: 'doughnut',
            data: {
                labels: ['Revueltas', 'Queso c/ Loroco', 'Chicharrón', 'Frijol c/ Queso'],
                datasets: [{
                    data: [45, 30, 15, 10],
                    backgroundColor: ['#d35400', '#27ae60', '#e67e22', '#f39c12']
                }]
            }
        });
    }
}

// REGISTRAR NUEVO PEDIDO
async function guardarNuevoPedido() {
    const cliente = document.getElementById('modal-cliente')?.value;
    const tipo_entrega = document.getElementById('modal-entrega')?.value;
    const producto = document.getElementById('modal-item-producto')?.value;
    const tipo_masa_nombre = document.getElementById('modal-item-masa')?.value;
    const cantidad = parseInt(document.getElementById('modal-item-cant')?.value) || 1;

    if (!cliente || !cliente.trim()) {
        return alert('Por favor ingresa el nombre del cliente.');
    }

    const precios = {
        'Pupusa Revueltas': 1.00,
        'Pupusa Queso con Loroco': 1.25,
        'Pupusa Chicharrón': 1.00,
        'Pupusa Frijol con Queso': 1.00,
        'Horchata Artesanal': 1.50
    };

    const precio_unitario = precios[producto] || 1.00;
    const total = precio_unitario * cantidad;

    const nuevoPedido = {
        cliente,
        telefono: 'N/A',
        tipo_entrega,
        total,
        items: [{
            producto_id: 1,
            nombre: producto,
            precio_unitario,
            tipo_masa_nombre,
            cantidad
        }]
    };

    try {
        const res = await fetch(`${API_URL}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoPedido)
        });

        if (res.ok) {
            alert('¡Pedido registrado e ingresado al comal!');
            
            const modalEl = document.getElementById('modalPedido');
            if (modalEl && window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            }
            
            document.getElementById('form-nuevo-pedido')?.reset();
            renderizarTodo();
        } else {
            alert('Error al guardar el pedido en el servidor.');
        }
    } catch (err) {
        console.error('Error enviando pedido:', err);
        alert('No se pudo conectar con el servidor.');
    }
}