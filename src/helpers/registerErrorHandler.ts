import type { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import type { ErrorOptions } from '../types/error';


export function registerErrorHandler(app: FastifyInstance) {
	app.setErrorHandler((error: FastifyError & ErrorOptions, request: FastifyRequest, reply: FastifyReply) => {

		// identify process and stats
		const status = error.status ?? error.statusCode ?? (error.validation ? 400 : 500);
		const isProd = process.env.NODE_ENV === 'production';

		// Log
		if (status >= 500) request.log.error(error);
		else request.log.warn(error);

		// Validation with Fastify (JSON Schema)
		if (error.validation) {
			return reply.code(400).send({
				success: false,
				message: 'Error de validación',
				error: {
					name: 'ValidationError',
					message: 'Error de validación',
					code: 'VALIDATION_ERROR',
					details: error.validation
				}
			});
		}

		// Business Errors (NotFoundError, ValidationError, etc.)
		if (error.name && ['NotFoundError', 'ValidationError', 'ClientError'].includes(error.name)) {
			return reply.code(status).send({
				success: false,
				message: error.message,
				error: {
					name: error.name,
					message: error.message,
					code: error.code,
					...(isProd ? {} : { details: error.details ?? error.stack }),
				},
			});
		}

		// Generic error response
		const response = {
			success: false,
			error: {
				name: error.name ?? 'Error',
				message:
					isProd && status === 500
						? 'Error interno del servidor'
						: error.message ?? 'Error desconocido',
				code: error.code,
				...(isProd ? {} : { details: error.details ?? error.stack }),
			},
		};

		return reply.code(status).send(response);
	});
}
