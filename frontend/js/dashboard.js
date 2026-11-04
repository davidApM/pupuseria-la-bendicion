// CONFIGURACIÓN DE CONEXIÓN CON EL BACKEND LOCAL C# (.NET)
const API_URL = 'http://localhost:5246/api';

let usuarioActual = null;
let filtroEstadoActual = 'Todos';
let pedidos = [];
let productosMenu = [];
let chartVentas = null;
let chartPupusas = null;

// VARIABLE GLOBAL ÚNICA PARA EL MODAL NUEVO PEDIDO
let itemsComandaTemp = [];

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

    // Actualización continua KDS y sincronización (cada 4s)
    setInterval(async () => {
        pedidos.forEach(p => {
            if (p.estado === 'En Comal') p.segundos = (p.segundos || 0) + 4;
        });

        await obtenerPedidosDesdeBD();
        renderizarKPIs();
        renderizarTablaPedidos();

        const cocinaSec = document.getElementById('section-cocina');
        if (cocinaSec && !cocinaSec.classList.contains('d-none')) {
            renderizarKDSCocina();
        }
    }, 4000);
});

// AUTENTICACIÓN LOCAL DE USUARIOS
function autenticarUsuario(e) {
    if (e && e.preventDefault) e.preventDefault();

    const userInput = document.getElementById('login-user');
    const passInput = document.getElementById('login-pass');
    const alertBox = document.getElementById('login-alert');

    const u = userInput ? userInput.value.trim().toLowerCase() : '';
    const p = passInput ? passInput.value.trim() : '';

    if (u === 'admin' || (u === 'admin' && p === 'admin') || u === 'cocina') {
        usuarioActual = {
            username: u,
            role: u === 'admin' ? 'Administrador' : 'Cocina KDS'
        };

        const overlay = document.getElementById('login-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            overlay.style.display = 'none';
        }

        const mainApp = document.getElementById('main-app');
        if (mainApp) mainApp.style.display = 'flex';

        configurarVistaPorRol();
        renderizarTodo();
    } else {
        if (alertBox) {
            alertBox.innerText = 'Credenciales inválidas. Usa "admin" / "admin"';
            alertBox.classList.remove('d-none');
        }
    }
}

function cerrarSesion() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.visibility = 'visible';
        overlay.style.opacity = '1';
    }
    const mainApp = document.getElementById('main-app');
    if (mainApp) mainApp.style.display = 'none';

    document.getElementById('form-login')?.reset();
    document.getElementById('login-alert')?.classList.add('d-none');
    usuarioActual = null;
}

function configurarVistaPorRol() {
    if (!usuarioActual) return;
    const badge = document.getElementById('user-role-badge');
    if (badge) badge.innerText = usuarioActual.role;

    const navDashboard = document.getElementById('nav-dashboard');
    const navMenu = document.getElementById('nav-menu');

    if (usuarioActual.username === 'cocina') {
        navegarA('cocina');
        if (navDashboard) navDashboard.style.display = 'none';
        if (navMenu) navMenu.style.display = 'none';
    } else {
        if (navDashboard) navDashboard.style.display = 'block';
        if (navMenu) navMenu.style.display = 'block';
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
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.innerText = titulos[seccion] || 'Panel de Control';

    if (seccion === 'dashboard') inicializarGraficos();
}

function toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('active');
}

// RENDERIZADO Y OBTENCIÓN DE DATOS
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
        const res = await fetch(`${API_URL}/pedidos`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const comandasBD = await res.json();
        pedidos = comandasBD.map(c => {
            const fechaStr = c.creado_en || c.fechaCreacion;
            const inicio = fechaStr ? new Date(fechaStr) : new Date();
            const diffSeg = Math.floor((new Date() - inicio) / 1000);
            const detalles = c.items || c.detallesPedido || [];

            return {
                id: c.id,
                cliente: c.cliente || c.clienteNombre || 'Cliente Dashboard',
                entrega: c.tipo_entrega || c.tipoEntrega || 'Local',
                estado: c.estado,
                total: parseFloat(c.total || 0),
                segundos: diffSeg > 0 ? diffSeg : 0,
                items: detalles.map(i => ({
                    cant: i.cantidad,
                    prod: i.producto || i.especialidad || 'Pupusa',
                    masa: i.tipo_masa || i.masa || 'Maíz'
                }))
            };
        });
    } catch (error) {
        console.error("Error consultando la API de pedidos:", error);
    }
}

async function obtenerProductosMenuBD() {
    try {
        let res = await fetch(`${API_URL}/productos`).catch(() => null);

        if (res && res.ok) {
            productosMenu = await res.json();
        } else {
            productosMenu = [
                { nombre: 'Pupusa Revuelta', descripcion: 'Masa de maíz/arroz con chicharrón, frijol y queso', precio: 1.00 },
                { nombre: 'Pupusa Queso con Loroco', descripcion: 'Masa de maíz/arroz con queso y loroco', precio: 1.00 },
                { nombre: 'Pupusa Jalapeño', descripcion: 'Masa de maíz/arroz con queso y jalapeño', precio: 1.25 },
                { nombre: 'Fresco de Ensalada', descripcion: 'Bebida natural de frutas', precio: 1.00 },
                { nombre: 'Chocolate de Olla', descripcion: 'Bebida caliente artesanal', precio: 1.25 }
            ];
        }
    } catch (error) {
        console.error("Error consultando el catálogo:", error);
    }
}

