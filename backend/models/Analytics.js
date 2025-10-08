const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  empresaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  tipo: {
    type: String,
    enum: ['factura_creada', 'cliente_agregado', 'contrato_generado', 'pago_recibido', 'login_usuario'],
    required: true
  },
  valor: {
    type: Number,
    default: 0
  },
  metadata: {
    usuarioId: mongoose.Schema.Types.ObjectId,
    clienteId: mongoose.Schema.Types.ObjectId,
    facturaId: mongoose.Schema.Types.ObjectId,
    contratoId: mongoose.Schema.Types.ObjectId,
    detalles: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

analyticsSchema.index({ empresaId: 1, fecha: -1 });
analyticsSchema.index({ empresaId: 1, tipo: 1, fecha: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);