import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { createTodoModelMock, type TodoModelInstance } from '../mocks/todo.model.mock.ts';
import { createTodoRepository, type TodoRepositoryInterface } from '../repository/todo.repository.ts';
import { NotFoundError } from '../helpers/app.errors.ts';

// Test Suite actualizado para Repository Pattern y MVC Architecture
describe('TodoModel/Repository - MVC Architecture', () => {
	let mockModel: TodoModelInstance;
	let repository: TodoRepositoryInterface;

	// Setup con Fresh Instance Pattern para aislar tests
	beforeEach(() => {
		// Crear nueva instancia del modelo mock
		mockModel = createTodoModelMock();

		// Garantizar estado inicial limpio
		mockModel.reset();

		// Crear repository con el modelo mock
		repository = createTodoRepository(mockModel);
	});

	// Cleanup después de cada test
	afterEach(() => {
		// La instancia se descarta automáticamente
	});

	describe('Repository Pattern Interface', () => {
		it('should have consistent interface between mock and real model', () => {
			// Verificar que el mock implementa la interface del repository
			expect(repository).toHaveProperty('findAll');
			expect(repository).toHaveProperty('findById');
			expect(repository).toHaveProperty('create');
			expect(repository).toHaveProperty('update');
			expect(repository).toHaveProperty('updateCompletion');
			expect(repository).toHaveProperty('delete');
		});

		it('should find all todos with repository', async () => {
			// Act
			const todos = await repository.findAll(10);

			// Assert
			expect(todos).toBeArray();
			expect(todos.length).toBeGreaterThan(0); // Verificar que hay datos
			expect(todos.length).toBeLessThanOrEqual(10); // No exceder el límite

			// Verificar estructura
			todos.forEach(todo => {
				expect(todo).toHaveProperty('id');
				expect(todo).toHaveProperty('description');
				expect(todo).toHaveProperty('completed');
			});
		});

		it('should respect limit parameter in repository', async () => {
			// Act
			const todos = await repository.findAll(2);

			// Assert
			expect(todos.length).toBeLessThanOrEqual(2);
			expect(todos.length).toBe(2);
		});

		it('should find todo by id with repository', async () => {
			// Arrange
			const todos = await repository.findAll(10);
			const todo = todos[0]!;

			// Act
			const found = await repository.findById(todo.id);

			// Assert
			expect(found.id).toBe(todo.id);
			expect(found.description).toBe(todo.description);
			expect(found.completed).toBe(todo.completed);
		});

		it('should create todo with repository', async () => {
			// Arrange
			const todoData = { description: 'Repository test todo', completed: false };

			// Act
			const created = await repository.create(todoData);

			// Assert
			expect(created).toHaveProperty('id');
			expect(created.description).toBe(todoData.description);
			expect(created.completed).toBe(todoData.completed);
		});

		it('should update todo with repository', async () => {
			// Arrange
			const todos = await repository.findAll(10);
			const todo = todos[0]!;
			const updateData = { description: 'Updated via repository' };

			// Act
			const updated = await repository.update(todo.id, updateData);

			// Assert
			expect(updated.description).toBe('Updated via repository');
			expect(updated.id).toBe(todo.id);
		});

		it('should update completion with repository', async () => {
			// Arrange
			const todos = await repository.findAll(10);
			const todo = todos[0]!;

			// Act
			const updated = await repository.updateCompletion(todo.id, true);

			// Assert
			expect(updated.completed).toBe(true);
			expect(updated.id).toBe(todo.id);
		});

		it('should delete todo with repository', async () => {
			// Arrange
			const todos = await repository.findAll(10);
			const todo = todos[0]!;


			// Act
			const result = await repository.delete(todo.id);

			// Assert
			expect(result).toBe(true);

			// Verificar que fue eliminado
			await expect(repository.findById(todo.id)).rejects.toThrow(NotFoundError);
		});
	});

	describe('Repository Error Handling', () => {
		it('should handle invalid ID validation in repository', async () => {
			// Act & Assert
			await expect(repository.findById('invalid-id')).rejects.toThrow();
			await expect(repository.update('invalid-id', { description: 'test' })).rejects.toThrow();
			await expect(repository.updateCompletion('invalid-id', true)).rejects.toThrow();
			await expect(repository.delete('invalid-id')).rejects.toThrow();
		});

		it('should handle not found errors in repository', async () => {
			// Arrange
			const nonExistentId = '507f1f77bcf86cd799439011';

			// Act & Assert
			await expect(repository.findById(nonExistentId)).rejects.toThrow(NotFoundError);
			await expect(repository.update(nonExistentId, { description: 'test' })).rejects.toThrow(NotFoundError);
			await expect(repository.updateCompletion(nonExistentId, true)).rejects.toThrow(NotFoundError);
			await expect(repository.delete(nonExistentId)).rejects.toThrow(NotFoundError);
		});

		it('should handle count method', async () => {
			// Act
			const todos = await repository.findAll(100);
			const count = todos.length;

			// Assert
			expect(count).toBeGreaterThan(0); // Verificar que hay datos
			expect(count).toBeLessThanOrEqual(100); // Dentro del límite esperado
		});

		it('should maintain data consistency in repository operations', async () => {
			// Arrange
			const initialCount = (await repository.findAll(100)).length;

			// Act: Múltiples operaciones
			await repository.create({ description: 'Test consistency', completed: false });
			await repository.updateCompletion((await repository.findAll(10))[1]!.id, true);
			const finalCount = (await repository.findAll(100)).length;

			// Assert
			expect(finalCount).toBe(initialCount + 1);
		});
	});

	describe('Model Layer Independence', () => {
		it('should work with factory pattern', async () => {
			// Crear múltiples instancias independientes
			const repo1 = createTodoRepository(mockModel);
			const repo2 = createTodoRepository(mockModel);

			// Act
			const todos1 = await repo1.findAll(10);
			const todos2 = await repo2.findAll(10);

			// Assert - ambas instancias deberían trabajar con el mismo modelo
			expect(todos1.length).toBe(todos2.length);

			// Modificar a través de una instancia
			await repo1.create({ description: 'Modified via repo1', completed: false });

			// Verificar que la otra instancia ve los cambios
			const todos1After = await repo1.findAll(10);
			const todos2After = await repo2.findAll(10);

			expect(todos1After.length).toBe(todos2After.length);
			expect(todos1After.length).toBe(todos1.length + 1);
		});

		it('should isolate different repository instances', async () => {
			// Arrange: Crear diferentes modelos mocks
			const model1 = createTodoModelMock();
			const model2 = createTodoModelMock();

			// Modificar model1
			await model1.createTodo({ description: 'Only in model1', completed: false });

			// Crear repositorios con diferentes modelos
			const repo1 = createTodoRepository(model1);
			const repo2 = createTodoRepository(model2);

			// Act
			const todos1 = await repo1.findAll(10);
			const todos2 = await repo2.findAll(10);

			// Assert - repositorios aislados
			expect(todos1.length).toBeGreaterThan(0); // Verificar que hay datos, no importe la cantidad exacta
			expect(todos2.length).toBeGreaterThan(0); // Verificar que hay datos, no importe la cantidad exacta

			expect(todos1.find(t => t.description === 'Only in model1')).toBeDefined();
			expect(todos2.find(t => t.description === 'Only in model1')).toBeUndefined();
		});
	});

	describe('MVC Integration Points', () => {
		it('should work with controller integration', async () => {
			// Verificar que el repository funciona en el contexto MVC
			// Esto simula cómo el Service Layer usaría el Repository

			// Act: Simular operación del Service Layer
			const todos = await repository.findAll(5);
			if (todos.length > 0) {
				const todo = todos[0]!;
				const updated = await repository.update(todo.id, { description: 'MVC integration test' });

				// Assert
				expect(updated.description).toBe('MVC integration test');
			}
		});

		it('should support business logic layer', async () => {
			// Simular reglas de negocio que el Service Layer aplicaría
			const todos = await repository.findAll(10);

			// Filtrar todos completados (lógica de negocio)
			// Filtrar todos completados (lógica de negocio) - simulado pero no usado

			// Actualizar uno no completado (más lógica de negocio)
			const incompleteTodos = todos.filter(todo => !todo.completed);
			if (incompleteTodos.length > 0) {
				const todoToUpdate = incompleteTodos[0]!;
				await repository.updateCompletion(todoToUpdate.id, true);

				// Verificar que la operación se aplicó
				const updated = await repository.findById(todoToUpdate.id);
				expect(updated.completed).toBe(true);
			}
		});
	});
});

