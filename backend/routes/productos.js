const express = require('express');
const router = express.Router();

// Placeholder para rutas de productos
router.get('/', (req, res) => {
  res.json({ message: 'Rutas de productos - En desarrollo' });
});

module.exports = router;