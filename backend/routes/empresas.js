const express = require('express');
const router = express.Router();

// Placeholder para rutas de empresas
router.get('/', (req, res) => {
  res.json({ message: 'Rutas de empresas - En desarrollo' });
});

module.exports = router;