function renderizarKPIs() {
    const totalVentas = pedidos.filter(p => p.estado !== 'Cancelado').reduce((sum, p) => sum + p.total, 0);
    const activos = pedidos.filter(p => p.estado === 'En Comal').length;

    const elVentas = document.getElementById('kpi-ventas');
    const elPedidos = document.getElementById('kpi-pedidos');
    const elActivos = document.getElementById('kpi-activos');

    if (elVentas) elVentas.innerText = `$${totalVentas.toFixed(2)}`;
    if (elPedidos) elPedidos.innerText = pedidos.length;
    if (elActivos) elActivos.innerText = activos;
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
        const detalleStr = p.items.map(i => `${i.cant}x ${i.prod} ${i.masa ? '(' + i.masa + ')' : ''}`).join(', ');

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
        let res = await fetch(`${API_URL}/pedidos/${id}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (res.ok) {
            renderizarTodo();
        } else {
            alert('Error al actualizar estado en el servidor.');
        }
    } catch (error) {
        alert('No se pudo actualizar el estado del pedido.');
    }
}

function filtrarEstadoTabla(estado) {
    filtroEstadoActual = estado;
    document.querySelectorAll('[id^="btn-filter-"]').forEach(btn => btn.classList.remove('active'));
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

// LÓGICA DEL MODAL NUEVO PEDIDO
function manejarCambioProducto() {
    const productoSelect = document.getElementById('modal-item-producto');
    const selectMasa = document.getElementById('modal-item-masa');
    if (!productoSelect || !selectMasa) return;

    const producto = productoSelect.value || '';
    const esPupusa = producto.toLowerCase().includes('pupusa');

    selectMasa.disabled = !esPupusa;
    if (esPupusa) selectMasa.classList.remove('bg-light');
    else selectMasa.classList.add('bg-light');
}

function agregarItemAComandaTemp() {
    const productoSelect = document.getElementById('modal-item-producto');
    const masaSelect = document.getElementById('modal-item-masa');
    const cantInput = document.getElementById('modal-item-cant');

    if (!productoSelect) return;

    const rawProducto = productoSelect.value;
    const especialidad = rawProducto.split(' (')[0];
    const esPupusa = rawProducto.toLowerCase().includes('pupusa');
    const masa = (esPupusa && masaSelect && !masaSelect.disabled) ? masaSelect.value : '';
    const cantidad = parseInt(cantInput?.value || 1, 10);

    let precio = 1.00;
    if (rawProducto.includes('$1.25')) precio = 1.25;
    else if (rawProducto.includes('$1.00')) precio = 1.00;

    const subtotal = cantidad * precio;

    itemsComandaTemp.push({
        especialidad: especialidad,
        tipoMasa: masa || 'Maíz',
        cantidad: cantidad,
        precio: precio,
        subtotal: subtotal
    });

    renderizarTablaItemsTemp();
}

function eliminarItemComandaTemp(index) {
    itemsComandaTemp.splice(index, 1);
    renderizarTablaItemsTemp();
}

function renderizarTablaItemsTemp() {
    const tbody = document.getElementById('tabla-items-comanda');
    const totalEl = document.getElementById('modal-total-comanda');
    if (!tbody) return;

    if (itemsComandaTemp.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No has agregado productos aún.</td></tr>`;
        if (totalEl) totalEl.innerText = '$0.00';
        return;
    }

    let totalGlobal = 0;
    tbody.innerHTML = itemsComandaTemp.map((item, idx) => {
        totalGlobal += item.subtotal;
        return `
            <tr>
                <td class="fw-bold">${item.cantidad}x</td>
                <td>${item.especialidad}</td>
                <td><small class="text-muted">${item.tipoMasa || 'N/A'}</small></td>
                <td class="fw-bold text-success">$${item.subtotal.toFixed(2)}</td>
                <td class="text-end">
                    <button type="button" class="btn btn-sm btn-link text-danger p-0" onclick="eliminarItemComandaTemp(${idx})">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    if (totalEl) totalEl.innerText = `$${totalGlobal.toFixed(2)}`;
}

// FUNCIÓN ÚNICA DE ENVÍO A C#
async function guardarNuevoPedido() {
    const clienteInput = document.getElementById('modal-cliente')?.value;
    const tipoEntregaInput = document.getElementById('modal-entrega')?.value;

    if (!clienteInput || !clienteInput.trim()) {
        return alert('Por favor ingresa el nombre del cliente.');
    }

    if (itemsComandaTemp.length === 0) {
        return alert('Debes agregar al menos un producto a la comanda con el botón "+".');
    }

    const totalCalculado = itemsComandaTemp.reduce((sum, item) => sum + item.subtotal, 0);

    // ESTRUCTURA EXACTA QUE ESPERA PedidoCrearDTO EN C#
    const nuevoPedido = {
        cliente: tipoEntregaInput ? `${clienteInput.trim()} (${tipoEntregaInput})` : clienteInput.trim(),
        total: parseFloat(totalCalculado.toFixed(2)),
        items: itemsComandaTemp.map(item => ({
            especialidad: String(item.especialidad),
            tipoMasa: String(item.tipoMasa),
            cantidad: parseInt(item.cantidad, 10),
            precio: parseFloat(item.precio),
            subtotal: parseFloat(item.subtotal)
        }))
    };

    try {
        const res = await fetch(`${API_URL}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoPedido)
        });

        if (res.ok) {
            alert('¡Pedido registrado e ingresado al comal!');
            
            itemsComandaTemp = [];
            renderizarTablaItemsTemp();
            document.getElementById('form-nuevo-pedido')?.reset();

            const modalEl = document.getElementById('modalPedido');
            if (modalEl && window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            }
            
            renderizarTodo();
        } else {
            const errorData = await res.json().catch(() => null);
            console.error('--- DETALLE DE ERROR C# (ModelState) ---', errorData);
            alert('Error al intentar registrar el pedido en el servidor. Revisa los datos.');
        }
    } catch (err) {
        console.error('Error enviando pedido:', err);
        alert('No se pudo conectar con el servidor en http://localhost:5246');
    }
}