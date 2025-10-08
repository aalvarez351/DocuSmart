# Documentación Técnica - DocuSmart

## 🏗️ Arquitectura del Sistema

DocuSmart es una aplicación SaaS construida con arquitectura de microservicios, diseñada específicamente para PYMEs panameñas que necesitan facturación electrónica y generación automática de contratos legales.

### Stack Tecnológico

```
Frontend (GitHub Pages)
├── React 18 + Vite
├── TailwindCSS + Material Dashboard
├── React Router Dom
├── Axios + React Query
├── Zustand (Estado Global)
└── Lucide React (Iconos)

Backend (Render.com)
├── Node.js 18+ + Express
├── MongoDB Atlas (Base: DocuSmart)
├── JWT + bcrypt (Autenticación)
├── OpenAI API (Generación IA)
├── PAC Integration (DGI Panamá)
└── Helmet + CORS (Seguridad)
```

## 📊 Modelo de Base de Datos

### Colección: `empresas`
```javascript
{
  _id: ObjectId,
  ruc: "8-123-456789",           // RUC panameño
  nombre: "Empresa S.A.",
  direccion: "Calle 50, Panamá",
  telefono: "+507 6000-1234",
  email: "admin@empresa.pa",
  plan: "basico|pro|enterprise",
  pac_config: {
    proveedor: "pac1|pac2|pac3",
    api_key: "encrypted_key",
    ambiente: "sandbox|produccion"
  },
  activa: true,
  fecha_vencimiento: ISODate,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Colección: `users`
```javascript
{
  _id: ObjectId,
  empresaId: ObjectId,           // Referencia a empresas
  nombre: "Juan Pérez",
  email: "juan@empresa.pa",
  password: "hashed_password",
  rol: "admin|contador|usuario",
  permisos: {
    facturas: { crear: true, leer: true, actualizar: false, eliminar: false },
    clientes: { crear: true, leer: true, actualizar: false, eliminar: false },
    productos: { crear: true, leer: true, actualizar: false, eliminar: false },
    contratos: { crear: false, leer: true, actualizar: false, eliminar: false }
  },
  activo: true,
  ultimo_acceso: ISODate,
  createdAt: ISODate
}
```

### Colección: `facturas`
```javascript
{
  _id: ObjectId,
  empresaId: ObjectId,
  clienteId: ObjectId,
  numero: "001-001-000001",      // Numeración DGI
  items: [
    {
      productoId: ObjectId,
      descripcion: "Producto/Servicio",
      cantidad: 2,
      precio_unitario: 100.00,
      descuento: 0,
      impuestos: {
        itbms: 7.00
      },
      total: 214.00
    }
  ],
  subtotal: 200.00,
  descuento_total: 0,
  impuestos_total: 14.00,
  total: 214.00,
  estado: "borrador|enviada|aprobada|rechazada",
  pac_response: {
    cufe: "uuid-cufe",
    xml_firmado: "base64_xml",
    fecha_envio: ISODate,
    estado_dgi: "aprobada"
  },
  createdAt: ISODate
}
```

## 🔐 Sistema de Autenticación

### JWT Token Structure
```javascript
{
  user: {
    id: "user_id",
    empresaId: "empresa_id", 
    rol: "admin|contador|usuario"
  },
  iat: timestamp,
  exp: timestamp
}
```

### Middleware de Autorización
```javascript
// Verificar autenticación
auth(req, res, next)

// Verificar rol específico
requireRole(['admin', 'contador'])

// Verificar permiso específico
requirePermission('facturas', 'crear')

// Verificar misma empresa
requireSameCompany(req, res, next)
```

## 🧠 Integración con IA (OpenAI)

### Generación de Contratos
```javascript
const prompt = `
Genera un contrato legal en español panameño para:
- Tipo: ${tipo_contrato}
- Partes: ${empresa} y ${cliente}
- Monto: $${monto} USD
- Plazo: ${plazo}
- Condiciones especiales: ${condiciones}

Incluye cláusulas estándar panameñas y numeración legal.
`;

