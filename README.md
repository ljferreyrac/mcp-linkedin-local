# LinkedIn MCP Server

Un servidor MCP (Model Context Protocol) que permite a Claude acceder a tu información personal de LinkedIn de forma segura y local.

## 🚀 Características

- **Extracción completa de datos**: Perfil, experiencia laboral, certificaciones, habilidades y educación
- **Base de datos local**: SQLite para almacenamiento rápido y privado
- **Múltiples fuentes de datos**: Script del navegador, exportación oficial de LinkedIn, o entrada manual
- **Interfaz MCP**: Integración directa con Claude para consultas naturales
- **Privacidad total**: Todos los datos se mantienen localmente en tu máquina
- **Sin scraping automático**: Utiliza datos que tú proporcionas, sin riesgo de detección anti-bot

## 📋 Requisitos

- Node.js 18+
- NPM
- Cuenta de LinkedIn (para exportar datos)
- Claude Desktop (para usar el servidor MCP)

## 🛠️ Instalación

1. **Clona y configura el proyecto**:
```bash
git clone <tu-repo>
cd mcp-linkedin-local
npm install
```

2. **Compila el proyecto**:
```bash
npm run build
```

## ⚙️ Configuración

### Configuración en Claude Desktop

Agrega esto a tu archivo de configuración de Claude (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "node",
      "args": ["RUTA_ABSOLUTA_AL_PROYECTO/dist/index.js"]
    }
  }
}
```

**Importante**: Reemplaza `RUTA_ABSOLUTA_AL_PROYECTO` con la ruta completa a tu proyecto.

**Ubicación del archivo de configuración:**
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

> **Nota**: En Windows, puedes acceder rápidamente escribiendo `%APPDATA%\Claude` en el explorador de archivos.

## 🚀 Uso

### 1. Obtener tus datos de LinkedIn

**Opción A: Script del navegador (Recomendado para datos completos)**
1. Ve a tu perfil de LinkedIn: `https://linkedin.com/in/me/`
2. Abre DevTools (F12) → Consola
3. Copia y pega el contenido de `src/linkedin-extractor.js`
4. Visita cada sección para obtener datos completos:
   - Tu perfil principal
   - `/details/experience/`
   - `/details/certifications/`
   - `/details/skills/`
5. Ejecuta el script en cada página
6. Copia el JSON final y guárdalo como `data/my-data.json`

**Opción B: Exportación oficial de LinkedIn**
1. LinkedIn → Configuración y privacidad → Privacidad de los datos → "Obtener una copia de tus datos"
2. Solicita el archivo completo (tardará unas horas/días)
3. Descarga el ZIP cuando esté listo
4. Extrae y ejecuta: `npm run import linkedin-export /ruta/a/la/exportacion`

**Opción C: Crear manualmente (Para pruebas rápidas)**
```bash
npm run import template    # Crea template.json
# Edita data/template.json con tus datos
npm run import json        # Importa el JSON editado
```

### 2. Importar datos a la base de datos

```bash
# Importar desde JSON (desde script del navegador)
npm run import json ./data/my-data.json

# Importar desde exportación oficial
npm run import linkedin-export ./Downloads/linkedin-export/

# Crear template para llenar manualmente
npm run import template
```

### 3. Ejecutar el servidor MCP

```bash
npm run build
npm start
```

El servidor se ejecutará y estará disponible para Claude Desktop.

## 💬 Ejemplos de uso con Claude

Una vez configurado, puedes hacer preguntas naturales a Claude sobre tu perfil:

- "¿Cuáles son mis certificaciones más recientes?"
- "Muéstrame mi experiencia laboral en orden cronológico"
- "¿Qué habilidades tengo y cuántos endorsements tienen?"
- "Busca conexiones que trabajen en tecnología"
- "¿Cuál es mi formación académica?"

## 🔧 Comandos disponibles

```bash
# Desarrollo y construcción
npm run build        # Compila TypeScript a JavaScript
npm run start        # Ejecuta el servidor MCP compilado
npm run dev          # Ejecuta en modo desarrollo con tsx

# Importación de datos
npm run import template                    # Crea un template para llenar
npm run import json [archivo]             # Importa desde JSON
npm run import linkedin-export [carpeta]  # Importa desde exportación oficial
```

