import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'bun:test';
import Fastify, { type FastifyInstance } from 'fastify';
import { todoRoutes } from '../routes/todo.route.ts';
import { createTodoModelMock, type TodoModelInstance } from '../mocks/todo.model.mock.ts';
import supertest from 'supertest';

// Test Suite con Fresh Instance Pattern para eliminar estado compartido
describe('Todo Routes', () => {
	// Variables de test scope
	let app: FastifyInstance;
	let request: any;
	let todoModel: TodoModelInstance;

	// Factory para crear instancias aisladas de Fastify
	function createTestApp(): FastifyInstance {
		const app = Fastify({
			logger: false,
			connectionTimeout: 5000,
			requestTimeout: 10000,
			bodyLimit: 1048576
		});

		// Error handler específico para tests
		app.setErrorHandler((error, request, reply) => {
			reply.status(error.statusCode || 500).send({
				success: false,
				error: error.message
			});
		});

		return app;
	}

	// Setup que se ejecuta antes de todos los tests
	beforeAll(async () => {
		// No se necesita setup global, cada test tendrá su propia instancia
	});

	// Cleanup global
	afterAll(async () => {
		// No se necesita cleanup global - cada test maneja su propio estado
	});

	// Setup para cada test - Fresh Instance Pattern
	beforeEach(async () => {
		// Crear nueva instancia de la aplicación para cada test
		app = createTestApp();

		// Crear nueva instancia del modelo mock
		todoModel = createTodoModelMock();
		todoModel.reset(); // Estado limpio

		// Registrar rutas
		app.register(todoRoutes, { prefix: '/api/v1/todos' });

		// Esperar a que la app esté lista
		await app.ready();

		// Crear client de request
		request = supertest(app.server) as any;
	});

	// Cleanup después de cada test
	afterEach(async () => {
		try {
			if (app) {
				await app.close();
			}
			// El modelo mock se limpia automáticamente con cada test
		} catch (error) {
			console.error('Error during test cleanup:', error);
		}
	});

	describe('GET /api/v1/todos', () => {
		it('should return todos without query', async () => {
			// Arrange: Verificar que tenemos datos iniciales
			const initialTodos = await todoModel.getAllTodos();
			expect(initialTodos.length).toBeGreaterThan(0);

			// Act
			const response = await request.get('/api/v1/todos').expect(200);

			// Assert
			expect(response.body.success).toBe(true);
			expect(response.body.data).toBeArray();
			expect(response.body.data.length).toBe(initialTodos.length);
		});

		it('should return todos with limit', async () => {
			// Arrange
			const limit = 2;

			// Act
			const response = await request.get(`/api/v1/todos?limit=${limit}`).expect(200);

			// Assert
			expect(response.body.success).toBe(true);
			expect(response.body.data).toBeArray();
			expect(response.body.data.length).toBeLessThanOrEqual(limit);
		});

		it('should handle edge case with limit 0', async () => {
			// Act
			const response = await request.get('/api/v1/todos?limit=0').expect(200);

			// Assert
			expect(response.body.success).toBe(true);
			expect(response.body.data).toBeArray();
			expect(response.body.data.length).toBe(0);
		});
	});

	describe('GET /api/v1/todos/:id', () => {
		it('should return todo for valid ID', async () => {
			// Arrange
			const todos = await todoModel.getAllTodos();
			const todo = todos[0]!;
			expect(todo).toBeDefined();

			// Act
			const response = await request.get(`/api/v1/todos/${todo.id}`).expect(200);

			// Assert
			expect(response.body.success).toBe(true);
			expect(response.body.data.id).toBe(todo.id);
			expect(response.body.data.description).toBe(todo.description);
		});

		it('should return 400 for invalid ID format', async () => {
			// Act & Assert
			await request.get('/api/v1/todos/invalid').expect(400);
		});

		it('should return 404 for non-existing ID', async () => {
			// Arrange
			const nonExistentId = '507f1f77bcf86cd799439011';

			// Act & Assert
			await request.get(`/api/v1/todos/${nonExistentId}`).expect(404);
		});
	});

	describe('POST /api/v1/todos', () => {
		it('should create todo with valid data', async () => {
			// Arrange
			const data = { description: 'New todo', completed: false };

			// Act
			const response = await request
				.post('/api/v1/todos')
				.send(data)
				.expect(201);

			// Assert
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty('id');
			expect(response.body.data.description).toBe(data.description);
			expect(response.body.data.completed).toBe(data.completed);
		});

		it('should return 400 for empty description', async () => {
			// Arrange
			const data = { description: '', completed: false };

			// Act & Assert
			const response = await request.post('/api/v1/todos').send(data).expect(400);
			expect(response.body.success).toBe(false);
		});

		it('should return 400 for missing description', async () => {
			// Arrange
			const data = { completed: false };

			// Act & Assert
			const response = await request.post('/api/v1/todos').send(data).expect(400);
			expect(response.body.success).toBe(false);
		});

		it('should return 400 for missing completed field', async () => {
			// Arrange
			const data = { description: 'Test todo' };

			// Act & Assert
			const response = await request.post('/api/v1/todos').send(data).expect(400);
			expect(response.body.success).toBe(false);
		});
	});

	describe('PUT /api/v1/todos/:id', () => {
		it('should update todo completely', async () => {
			// Arrange
			const todos = await todoModel.getAllTodos();
			const todo = todos[0]!;
			const data = { description: 'Updated', completed: true };

			// Act
			const response = await request
				.put(`/api/v1/todos/${todo.id}`)
				.send(data)
				.expect(200);

			// Assert
			expect(response.body.success).toBe(true);
			expect(response.body.data.description).toBe('Updated');
			expect(response.body.data.completed).toBe(true);
		});

		it('should update todo partially', async () => {
			// Arrange
			const todos = await todoModel.getAllTodos();
			const todo = todos[0]!;
			const data = { description: 'Partial update' };

			// Act
			const response = await request
				.put(`/api/v1/todos/${todo.id}`)
				.send(data)
				.expect(200);

			// Assert
			expect(response.body.success).toBe(true);
			expect(response.body.data.description).toBe('Partial update');
			expect(response.body.data.completed).toBe(todo.completed); // Mantenido
		});

		it('should return 400 for invalid ID', async () => {
			// Act & Assert
			await request.put('/api/v1/todos/invalid').send({ description: 'Test' }).expect(400);
		});

		it('should return 404 for non-existing ID', async () => {
			// Arrange
			const nonExistentId = '507f1f77bcf86cd799439011';

			// Act & Assert
			await request
				.put(`/api/v1/todos/${nonExistentId}`)
				.send({ description: 'Test' })
				.expect(404);
		});
	});

	describe('PATCH /api/v1/todos/:id', () => {
		it('should update completion status to true', async () => {
			// Arrange
			const todos = await todoModel.getAllTodos();
			const todo = todos.find(t => !t.completed) || todos[0]!;

			// Act
			const response = await request
				.patch(`/api/v1/todos/${todo.id}`)
				.send({ completed: true })
				.expect(200);

			// Assert
			expect(response.body.success).toBe(true);
			expect(response.body.data.completed).toBe(true);
		});

		it('should update completion status to false', async () => {
			// Arrange
			const todos = await todoModel.getAllTodos();
			const todo = todos.find(t => t.completed) || todos[0]!;

			// Act
			const response = await request
				.patch(`/api/v1/todos/${todo.id}`)
				.send({ completed: false })
				.expect(200);

			// Assert
			expect(response.body.success).toBe(true);
			expect(response.body.data.completed).toBe(false);
		});

		it('should return 400 for invalid ID', async () => {
			// Act & Assert
			await request.patch('/api/v1/todos/invalid').send({ completed: false }).expect(400);
		});
	});

	describe('DELETE /api/v1/todos/:id', () => {
		it('should delete existing todo', async () => {
			// Arrange
			const todos = await todoModel.getAllTodos();
			const todo = todos[0]!;
			const initialCount = todos.length;

			// Act
			await request.delete(`/api/v1/todos/${todo.id}`).expect(204);

			// Assert: Verificar que el todo fue eliminado
			const remainingTodos = await todoModel.getAllTodos();
			expect(remainingTodos.length).toBe(initialCount - 1);

			// Assert: Verificar que el todo no existe
			await request.get(`/api/v1/todos/${todo.id}`).expect(404);
		});

		it('should return 404 for non-existing ID', async () => {
			// Arrange
			const nonExistentId = '507f1f77bcf86cd799439011';

			// Act & Assert
			await request.delete(`/api/v1/todos/${nonExistentId}`).expect(404);
		});
	});
});