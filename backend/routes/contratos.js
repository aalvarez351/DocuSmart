const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  res.json({ message: 'Ruta de contratos funcionando' });
});

module.exports = router;