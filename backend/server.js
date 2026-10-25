const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(cors());

// ==========================================
// 1. RUTA PARA INICIO DE SESIÓN (LOGIN)
// ==========================================
app.post('/api/login', async (req, res) => {
    const { usuario, password } = req.body;
    try {
        const resultado = await db.query(
            'SELECT id, nombre, usuario, rol FROM usuarios WHERE usuario = $1 AND password = $2',
            [usuario, password]
        );

        if (resultado.rows.length > 0) {
            const user = resultado.rows[0];
            res.json({ ok: true, usuario: user });
        } else {
            res.status(401).json({ ok: false, mensaje: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ ok: false, mensaje: 'Error interno en la base de datos' });
    }
});

// ==========================================
// 2. OBTENER CATÁLOGO DE PRODUCTOS
// ==========================================
app.get('/api/productos', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT p.*, c.nombre as categoria FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.disponible = true'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 3. REGISTRAR UN NUEVO PEDIDO
// ==========================================
app.post('/api/pedidos', async (req, res) => {
    const { cliente, telefono, tipo_entrega, direccion, total, notas, items } = req.body;
    
    try {
        await db.query('BEGIN'); // Inicio de transacción

        const pedidoQuery = `
            INSERT INTO pedidos (cliente, telefono, tipo_entrega, direccion, total, notas) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
        `;
        const pedidoRes = await db.query(pedidoQuery, [cliente, telefono || 'N/A', tipo_entrega, direccion || 'N/A', total, notas || '']);
        const pedidoId = pedidoRes.rows[0].id;

        const detalleQuery = `
            INSERT INTO detalle_pedidos (pedido_id, producto_id, tipo_masa_id, cantidad, precio_unitario, subtotal)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        if (items && Array.isArray(items)) {
            for (let item of items) {
                await db.query(detalleQuery, [
                    pedidoId,
                    item.producto_id,
                    item.tipo_masa_id || null,
                    item.cantidad,
                    item.precio_unitario,
                    item.cantidad * item.precio_unitario
                ]);
            }
        }

        await db.query('COMMIT'); // Confirmar transacción
        res.status(201).json({ status: 'success', pedido_id: pedidoId });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Error guardando pedido:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 4. OBTENER COMANDAS Y PEDIDOS ACTIVOS
// ==========================================
app.get('/api/comandas', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id, p.cliente, p.tipo_entrega, p.estado, p.total, p.notas, p.creado_en,
                dp.cantidad, pr.nombre as producto, tm.nombre as tipo_masa
            FROM pedidos p
            JOIN detalle_pedidos dp ON p.id = dp.pedido_id
            JOIN productos pr ON dp.producto_id = pr.id
            LEFT JOIN tipo_masa tm ON dp.tipo_masa_id = tm.id
            ORDER BY p.id DESC
        `;
        const result = await db.query(query);

        // Agrupar filas por id de pedido
        const comandas = {};
        result.rows.forEach(row => {
            if (!comandas[row.id]) {
                comandas[row.id] = {
                    id: row.id,
                    cliente: row.cliente,
                    tipo_entrega: row.tipo_entrega,
                    estado: row.estado,
                    total: parseFloat(row.total || 0),
                    notas: row.notas,
                    creado_en: row.creado_en,
                    hora: new Date(row.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    items: []
                };
            }
            comandas[row.id].items.push({
                cantidad: row.cantidad,
                producto: row.producto,
                tipo_masa: row.tipo_masa
            });
        });

        res.json(Object.values(comandas));
    } catch (err) {
        console.error('Error obteniendo comandas:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 5. ACTUALIZAR ESTADO DEL PEDIDO
// ==========================================
app.patch('/api/pedidos/:id/estado', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        await db.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, id]);
        res.json({ message: 'Estado actualizado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});