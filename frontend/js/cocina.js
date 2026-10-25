const API_URL = 'http://10.239.185.123:3000/api';
let ultimosIdsPedidios = new Set();
let esPrimeraCarga = true;

// Efecto Sonoro para Nuevas Comandas
function reproducirSonidoComanda() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // Nota D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // Nota A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
        console.log("Audio no habilitado interactúe con la pantalla primero");
    }
}

function reproducirSonidoPrueba() {
    reproducirSonidoComanda();
}

function calcularMinutosTranscurridos(fechaIso) {
    if (!fechaIso) return 0;
    const inicio = new Date(fechaIso);
    const ahora = new Date();
    const difMs = ahora - inicio;
    return Math.floor(difMs / 60000);
}

async function obtenerComandas() {
    try {
        const res = await fetch(`${API_URL}/comandas`);
        const comandas = await res.json();

        const contenedor = document.getElementById('contenedor-comandas');
        const contador = document.getElementById('contador-pendientes');
        
        contador.innerText = `${comandas.filter(c => c.estado === 'En Comal').length} En Comal`;

        if (comandas.length === 0) {
            contenedor.innerHTML = `
                <div class="col-12 text-center text-muted py-5">
                    <i class="fa-solid fa-circle-check fs-1 mb-3 text-success"></i>
                    <h2 class="fw-bold text-light">¡Comal Limpio!</h2>
                    <p class="fs-5">No hay órdenes pendientes en este momento.</p>
                </div>`;
            return;
        }

        // Detectar pedidos nuevos para hacer sonar la alerta
        const idsActuales = new Set(comandas.map(c => c.id));
        if (!esPrimeraCarga) {
            comandas.forEach(c => {
                if (!ultimosIdsPedidios.has(c.id) && c.estado === 'En Comal') {
                    reproducirSonidoComanda();
                }
            });
        }
        ultimosIdsPedidios = idsActuales;
        esPrimeraCarga = false;

        contenedor.innerHTML = comandas.map(c => {
            const minutos = calcularMinutosTranscurridos(c.creado_en || c.hora);
            const esRetrasado = minutos >= 15 && c.estado === 'En Comal';
            const esListo = c.estado === 'Listo';

            return `
                <div class="col-xl-3 col-lg-4 col-md-6">
                    <div class="card card-comanda p-3 ${esListo ? 'card-listo' : 'card-en-comal'} ${esRetrasado ? 'card-alerta' : ''}">
                        
                        <!-- Encabezado de la Comanda -->
                        <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                            <div>
                                <h2 class="fw-extrabold m-0 text-dark">#${c.id}</h2>
                                <span class="timer-badge ${esRetrasado ? 'bg-danger' : ''}">
                                    <i class="fa-regular fa-clock me-1"></i> ${minutos} min
                                </span>
                            </div>
                            <span class="badge ${esListo ? 'bg-success' : 'bg-danger'} fs-6 px-3 py-2">
                                ${c.estado}
                            </span>
                        </div>

                        <!-- Datos del Cliente -->
                        <div class="mb-3">
                            <div class="fs-5 fw-bold text-dark text-truncate">${c.cliente}</div>
                            <span class="badge bg-secondary">${c.tipo_entrega}</span>
                        </div>

                        <!-- Lista de Ítems (Pupusas y Bebidas) -->
                        <div class="mb-3">
                            ${c.items.map(i => `
                                <div class="item-comanda d-flex justify-content-between align-items-center">
                                    <div>
                                        <span class="text-danger fw-extrabold fs-3 me-1">${i.cantidad}x</span> 
                                        <span>${i.producto}</span>
                                    </div>
                                    ${i.tipo_masa ? `
                                        <span class="badge ${i.tipo_masa === 'Maíz' ? 'badge-maiz' : 'badge-arroz'} ms-2">
                                            ${i.tipo_masa === 'Maíz' ? '🌽 Maíz' : '🌾 Arroz'}
                                        </span>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>

                        <!-- Botón de Acción -->
                        ${c.estado === 'En Comal' 
                            ? `<button class="btn btn-success btn-comal w-100 shadow" onclick="actualizarEstado(${c.id}, 'Listo')">
                                <i class="fa-solid fa-check me-2"></i> LISTO EN COMAL
                               </button>`
                            : `<button class="btn btn-dark btn-comal w-100" onclick="actualizarEstado(${c.id}, 'Entregado')">
                                <i class="fa-solid fa-box-check me-2"></i> DESPACHAR
                               </button>`
                        }
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Error al obtener comandas:", error);
    }
}

async function actualizarEstado(id, nuevoEstado) {
    try {
        await fetch(`${API_URL}/pedidos/${id}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        obtenerComandas();
    } catch (error) {
        alert('No se pudo actualizar el estado del pedido.');
    }
}

// Consultar órdenes automáticamente cada 4 segundos
setInterval(obtenerComandas, 4000);
obtenerComandas();

// Función para refrescar el tiempo de las tarjetas visibles en pantalla
function actualizarRelojesPantalla() {
    document.querySelectorAll('.card-comanda').forEach(card => {
        // Obtenemos el tiempo o la hora almacenada en la tarjeta
        const timerElemento = card.querySelector('.timer-badge');
        if (!timerElemento) return;

        // Extraemos los minutos actuales y los incrementamos
        let textoActual = timerElemento.innerText.replace(/[^0-9]/g, '');
        let minutos = parseInt(textoActual) || 0;
        
        // Si la tarjeta no está marcada como "Listo", actualizamos
        if (!card.classList.contains('card-listo')) {
            minutos++;
            timerElemento.innerHTML = `<i class="fa-regular fa-clock me-1"></i> ${minutos} min`;
            
            // Si supera o iguala los 15 minutos, se activa la alerta visual
            if (minutos >= 15) {
                card.classList.add('card-alerta');
                timerElemento.classList.add('bg-danger');
            }
        }
    });
}

// Actualizar los relojes cada 60 segundos (1 minuto)
setInterval(actualizarRelojesPantalla, 60000);