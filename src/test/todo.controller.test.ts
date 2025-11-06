import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { TodoController } from '../controller/todo.controller.ts';
import { TodoModelMock } from '../mocks/todo.model.mock.ts';
import { ValidationError } from '../helpers/app.errors.ts';

// Mock TodoModel
mock.module('../model/todo.model.ts', () => ({
	TodoModel: TodoModelMock
}));

describe('TodoController', () => {
	beforeEach(() => {
		TodoModelMock.reset();
	});

	describe('getAllTodos', () => {
		it('should return todos from model', async () => {
			const todos = await TodoController.getAllTodos(10);
			expect(todos).toBeArray();
			expect(todos.length).toBeGreaterThanOrEqual(3);
		});

		it('should pass limit to model', async () => {
			const todos = await TodoController.getAllTodos(2);
			expect(todos.length).toBeLessThanOrEqual(2);
		});
	});

	describe('getTodoById', () => {
		it('should return todo from model', async () => {
			const todos = await TodoModelMock.getAllTodos();
			const id = todos[0]!.id;
			const todo = await TodoController.getTodoById(id);
			expect(todo.id).toBe(id);
		});

		it('should throw if model throws', async () => {
			expect(TodoController.getTodoById('invalid')).rejects.toThrow(ValidationError);
		});
	});

	describe('createTodo', () => {
		it('should validate and create todo', async () => {
			const data = { description: 'New todo', completed: false };
			const todo = await TodoController.createTodo(data);
			expect(todo).toHaveProperty('id');
			expect(todo.description).toBe('New todo');
		});

		it('should throw on invalid data', async () => {
			const invalidData = { description: '', completed: false };
			expect(TodoController.createTodo(invalidData)).rejects.toThrow();
		});
	});

	describe('updateTodo', () => {
		it('should validate and update todo', async () => {
			const todos = await TodoModelMock.getAllTodos();
			const id = todos[0]!.id;
			const data = { description: 'Updated' };
			const updated = await TodoController.updateTodo(id, data);
			expect(updated.description).toBe('Updated');
		});

		it('should throw on invalid ID', async () => {
			expect(TodoController.updateTodo('invalid', { description: 'Test' })).rejects.toThrow(ValidationError);
		});

		it('should throw on invalid data', async () => {
			const todos = await TodoModelMock.getAllTodos();
			const id = todos[0]!.id;
			expect(TodoController.updateTodo(id, {})).rejects.toThrow(); // At least one field required
		});
	});

	describe('updateTodoCompletion', () => {
		it('should update completion', async () => {
			const todos = await TodoModelMock.getAllTodos();
			const id = todos[0]!.id;
			const updated = await TodoController.updateTodoCompletion(id, true);
			expect(updated.completed).toBe(true);
		});

		it('should throw on invalid ID', async () => {
			expect(TodoController.updateTodoCompletion('invalid', false)).rejects.toThrow(ValidationError);
		});
	});

	describe('deleteTodo', () => {
		it('should delete todo', async () => {
			const todos = await TodoModelMock.getAllTodos();
			const id = todos[0]!.id;
			const result = await TodoController.deleteTodo(id);
			expect(result).toBe(true); // Model returns true
		});

		it('should throw on invalid ID', async () => {
			expect(TodoController.deleteTodo('invalid')).rejects.toThrow(ValidationError);
		});
	});
});