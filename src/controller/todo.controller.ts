import { TodoModel } from '../model/todo.model.ts';
import type { Todo, UpdateTodo } from '../types/todo.d.ts';
import { TodoCreateSchema, TodoUpdateSchema, CompletionUpdateSchema } from '../schema/schema.todo.ts';

class TodoController {
	static async getAllTodos(limit: number) {
		const todos = await TodoModel.getAllTodos(limit);
		return todos ?? [];
	}

	static async getTodoById(id: string) {
		return await TodoModel.getTodoById(id);
	}

	static async createTodo(data: Todo) {
		const validData = TodoCreateSchema.parse(data);
		return await TodoModel.createTodo(validData);
	}

	static async updateTodo(id: string, data: UpdateTodo) {
		const validData = TodoUpdateSchema.parse(data);
		return await TodoModel.updateTodo(id, validData);
	}

	static async updateTodoCompletion(id: string, completed: boolean) {
		const validData = CompletionUpdateSchema.parse({ completed });
		return await TodoModel.updateTodoCompletion(id, validData.completed);
	}

	static async deleteTodo(id: string) {
		return await TodoModel.deleteTodo(id);
	}
}

Object.freeze(TodoController);

export { TodoController };