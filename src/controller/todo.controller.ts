
import { todoModel } from "../model/todo.model.ts";
import type { Todo, UpdateTodo } from "../types/todo.d.ts";

class todoController {

	static async getAllTodos() {
		return await todoModel.getAllTodos();
	}

	static async getTodoById(id: string) {
		return await todoModel.getTodoById(id);
	}

	static async createTodo(data: Todo) {
		return await todoModel.createTodo(data);
	}

	static async updateTodo(id: string, data: UpdateTodo) {
		return await todoModel.updateTodo(id, data);
	}

	static async deleteTodo(id: string) {
		return await todoModel.deleteTodo(id);
	}
}

Object.freeze(todoController);

export { todoController };