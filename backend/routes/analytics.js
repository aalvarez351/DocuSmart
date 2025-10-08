const express = require('express');
const { auth } = require('../middleware/auth');
const Analytics = require('../models/Analytics');
const Factura = require('../models/Factura');
const Cliente = require('../models/Cliente');
const Contrato = require('../models/Contrato');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Obtener métricas del dashboard
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const empresaId = req.user.empresaId;
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioAno = new Date(hoy.getFullYear(), 0, 1);

    // Métricas del mes actual
    const [facturasCount, clientesCount, contratosCount, ingresosMes] = await Promise.all([
      Analytics.countDocuments({
        empresaId,
        tipo: 'factura_creada',
        fecha: { $gte: inicioMes }
      }),
      Analytics.countDocuments({
        empresaId,
        tipo: 'cliente_agregado',
        fecha: { $gte: inicioMes }
      }),
      Analytics.countDocuments({
        empresaId,
        tipo: 'contrato_generado',
        fecha: { $gte: inicioMes }
      }),
      Analytics.aggregate([
        {
          $match: {
            empresaId: empresaId,
            tipo: 'pago_recibido',
            fecha: { $gte: inicioMes }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$valor' }
          }
        }
      ])
    ]);

    // Datos para gráficos
    const ventasPorMes = await Analytics.aggregate([
      {
        $match: {
          empresaId: empresaId,
          tipo: 'pago_recibido',
          fecha: { $gte: inicioAno }
        }
      },
      {
        $group: {
          _id: {
            mes: { $month: '$fecha' },
            año: { $year: '$fecha' }
          },
          total: { $sum: '$valor' },
          cantidad: { $sum: 1 }
        }
      },
      { $sort: { '_id.año': 1, '_id.mes': 1 } }
    ]);

    res.json({
      metricas: {
        facturas_mes: facturasCount,
        clientes_activos: clientesCount,
        contratos_generados: contratosCount,
        ingresos_mes: ingresosMes[0]?.total || 0
      },
      graficos: {
        ventas_por_mes: ventasPorMes
      }
    });

  } catch (error) {
    console.error('Error obteniendo analytics:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/analytics/track
// @desc    Registrar evento de analítica
// @access  Private
router.post('/track', auth, async (req, res) => {
  try {
    const { tipo, valor, metadata } = req.body;
    
    const analytics = new Analytics({
      empresaId: req.user.empresaId,
      tipo,
      valor: valor || 0,
      metadata: {
        usuarioId: req.user.id,
        ...metadata
      }
    });

    await analytics.save();
    res.json({ message: 'Evento registrado' });

  } catch (error) {
    console.error('Error registrando evento:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;