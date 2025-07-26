# LinkedIn MCP Server

Un servidor MCP (Model Context Protocol) que permite a Claude acceder a tu información personal de LinkedIn de forma segura y local.

## 🚀 Características

- **Extracción completa de datos**: Perfil, experiencia laboral, certificaciones, habilidades y posts recientes
- **Base de datos local**: SQLite para almacenamiento rápido y privado
- **Sincronización automática**: Web scraping inteligente con detección anti-bot
- **Interfaz MCP**: Integración directa con Claude para consultas naturales
- **Privacidad total**: Todos los datos se mantienen localmente

## 📋 Requisitos

- Node.js 18+
- NPM o Yarn
- Cuenta de LinkedIn
- Claude Desktop (para usar el MCP)

## 🛠️ Instalación

1. **Clona y configura el proyecto**:
```bash
git clone <tu-repo>
cd linkedin-mcp-server
npm install
```

3. **Compila el proyecto**:
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
      "args": ["ruta/al/proyecto/dist/index.js"]
    }
  }
}
```

## 🚀 Uso

### 1. Obtener tus datos de LinkedIn

**Opción A: Script del navegador (Recomendado)**
1. Ve a tu perfil de LinkedIn: `https://linkedin.com/in/me/`
2. Abre DevTools (F12) → Consola
3. Copia y pega el código de `linkedin-extractor.js`
4. Visita cada sección:
   - `/details/experience/`
   - `/details/certifications/`
   - `/details/skills/`
5. Ejecuta el script en cada página
6. Copia el JSON final y guárdalo como `data/my-data.json`

**Opción B: Exportación oficial**
1. LinkedIn → Configuración → Privacidad → "Obtener una copia de tus datos"
2. Descarga el ZIP cuando esté listo
3. Extrae y ejecuta: `npm run import linkedin-export /path/to/export`

**Opción C: Crear manualmente**
```bash
npm run create-template    # Crea template.json
# Edita data/template.json con tus datos
npm run import-json        # Importa el JSON
```

### 2. Importar datos

```bash
# Importar desde JSON (desde script del navegador)
npm run import json ./data/my-data.json

# Importar desde exportación oficial
npm run import linkedin-export ./Downloads/linkedin-export/

# Crear template para llenar manualmente
npm run create-template
```

### 3. Ejecutar el servidor MCP

```bash
npm run build
npm start
```

- "¿Cuáles son mis certificaciones más recientes?"
- "Muéstrame mi experiencia laboral en orden cronológico"
- "¿Qué habilidades tengo con más endorsements?"
- "¿Cuáles fueron mis últimos 5 posts en LinkedIn?"
- "Busca conexiones que trabajen en tecnología"

### 3. Comandos disponibles

```bash
# Desarrollo
npm run dev          # Ejecuta en modo desarrollo
npm run build        # Compila TypeScript
npm run start        # Ejecuta la versión compilada
```

## 🔧 Funciones MCP disponibles

| Función | Descripción |
|---------|-------------|
| `get_profile` | Obtiene información del perfil |
| `get_experience` | Lista experiencia laboral |
| `get_certifications` | Obtiene certificaciones |
| `get_skills` | Lista habilidades y endorsements |
| `get_recent_posts` | Obtiene posts recientes |
| `search_connections` | Busca en conexiones |
| `get_sync_status` | Estado de la última sincronización |

## 📊 Estructura de datos

### Perfil
```typescript
{
  firstName: string;
  lastName: string;
  headline: string;
  summary: string;
  location: string;
  connectionsCount: number;
}
```

### Experiencia
```typescript
{
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}
```

### Certificaciones
```typescript
{
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
}
```

## 🔒 Privacidad y Seguridad

- **Datos locales**: Toda la información se almacena en SQLite local
- **Sin APIs externas**: No se envía información a terceros

## 🤝 Contribuciones

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/mejora`)
3. Commit tus cambios (`git commit -am 'Agrega nueva feature'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - puedes usar, modificar y distribuir libremente.

## 🔄 Roadmap

- [ ] Soporte para múltiples perfiles
- [ ] Exportación a diferentes formatos
- [ ] Dashboard web opcional
- [ ] Sincronización incremental
- [ ] Integración con otros MCPs

---

¿Necesitas ayuda? Abre un issue o consulta la documentación de MCP.