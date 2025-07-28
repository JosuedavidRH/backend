
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const db = require('./db'); // Reutilizamos la conexión exportada

const app = express();

// ✅ Puerto dinámico para Render
const PORT = process.env.PORT || 3001;

// ✅ Permitir múltiples orígenes (como tu frontend en Vercel)
app.use(cors({
    origin: ['https://kiosko-seven.vercel.app'],
    credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Función de log
function logMsg(msg) {
    fs.appendFileSync('log_insert.txt', `${new Date().toISOString()} - ${msg}\n`);
}

// ✅ Ruta para guardar datos
app.post('/guardar_numero', (req, res) => {
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

// ✅ Seguridad: manejo de errores globales
process.on('uncaughtException', (err) => {
    logMsg(`🚨 Excepción no capturada: ${err.message}`);
});

// ✅ Inicio del servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
});
