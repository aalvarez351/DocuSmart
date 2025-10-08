const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Cliente = require('../models/Cliente');
const Analytics = require('../models/Analytics');

const router = express.Router();

// @route   GET /api/clientes
// @desc    Obtener clientes de la empresa
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const clientes = await Cliente.find({ empresaId: req.user.empresaId, activo: true })
      .sort({ createdAt: -1 });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo clientes' });
  }
});

// @route   POST /api/clientes
// @desc    Crear nuevo cliente
// @access  Private
router.post('/', [
  auth,
  body('nombre').isLength({ min: 2 }).withMessage('Nombre requerido'),
  body('rucIdentidad').isLength({ min: 5 }).withMessage('RUC/Identidad requerido'),
  body('email').optional().isEmail().withMessage('Email inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const cliente = new Cliente({
      ...req.body,
      empresaId: req.user.empresaId
    });

    await cliente.save();

    // Registrar en analytics
    await new Analytics({
      empresaId: req.user.empresaId,
      tipo: 'cliente_agregado',
      metadata: { usuarioId: req.user.id, clienteId: cliente._id }
    }).save();

    res.status(201).json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error creando cliente' });
  }
});

// @route   PUT /api/clientes/:id
// @desc    Actualizar cliente
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const cliente = await Cliente.findOneAndUpdate(
      { _id: req.params.id, empresaId: req.user.empresaId },
      req.body,
      { new: true }
    );
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando cliente' });
  }
});

// @route   DELETE /api/clientes/:id
// @desc    Eliminar cliente (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const cliente = await Cliente.findOneAndUpdate(
      { _id: req.params.id, empresaId: req.user.empresaId },
      { activo: false },
      { new: true }
    );
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando cliente' });
  }
});

module.exports = router;