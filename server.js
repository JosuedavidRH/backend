// backend/server.js   analiza  el codigo de produccion pero no modifiques nada

const express = require('express');
const cron = require("node-cron");
const db = require('./db');
const guardarNumero = require('./guardar_numero');
const validarQR = require('./validar_qr');
const realtimeRoutes = require('./realTime');
const twilio = require("twilio");


// Cargar variables de entorno
  require('dotenv').config();
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require("twilio")(accountSid, authToken);
  const twilioFrom = "whatsapp:+573205549400"; //  número Twilio sender


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



// ✅ Endpoint para programar mensaje de WhatsApp con template aprobado
app.post("/api/enviar-factura-whatsapp", async (req, res) => {
  const { to } = req.body; // número destino

  if (!to) {
    return res.status(400).json({ success: false, message: "Faltan parámetros: to" });
  }

  // ⏰ Cambiar tiempo de espera → 1 minutos
  const sendTime = Date.now() + 1 * 60 * 1000; // 1 minuto en milisegundos

  // <-- Cambié el INSERT para incluir 'mensaje' como '' (cadena vacía)
  const query = "INSERT INTO scheduled_messages (to_number, mensaje, template_sid, send_time, enviado) VALUES (?, ?, ?, ?, 0)";
  db.query(query, [to, '', "HX1452ce97072fedd790870c78618257d4", sendTime], (err, result) => {
    if (err) {
      console.error("❌ Error al guardar mensaje programado:", err);
      return res.status(500).json({ success: false, message: "Error en BD" });
    }

    console.log(`🕒 Mensaje de factura programado para ${to} en 1 minuto`);
    res.json({
      success: true,
      message: "Mensaje de factura programado para envío en 1 minuto",
      id: result.insertId,
    });
  });
});


// 🕒 Cron que revisa mensajes cada 30 segundos (respetando la lógica original)
cron.schedule("*/30 * * * * *", async () => {
  const ahora = Date.now();

  db.query(
    "SELECT * FROM scheduled_messages WHERE enviado = 0 AND send_time <= ?",
    [ahora],
    async (err, results) => {
      if (err) return console.error("❌ Error al buscar mensajes:", err);
      if (results.length === 0) return;

      for (const msg of results) {
        try {
          // Si el mensaje tiene template_sid, usamos plantilla; si no, body normal
          const options = msg.template_sid
            ? {
                from: twilioFrom,
                to: `whatsapp:${msg.to_number}`,
                contentSid: msg.template_sid
              }
            : {
                from: twilioFrom,
                to: `whatsapp:${msg.to_number}`,
                body: msg.mensaje
              };

          const message = await client.messages.create(options);

          console.log(`✅ Enviado a ${msg.to_number} → SID: ${message.sid}`);

          db.query("UPDATE scheduled_messages SET enviado = 1 WHERE id = ?", [msg.id]);
        } catch (error) {
          console.error(`❌ Error al enviar a ${msg.to_number}:`, error.message);
        }
      }
    }
  );
});


// --- 3️⃣ Enviar código de verificación por SMS ---
app.post("/api/send-code-sms", async (req, res) => {
  const { username } = req.body; // número destino en Colombia sin +57

  if (!username)
    return res.status(400).json({ success: false, message: "Número requerido" });

  try {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expira = Date.now() + 3 * 60 * 1000; // 3 minutos

    db.query(
      "INSERT INTO verification_codes (username, codigo, expira, usado) VALUES (?, ?, ?, 0)",
      [username, codigo, expira],
      async (err) => {
        if (err) {
          console.error("❌ Error al guardar código en BD:", err);
          return res.status(500).json({ success: false, message: "Error al guardar código" });
        }

        const mensaje = `Tu código de verificación es: ${codigo} (válido por 3 minutos)`;

        try {
          const message = await client.messages.create({
            from: "+13142484618", // tu número Twilio con SMS
            to: `+57${username}`,
            body: mensaje
          });

          console.log("✅ Código SMS enviado:", codigo, "SID:", message.sid);
          res.json({ success: true, message: "Código enviado", sid: message.sid });

        } catch (error) {
          console.error("❌ Error al enviar SMS:", error);
          res.status(500).json({ success: false, message: error.message });
        }
      }
    );

  } catch (error) {
    console.error("❌ Error general:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

 

// --- 2️⃣ Verificar código ---
app.post("/api/verify-code", (req, res) => {
  const { username, code } = req.body;

  if (!username || !code)
    return res.status(400).json({ success: false, message: "Faltan parámetros" });

  db.query(
    "SELECT * FROM verification_codes WHERE username = ? AND usado = 0 ORDER BY id DESC LIMIT 1",
    [username],
    (err, results) => {
      if (err) {
        console.error("❌ Error en la consulta:", err);
        return res.status(500).json({ success: false, message: "Error en el servidor" });
      }

      if (results.length === 0) {
        return res.json({ success: false, message: "Código no encontrado o ya usado" });
      }

      const data = results[0];

      if (Date.now() > data.expira) {
        return res.json({ success: false, message: "Código expirado" });
      }

      if (data.codigo === code) {
        db.query("UPDATE verification_codes SET usado = 1 WHERE id = ?", [data.id]);
        return res.json({ success: true, message: "Código verificado correctamente" });
      } else {
        return res.json({ success: false, message: "Código incorrecto" });
      }
    }
  );
});


// Puerto dinámico
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
