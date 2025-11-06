import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import Fastify, { type FastifyInstance } from 'fastify';
import { todoRoutes } from '../routes/todo.route.ts';
import { TodoModelMock } from '../mocks/todo.model.mock.ts';
import supertest from 'supertest';

// Mock TodoModel
mock.module('../model/todo.model.ts', () => ({
	TodoModel: TodoModelMock
}));

describe('Todo Routes', () => {
	let app: FastifyInstance;
	let request: any;

	beforeEach(async () => {
		app = Fastify({ logger: false });
		app.register(todoRoutes, { prefix: '/api/v1/todos' });
		await app.ready();
		request = supertest(app.server) as any;
		TodoModelMock.reset();
	});

	afterEach(async () => {
		await app.close();
	});

	describe('GET /api/v1/todos', () => {
		it('should return todos without query', async () => {
			const response = await request.get('/api/v1/todos').expect(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toBeArray();
		});

		it('should return todos with limit', async () => {
			const response = await request.get('/api/v1/todos?limit=2').expect(200);
			expect(response.body.data.length).toBeLessThanOrEqual(2);
		});
	});

	describe('GET /api/v1/todos/:id', () => {
		it('should return todo for valid ID', async () => {
			const todos = await TodoModelMock.getAllTodos();
			const id = todos[0]!.id;
			const response = await request.get(`/api/v1/todos/${id}`).expect(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.id).toBe(id);
		});

		it('should return 400 for invalid ID', async () => {
			await request.get('/api/v1/todos/invalid').expect(400);
		});

		it('should return 404 for non-existing ID', async () => {
			const validId = '507f1f77bcf86cd799439011';
			await request.get(`/api/v1/todos/${validId}`).expect(404);
		});
	});

	describe('POST /api/v1/todos', () => {
		it('should create todo with valid data', async () => {
			const data = { description: 'New todo', completed: false };
			const response = await request.post('/api/v1/todos').send(data).expect(201);
			expect(response.body.success).toBe(true);
			expect(response.body.data.description).toBe('New todo');
		});

		it('should return 400 for invalid data', async () => {
			const data = { description: '', completed: false };
			await request.post('/api/v1/todos').send(data).expect(400);
		});
	});

	describe('PUT /api/v1/todos/:id', () => {
		it('should update todo completely', async () => {
			const todos = await TodoModelMock.getAllTodos();
			const id = todos[0]!.id;
			const data = { description: 'Updated', completed: true };
			const response = await request.put(`/api/v1/todos/${id}`).send(data).expect(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.description).toBe('Updated');
		});

		it('should update todo partially', async () => {
			const todos = await TodoModelMock.getAllTodos();
			const id = todos[0]!.id;
			const data = { description: 'Partial' };
			const response = await request.put(`/api/v1/todos/${id}`).send(data).expect(200);
			expect(response.body.data.description).toBe('Partial');
		});

		it('should return 400 for invalid ID', async () => {
			await request.put('/api/v1/todos/invalid').send({ description: 'Test' }).expect(400);
		});
	});

	describe('PATCH /api/v1/todos/:id', () => {
		it('should update completion', async () => {
			const todos = await TodoModelMock.getAllTodos();
			const id = todos[0]!.id;
			const response = await request.patch(`/api/v1/todos/${id}`).send({ completed: true }).expect(200);
			expect(response.body.data.completed).toBe(true);
		});

		it('should return 400 for invalid ID', async () => {
			await request.patch('/api/v1/todos/invalid').send({ completed: false }).expect(400);
		});
	});

	describe('DELETE /api/v1/todos/:id', () => {
		it('should delete todo', async () => {
			const todos = await TodoModelMock.getAllTodos();
			const id = todos[0]!.id;
			await request.delete(`/api/v1/todos/${id}`).expect(204);
		});

		it('should return 404 for non-existing ID', async () => {
			const validId = '507f1f77bcf86cd799439011';
			await request.delete(`/api/v1/todos/${validId}`).expect(404);
		});
	});
});