const contrato = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }],
  max_tokens: 2000,
  temperature: 0.3
});
```

## 📄 Integración PAC (Facturación Electrónica)

### Flujo de Facturación
```
1. Usuario crea factura → Estado: "borrador"
2. Sistema valida datos → Aplicar reglas DGI
3. Generar XML CFDI → Formato estándar panameño
4. Enviar a PAC → Firma digital + Timbre
5. Recibir respuesta → CUFE + XML firmado
6. Actualizar estado → "aprobada" o "rechazada"
7. Notificar usuario → Email + Dashboard
```

### Estructura XML CFDI (Simplificada)
```xml
<FacturaElectronica>
  <Encabezado>
    <RUCEmisor>8-123-456789</RUCEmisor>
    <FechaEmision>2024-01-15T10:30:00</FechaEmision>
    <NumeroFactura>001-001-000001</NumeroFactura>
  </Encabezado>
  <Receptor>
    <RUCReceptor>9-987-654321</RUCReceptor>
    <NombreReceptor>Cliente S.A.</NombreReceptor>
  </Receptor>
  <Conceptos>
    <Concepto>
      <Descripcion>Servicio de Consultoría</Descripcion>
      <Cantidad>1</Cantidad>
      <ValorUnitario>1000.00</ValorUnitario>
      <ITBMS>70.00</ITBMS>
    </Concepto>
  </Conceptos>
  <Totales>
    <Subtotal>1000.00</Subtotal>
    <ITBMS>70.00</ITBMS>
    <Total>1070.00</Total>
  </Totales>
</FacturaElectronica>
```

## 🚀 Despliegue y DevOps

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
1. Test & Lint → Verificar código
2. Build Backend → Preparar para Render
3. Deploy Backend → Render.com automático
4. Build Frontend → Optimizar para producción
5. Deploy Frontend → GitHub Pages
6. Notify → Slack/Email de estado
```

### Variables de Entorno Requeridas

#### Backend (Render.com)
```bash
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/DocuSmart
JWT_SECRET=super-secret-key-256-bits
OPENAI_API_KEY=sk-openai-key
PAC_API_URL=https://api-pac.com/v1
PAC_API_KEY=pac-secret-key
FRONTEND_URL=https://tu-usuario.github.io/DocuSmart
```

#### Frontend (GitHub Pages)
```bash
VITE_API_URL=https://docusmart-backend.onrender.com/api
VITE_APP_NAME=DocuSmart
VITE_APP_VERSION=1.0.0
```

## 📈 Monitoreo y Logs

### Métricas Clave
- **Uptime**: >99.5% (objetivo)
- **Response Time**: <500ms (API)
- **Error Rate**: <1%
- **Facturas/día**: Tracking por empresa
- **Usuarios activos**: DAU/MAU

### Logging Structure
```javascript
{
  timestamp: "2024-01-15T10:30:00Z",
  level: "info|warn|error",
  service: "backend|frontend",
  user_id: "user_id",
  empresa_id: "empresa_id", 
  action: "factura_created",
  details: { factura_id: "123", total: 1070.00 },
  ip: "192.168.1.1",
  user_agent: "Mozilla/5.0..."
}
```

## 🔒 Seguridad

### Medidas Implementadas
- **HTTPS**: Obligatorio en producción
- **JWT**: Tokens con expiración
- **Rate Limiting**: 100 req/15min por IP
- **CORS**: Configurado para dominios específicos
- **Helmet**: Headers de seguridad
- **bcrypt**: Hash de contraseñas (12 rounds)
- **Input Validation**: express-validator
- **SQL Injection**: Mongoose ODM
- **XSS**: Sanitización automática

### Cumplimiento Legal
- **Ley 81 (Panamá)**: Protección de datos personales
- **DGI**: Facturación electrónica certificada
- **Retención de datos**: 7 años (legal panameño)

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                    # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e          # End-to-end tests
```

### Frontend Tests
```bash
cd frontend
npm test                   # Vitest + Testing Library
npm run test:e2e          # Playwright E2E
```

## 📞 Soporte y Mantenimiento

### Canales de Soporte
- **Email**: soporte@docusmart.pa
- **WhatsApp**: +507 6000-0000
- **Portal**: https://soporte.docusmart.pa
- **Status Page**: https://status.docusmart.pa

### Horarios de Soporte
- **Básico**: Lun-Vie 8AM-6PM
- **Pro**: Lun-Vie 8AM-8PM + Sáb 9AM-1PM  
- **Enterprise**: 24/7 con SLA <2h

---

**Última actualización**: Enero 2024  
**Versión**: 1.0.0  
**Mantenido por**: Equipo DocuSmart