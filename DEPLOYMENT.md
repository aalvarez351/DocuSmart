# Guía de Despliegue - DocuSmart

## 🚀 Configuración de Variables de Entorno en Render.com

### Paso 1: Acceder al Dashboard de Render.com
1. Ve a https://render.com y accede a tu cuenta
2. Selecciona el servicio "docusmart" (backend)
3. Ve a la pestaña "Environment"

### Paso 2: Agregar Variables de Entorno
Agrega las siguientes variables de entorno una por una:

```
MONGO_URI=mongodb+srv://aalvarez351:Lentesdesol@ianube.furqsl0.mongodb.net/DocuSmart?retryWrites=true&w=majority
JWT_SECRET=docusmart-super-secret-key-2024-panama-jwt-256-bits
JWT_EXPIRES_IN=7d
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://aalvarez351.github.io/DocuSmart
OPENAI_API_KEY=sk-tu-clave-openai-aqui
PAC_API_URL=https://api-pac-sandbox.com/v1
PAC_API_KEY=tu-clave-pac-aqui
```

### Paso 3: Reiniciar el Servicio
1. Después de agregar todas las variables, haz clic en "Save Changes"
2. El servicio se reiniciará automáticamente
3. Verifica que el despliegue sea exitoso

## 🔧 Verificación del Despliegue

### Backend (Render.com)
- URL: https://docusmart.onrender.com
- Estado: https://docusmart.onrender.com/api/status
- Salud: https://docusmart.onrender.com/health

### Frontend (GitHub Pages)
- URL: https://aalvarez351.github.io/DocuSmart
- Configuración automática via GitHub Actions

## 🐛 Solución de Problemas

### Error: "connect ECONNREFUSED"
- **Causa**: Variables de entorno no configuradas en Render.com
- **Solución**: Verificar que MONGO_URI esté configurado correctamente

### Error: "Ruta no encontrada"
- **Causa**: Acceso a rutas que no existen
- **Solución**: Usar las rutas correctas del API (/api/*)

### Error: "Token inválido"
- **Causa**: JWT_SECRET no configurado
- **Solución**: Verificar que JWT_SECRET esté en las variables de entorno

## 📊 Monitoreo

### Logs en Render.com
1. Ve al dashboard del servicio
2. Selecciona la pestaña "Logs"
3. Monitorea errores y conexiones

### Métricas
- Conexiones a MongoDB
- Requests por minuto
- Tiempo de respuesta
- Errores 4xx/5xx

## 🔄 Proceso de Actualización

### Backend
1. Hacer push a la rama `main` en GitHub
2. Render.com detecta automáticamente los cambios
3. Inicia el proceso de build y deploy
4. Verifica el estado en el dashboard

### Frontend
1. Hacer push a la rama `main` en GitHub
2. GitHub Actions ejecuta el workflow
3. Despliega automáticamente a GitHub Pages
4. Verifica en https://aalvarez351.github.io/DocuSmart