//CODIGO en produccion 


// realtime.js - Rutas para manejar los temporizadores en la tabla realTime.


const express = require('express');
const db = require('./db'); // Asegúrate de que db.js esté configurado con variables de entorno

const router = express.Router();


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
  const {
    statusActual,
    temporizadorPrincipal,
    temporizadorFactura1,
    temporizadorFactura2,
    temporizadorFactura3
  } = req.body;

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
  const { userId, temporizadorPrincipal } = req.body;

  const sql = `
    INSERT INTO realtime (user_id, temporizadorPrincipal)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE temporizadorPrincipal = VALUES(temporizadorPrincipal)
  `;

  db.query(sql, [userId, temporizadorPrincipal], (err, result) => {
    if (err) {
      console.error('❌ Error al guardar temporizadorPrincipal:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: 'Temporizador principal actualizado' });
  });
});


// Guardar temporizadorFactura1
router.post('/temporizadorFactura1', (req, res) => {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {
      return res.status(400).json({ success: false, message: 'JSON inválido' });
    }
  }

  const { userId, temporizadorFactura1 } = body;
  if (!userId || temporizadorFactura1 === undefined) {
    return res.status(400).json({ success: false, message: 'Falta userId o temporizadorFactura1' });
  }

  const sql = `
    INSERT INTO realtime (user_id, temporizadorFactura1)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE temporizadorFactura1 = VALUES(temporizadorFactura1),
    updated_at = NOW()
  `;

  db.query(sql, [userId, temporizadorFactura1], (err, result) => {
    if (err) {
      console.error('❌ Error al guardar temporizadorFactura1:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: 'temporizadorFactura1 actualizado' });
  });
});


// Guardar temporizadorFactura2
router.post('/temporizadorFactura2', (req, res) => {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {
      return res.status(400).json({ success: false, message: 'JSON inválido' });
    }
  }

  const { userId, temporizadorFactura2 } = body;

  console.log("📥 Datos recibidos (Factura2):", body);

  if (!userId || temporizadorFactura2 === undefined) {
    return res.status(400).json({ success: false, message: 'Falta userId o temporizadorFactura2' });
  }

  const sql = `
    INSERT INTO realtime (user_id, temporizadorFactura2)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE temporizadorFactura2 = VALUES(temporizadorFactura2),
    updated_at = NOW()
  `;

  db.query(sql, [userId, temporizadorFactura2], (err, result) => {
    if (err) {
      console.error('❌ Error al guardar temporizadorFactura2:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: 'temporizadorFactura2 actualizado' });
  });
});


// Guardar temporizadorFactura3
router.post('/temporizadorFactura3', (req, res) => {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {
      return res.status(400).json({ success: false, message: 'JSON inválido' });
    }
  }

  const { userId, temporizadorFactura3 } = body;

  console.log("📥 Datos recibidos (Factura3):", body);

  if (!userId || temporizadorFactura3 === undefined) {
    return res.status(400).json({ success: false, message: 'Falta userId o temporizadorFactura3' });
  }

  const sql = `
    INSERT INTO realtime (user_id, temporizadorFactura3)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE temporizadorFactura3 = VALUES(temporizadorFactura3),
    updated_at = NOW()
  `;

  db.query(sql, [userId, temporizadorFactura3], (err, result) => {
    if (err) {
      console.error('❌ Error al guardar temporizadorFactura3:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: 'temporizadorFactura3 actualizado' });
  });
});


// Guardar  el statusActual
router.post('/statusActual', (req, res) => {
  const { userId, statusActual } = req.body;

  if (!userId || statusActual === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Falta userId o statusActual'
    });
  }

  const sql = `
    INSERT INTO realtime (user_id, statusActual)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE statusActual = VALUES(statusActual)
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
