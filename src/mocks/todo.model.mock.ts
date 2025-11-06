import type { Todo } from '../types/todo.d.ts';
import { NotFoundError, ValidationError } from '../helpers/app.errors.ts';

// Function to generate a valid MongoDB ObjectId-like string (24 hex chars)
function generateObjectId(): string {
	return Math.random().toString(16).substring(2, 26).padEnd(24, '0').substring(0, 24);
}

// Mock in-memory storage with initial sample data
const mockTodos: (Todo & { id: string })[] = [
	{ id: generateObjectId(), description: 'Comprar leche', completed: false },
	{ id: generateObjectId(), description: 'Estudiar TypeScript', completed: true },
	{ id: generateObjectId(), description: 'Hacer ejercicio', completed: false }
];

class TodoModelMock {
	static validateMongoId(id: string) {
		if (!/^[0-9a-fA-F]{24}$/.test(id)) {
			throw new ValidationError('Invalid ID format');
		}
	}

	static async getAllTodos(limit: number = 100) {
		return mockTodos.slice(0, limit);
	}

	static async getTodoById(id: string) {
		await this.validateMongoId(id);
		const todo = mockTodos.find(t => t.id === id);
		if (!todo) {
			throw new NotFoundError(`Todo with ID ${id} not found`, { status: 404 });
		}
		return todo;
	}

	static async createTodo(data: Todo) {
		const newTodo = { ...data, id: generateObjectId() };
		mockTodos.push(newTodo);
		return newTodo;
	}

	static async updateTodo(id: string, data: Partial<Todo>) {
		await this.validateMongoId(id);
		const index = mockTodos.findIndex(t => t.id === id);
		if (index === -1) {
			throw new NotFoundError(`Todo with ID ${id} not found`, { status: 404 });
		}
		const updatedTodo = { ...mockTodos[index], ...data };
		mockTodos[index] = updatedTodo as Todo & { id: string };
		return mockTodos[index];
	}

	static async updateTodoCompletion(id: string, completed: boolean) {
		await this.validateMongoId(id);
		const index = mockTodos.findIndex(t => t.id === id);
		if (index === -1) {
			throw new NotFoundError(`Todo with ID ${id} not found`, { status: 404 });
		}
		mockTodos[index]!.completed = completed;
		return mockTodos[index]!;
	}

	static async deleteTodo(id: string) {
		await this.validateMongoId(id);
		const index = mockTodos.findIndex(t => t.id === id);
		if (index === -1) {
			throw new NotFoundError(`Todo with ID ${id} not found`, { status: 404 });
		}
		mockTodos.splice(index, 1);
		return true;
	}

	// Utility method to reset mock data for testing
	static reset() {
		mockTodos.splice(0, mockTodos.length, ...[
			{ id: generateObjectId(), description: 'Comprar leche', completed: false },
			{ id: generateObjectId(), description: 'Estudiar TypeScript', completed: true },
			{ id: generateObjectId(), description: 'Hacer ejercicio', completed: false }
		]);
	}
}

Object.freeze(TodoModelMock);

export { TodoModelMock };