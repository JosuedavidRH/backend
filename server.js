// backend/server.js
const express = require('express');
const db = require('./db');
const guardarNumero = require('./guardar_numero');
const validarQR = require('./validar_qr');
const realtimeRoutes = require('./realTime');

const app = express();

// ✅ Configuración CORS manual para manejar preflight y múltiples orígenes
const allowedOrigins = [
  'https://kiosko-seven.vercel.app',
  'https://monumental-bavarois-56902a.netlify.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Responder OPTIONS (preflight) inmediatamente
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// ✅ Middleware para parsear JSON
app.use(express.json());

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

// ✅ Vincular rutas adicionales
app.use('/api/realTime', realtimeRoutes);
app.use('/api/guardar', guardarNumero);
app.use('/api/validar', validarQR);

// Puerto dinámico
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
