const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Factura = require('../models/Factura');
const Cliente = require('../models/Cliente');
const Analytics = require('../models/Analytics');

const router = express.Router();

// @route   GET /api/facturas
// @desc    Obtener facturas de la empresa
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const facturas = await Factura.find({ empresaId: req.user.empresaId })
      .populate('clienteId', 'nombre rucIdentidad')
      .sort({ createdAt: -1 });
    res.json(facturas);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo facturas' });
  }
});

// @route   POST /api/facturas
// @desc    Crear nueva factura
// @access  Private
router.post('/', [
  auth,
  body('clienteId').notEmpty().withMessage('Cliente requerido'),
  body('items').isArray({ min: 1 }).withMessage('Items requeridos'),
  body('total').isNumeric().withMessage('Total requerido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generar número de factura
    const count = await Factura.countDocuments({ empresaId: req.user.empresaId });
    const numero = `F-${String(count + 1).padStart(6, '0')}`;

    const factura = new Factura({
      ...req.body,
      empresaId: req.user.empresaId,
      numero,
      fecha: new Date()
    });

    await factura.save();

    // Registrar en analytics
    await new Analytics({
      empresaId: req.user.empresaId,
      tipo: 'factura_creada',
      valor: factura.total,
      metadata: { usuarioId: req.user.id, facturaId: factura._id }
    }).save();

    res.status(201).json(factura);
  } catch (error) {
    res.status(500).json({ error: 'Error creando factura' });
  }
});

// @route   PUT /api/facturas/:id
// @desc    Actualizar factura
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const factura = await Factura.findOneAndUpdate(
      { _id: req.params.id, empresaId: req.user.empresaId },
      req.body,
      { new: true }
    );
    
    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    res.json(factura);
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando factura' });
  }
});

module.exports = router;