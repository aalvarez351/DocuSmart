const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/clientes
// @desc    Obtener clientes
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    res.json({ message: 'Ruta de clientes funcionando' });
  } catch (error) {
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;