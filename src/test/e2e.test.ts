import { describe, it, expect, beforeAll, afterAll, mock } from 'bun:test';
import Fastify, { type FastifyInstance } from 'fastify';
import { todoRoutes } from '../routes/todo.route.ts';
import { TodoModelMock } from '../mocks/todo.model.mock.ts';
import supertest from 'supertest';

// Mock TodoModel for E2E
mock.module('../model/todo.model.ts', () => ({
	TodoModel: TodoModelMock
}));

describe('E2E Tests', () => {
	let app: FastifyInstance;
	let request: any;

	beforeAll(async () => {
		app = Fastify({ logger: false });
		app.register(todoRoutes, { prefix: '/api/v1/todos' });
		app.get('/health', async () => ({ status: 'ok' }));
		await app.listen({ port: 0 }); // Random port
		request = supertest(app.server);
		TodoModelMock.reset();
	});

	afterAll(async () => {
		await app.close();
	});

	it('Health check returns ok', async () => {
		const response = await request.get('/health').expect(200);
		expect(response.body.status).toBe('ok');
	});

	it('Full CRUD flow', async () => {
		// Create
		const createRes = await request
			.post('/api/v1/todos')
			.send({ description: 'E2E todo', completed: false })
			.expect(201);
		const id = createRes.body.data.id;

		// Read
		const readRes = await request.get(`/api/v1/todos/${id}`).expect(200);
		expect(readRes.body.data.description).toBe('E2E todo');

		// Update
		await request
			.put(`/api/v1/todos/${id}`)
			.send({ description: 'Updated E2E', completed: true })
			.expect(200);

		// List
		const listRes = await request.get('/api/v1/todos').expect(200);
		expect(listRes.body.data.length).toBeGreaterThan(0);

		// Delete
		await request.delete(`/api/v1/todos/${id}`).expect(204);
	});
});