## 🔧 Funciones MCP disponibles

| Función | Descripción |
|---------|-------------|
| `get_profile` | Obtiene información del perfil personal |
| `get_experience` | Lista experiencia laboral |
| `get_certifications` | Obtiene certificaciones y licencias |
| `get_skills` | Lista habilidades y endorsements |
| `get_recent_posts` | Obtiene posts recientes (si están disponibles) |
| `search_connections` | Busca en conexiones por nombre, empresa o título |
| `get_sync_status` | Estado de la última sincronización |
| `import_data` | Importa datos desde un archivo JSON |

## 📊 Estructura de datos

### Perfil
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  summary: string;
  location: string;
  profileUrl: string;
  profilePicture?: string;
  connectionsCount?: number;
  followersCount?: number;
  updatedAt: Date;
}
```

### Experiencia
```typescript
{
  id: string;
  title: string;
  company: string;
  companyUrl?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  skills?: string[];
  current: boolean;
  createdAt: Date;
}
```

### Certificaciones
```typescript
{
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  skills?: string[];
  createdAt: Date;
}
```

### Habilidades
```typescript
{
  id: string;
  name: string;
  endorsementsCount?: number;
  createdAt: Date;
}
```

### Educación
```typescript
{
  id: string;
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  createdAt: Date;
}
```

## 🔒 Privacidad y Seguridad

- **Datos 100% locales**: Toda la información se almacena en SQLite local (`data/linkedin.db`)
- **Sin APIs externas**: No se envía información a terceros ni servidores externos
- **Sin scraping automático**: Solo utiliza datos que tú proporcionas explícitamente
- **Control total**: Puedes eliminar la base de datos en cualquier momento
- **Sin credenciales**: No necesitas proporcionar contraseñas ni tokens de acceso

## 🔧 Solución de problemas

### El servidor no inicia
```bash
# Verifica que está compilado
npm run build

# Verifica que el archivo existe
ls dist/index.js  # En PowerShell: Get-ChildItem dist/index.js
```

### Claude no encuentra el servidor
1. Verifica que la ruta en `claude_desktop_config.json` sea **absoluta**
2. Reinicia Claude Desktop después de cambiar la configuración
3. Verifica que no hay errores en la consola de Claude Desktop

### No aparecen datos
```bash
# Verifica que los datos se importaron correctamente
npm run import json ./data/my-data.json

# Ejecuta el debug para verificar la base de datos
npm run debug
```

### Error "Database handle is closed"
Este es un error conocido que ocurre al finalizar algunos comandos de importación pero no afecta la funcionalidad principal del servidor MCP.

### Problemas con el script del navegador
- Asegúrate de estar **logueado** en LinkedIn
- Ejecuta el script en cada página por separado
- Si LinkedIn bloquea, espera unos minutos e inténtalo de nuevo

## 🤝 Contribuciones

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/mejora`)
3. Commit tus cambios (`git commit -am 'Agrega nueva feature'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - puedes usar, modificar y distribuir libremente.

## 🔄 Roadmap

### Mejoras planeadas
- [ ] Corregir error de cierre de base de datos
- [ ] Mejorar manejo de errores en importación
- [ ] Soporte para múltiples perfiles (equipos)
- [ ] Exportación a diferentes formatos (CSV, JSON)
- [ ] Sincronización incremental (detectar cambios)
- [ ] Integración con otros MCPs del ecosistema

### Contribuciones bienvenidas
- Mejoras en el script del navegador
- Soporte para más campos de LinkedIn
- Optimizaciones de rendimiento
- Documentación y ejemplos

## 📚 Recursos adicionales

- [Documentación oficial de MCP](https://modelcontextprotocol.io/docs)
- [Claude Desktop](https://claude.ai/desktop)
- [Exportar datos de LinkedIn](https://www.linkedin.com/help/linkedin/answer/a1339364)

---

¿Necesitas ayuda? Abre un issue o consulta la documentación de MCP.