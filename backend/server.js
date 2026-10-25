const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(cors());

// 1. Obtener lista de productos
app.get('/api/productos', async (req, res) => {
    try {
        const result = await db.query('SELECT p.*, c.nombre as categoria FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.disponible = true');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Crear un nuevo pedido
app.post('/api/pedidos', async (req, res) => {
    const { cliente, telefono, tipo_entrega, direccion, total, notas, items } = req.body;
    
    try {
        await db.query('BEGIN'); // Inicio de transacción

        const pedidoQuery = `
            INSERT INTO pedidos (cliente, telefono, tipo_entrega, direccion, total, notas) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
        `;
        const pedidoRes = await db.query(pedidoQuery, [cliente, telefono, tipo_entrega, direccion, total, notas]);
        const pedidoId = pedidoRes.rows[0].id;

        const detalleQuery = `
            INSERT INTO detalle_pedidos (pedido_id, producto_id, tipo_masa_id, cantidad, precio_unitario, subtotal)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

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

        await db.query('COMMIT'); // Confirmar transacción
        res.status(201).json({ status: 'success', pedido_id: pedidoId });
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

// 3. Obtener comandas activas para la cocina (KDS)
app.get('/api/comandas', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id, p.cliente, p.tipo_entrega, p.estado, p.notas, p.creado_en,
                dp.cantidad, pr.nombre as producto, tm.nombre as tipo_masa
            FROM pedidos p
            JOIN detalle_pedidos dp ON p.id = dp.pedido_id
            JOIN productos pr ON dp.producto_id = pr.id
            LEFT JOIN tipo_masa tm ON dp.tipo_masa_id = tm.id
            WHERE p.estado IN ('En Comal', 'Listo')
            ORDER BY p.id ASC
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
                    notas: row.notas,
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
        res.status(500).json({ error: err.message });
    }
});

// 4. Actualizar estado del pedido (En Comal -> Listo -> Entregado)
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});