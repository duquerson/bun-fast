import { ValidationError } from './app.errors.ts';
import { DtoValidators } from '../dto/todo.dto.ts';

// Validador separado del controlador - MVC Pattern
export class ValidadorTodo {

	static validarCrear(data: any) {
		return DtoValidators.createTodo(data);
	}

	static validarActualizar(data: any) {
		return DtoValidators.updateTodo(data);
	}

	static validarId(id: string): string {
		if (!id || typeof id !== 'string') {
			throw new ValidationError('ID inválido');
		}

		if (!/^[0-9a-fA-F]{24}$/.test(id)) {
			throw new ValidationError('Formato de ID inválido');
		}

		return id;
	}

	static validarLimit(limit: number): number {
		const numLimit = Number(limit);
		if (isNaN(numLimit) || numLimit < 0) {
			throw new ValidationError('El límite debe ser un número positivo');
		}

		return Math.min(numLimit, 1000); // Máximo 1000
	}

	static validarCompletion(completed: any): boolean {
		if (typeof completed !== 'boolean') {
			throw new ValidationError('El campo completed debe ser boolean');
		}
		return completed;
	}
}