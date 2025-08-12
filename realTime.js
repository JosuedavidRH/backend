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


// Guardar  el statusActual
router.post('/api/statusActual', (req, res) => {
  const { userId, statusActual } = req.body;

  if (!userId || statusActual === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Falta userId o statusActual'
    });
  }

  const sql = `
    INSERT INTO realTime (user_id, statusActual)
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
