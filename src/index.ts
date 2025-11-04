import Fastify from 'fastify';
import { todoRoutes } from './routes/todo.route.ts';
import { connect } from './config/conectDB.ts';
const app = Fastify({ logger: true });
import { registerErrorHandler } from './helpers/registerErrorHandler.ts';
import { configSwagger } from './config/configSwagger.ts';
import { SchemaHealth } from './schema/shema.routes.ts';
import { config } from './config/index.ts';

//-----------------------------------------------------
//Swagger
//-----------------------------------------------------
await configSwagger(app, config.host, config.port);
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
		await connect(config.mongoUrl);
		await app.listen({ port: config.port, host: config.host });
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log('✅ Servidor corriendo correctamente');
		console.log(`🌐 API: http://${config.host}:${config.port}`);
		console.log(`📚 Swagger UI: http://${config.host}:${config.port}/documentation`);
		console.log(`🏥 Health Check: http://${config.host}:${config.port}/health`);
		console.log('🗄️  MongoDB: Conectado');
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};

start();
