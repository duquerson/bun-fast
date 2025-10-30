import type { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from "fastify";
import type { ErrorOptions } from "../types/error";


export function registerErrorHandler(app: FastifyInstance) {
	app.setErrorHandler((error: FastifyError & ErrorOptions, request: FastifyRequest, reply: FastifyReply) => {

		//identify process and stats
		const status = error.status ?? (error.validation ? 400 : 500);
		const isProd = process.env.NODE_ENV === "production";

		// Log
		if (status >= 500) request.log.error(error);
		else request.log.warn(error);

		// Validation with Fastify (JSON Schema)
		if (error.validation) {
			return reply.code(400).send({
				success: false,
				message: "Error de validación",
				errores: error.validation,
			});
		}

		// menssage Error generic
		const response = {
			success: false,
			error: {
				name: error.name ?? "Error",
				message:
					isProd && status === 500
						? "Error interno del servidor"
						: error.message ?? "Error desconocido",
				code: error.code,
				...(isProd ? {} : { details: error.details ?? error.stack }),
			},
		};

		return reply.code(status).send(response);
	});
}
