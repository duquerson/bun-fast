# bun-fast

API RESTful para gestión de tareas TODO construida con Fastify, TypeScript y MongoDB.

## Características

- 🚀 **Fastify**: Framework web de alto rendimiento
- 📝 **TypeScript**: Tipado fuerte y desarrollo moderno
- 🗄️ **MongoDB**: Base de datos NoSQL con Mongoose
- 📚 **Swagger/OpenAPI**: Documentación automática de la API
- 🔍 **ESLint**: Linting y calidad de código
- 🏥 **Health Check**: Monitoreo del estado del sistema
- ⚡ **Bun**: Runtime rápido de JavaScript
- 🧪 **Bun Test**: Framework de pruebas integrado
- ✅ **Zod**: Validación de esquemas

## Instalación

```bash
bun install
```

## Uso

### Desarrollo
```bash
bun run dev
```

### Producción
```bash
bun run build
bun run start
```

## API Endpoints

- `GET /health` - Health check del sistema
- `GET /api/v1/todos` - Obtener todas las tareas
- `GET /api/v1/todos/:id` - Obtener tarea por ID
- `POST /api/v1/todos` - Crear nueva tarea
- `PUT /api/v1/todos/:id` - Actualizar tarea completa
- `PATCH /api/v1/todos/:id` - Actualizar estado de completado
- `DELETE /api/v1/todos/:id` - Eliminar tarea

## Documentación

La documentación completa de la API está disponible en:
- **Swagger UI**: `http://localhost:4321/documentation`
- **OpenAPI Spec**: `http://localhost:4321/documentation/json`

## Configuración

### Variables de Entorno

- `APIMONGODB`: URL de conexión a MongoDB (default: `mongodb://localhost:27017/todos`)
- `PORT`: Puerto del servidor
- `HOST`: Host del servidor

### Base de Datos

Asegúrate de tener MongoDB corriendo localmente o configura la variable `APIMONGODB` para apuntar a tu instancia de MongoDB.

## Desarrollo

### Scripts Disponibles

- `bun run dev` - Inicia el servidor en modo desarrollo
- `bun run build` - Construye el proyecto para producción
- `bun run start` - Inicia el servidor en modo producción
- `bun run test` - Ejecuta las pruebas
- `bun run test:watch` - Ejecuta las pruebas en modo watch
- `bun run lint` - Ejecuta ESLint para verificar calidad de código
- `bun run lint:fix` - Corrige automáticamente errores de linting

### Estructura del Proyecto

```
src/
├── config/          # Configuraciones (DB, Swagger)
├── controller/      # Controladores de la API
├── helpers/         # Utilidades y manejo de errores
├── mocks/           # Mocks para pruebas
├── model/           # Modelos de datos
├── routes/          # Definición de rutas
├── schema/          # Esquemas JSON y validaciones
├── test/            # Pruebas unitarias y E2E
├── types/           # Definiciones de tipos TypeScript
```

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## Tecnologías

- [Fastify](https://fastify.dev/) - Framework web
- [TypeScript](https://www.typescriptlang.org/) - Lenguaje de programación
- [MongoDB](https://www.mongodb.com/) - Base de datos
- [Mongoose](https://mongoosejs.com/) - ODM para MongoDB
- [Bun](https://bun.sh/) - Runtime de JavaScript
- [Bun Test](https://bun.sh/docs/test) - Framework de pruebas
- [Zod](https://zod.dev/) - Validación de esquemas
- [ESLint](https://eslint.org/) - Linting

---

Creado con ❤️ usando [Bun](https://bun.com)
