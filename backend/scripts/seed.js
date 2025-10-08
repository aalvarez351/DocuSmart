const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importar modelos
const Empresa = require('../models/Empresa');
const User = require('../models/User');

// Datos de prueba para inicializar la base de datos DocuSmart
const empresasSeed = [
  {
    ruc: '8-123-456789',
    nombre: 'Tecnología Avanzada S.A.',
    direccion: 'Calle 50, Edificio Global Bank, Piso 15, Ciudad de Panamá',
    telefono: '+507 6000-1234',
    email: 'admin@tecnoavanzada.pa',
    plan: 'pro',
    pac_config: {
      proveedor: 'pac1',
      ambiente: 'sandbox'
    }
  },
  {
    ruc: '9-987-654321',
    nombre: 'Consultoría Legal Panamá Ltda.',
    direccion: 'Avenida Balboa, Torre de las Américas, Oficina 2501',
    telefono: '+507 6000-5678',
    email: 'contacto@consultorialegal.pa',
    plan: 'enterprise',
    pac_config: {
      proveedor: 'pac2',
      ambiente: 'sandbox'
    }
  },
  {
    ruc: '2-555-123456',
    nombre: 'Comercial El Buen Precio',
    direccion: 'Vía España, Centro Comercial El Dorado, Local 45',
    telefono: '+507 6000-9999',
    email: 'ventas@buenprecio.pa',
    plan: 'basico',
    pac_config: {
      proveedor: 'pac1',
      ambiente: 'sandbox'
    }
  }
];

const usuariosSeed = [
  {
    nombre: 'Carlos Rodríguez',
    email: 'carlos@tecnoavanzada.pa',
    password: 'admin123',
    rol: 'admin'
  },
  {
    nombre: 'María González',
    email: 'maria@tecnoavanzada.pa',
    password: 'contador123',
    rol: 'contador'
  },
  {
    nombre: 'Ana Martínez',
    email: 'ana@consultorialegal.pa',
    password: 'admin123',
    rol: 'admin'
  },
  {
    nombre: 'Luis Pérez',
    email: 'luis@consultorialegal.pa',
    password: 'usuario123',
    rol: 'usuario'
  },
  {
    nombre: 'Roberto Silva',
    email: 'roberto@buenprecio.pa',
    password: 'admin123',
    rol: 'admin'
  }
];

async function conectarDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/DocuSmart', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB Atlas - Base de datos: DocuSmart');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

async function limpiarDB() {
  try {
    await User.deleteMany({});
    await Empresa.deleteMany({});
    console.log('🧹 Base de datos limpiada');
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error);
  }
}

async function crearEmpresas() {
  try {
    const empresasCreadas = await Empresa.insertMany(empresasSeed);
    console.log(`✅ ${empresasCreadas.length} empresas creadas`);
    return empresasCreadas;
  } catch (error) {
    console.error('❌ Error creando empresas:', error);
    return [];
  }
}

async function crearUsuarios(empresas) {
  try {
    const usuariosConEmpresa = [
      // Usuarios para Tecnología Avanzada S.A.
      { ...usuariosSeed[0], empresaId: empresas[0]._id },
      { ...usuariosSeed[1], empresaId: empresas[0]._id },
      
      // Usuarios para Consultoría Legal Panamá Ltda.
      { ...usuariosSeed[2], empresaId: empresas[1]._id },
      { ...usuariosSeed[3], empresaId: empresas[1]._id },
      
      // Usuario para Comercial El Buen Precio
      { ...usuariosSeed[4], empresaId: empresas[2]._id }
    ];

    // Hashear contraseñas
    for (let usuario of usuariosConEmpresa) {
      const salt = await bcrypt.genSalt(12);
      usuario.password = await bcrypt.hash(usuario.password, salt);
    }

    const usuariosCreados = await User.insertMany(usuariosConEmpresa);
    console.log(`✅ ${usuariosCreados.length} usuarios creados`);
    return usuariosCreados;
  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
    return [];
  }
}

async function mostrarResumen(empresas, usuarios) {
  console.log('\n📊 RESUMEN DE DATOS CREADOS:');
  console.log('================================');
  
  for (let i = 0; i < empresas.length; i++) {
    const empresa = empresas[i];
    const usuariosEmpresa = usuarios.filter(u => u.empresaId.toString() === empresa._id.toString());
    
    console.log(`\n🏢 ${empresa.nombre}`);
    console.log(`   RUC: ${empresa.ruc}`);
    console.log(`   Email: ${empresa.email}`);
    console.log(`   Plan: ${empresa.plan}`);
    console.log(`   Usuarios:`);
    
    usuariosEmpresa.forEach(usuario => {
      console.log(`   - ${usuario.nombre} (${usuario.email}) - Rol: ${usuario.rol}`);
    });
  }
  
  console.log('\n🔑 CREDENCIALES DE ACCESO:');
  console.log('==========================');
  usuarios.forEach(usuario => {
    const empresa = empresas.find(e => e._id.toString() === usuario.empresaId.toString());
    console.log(`${usuario.email} / ${usuariosSeed.find(u => u.email === usuario.email)?.password} (${empresa.nombre})`);
  });
  
  console.log('\n🌐 URLs DE ACCESO:');
  console.log('==================');
  console.log('Backend API: http://localhost:3000/api/status');
  console.log('Frontend: http://localhost:5173');
  console.log('MongoDB: DocuSmart database');
}

async function seed() {
  console.log('🌱 Iniciando seed de la base de datos DocuSmart...\n');
  
  await conectarDB();
  await limpiarDB();
  
  const empresas = await crearEmpresas();
  if (empresas.length === 0) {
    console.error('❌ No se pudieron crear las empresas');
    process.exit(1);
  }
  
  const usuarios = await crearUsuarios(empresas);
  if (usuarios.length === 0) {
    console.error('❌ No se pudieron crear los usuarios');
    process.exit(1);
  }
  
  await mostrarResumen(empresas, usuarios);
  
  console.log('\n✅ Seed completado exitosamente!');
  console.log('🚀 Puedes iniciar el servidor con: npm run dev');
  
  process.exit(0);
}

// Ejecutar seed si se llama directamente
if (require.main === module) {
  seed().catch(error => {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  });
}

module.exports = { seed };