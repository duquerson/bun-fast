// DTOs para mejorar la consistencia de la API
import { z } from 'zod';

// Schemas de validación base
export const CreateTodoSchema = z.object({
	description: z.string().min(1, 'Description cannot be empty').max(1000, 'Description too long'),
	completed: z.boolean().default(false)
});

export const UpdateTodoSchema = z.object({
	description: z.string().min(1, 'Description cannot be empty').max(1000, 'Description too long').optional(),
	completed: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
	message: 'At least one field must be provided'
});

export const CompletionUpdateSchema = z.object({
	completed: z.boolean()
});

// DTO de entrada para crear todo
export class CreateTodoDto {
	constructor(
		public description: string,
		public completed: boolean = false
	) { }

	static from(input: unknown): CreateTodoDto {
		const validated = CreateTodoSchema.parse(input);
		return new CreateTodoDto(validated.description, validated.completed);
	}
}

// DTO de entrada para actualizar todo
export class UpdateTodoDto {
	constructor(
		public description?: string,
		public completed?: boolean
	) { }

	static from(input: unknown): UpdateTodoDto {
		const validated = UpdateTodoSchema.parse(input);
		return new UpdateTodoDto(
			validated.description,
			validated.completed
		);
	}
}

// DTO de entrada para actualizar completado
export class CompletionUpdateDto {
	constructor(
		public completed: boolean
	) { }

	static from(input: unknown): CompletionUpdateDto {
		const validated = CompletionUpdateSchema.parse(input);
		return new CompletionUpdateDto(validated.completed);
	}
}

// DTO de respuesta para todo
export class TodoResponseDto {
	constructor(
		public id: string,
		public description: string,
		public completed: boolean,
		public createdAt?: Date,
		public updatedAt?: Date
	) { }

	static from(todo: any): TodoResponseDto {
		return new TodoResponseDto(
			todo.id,
			todo.description,
			todo.completed,
			todo.createdAt,
			todo.updatedAt
		);
	}

	static fromMany(todos: any[]): TodoResponseDto[] {
		return todos.map(todo => TodoResponseDto.from(todo));
	}
}

// DTO para respuesta de lista
export class TodoListResponseDto {
	constructor(
		public todos: TodoResponseDto[],
		public total: number,
		public limit: number,
		public offset: number = 0
	) { }

	static from(todos: any[], limit: number, offset: number = 0): TodoListResponseDto {
		return new TodoListResponseDto(
			TodoResponseDto.fromMany(todos),
			todos.length,
			limit,
			offset
		);
	}
}

// DTO para respuesta de API exitosa
export class ApiResponseDto<T> {
	constructor(
		public success: boolean,
		public data: T,
		public message?: string,
		public timestamp: string = new Date().toISOString()
	) { }

	static success<T>(data: T, message?: string): ApiResponseDto<T> {
		return new ApiResponseDto(true, data, message);
	}

	static error(errorMessage: string): ApiResponseDto<null> {
	  return new ApiResponseDto(false, null, errorMessage);
	}
}

// DTO para respuesta de error
export class ApiErrorDto {
	constructor(
		public success: boolean,
		public error: {
			code: string;
			message: string;
			details?: any;
		},
		public timestamp: string = new Date().toISOString()
	) { }

	static create(code: string, message: string, details?: any): ApiErrorDto {
		return new ApiErrorDto(
			false,
			{
				code,
				message,
				details
			}
		);
	}
}

// Helper para manejar respuestas HTTP
export class ResponseHelper {
	static sendSuccess(reply: any, data: any, message?: string, statusCode: number = 200): void {
		return reply.status(statusCode).send({
			success: true,
			data,
			message,
			timestamp: new Date().toISOString()
		});
	}

	static sendError(reply: any, message: string, code: string = 'ERROR', statusCode: number = 400, details?: any): void {
		return reply.status(statusCode).send({
			success: false,
			error: {
				code,
				message,
				details
			},
			timestamp: new Date().toISOString()
		});
	}

	static sendNotFound(reply: any, message: string = 'Resource not found'): void {
		return this.sendError(reply, message, 'NOT_FOUND', 404);
	}

	static sendBadRequest(reply: any, message: string, details?: any): void {
		return this.sendError(reply, message, 'BAD_REQUEST', 400, details);
	}

	static sendValidationError(reply: any, details: any): void {
		return this.sendError(reply, 'Validation failed', 'VALIDATION_ERROR', 400, details);
	}

	static sendServerError(reply: any, message: string = 'Internal server error'): void {
		return this.sendError(reply, message, 'INTERNAL_ERROR', 500);
	}
}

// Para usar en rutas HTTP
export const DtoValidators = {
	createTodo: (data: any) => CreateTodoDto.from(data),
	updateTodo: (data: any) => UpdateTodoDto.from(data),
	updateCompletion: (data: any) => CompletionUpdateDto.from(data),
	parseBody: (schema: any, data: any) => schema.parse(data)
};

// Para usar en controladores
export const DtoMappers = {
	toTodoResponse: (todo: any) => TodoResponseDto.from(todo),
	toTodoListResponse: (todos: any[], limit: number, offset: number = 0) =>
		TodoListResponseDto.from(todos, limit, offset),
	toApiResponse: (data: any, message?: string) =>
		ApiResponseDto.success(data, message),
	toErrorResponse: (message: string, code: string = 'ERROR', details?: any) =>
		ApiErrorDto.create(code, message, details)
};