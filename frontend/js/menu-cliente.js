// CONFIGURACIÓN: Ingresa el número de tu negocio (con código de país 503 para El Salvador)
const NUMERO_PUPUSERIA = "50379269692"; // <-- CAMBIA ESTE NÚMERO POR EL TUYO

const API_URL = 'http://localhost:3000/api';
let productosBD = [];
let carrito = {}; // Almacena { id_producto: { cantidad, tipo_masa, precio, nombre } }

document.addEventListener('DOMContentLoaded', async () => {
    await cargarProductos();
});

// Mostrar/Ocultar dirección si es a domicilio
function toggleDireccion() {
    const entrega = document.getElementById('cliente-entrega').value;
    const divDir = document.getElementById('div-direccion');
    if (entrega === 'A Domicilio') {
        divDir.classList.remove('d-none');
    } else {
        divDir.classList.add('d-none');
    }
}

// Cargar menú dinámicamente desde el Backend PostgreSQL
async function cargarProductos() {
    try {
        const res = await fetch(`${API_URL}/productos`);
        if (res.ok) {
            productosBD = await res.json();
            renderizarMenuCliente();
        }
    } catch (e) {
        console.error("Error cargando productos:", e);
    }
}

function renderizarMenuCliente() {
    const container = document.getElementById('lista-productos');
    if (!container) return;

    container.innerHTML = productosBD.map(p => {
        const esPupusa = p.nombre.toLowerCase().includes('pupusa');
        
        return `
            <div class="col-12">
                <div class="card card-producto p-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="fw-bold m-0">${p.nombre}</h6>
                            <small class="text-muted">${p.descripcion || 'Especialidad de la casa'}</small>
                            <div class="fw-bold text-success fs-5 mt-1">$${parseFloat(p.precio).toFixed(2)}</div>
                        </div>
                        <div class="d-flex flex-column align-items-end gap-2">
                            ${esPupusa ? `
                                <select id="masa-${p.id}" class="form-select form-select-sm" style="width: 90px;">
                                    <option value="Maíz">🌽 Maíz</option>
                                    <option value="Arroz">🌾 Arroz</option>
                                </select>
                            ` : ''}
                            <div class="input-group input-group-sm" style="width: 110px;">
                                <button class="btn btn-outline-secondary" onclick="modificarCantidad(${p.id}, -1, '${p.nombre}', ${p.precio})">-</button>
                                <span class="form-control text-center fw-bold" id="cant-${p.id}">0</span>
                                <button class="btn btn-warning fw-bold" onclick="modificarCantidad(${p.id}, 1, '${p.nombre}', ${p.precio})">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function modificarCantidad(prodId, cambio, nombre, precio) {
    const masaEl = document.getElementById(`masa-${prodId}`);
    const masa = masaEl ? masaEl.value : '';
    const key = `${prodId}-${masa}`;

    if (!carrito[key]) {
        carrito[key] = { prodId, nombre, precio, masa, cantidad: 0 };
    }

    carrito[key].cantidad += cambio;

    if (carrito[key].cantidad <= 0) {
        delete carrito[key];
    }

    // Actualizar contador individual en UI
    const totalCantidadProd = Object.values(carrito)
        .filter(item => item.prodId === prodId)
        .reduce((sum, item) => sum + item.cantidad, 0);

    document.getElementById(`cant-${prodId}`).innerText = totalCantidadProd;

    calcularTotal();
}

function calcularTotal() {
    const total = Object.values(carrito).reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById('total-carrito').innerText = `$${total.toFixed(2)}`;
}

// CONSTRUIR EL MENSAJE Y ABRIR WHATSAPP DE LA PUPUSERÍA
function enviarPedidoPorWhatsApp() {
    const cliente = document.getElementById('cliente-nombre').value.trim();
    const entrega = document.getElementById('cliente-entrega').value;
    const direccion = document.getElementById('cliente-direccion').value.trim();

    if (!cliente) {
        return alert("Por favor ingresa tu nombre para procesar la orden.");
    }

    const items = Object.values(carrito);
    if (items.length === 0) {
        return alert("Selecciona al menos un producto para enviar tu pedido.");
    }

    // Construir lista del pedido
    let detalleTexto = "";
    let totalTotal = 0;

    items.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        totalTotal += subtotal;
        detalleTexto += `• ${item.cantidad}x ${item.nombre} ${item.masa ? `(${item.masa})` : ''} - $${subtotal.toFixed(2)}\n`;
    });

    // Formatear texto final del WhatsApp
    const mensaje = 
`Hola *Pupusería La Bendición*, me gustaría hacer el siguiente pedido:

👤 *Cliente:* ${cliente}
🛵 *Entrega:* ${entrega} ${entrega === 'A Domicilio' ? `\n📍 *Dirección:* ${direccion}` : ''}

📋 *DETALLE DEL PEDIDO:*
${detalleTexto}
💰 *TOTAL ESTIMADO:* $${totalTotal.toFixed(2)}

Quedo a la espera de confirmación. ¡Muchas gracias!`;

    // Redirigir al WhatsApp del restaurante
    const urlWA = `https://wa.me/${NUMERO_PUPUSERIA}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWA, '_blank');
}