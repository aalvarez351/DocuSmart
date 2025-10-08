const express = require('express');
const { auth } = require('../middleware/auth');
const Empresa = require('../models/Empresa');

const router = express.Router();

// @route   GET /api/empresas/me
// @desc    Obtener empresa actual
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const empresa = await Empresa.findById(req.user.empresaId);
    if (!empresa) {
      return res.status(404).json({
        error: 'Empresa no encontrada'
      });
    }
    res.json(empresa);
  } catch (error) {
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;