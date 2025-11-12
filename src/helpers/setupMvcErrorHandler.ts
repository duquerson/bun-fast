import type { FastifyInstance } from 'fastify';
import { ValidationError, NotFoundError } from '../helpers/app.errors.ts';
import { ResponseHelper } from '../dto/todo.dto.ts';

// Manejador de errores mejorado para patrón MVC
export function setupMvcErrorHandler(app: FastifyInstance) {
	app.setErrorHandler((error, request, reply) => {
		// Logging del error para debugging
		console.error(`[MVC Error] ${request.method} ${request.url}:`, {
			error: error.message,
			stack: error.stack,
			body: request.body,
			params: request.params,
			query: request.query
		});

		// Clasificación de errores según patrón MVC
		if (error instanceof ValidationError) {
			return ResponseHelper.sendValidationError(reply, {
				message: error.message,
				field: 'validation',
				code: error.code
			});
		}

		if (error instanceof NotFoundError) {
			return ResponseHelper.sendNotFound(reply, error.message);
		}

		// Errores de MongoDB/BD
		if (error.name === 'MongoError' || error.name === 'MongooseError') {
			return ResponseHelper.sendError(
				reply,
				'Error de base de datos',
				'DATABASE_ERROR',
				500
			);
		}

		// Errores de red/conexión
		if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
			return ResponseHelper.sendError(
				reply,
				'Error de conexión',
				'CONNECTION_ERROR',
				503
			);
		}

		// Errores de timeout
		if (error.code === 'ETIMEDOUT') {
			return ResponseHelper.sendError(
				reply,
				'Tiempo de espera agotado',
				'TIMEOUT_ERROR',
				408
			);
		}

		// Errores de validación de esquema
		if (error.name === 'ZodError') {
			const zodError = error as any;
			const validationErrors = zodError.errors?.map((err: any) => ({
				field: err.path?.join('.'),
				message: err.message,
				code: err.code
			})) || [];

			return ResponseHelper.sendValidationError(reply, {
				message: 'Datos de entrada inválidos',
				errors: validationErrors,
				code: 'SCHEMA_VALIDATION_ERROR'
			});
		}

		// Error interno del servidor para casos no manejados
		const isDevelopment = process.env.NODE_ENV === 'development';

		return ResponseHelper.sendError(
			reply,
			'Error interno del servidor',
			'INTERNAL_SERVER_ERROR',
			500,
			isDevelopment ? {
				error: error.message,
				stack: error.stack,
				originalError: error.name
			} : undefined
		);
	});

	// Manejador para rutas no encontradas (404)
	app.setNotFoundHandler((request, reply) => {
		return ResponseHelper.sendError(
			reply,
			`Ruta ${request.method} ${request.url} no encontrada`,
			'ROUTE_NOT_FOUND',
			404
		);
	});
}