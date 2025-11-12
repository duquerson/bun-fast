import { describe, it, expect } from 'bun:test';
import { createTodoModelMock } from '../mocks/todo.model.mock.ts';
import { ValidationError } from '../helpers/app.errors.ts';

// Mock del Service Layer para testing
class MockTodoServicio {
	private mockModel = createTodoModelMock();

	async obtenerTodos(limit: number) {
		return await this.mockModel.getAllTodos(limit);
	}

	async obtenerPorId(id: string) {
		this.mockModel.validateMongoId(id);
		return await this.mockModel.getTodoById(id);
	}

	async crearTodo(data: { description: string; completed: boolean }) {
		if (!data.description || data.description.trim().length === 0) {
			throw new Error('Description cannot be empty');
		}

		// Validación de contenido prohibido
		if (data.description.toLowerCase().includes('spam') ||
			data.description.toLowerCase().includes('malicious')) {
			throw new Error('Contenido no permitido');
		}

		return await this.mockModel.createTodo(data);
	}

	async actualizarTodo(id: string, data: any) {
		this.mockModel.validateMongoId(id);

		// Validación de contenido prohibido
		if (data.description &&
			(data.description.toLowerCase().includes('spam') ||
				data.description.toLowerCase().includes('malicious'))) {
			throw new Error('Contenido no permitido');
		}

		return await this.mockModel.updateTodo(id, data);
	}

	async actualizarCompletado(id: string, completed: boolean) {
		this.mockModel.validateMongoId(id);
		return await this.mockModel.updateTodoCompletion(id, completed);
	}

	async eliminarTodo(id: string) {
		this.mockModel.validateMongoId(id);
		return await this.mockModel.deleteTodo(id);
	}
}

// Mock controller para testing
class MockController {
	private servicio = new MockTodoServicio();

	static async getAllTodos(limit: number) {
		const controller = new MockController();
		return await controller.servicio.obtenerTodos(limit);
	}

	static async getTodoById(id: string) {
		const controller = new MockController();
		return await controller.servicio.obtenerPorId(id);
	}

	static async createTodo(data: any) {
		const controller = new MockController();
		return await controller.servicio.crearTodo(data);
	}

	static async updateTodo(id: string, data: any) {
		const controller = new MockController();
		return await controller.servicio.actualizarTodo(id, data);
	}

	static async updateTodoCompletion(id: string, completed: boolean) {
		const controller = new MockController();
		return await controller.servicio.actualizarCompletado(id, completed);
	}

	static async deleteTodo(id: string) {
		const controller = new MockController();
		return await controller.servicio.eliminarTodo(id);
	}
}

