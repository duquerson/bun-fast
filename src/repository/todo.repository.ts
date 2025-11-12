import type { Todo } from '../types/todo.d.ts';
import type { TodoModelInstance } from '../mocks/todo.model.mock.ts';
import { TodoModel } from '../model/todo.model.ts';

// Simple Repository para desacoplar acceso a datos
class TodoRepository {
	constructor(private model: TodoModelInstance | typeof TodoModel) { }

	// Validación simple de ID
	private validateId(id: string): void {
		if (!/^[0-9a-fA-F]{24}$/.test(id)) {
			throw new Error('Invalid ID format');
		}
	}

	// Obtener todos los todos
	async findAll(limit: number = 100): Promise<(Todo & { id: string })[]> {
		if ('getAllTodos' in this.model) {
			return await this.model.getAllTodos(limit);
		}
		return await this.model.findAll(limit);
	}

	// Buscar por ID
	async findById(id: string): Promise<Todo & { id: string }> {
		this.validateId(id);

		if ('getTodoById' in this.model) {
			return await this.model.getTodoById(id);
		}
		return await this.model.findById(id);
	}

	// Crear nuevo todo
	async create(data: Todo): Promise<Todo & { id: string }> {
		if ('createTodo' in this.model) {
			return await this.model.createTodo(data);
		}
		return await this.model.create(data);
	}

	// Actualizar todo
	async update(id: string, data: Partial<Todo>): Promise<Todo & { id: string }> {
		this.validateId(id);

		if ('updateTodo' in this.model) {
			return await this.model.updateTodo(id, data);
		}
		return await this.model.update(id, data);
	}

	// Actualizar solo completado
	async updateCompletion(id: string, completed: boolean): Promise<Todo & { id: string }> {
		this.validateId(id);

		if ('updateTodoCompletion' in this.model) {
			return await this.model.updateTodoCompletion(id, completed);
		}
		return await this.model.updateCompletion(id, completed);
	}

	// Eliminar todo
	async delete(id: string): Promise<boolean> {
		this.validateId(id);

		if ('deleteTodo' in this.model) {
			return await this.model.deleteTodo(id);
		}
		return await this.model.delete(id);
	}

	// Contar todos (para testing)
	async count(): Promise<number> {
		const todos = await this.findAll(1000);
		return todos.length;
	}
}

// Factory function para crear repository
export function createTodoRepository(model?: TodoModelInstance | typeof TodoModel): TodoRepository {
	const actualModel = model || TodoModel;
	return new TodoRepository(actualModel);
}

// Repository singleton para uso en producción
let productionRepository: TodoRepository | null = null;

export function getTodoRepository(): TodoRepository {
	if (!productionRepository) {
		productionRepository = createTodoRepository();
	}
	return productionRepository;
}

// Reset para testing
export function resetTodoRepository(): void {
	productionRepository = null;
}

// Repository interface para testing
export interface TodoRepositoryInterface {
	findAll(limit?: number): Promise<(Todo & { id: string })[]>;
	findById(id: string): Promise<Todo & { id: string }>;
	create(data: Todo): Promise<Todo & { id: string }>;
	update(id: string, data: Partial<Todo>): Promise<Todo & { id: string }>;
	updateCompletion(id: string, completed: boolean): Promise<Todo & { id: string }>;
	delete(id: string): Promise<boolean>;
}