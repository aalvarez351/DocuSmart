const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'docusmart-super-secret-key-2024-panama-jwt-256-bits';

// Middleware de seguridad
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://aalvarez351.github.io',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB Atlas - Base de datos: DocuSmart
function getMongoUri() {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  const encoded = 'bW9uZ29kYitzcnY6Ly9hYWx2YXJlejM1MTpMZW50ZXNkZXNvbEBpYW51YmUuZnVycXNsMC5tb25nb2RiLm5ldC9Eb2N1U21hcnQ/cmV0cnlXcml0ZXM9dHJ1ZSZ3PW1ham9yaXR5';
  return Buffer.from(encoded, 'base64').toString('utf8');
}
const mongoUri = getMongoUri();

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado a MongoDB Atlas - Base de datos: DocuSmart');
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error);
  process.exit(1);
});

// Rutas principales
app.use('/api/auth', require('./routes/auth'));
app.use('/api/empresas', require('./routes/empresas'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/facturas', require('./routes/facturas'));
app.use('/api/contratos', require('./routes/contratos'));
app.use('/api/integraciones', require('./routes/integraciones'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/analytics', require('./routes/analytics'));

// Ruta de estado del servidor
app.get('/api/status', (req, res) => {
  res.json({
    ok: true,
    version: '1.0.0',
    message: 'DocuSmart Backend activo',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'conectada' : 'desconectada'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'DocuSmart API - Asistente Legal-Contable con IA',
    version: '1.0.0',
    status: 'activo',
    endpoints: {
      status: '/api/status',
      auth: '/api/auth',
      empresas: '/api/empresas',
      clientes: '/api/clientes'
    }
  });
});

// Ruta de salud
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'DocuSmart API' });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: 'La ruta solicitada no existe en la API de DocuSmart'
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: error.message
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'ID inválido',
      message: 'El ID proporcionado no es válido'
    });
  }
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: 'Ha ocurrido un error inesperado'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor DocuSmart ejecutándose en puerto ${PORT}`);
  console.log(`📊 Panel de control: http://localhost:${PORT}/api/status`);
  console.log(`🔗 Base de datos: DocuSmart en MongoDB Atlas`);
});

module.exports = app;