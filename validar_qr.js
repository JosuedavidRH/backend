const express = require('express');
const db = require('./db'); // Aquí se espera que ya uses mysql2 en db.js
const app = express();
const port = 3000;

// Ruta GET para validar y eliminar QR
app.get('/validar_qr', (req, res) => {
    res.set('Cache-Control', 'no-cache, must-revalidate');
    res.set('Expires', 'Sat, 1 Jan 2000 00:00:00 GMT');

    const id = req.query.id || '';

    if (!id || !id.includes('|')) {
        res.send("invalido");
        return;
    }

    const [numero_apto, codigo_qr] = id.split('|');

    const sql = "DELETE FROM registros WHERE numero_apto = ? AND codigo_qr = ?";

    // Aquí usamos `db` (importado de db.js), que ya debe estar configurado con mysql2
    db.execute(sql, [numero_apto, codigo_qr], (err, result) => {
        if (err) {
            res.status(500).send("Error al ejecutar la consulta: " + err.message);
            return;
        }

        if (result.affectedRows > 0) {
            res.send("ID válido");
        } else {
            res.send("ID no válido");
        }
    });
});

app.listen(port, () => {
    console.log(`✅ Servidor escuchando en http://localhost:${port}`);
});
