const API_URL = 'http://10.239.185.123:3000/api';
let productosDisponibles = [];
let carrito = [];

async function cargarProductos() {
    try {
        const res = await fetch(`${API_URL}/productos`);
        productosDisponibles = await res.json();
        
        document.getElementById('total-productos-count').innerText = `${productosDisponibles.length} disponibles`;

        const contenedor = document.getElementById('contenedor-productos');
        contenedor.innerHTML = productosDisponibles.map(p => `
            <div class="col-md-6">
                <div class="card p-3 product-card h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="d-flex justify-content-between align-items-start mb-1">
                            <h6 class="fw-bold text-dark m-0">${p.nombre}</h6>
                            <span class="badge bg-warning text-dark fw-bold">$${parseFloat(p.precio).toFixed(2)}</span>
                        </div>
                        <p class="text-muted small mb-3">${p.descripcion || 'Especialidad de la casa'}</p>
                    </div>
                    <button class="btn btn-sm btn-primary-custom w-100 py-2" onclick="agregarAlCarrito(${p.id})">
                        <i class="fa-solid fa-plus me-1"></i> Agregar
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error al cargar productos:", error);
        document.getElementById('contenedor-productos').innerHTML = `
            <div class="col-12 alert alert-danger">
                No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en http://localhost:3000
            </div>`;
    }
}

function agregarAlCarrito(productoId) {
    const prod = productosDisponibles.find(p => p.id === productoId);
    const esPupusa = prod.categoria === 'Pupusas Tradicionales' || prod.categoria === 'Especialidades';
    const masaId = esPupusa ? parseInt(document.querySelector('input[name="masa"]:checked').value) : null;
    const masaNombre = esPupusa ? (masaId === 1 ? 'Maíz' : 'Arroz') : null;

    const item = carrito.find(i => i.producto_id === productoId && i.tipo_masa_id === masaId);
    if (item) {
        item.cantidad++;
    } else {
        carrito.push({
            producto_id: prod.id,
            nombre: prod.nombre,
            precio_unitario: parseFloat(prod.precio),
            tipo_masa_id: masaId,
            tipo_masa_nombre: masaNombre,
            cantidad: 1
        });
    }
    renderizarCarrito();
}

function cambiarCantidad(index, delta) {
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }
    renderizarCarrito();
}

function renderizarCarrito() {
    const lista = document.getElementById('lista-carrito');
    let total = 0;

    if (carrito.length === 0) {
        lista.innerHTML = `
            <li class="list-group-item text-center text-muted py-4">
                <i class="fa-solid fa-cart-flatbed fs-2 mb-2 text-secondary"></i>
                <p class="mb-0">No has agregado productos aún</p>
            </li>`;
        document.getElementById('totalTexto').innerText = '$0.00';
        return;
    }

    lista.innerHTML = carrito.map((item, index) => {
        const subtotal = item.precio_unitario * item.cantidad;
        total += subtotal;
        const badgeMasa = item.tipo_masa_nombre 
            ? `<span class="badge ${item.tipo_masa_nombre === 'Maíz' ? 'bg-warning text-dark' : 'bg-success'} badge-masa ms-1">${item.tipo_masa_nombre}</span>` 
            : '';

        return `
            <li class="list-group-item d-flex justify-content-between align-items-center py-3">
                <div class="me-2">
                    <div class="fw-bold text-dark">${item.nombre} ${badgeMasa}</div>
                    <small class="text-muted">$${item.precio_unitario.toFixed(2)} c/u</small>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary qty-btn" onclick="cambiarCantidad(${index}, -1)">-</button>
                        <span class="px-2 fw-bold align-self-center">${item.cantidad}</span>
                        <button class="btn btn-outline-secondary qty-btn" onclick="cambiarCantidad(${index}, 1)">+</button>
                    </div>
                    <span class="fw-bold text-dark ms-2" style="min-width: 50px; text-align: right;">$${subtotal.toFixed(2)}</span>
                </div>
            </li>
        `;
    }).join('');

    document.getElementById('totalTexto').innerText = `$${total.toFixed(2)}`;
}

async function enviarPedido() {
    const cliente = document.getElementById('clienteNombre').value;
    const telefono = document.getElementById('clienteTelefono').value;
    const tipo_entrega = document.getElementById('tipoEntrega').value;

    if (!cliente.trim()) return alert('Por favor escribe el nombre del cliente');
    if (carrito.length === 0) return alert('El carrito está vacío');

    const total = carrito.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);

    try {
        const respuesta = await fetch(`${API_URL}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cliente, telefono, tipo_entrega, total, items: carrito })
        });

        if (respuesta.ok) {
            alert('¡Pedido enviado al área de comales con éxito!');
            carrito = [];
            document.getElementById('clienteNombre').value = '';
            document.getElementById('clienteTelefono').value = '';
            renderizarCarrito();
        } else {
            alert('Error al procesar el pedido. Intenta nuevamente.');
        }
    } catch (error) {
        console.error("Error al enviar pedido:", error);
        alert('No se pudo conectar con el servidor.');
    }
}

cargarProductos();