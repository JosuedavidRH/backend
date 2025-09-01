//CODIGO en produccion 


// realtime.js - Rutas para manejar los temporizadores en la tabla realTime.


const express = require('express');
const db = require('./db'); // Asegúrate de que db.js esté configurado con variables de entorno

const router = express.Router();


// 📌 Middleware para soportar sendBeacon que envía string en vez de JSON
router.use(express.text({ type: 'application/json' }));

// Helper para parsear body si viene como string
function parseBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }
  return body;
}


// Obtener datos de realTime para un user_id
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  db.query('SELECT * FROM realtime WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener datos de realtime:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: results[0] || null });
  });
});


// Actualizar temporizadores de realTime para un user_id
router.put('/:userId', (req, res) => {
  const { userId } = req.params;
  const body = parseBody(req);

  const {
    statusActual,
    temporizadorPrincipal,
    temporizadorFactura1,
    temporizadorFactura2,
    temporizadorFactura3
  } = body;

  const sql = `
    UPDATE realtime SET 
      statusActual = ?, 
      temporizadorPrincipal = ?, 
      temporizadorFactura1 = ?, 
      temporizadorFactura2 = ?, 
      temporizadorFactura3 = ?,
      updated_at = NOW()
    WHERE user_id = ?
  `;

  db.query(sql, [
    statusActual,
    temporizadorPrincipal,
    temporizadorFactura1,
    temporizadorFactura2,
    temporizadorFactura3,
    userId
  ], (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar realtime:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: 'Temporizadores actualizados correctamente' });
  });
});


// Guardar el temporizadorPrincipal
router.post('/temporizador', (req, res) => {
  const body = parseBody(req);
  const { userId, temporizadorPrincipal } = body;

  console.log("📥 Recibido en /temporizador:", body);

  const sql = `
    INSERT INTO realtime (user_id, temporizadorPrincipal)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE temporizadorPrincipal = VALUES(temporizadorPrincipal),
    updated_at = NOW()
  `;

  db.query(sql, [userId, temporizadorPrincipal], (err, result) => {
    if (err) {
      console.error('❌ Error al guardar temporizadorPrincipal:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: 'Temporizador principal actualizado' });
  });
});


// Guardar el statusActual
router.post('/statusActual', (req, res) => {
  const body = parseBody(req);
  const { userId, statusActual } = body;

  if (!userId || statusActual === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Falta userId o statusActual'
    });
  }

  console.log("📥 Recibido en /statusActual:", body);

  const sql = `
    INSERT INTO realtime (user_id, statusActual)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE statusActual = VALUES(statusActual),
    updated_at = NOW()
  `;

  db.query(sql, [userId, statusActual], (err, result) => {
    if (err) {
      console.error('❌ Error al guardar statusActual:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({
      success: true,
      message: 'statusActual actualizado correctamente'
    });
  });
});


module.exports = router;
