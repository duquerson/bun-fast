import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';
import Fastify, { type FastifyInstance } from 'fastify';
import { todoRoutes } from '../routes/todo.route.ts';
import { createTodoModelMock, type TodoModelInstance } from '../mocks/todo.model.mock.ts';
import supertest from 'supertest';


// Test Container Pattern para encapsular recursos de testing
class TestContainer {
	private app: FastifyInstance;
	private request: any;
	private todoModel: TodoModelInstance;
	private originalEnv: Record<string, string>;

	constructor() {
		this.app = this.createTestApp();
		this.todoModel = createTodoModelMock();
		this.originalEnv = Object.fromEntries(
			Object.entries(process.env).filter(([, value]) => value !== undefined)
		) as Record<string, string>;
	}

	private createTestApp(): FastifyInstance {
		const app = Fastify({
			logger: false,
			connectionTimeout: 5000,
			requestTimeout: 10000,
			bodyLimit: 1048576 // 1MB
		});

		return app;
	}

	async start(): Promise<void> {
		// Configurar puerto específico y validarlo
		const testPort = await this.getAvailablePort(3000);

		// Resetear modelo mock
		this.todoModel.reset();

		// Registrar rutas con prefijo específico para tests
		this.app.register(todoRoutes, { prefix: '/api/v1/todos' });

		// Ruta de health check para tests
		this.app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

		// Hooks de cleanup automático
		this.app.addHook('onClose', async () => {
			await this.cleanup();
		});

		// Configurar manejo de errores para tests
		this.app.setErrorHandler((error, request, reply) => {
			// En tests, podemos logear el error para debugging
			console.error(`Test error on ${request.method} ${request.url}:`, error.message);
			reply.status(error.statusCode || 500).send({
				success: false,
				error: error.message
			});
		});

		// Iniciar servidor
		await this.app.listen({ port: testPort, host: '127.0.0.1' });
		this.request = supertest(this.app.server);

		console.log(`Test server started on port ${testPort}`);
	}

	private async getAvailablePort(startPort: number): Promise<number> {
		const net = await import('net');

		for (let port = startPort; port < startPort + 100; port++) {
			const server = net.createServer();
			await new Promise<void>((resolve) => {
				server.listen(port, '127.0.0.1', () => {
					server.close();
					resolve();
				});
				server.on('error', () => {
					resolve();
				});
			});
			return port;
		}

		throw new Error('No available port found');
	}

	async stop(): Promise<void> {
		try {
			if (this.app) {
				await this.app.close();
			}
			// Restaurar environment
			process.env = this.originalEnv;
		} catch (error) {
			console.error('Error stopping test container:', error);
		}
	}

	async cleanup(): Promise<void> {
		try {
			// Resetear el estado del modelo mock
			this.todoModel.reset();
			// Limpiar cualquier estado de la app
			await this.app?.ready();
		} catch (error) {
			console.error('Error during cleanup:', error);
		}
	}

	getRequest(): any {
		return this.request;
	}

	getApp(): FastifyInstance {
		return this.app;
	}

	getTodoModel(): TodoModelInstance {
		return this.todoModel;
	}
}

describe('E2E Tests', () => {
	let container: TestContainer;
	let request: any;

	beforeAll(async () => {
		container = new TestContainer();
		await container.start();
		request = container.getRequest();
	});

	afterAll(async () => {
		if (container) {
			await container.stop();
		}
	});

	beforeEach(async () => {
		// Garantizar estado limpio antes de cada test
		const model = container.getTodoModel();
		model.reset();
	});

	afterEach(async () => {
		// Cleanup después de cada test
		await container.cleanup();
	});

	describe('Health Check', () => {
		it('should return ok status', async () => {
			const response = await request.get('/health').expect(200);
			expect(response.body.status).toBe('ok');
			expect(response.body).toHaveProperty('timestamp');
		});
	});

	describe('Full CRUD Flow', () => {
		it('should complete full CRUD cycle', async () => {
			const model = container.getTodoModel();

			// Arrange: Obtener ID inicial para comparación
			const initialTodos = await model.getAllTodos();
			const initialCount = initialTodos.length;

			// Act: Create
			const createRes = await request
				.post('/api/v1/todos')
				.send({ description: 'E2E todo', completed: false })
				.expect(201);

			expect(createRes.body.success).toBe(true);
			expect(createRes.body.data).toHaveProperty('id');
			expect(createRes.body.data.description).toBe('E2E todo');
			expect(createRes.body.data.completed).toBe(false);

			const id = createRes.body.data.id;

			// Act: Read
			const readRes = await request.get(`/api/v1/todos/${id}`).expect(200);
			expect(readRes.body.success).toBe(true);
			expect(readRes.body.data.id).toBe(id);
			expect(readRes.body.data.description).toBe('E2E todo');

			// Act: Update
			const updateRes = await request
				.put(`/api/v1/todos/${id}`)
				.send({ description: 'Updated E2E', completed: true })
				.expect(200);

			expect(updateRes.body.success).toBe(true);
			expect(updateRes.body.data.description).toBe('Updated E2E');
			expect(updateRes.body.data.completed).toBe(true);

			// Act: List
			const listRes = await request.get('/api/v1/todos').expect(200);
			expect(listRes.body.success).toBe(true);
			expect(listRes.body.data.length).toBe(initialCount + 1);

			// Act: Delete
			const deleteRes = await request.delete(`/api/v1/todos/${id}`).expect(204);
			expect(deleteRes.body).toEqual({});

			// Assert: Verify deletion
			await request.get(`/api/v1/todos/${id}`).expect(404);
		});

		it('should handle concurrent operations correctly', async () => {
			// Crear múltiples todos concurrentemente
			const createPromises = Array.from({ length: 5 }, (_, i) =>
				request.post('/api/v1/todos')
					.send({ description: `Concurrent todo ${i}`, completed: false })
					.expect(201)
			);

			const results = await Promise.all(createPromises);
			expect(results).toHaveLength(5);

			// Verificar que todos se crearon
			const todos = results.map(r => r.body.data.id);
			expect(new Set(todos).size).toBe(5); // No duplicados

			// Limpiar todos creados
			await Promise.all(todos.map(id =>
				request.delete(`/api/v1/todos/${id}`).expect(204)
			));
		});
	});

	describe('Error Handling', () => {
		it('should return 400 for invalid data', async () => {
			const response = await request
				.post('/api/v1/todos')
				.send({ description: '', completed: false })
				.expect(400);

			expect(response.body.success).toBe(false);
			expect(response.body.error).toBeTruthy();
		});

		it('should return 404 for non-existent todo', async () => {
			const nonExistentId = '507f1f77bcf86cd799439011';
			await request.get(`/api/v1/todos/${nonExistentId}`).expect(404);
			await request.put(`/api/v1/todos/${nonExistentId}`).send({ description: 'Test' }).expect(404);
			await request.delete(`/api/v1/todos/${nonExistentId}`).expect(404);
		});
	});
});
