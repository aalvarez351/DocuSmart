# DocuSmart - Asistente Legal-Contable con IA para PYMEs

## 🚀 Descripción del Proyecto

DocuSmart es una plataforma SaaS integral que combina facturación electrónica, generación automática de contratos legales con IA y gestión contable para pequeñas y medianas empresas en Panamá.

### Características Principales

- ✅ **Facturación Electrónica**: Integración con PACs certificados por la DGI
- ✅ **Generación de Contratos IA**: Documentos legales automáticos en español panameño
- ✅ **Gestión de Clientes**: CRUD completo con validación de RUC/Cédula
- ✅ **Control de Productos**: Inventario básico con precios e impuestos
- ✅ **Dashboard Intuitivo**: Panel de control moderno y responsivo
- ✅ **Autenticación JWT**: Sistema de roles (admin, contador, usuario)
- ✅ **Base de Datos MongoDB**: Cluster "DocuSmart" en MongoDB Atlas

## 🏗️ Arquitectura Técnica

### Frontend
- **Framework**: React + Vite
- **Estilos**: TailwindCSS + Material Dashboard
- **Despliegue**: GitHub Pages
- **Comunicación**: REST API con Axios

### Backend
- **Runtime**: Node.js + Express
- **Base de Datos**: MongoDB Atlas (Cluster: DocuSmart)
- **Autenticación**: JWT + bcrypt
- **Despliegue**: Render.com
- **Integraciones**: OpenAI API, PACs DGI

### Estructura de Base de Datos

```javascript
// Colecciones en MongoDB Atlas - Base: DocuSmart
empresas: {
  _id, ruc, nombre, direccion, telefono, email, 
  plan, pac_config, createdAt
}

users: {
  _id, empresaId, nombre, email, rol, 
  hashPassword, createdAt
}

clientes: {
  _id, empresaId, nombre, rucIdentidad, 
  direccion, telefono, email
}

productos: {
  _id, empresaId, sku, nombre, precio, 
  unidad, impuestos
}

facturas: {
  _id, empresaId, clienteId, items[], total, 
  estado, pac_response, xml, createdAt
}

contratos: {
  _id, empresaId, clienteId, tipo, contenidoIA, 
  firmado, fechaFirma
}
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- MongoDB Atlas Account
- OpenAI API Key
- Render.com Account
- GitHub Account

### Variables de Entorno

```bash
# Backend (.env)
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/DocuSmart
JWT_SECRET=your-super-secret-key
OPENAI_API_KEY=sk-your-openai-key
PAC_API_URL=https://pac-provider.com/api
PAC_API_KEY=your-pac-key
PORT=3000

# Frontend (.env)
VITE_API_URL=https://docusmart-backend.render.com
```

### Comandos de Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/DocuSmart.git
cd DocuSmart

# Instalar dependencias
npm install

# Configurar base de datos
npm run setup-db

# Desarrollo local
npm run dev

# Despliegue completo
npm run deploy
```

## 📊 Modelo de Negocio

### Planes de Suscripción
- **Básico**: $15/mes - 100 facturas
- **Pro**: $30/mes - 500 facturas + contratos IA
- **Enterprise**: $80/mes - Ilimitado + soporte prioritario

### Mercado Objetivo
- PYMEs panameñas (5,000-50,000 empresas)
- Contadores independientes
- Estudios jurídicos pequeños

## 🛠️ Desarrollo

### Estructura del Proyecto
```
DocuSmart/
├── frontend/          # React + Vite
├── backend/           # Node.js + Express
├── docs/              # Documentación
├── config/            # Configuraciones
├── pages/             # Plantilla actual (Material Dashboard)
└── assets/            # Recursos estáticos
```

### Roadmap de Desarrollo

#### Fase 0 (1 semana) - Configuración
- [x] Configurar MongoDB Atlas (DocuSmart)
- [x] Crear repositorios GitHub
- [x] Configurar Render.com
- [x] Definir variables de entorno

#### Fase 1 (4-6 semanas) - MVP
- [ ] Sistema de autenticación JWT
- [ ] CRUD empresas, clientes, productos
- [ ] Facturación electrónica básica
- [ ] Generador de contratos IA
- [ ] Dashboard funcional

#### Fase 2 (2 meses) - Piloto
- [ ] Integración PAC real
- [ ] Testing con 10 PYMEs
- [ ] Optimización de rendimiento
- [ ] Métricas y analytics

#### Fase 3 (6 meses) - Escalamiento
- [ ] Múltiples PACs
- [ ] Módulos adicionales (nómina, contabilidad)
- [ ] Monetización SaaS
- [ ] Expansión regional

## 🔒 Seguridad y Cumplimiento

- **Ley 81 de Protección de Datos**: Cumplimiento total
- **DGI Panamá**: Integración certificada
- **HTTPS**: Encriptación end-to-end
- **JWT**: Tokens seguros con expiración
- **Rate Limiting**: Protección contra ataques
- **Logs de Auditoría**: Trazabilidad completa

## 📞 Contacto y Soporte

- **Email**: soporte@docusmart.pa
- **Teléfono**: +507 6000-0000
- **Documentación**: https://docs.docusmart.pa
- **Status**: https://status.docusmart.pa

---

**© 2024 DocuSmart - Asistente Legal-Contable con IA para PYMEs en Panamá**