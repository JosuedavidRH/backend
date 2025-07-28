const express = require('express');
const fs = require('fs');
const db = require('./db'); // Reutilizamos la conexión exportada

const router = express.Router();

// ✅ Función de log (respetada)
function logMsg(msg) {
    fs.appendFileSync('log_insert.txt', `${new Date().toISOString()} - ${msg}\n`);
}

// ✅ Ruta para guardar datos (misma lógica, solo adaptada al router)
router.post('/', (req, res) => {
    const { numero_apto, codigo_generado } = req.body;

    const postData = JSON.stringify(req.body);
    logMsg(`📩 POST recibido: ${postData}`);

    if (!numero_apto || !codigo_generado) {
        res.status(400).send("❌ Faltan parámetros: 'numero_apto' o 'codigo_generado'");
        return;
    }

    const sql = "INSERT INTO registros (numero_apto, codigo_qr) VALUES (?, ?)";
    db.query(sql, [numero_apto, codigo_generado], (err, result) => {
        if (err) {
            logMsg(`❌ Error en INSERT: ${err.message}`);
            res.status(500).send("Error al guardar datos");
        } else {
            logMsg(`✅ Insert OK: Apto ${numero_apto}, Código ${codigo_generado}`);
            res.send("✅ Datos guardados exitosamente");
        }
    });
});

// ✅ Seguridad: manejo de errores globales (respetado)
process.on('uncaughtException', (err) => {
    logMsg(`🚨 Excepción no capturada: ${err.message}`);
});

// ✅ Exportar el router (no lanzar app.listen aquí)
module.exports = router;
