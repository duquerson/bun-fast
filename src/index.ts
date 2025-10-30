import Fastify from 'fastify';
import { todoRoutes } from './routes/todo.route.ts';
import { connect } from './config/conectDB.ts';
const app = Fastify({ logger: true });
import { DATA } from './utils/CONST.ts';
import { registerErrorHandler } from './helpers/registerErrorHandler.ts';
import { configSwagger } from './config/configSwagger.ts';
import { SchemaHealth } from './schema/shema.routes.ts';
//----------------------------------------------------------
// CONST
//---------------------------------------------------------
const port = 4321;
const host = DATA.HOST ?? 'localhost';
const URL = DATA.URL ?? 'http://localhost:27017/todos';
//-----------------------------------------------------
//Swagger
//-----------------------------------------------------
await configSwagger(app, host, port);
//-----------------------------------------------------
// ROUTES
//-----------------------------------------------------
app.get('/health', {
	schema: SchemaHealth
}, async () => {
	return {
		status: 'ok',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		environment: process.env.NODE_ENV || 'development',
	};
});
app.register(todoRoutes, { prefix: '/api/v1/todos' });
//------------------------------------------------------
//handlers routes and errors
//------------------------------------------------------
app.setNotFoundHandler(async (request, reply) => {
	reply.status(404).send({ error: `Route ${request.url} not found` });
});

registerErrorHandler(app);

//------------------------------------------------------
//start services
//------------------------------------------------------
const start = async () => {
	try {
		await connect(URL);
		await app.listen({ port, host });
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log('✅ Servidor corriendo correctamente');
		console.log(`🌐 API: http://${host}:${port}`);
		console.log(`📚 Swagger UI: http://${host}:${port}/documentation`);
		console.log(`🏥 Health Check: http://${host}:${port}/health`);
		console.log('🗄️  MongoDB: Conectado');
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};
start();
