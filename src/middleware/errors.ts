export interface AppErrorDetails {
	field?: string;
	message?: string;
	hint?: string;
}

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly code?: string;
	public readonly details?: AppErrorDetails[];

	constructor(message: string, statusCode = 500, code?: string, details?: AppErrorDetails[]) {
		super(message);
		this.name = new.target.name;
		this.statusCode = statusCode;
		this.code = code;
		this.details = details;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class NotFoundError extends AppError {
	constructor(message = 'Recurso no encontrado') {
		super(message, 404, 'NOT_FOUND');
	}
}

export class ValidationError extends AppError {
	constructor(message = 'Error de validación', details?: AppErrorDetails[]) {
		super(message, 400, 'VALIDATION_ERROR', details);
	}
}

export class ClientError extends AppError {
	constructor(message = 'Petición inválida', details?: AppErrorDetails[]) {
		super(message, 422, 'CLIENT_ERROR', details);
	}
}

export class ServerError extends AppError {
	constructor(message = 'Error interno del servidor') {
		super(message, 500, 'SERVER_ERROR');
	}
}