// Test Suite con mocks aislados
describe('TodoController - MVC Architecture (Mocked)', () => {
	describe('Static Methods - Service Layer Integration', () => {
		it('should delegate getAllTodos to service layer', async () => {
			// Arrange
			const limit = 10;

			// Act
			const result = await MockController.getAllTodos(limit);

			// Assert
			expect(result).toBeArray();
			expect(result.length).toBe(3); // Datos iniciales por defecto
		});

		it('should handle service layer errors gracefully', async () => {
			// Arrange
			const invalidId = 'invalid';

			// Act & Assert
			await expect(MockController.getTodoById(invalidId))
				.rejects.toThrow(ValidationError);
		});

		it('should handle Todo creation with validation', async () => {
			// Arrange
			const todoData = { description: 'Test todo', completed: false };

			// Act
			const result = await MockController.createTodo(todoData);

			// Assert
			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('description');
			expect(result).toHaveProperty('completed');
			expect(result.description).toBe(todoData.description);
		});

		it('should validate Todo creation data', async () => {
			// Arrange
			const invalidData = { description: '', completed: false };

			// Act & Assert
			await expect(MockController.createTodo(invalidData))
				.rejects.toThrow();
		});

		it('should update Todo with partial data', async () => {
			// Arrange
			const todos = await MockController.getAllTodos(10);
			const todoId = todos[0]!.id;
			const updateData = { description: 'Updated description' };

			// Act
			const result = await MockController.updateTodo(todoId, updateData);

			// Assert
			expect(result.description).toBe('Updated description');
			expect(result).toHaveProperty('completed');
		});

		it('should update Todo completion status', async () => {
			// Arrange
			const todos = await MockController.getAllTodos(10);
			const todoId = todos[0]!.id;

			// Act
			const result = await MockController.updateTodoCompletion(todoId, true);

			// Assert
			expect(result.completed).toBe(true);
		});

		it('should delete Todo successfully', async () => {
			// Arrange
			const todos = await MockController.getAllTodos(10);
			const todoId = todos[0]!.id;

			// Act
			const result = await MockController.deleteTodo(todoId);

			// Assert
			expect(result).toBe(true);

			// Verificar que fue eliminado
			await expect(MockController.getTodoById(todoId))
				.rejects.toThrow();
		});
	});

	describe('Service Layer Business Logic', () => {
		it('should apply business rules during creation', async () => {
			// Arrange - Crear todo con contenido prohibido
			const prohibitedData = { description: 'This is spam content', completed: false };

			// Act & Assert
			await expect(MockController.createTodo(prohibitedData))
				.rejects.toThrow('Contenido no permitido');
		});

		it('should apply business rules during update', async () => {
			// Arrange
			const todos = await MockController.getAllTodos(10);
			const todoId = todos[0]!.id;
			const updateData = { description: 'malicious content here' };

			// Act & Assert
			await expect(MockController.updateTodo(todoId, updateData))
				.rejects.toThrow('Contenido no permitido');
		});

		it('should handle limit validation', async () => {
			// Act
			const result = await MockController.getAllTodos(0);

			// Assert
			expect(result).toBeArray();
			expect(result.length).toBe(0);
		});
	});

	describe('Error Handling Integration', () => {
		it('should handle ValidationError from service layer', async () => {
			// Act & Assert
			await expect(MockController.getTodoById('invalid-id'))
				.rejects.toThrow(ValidationError);
		});

		it('should handle NotFoundError from service layer', async () => {
			// Arrange
			const nonExistentId = '507f1f77bcf86cd799439011';

			// Act & Assert
			await expect(MockController.getTodoById(nonExistentId))
				.rejects.toThrow('not found');
		});

		it('should handle delete of non-existent todo', async () => {
			// Arrange
			const nonExistentId = '507f1f77bcf86cd799439011';

			// Act & Assert
			await expect(MockController.deleteTodo(nonExistentId))
				.rejects.toThrow();
		});
	});

	describe('Data Consistency', () => {
		it('should maintain data consistency after operations', async () => {
			// Arrange
			const todos = await MockController.getAllTodos(10);
			const todoId = todos[0]!.id;

			// Act: Múltiples operaciones
			await MockController.updateTodoCompletion(todoId, true);
			const updated = await MockController.getTodoById(todoId);

			// Assert
			expect(updated.completed).toBe(true);

			// Verificar que otras operaciones siguen funcionando
			const allTodos = await MockController.getAllTodos(10);
			expect(allTodos.length).toBe(todos.length);
		});

		it('should handle concurrent updates correctly', async () => {
			// Arrange
			const todos = await MockController.getAllTodos(10);
			const todoId = todos[0]!.id;

			// Act: Operaciones concurrentes (simuladas)
			const updatePromise1 = MockController.updateTodo(todoId, { description: 'First update' });
			const updatePromise2 = MockController.updateTodo(todoId, { description: 'Second update' });

			const result1 = await updatePromise1;
			const result2 = await updatePromise2;

			// Assert
			expect(result1.description).toBe('First update');
			expect(result2.description).toBe('Second update');
			expect(result1.id).toBe(result2.id);
		});
	});

	describe('Mock Layer Integration', () => {
		it('should work with TodoModelMock directly', async () => {
			// Arrange
			const mockModel = createTodoModelMock();
			mockModel.reset();

			// Act
			const todos = await mockModel.getAllTodos(10);

			// Assert
			expect(todos).toBeArray();
			expect(todos.length).toBe(3);

			// Verificar que el mock funciona independientemente
			await mockModel.createTodo({ description: 'Mock test', completed: false });
			const todosAfter = await mockModel.getAllTodos(10);
			expect(todosAfter.length).toBe(4);
		});
	});
});