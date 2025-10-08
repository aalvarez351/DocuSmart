const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  empresaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  rucIdentidad: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  telefono: String,
  direccion: String,
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cliente', clienteSchema);