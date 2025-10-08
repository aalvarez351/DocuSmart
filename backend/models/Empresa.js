const mongoose = require('mongoose');

const empresaSchema = new mongoose.Schema({
  ruc: {
    type: String,
    required: [true, 'El RUC es obligatorio'],
    unique: true,
    trim: true,
    match: [/^\d{1,2}-\d{1,4}-\d{1,6}$/, 'Formato de RUC inválido (ej: 8-123-456789)']
  },
  nombre: {
    type: String,
    required: [true, 'El nombre de la empresa es obligatorio'],
    trim: true,
    maxlength: [200, 'El nombre no puede exceder 200 caracteres']
  },
  direccion: {
    type: String,
    required: [true, 'La dirección es obligatoria'],
    trim: true,
    maxlength: [500, 'La dirección no puede exceder 500 caracteres']
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true,
    match: [/^\+507\s?\d{4}-?\d{4}$/, 'Formato de teléfono inválido (+507 1234-5678)']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  plan: {
    type: String,
    enum: ['basico', 'pro', 'enterprise'],
    default: 'basico'
  },
  pac_config: {
    proveedor: {
      type: String,
      enum: ['pac1', 'pac2', 'pac3'],
      default: 'pac1'
    },
    api_key: String,
    certificado_path: String,
    ambiente: {
      type: String,
      enum: ['sandbox', 'produccion'],
      default: 'sandbox'
    }
  },
  configuracion: {
    moneda: {
      type: String,
      default: 'USD'
    },
    idioma: {
      type: String,
      default: 'es'
    },
    zona_horaria: {
      type: String,
      default: 'America/Panama'
    }
  },
  activa: {
    type: Boolean,
    default: true
  },
  fecha_vencimiento: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
  }
}, {
  timestamps: true,
  collection: 'empresas'
});

// Índices para optimizar consultas
empresaSchema.index({ ruc: 1 });
empresaSchema.index({ email: 1 });
empresaSchema.index({ activa: 1 });

// Método para verificar si la empresa está activa
empresaSchema.methods.estaActiva = function() {
  return this.activa && this.fecha_vencimiento > new Date();
};

// Método para obtener configuración PAC
empresaSchema.methods.obtenerConfigPAC = function() {
  return {
    proveedor: this.pac_config.proveedor,
    ambiente: this.pac_config.ambiente,
    api_key: this.pac_config.api_key
  };
};

// Middleware pre-save para validaciones adicionales
empresaSchema.pre('save', function(next) {
  // Validar que el RUC tenga formato panameño válido
  if (this.ruc && !this.ruc.match(/^\d{1,2}-\d{1,4}-\d{1,6}$/)) {
    next(new Error('Formato de RUC inválido para Panamá'));
  }
  next();
});

module.exports = mongoose.model('Empresa', empresaSchema);