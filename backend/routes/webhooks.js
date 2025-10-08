const express = require('express');
const router = express.Router();

// Placeholder para rutas de webhooks
router.post('/pac', (req, res) => {
  res.json({ message: 'Webhook PAC - En desarrollo' });
});

module.exports = router;