const mongoose = require('mongoose');

const contratoSchema = new mongoose.Schema({
  empresaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true
  },
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  tipo: {
    type: String,
    enum: ['servicio', 'compraventa', 'arrendamiento', 'laboral', 'otro'],
    required: true
  },
  titulo: String,
  contenido: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['borrador', 'generado', 'firmado', 'cancelado'],
    default: 'borrador'
  },
  firmado: {
    type: Boolean,
    default: false
  },
  fecha_firma: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Contrato', contratoSchema);