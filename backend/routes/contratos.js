const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Contrato = require('../models/Contrato');
const Cliente = require('../models/Cliente');
const Analytics = require('../models/Analytics');

const router = express.Router();

// @route   GET /api/contratos
// @desc    Obtener contratos de la empresa
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const contratos = await Contrato.find({ empresaId: req.user.empresaId })
      .populate('clienteId', 'nombre rucIdentidad')
      .sort({ createdAt: -1 });
    res.json(contratos);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo contratos' });
  }
});

// @route   POST /api/contratos
// @desc    Crear nuevo contrato
// @access  Private
router.post('/', [
  auth,
  body('clienteId').notEmpty().withMessage('Cliente requerido'),
  body('tipo').notEmpty().withMessage('Tipo de contrato requerido'),
  body('titulo').notEmpty().withMessage('Título requerido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contrato = new Contrato({
      ...req.body,
      empresaId: req.user.empresaId
    });

    await contrato.save();

    // Registrar en analytics
    await new Analytics({
      empresaId: req.user.empresaId,
      tipo: 'contrato_generado',
      metadata: { usuarioId: req.user.id, contratoId: contrato._id }
    }).save();

    res.status(201).json(contrato);
  } catch (error) {
    res.status(500).json({ error: 'Error creando contrato' });
  }
});

// @route   POST /api/contratos/generar-ia
// @desc    Generar contrato con IA
// @access  Private
router.post('/generar-ia', [
  auth,
  body('clienteId').notEmpty().withMessage('Cliente requerido'),
  body('tipo').notEmpty().withMessage('Tipo de contrato requerido'),
  body('descripcion').notEmpty().withMessage('Descripción requerida')
], async (req, res) => {
  try {
    const { clienteId, tipo, descripcion } = req.body;
    
    // Obtener datos del cliente
    const cliente = await Cliente.findById(clienteId);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Simular generación con IA (aquí iría la integración con OpenAI)
    const contenidoIA = generarContratoSimulado(tipo, cliente, descripcion);
    
    const contrato = new Contrato({
      empresaId: req.user.empresaId,
      clienteId,
      tipo,
      titulo: `Contrato de ${tipo} - ${cliente.nombre}`,
      contenido: contenidoIA,
      estado: 'generado'
    });

    await contrato.save();

    // Registrar en analytics
    await new Analytics({
      empresaId: req.user.empresaId,
      tipo: 'contrato_generado',
      metadata: { usuarioId: req.user.id, contratoId: contrato._id }
    }).save();

    res.status(201).json(contrato);
  } catch (error) {
    res.status(500).json({ error: 'Error generando contrato con IA' });
  }
});

function generarContratoSimulado(tipo, cliente, descripcion) {
  const fecha = new Date().toLocaleDateString('es-PA');
  
  const plantillas = {
    servicio: `
CONTRATO DE PRESTACIÓN DE SERVICIOS

En la ciudad de Panamá, República de Panamá, a los ${fecha}, entre:

EL PRESTADOR: [NOMBRE DE LA EMPRESA]
RUC: [RUC DE LA EMPRESA]
Dirección: [DIRECCIÓN DE LA EMPRESA]

EL CLIENTE: ${cliente.nombre}
RUC/Cédula: ${cliente.rucIdentidad}
Dirección: ${cliente.direccion || 'Por definir'}

CLÁUSULAS:

PRIMERA: OBJETO DEL CONTRATO
${descripcion}

SEGUNDA: DURACIÓN
El presente contrato tendrá una duración de [DURACIÓN] a partir de la fecha de firma.

TERCERA: OBLIGACIONES
El prestador se compromete a brindar los servicios con la calidad y profesionalismo requeridos.

CUARTA: PAGO
El cliente se compromete a pagar la suma acordada en los términos establecidos.

QUITA: TERMINACIÓN
Este contrato podrá terminarse por mutuo acuerdo o por incumplimiento de cualquiera de las partes.

En fe de lo cual, las partes firman el presente contrato.

_________________                    _________________
EL PRESTADOR                         EL CLIENTE
`,
    compraventa: `
CONTRATO DE COMPRAVENTA

En la ciudad de Panamá, República de Panamá, a los ${fecha}, entre:

EL VENDEDOR: [NOMBRE DE LA EMPRESA]
RUC: [RUC DE LA EMPRESA]

EL COMPRADOR: ${cliente.nombre}
RUC/Cédula: ${cliente.rucIdentidad}

OBJETO: ${descripcion}

PRECIO: Por definir

CONDICIONES DE ENTREGA: Por definir

En fe de lo cual, las partes firman.

_________________                    _________________
EL VENDEDOR                          EL COMPRADOR
`
  };
  
  return plantillas[tipo] || plantillas.servicio;
}

module.exports = router;