// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();

// ✅ Permitir múltiples orígenes (frontend en Vercel, etc.)
app.use(cors({
  origin: ['https://kiosko-seven.vercel.app'],
  credentials: true
}));

app.use(bodyParser.json());

// Endpoint de inicio de sesión
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Error en el servidor' });
      } else if (results.length > 0) {
        res.json({ 
          success: true, 
          username: results[0].username,
          apartmentNumber: results[0].apartmentNumber 
        });
      } else {
        res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }
    }
  );
});

// Endpoint de registro
app.post('/api/register', (req, res) => {
  const { username, password, apartmentNumber } = req.body;

  console.log('Datos recibidos:', { username, password, apartmentNumber });

  db.query(
    'INSERT INTO users (username, password, apartmentNumber) VALUES (?, ?, ?)',
    [username, password, apartmentNumber],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al registrar el usuario' });
      } else {
        res.json({ 
          success: true, 
          username,
          apartmentNumber 
        });
      }
    }
  );
});

// ✅ Puerto dinámico para Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
