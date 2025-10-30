
import { TodoModel } from '../model/todo.model.ts';
import type { Todo, UpdateTodo } from '../types/todo.d.ts';
import { ValidationError, NotFoundError, ClientError } from '../helpers/app.errors.ts';

class TodoController {

	static async getAllTodos() {
		const todos = await TodoModel.getAllTodos();
		return todos || [];
	}

	static async getTodoById(id: string) {

		const todo = await TodoModel.getTodoById(id);


		return todo;
	}

	static async createTodo(data: Todo) {
		if (!data.description?.trim()) {
			throw new ValidationError('Todo description is required');
		}

		const todo = await TodoModel.createTodo({
			...data,
			description: data.description.trim()
		});

		if (!todo) {
			throw new ClientError('Failed to create todo');
		}

		return todo;
	}

	static async updateTodo(id: string, data: UpdateTodo) {

		const updatedTodo = await TodoModel.updateTodo(id, {
			...data,
			description: data.description?.trim()
		});

		if (!updatedTodo) {
			throw new NotFoundError(`Todo with ID ${id} not found`);
		}

		return updatedTodo;
	}
	static async updateTodoCompletion(id: string, completed: boolean) {

		const updatedTodo = await TodoModel.updateTodoCompletion(id, completed);

		if (!updatedTodo) {
			throw new NotFoundError(`Todo with ID ${id} not found`);
		}

		return updatedTodo;
	}

	static async deleteTodo(id: string) {


		const deleted = await TodoModel.deleteTodo(id);

		return deleted;
	}

}

Object.freeze(TodoController);

export { TodoController };
