const express = require('express');

const router = express.Router();

router.post('/', async (req, res) => {
  res.json({ message: 'Webhook recibido' });
});

module.exports = router;