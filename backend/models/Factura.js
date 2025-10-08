const mongoose = require('mongoose');

const facturaSchema = new mongoose.Schema({
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
  numero: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  items: [{
    descripcion: String,
    cantidad: Number,
    precio: Number,
    total: Number
  }],
  subtotal: {
    type: Number,
    required: true
  },
  impuestos: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['borrador', 'enviada', 'pagada', 'cancelada'],
    default: 'borrador'
  },
  pac_response: mongoose.Schema.Types.Mixed,
  xml: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Factura', facturaSchema);