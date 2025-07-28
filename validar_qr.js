const express = require('express');
const db = require('./db');
const router = express.Router();

// Ruta GET para validar y eliminar QR
router.get('/', (req, res) => {
    res.set('Cache-Control', 'no-cache, must-revalidate');
    res.set('Expires', 'Sat, 1 Jan 2000 00:00:00 GMT');

    const id = req.query.id || '';

    if (!id || !id.includes('|')) {
        res.send("invalido");
        return;
    }

    const [numero_apto, codigo_qr] = id.split('|');

    if (!/^\d{6}$/.test(codigo_qr)) {
        res.send("invalido");
        return;
    }

    const sql = "DELETE FROM registros WHERE numero_apto = ? AND codigo_qr = ?";
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

module.exports = router;
