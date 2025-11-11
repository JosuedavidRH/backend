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
  'https://monumental-bavarois-56902a.netlify.app',
  'https://kiosko-js-nativo-vxq3.vercel.app'

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

// ✅ Endpoint para enviar mensaje de WhatsApp con Twilio
app.post('/api/enviar-whatsapp', async (req, res) => {
  // Cargar variables de entorno
  require('dotenv').config();
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require("twilio")(accountSid, authToken);

  try {
    const { to, mensaje } = req.body;

    if (!to || !mensaje) {
      return res.status(400).json({ success: false, message: "Faltan parámetros: to o mensaje" });
    }

    const message = await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:${to}`,
      body: mensaje,
    });

    console.log("✅ Mensaje enviado:", message.sid);

    res.json({
      success: true,
      sid: message.sid,
      status: message.status,
      to: message.to,
      body: message.body,
    });
  } catch (error) {
    console.error("❌ Error al enviar mensaje:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});



// Puerto dinámico
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
