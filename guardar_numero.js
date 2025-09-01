//CODIGO de produccion 

// backend/guardar_numero.js
const express = require('express');
const db = require('./db'); // Conexión a la BD compartida

const router = express.Router();

// ✅ Función de log
function logMsg(msg) {
  console.log(`${new Date().toISOString()} - ${msg}`);
}

// ✅ Ruta para guardar datos
// POST /api/guardar
router.post('/', (req, res) => {
  const { numero_apto, codigo_generado } = req.body;

  logMsg(`📩 POST recibido: ${JSON.stringify(req.body)}`);

  if (!numero_apto || !codigo_generado) {
    return res
      .status(400)
      .json({ success: false, error: "❌ Faltan parámetros: 'numero_apto' o 'codigo_generado'" });
  }

  const sql = "INSERT INTO registros (numero_apto, codigo_qr) VALUES (?, ?)";
  db.query(sql, [numero_apto, codigo_generado], (err) => {
    if (err) {
      logMsg(`❌ Error en INSERT: ${err.message}`);
      return res.status(500).json({ success: false, error: "Error al guardar datos" });
    }
    logMsg(`✅ Insert OK: Apto ${numero_apto}, Código ${codigo_generado}`);
    res.json({ success: true, message: "✅ Datos guardados exitosamente" });
  });
});

// ✅ Ruta para recuperar últimos 3 códigos
// GET /api/guardar/recuperar/:numero_apto
router.get('/recuperar/:numero_apto', (req, res) => {
  const numeroApto = req.params.numero_apto;

  // Validar que sea número
  if (!/^\d+$/.test(numeroApto)) {
    return res.status(400).json({ success: false, error: "Número de apartamento inválido" });
  }

  const sql = "SELECT * FROM registros WHERE numero_apto = ? ORDER BY id DESC LIMIT 3";
  db.query(sql, [numeroApto], (err, results) => {
    if (err) {
      logMsg(`❌ Error en SELECT: ${err.message}`);
      return res.status(500).json({ success: false, error: "Error al consultar registros" });
    }
    res.json({ success: true, data: results });
  });
});

// ✅ Seguridad: manejo de errores globales
process.on('uncaughtException', (err) => {
  logMsg(`🚨 Excepción no capturada: ${err.message}`);
});

module.exports = router;
