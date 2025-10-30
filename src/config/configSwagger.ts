import type { FastifyInstance } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

export async function configSwagger(app: FastifyInstance, host: string, port: number) {


	await app.register(fastifySwagger, {
		openapi: {
			openapi: '3.0.0',
			info: {
				title: 'TODO API',
				description: 'API RESTful for handler TODOs with documentation complete',
				version: '1.0.0',
				contact: {
					name: 'Duquerson',
					email: 'example@luke-.com',
				},
				license: {
					name: 'MIT',
					url: 'https://opensource.org/licenses/MIT',
				},
			},
			servers: [
				{
					url: `http://${host}:${port}`,
					description: 'development server',
				},

			],
			tags: [
				{ name: 'TODOs', description: 'handles of TODOs' },
				{ name: 'System', description: 'System and monotoring' },
			],

			components: {
				securitySchemes: {
					bearerAuth: {
						type: 'http',
						scheme: 'bearer',
						bearerFormat: 'JWT',
					},
				},
			},
			security: [{ bearerAuth: [] }],
		},

		transform: ({ schema, url }) => {

			return { schema, url };
		},
	});


	await app.register(fastifySwaggerUi, {
		routePrefix: '/documentation',
		uiConfig: {
			docExpansion: 'list',
			deepLinking: false,
		},
	});
}
