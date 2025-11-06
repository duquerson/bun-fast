import { describe, it, expect, beforeEach } from 'bun:test';
import { TodoModelMock } from '../mocks/todo.model.mock.ts';
import { NotFoundError, ValidationError } from '../helpers/app.errors.ts';

describe('TodoModel (Mock)', () => {
	beforeEach(() => {
		TodoModelMock.reset();
	});

	describe('validateMongoId', () => {
		it('should not throw for valid ID', () => {
			const validId = '507f1f77bcf86cd799439011';
			expect(() => TodoModelMock.validateMongoId(validId)).not.toThrow();
		});

		it('should throw ValidationError for invalid ID', () => {
			expect(() => TodoModelMock.validateMongoId('invalid')).toThrow(ValidationError);
			expect(() => TodoModelMock.validateMongoId('123')).toThrow(ValidationError);
		});
	});

	describe('getAllTodos', () => {
		it('should return list with elements', async () => {
			const todos = await TodoModelMock.getAllTodos();
			expect(todos).toBeArray();
			expect(todos.length).toBeGreaterThan(0);
		});

		it('should respect limit', async () => {
			const todos = await TodoModelMock.getAllTodos(2);
			expect(todos.length).toBeLessThanOrEqual(2);
		});
	});

	describe('getTodoById', () => {
		it('should return todo for existing ID', async () => {
			const todos = await TodoModelMock.getAllTodos();
			expect(todos.length).toBeGreaterThan(0);
			const id = todos[0]!.id;
			const todo = await TodoModelMock.getTodoById(id);
			expect(todo.id).toBe(id);
		});

		it('should throw NotFoundError for non-existing ID', async () => {
			const validId = '507f1f77bcf86cd799439011';
			expect(TodoModelMock.getTodoById(validId)).rejects.toThrow(NotFoundError);
		});

		it('should throw ValidationError for invalid ID', async () => {
			expect(TodoModelMock.getTodoById('invalid')).rejects.toThrow(ValidationError);
		});
	});

	describe('createTodo', () => {
		it('should create and return todo with generated ID', async () => {
			const data = { description: 'Test todo', completed: false };
			const todo = await TodoModelMock.createTodo(data);
			expect(todo).toHaveProperty('id');
			expect(todo.description).toBe(data.description);
			expect(todo.completed).toBe(data.completed);
		});
	});

	describe('updateTodo', () => {
		it('should update description', async () => {
			const todos = await TodoModelMock.getAllTodos();
			expect(todos.length).toBeGreaterThan(0);
			const id = todos[0]!.id;
			const updated = await TodoModelMock.updateTodo(id, { description: 'Updated' });
			expect(updated.description).toBe('Updated');
		});

		it('should update completed', async () => {
			const todos = await TodoModelMock.getAllTodos();
			expect(todos.length).toBeGreaterThan(0);
			const id = todos[0]!.id;
			const updated = await TodoModelMock.updateTodo(id, { completed: true });
			expect(updated.completed).toBe(true);
		});

		it('should update both fields', async () => {
			const todos = await TodoModelMock.getAllTodos();
			expect(todos.length).toBeGreaterThan(0);
			const id = todos[0]!.id;
			const updated = await TodoModelMock.updateTodo(id, { description: 'Both', completed: true });
			expect(updated.description).toBe('Both');
			expect(updated.completed).toBe(true);
		});

		it('should throw NotFoundError for non-existing ID', async () => {
			const validId = '507f1f77bcf86cd799439011';
			expect(TodoModelMock.updateTodo(validId, { description: 'Test' })).rejects.toThrow(NotFoundError);
		});
	});

	describe('updateTodoCompletion', () => {
		it('should update completion status', async () => {
			const todos = await TodoModelMock.getAllTodos();
			expect(todos.length).toBeGreaterThan(0);
			const id = todos[0]!.id;
			const updated = await TodoModelMock.updateTodoCompletion(id, true);
			expect(updated.completed).toBe(true);
		});

		it('should throw NotFoundError for non-existing ID', async () => {
			const validId = '507f1f77bcf86cd799439011';
			expect(TodoModelMock.updateTodoCompletion(validId, false)).rejects.toThrow(NotFoundError);
		});
	});

	describe('deleteTodo', () => {
		it('should delete existing todo', async () => {
		  const todos = await TodoModelMock.getAllTodos();
		  expect(todos.length).toBeGreaterThan(0);
		  const id = todos[0]!.id;
		  const result = await TodoModelMock.deleteTodo(id);
		  expect(result).toBe(true);
		  expect(TodoModelMock.getTodoById(id)).rejects.toThrow(NotFoundError);
		});

		it('should throw NotFoundError for non-existing ID', async () => {
			const validId = '507f1f77bcf86cd799439011';
			expect(TodoModelMock.deleteTodo(validId)).rejects.toThrow(NotFoundError);
		});
	});
});
