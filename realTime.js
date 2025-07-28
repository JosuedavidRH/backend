// realtime.js - Servidor para manejar los temporizadores en la tabla realTime

const express = require('express');
const cors = require('cors');
const db = require('./db'); // Asegúrate de que db.js esté configurado con variables de entorno

const app = express();
const port = process.env.PORT || 4000; // Render define automáticamente PORT

app.use(cors());
app.use(express.json());

// Test de conexión (opcional en producción)
db.connect(err => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
    return;
  }
  console.log('✅ Conectado a la base de datos');
});

// Obtener datos de realTime para un user_id
app.get('/api/realtime/:userId', (req, res) => {
  const { userId } = req.params;

  db.query('SELECT * FROM realTime WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener datos de realTime:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: results[0] || null });
  });
});

// Actualizar temporizadores de realTime para un user_id
app.put('/api/realtime/:userId', (req, res) => {
  const { userId } = req.params;
  const {
    statusActual,
    temporizadorPrincipal,
    temporizadorFactura1,
    temporizadorFactura2,
    temporizadorFactura3
  } = req.body;

  const sql = `
    UPDATE realTime SET 
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
      console.error('❌ Error al actualizar realTime:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: 'Temporizadores actualizados correctamente' });
  });
});

// Guardar solo el temporizadorPrincipal
app.post('/api/realtime/temporizador', (req, res) => {
  const { userId, temporizadorPrincipal } = req.body;

  console.log("📥 Datos recibidos:", req.body);

  const sql = `
    INSERT INTO realTime (user_id, temporizadorPrincipal)
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

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor realTime escuchando en http://localhost:${port}`);
});
