import { model } from "mongoose";
import type { Todo } from "../types/todo.d.ts";
import { NotFoundError } from "../helpers/app.errors.ts";
import { schema } from '../schema/schema.model.ts';
//--------------------------------------------------------------------------

const TodoMongoose = model('Todos', schema);

//--------------------------------------------------------------------------

class todoModel {

	static async getAllTodos(limit: number = 100) {
		const todos = await TodoMongoose.find({}).limit(limit);
		return todos.map(todo => todo.toJSON());
	}

	static async getTodoById(id: string) {
		const todo = await TodoMongoose.findById(id);
		if (!todo) {
			throw new NotFoundError('Tarea no encontrada');
		}
		return todo.toJSON();
	}

	static async createTodo(data: Todo) {
		const todo = await TodoMongoose.create(data);
		return todo.toJSON();
	}

	static async updateTodo(id: string, data: Partial<Todo>) {
		const todo = await TodoMongoose.findByIdAndUpdate(id, data, {
			new: true,
			runValidators: true
		});

		if (!todo) {
			throw new NotFoundError('Tarea no encontrada');
		}

		return todo.toJSON();
	}

	static async deleteTodo(id: string) {
		const todo = await TodoMongoose.findByIdAndDelete(id);
		if (!todo) {
			throw new NotFoundError('Tarea no encontrada');
		}
		return {
			success: true,
			message: 'Tarea eliminada exitosamente',
			id
		};
	}
}

Object.freeze(todoModel);

export { todoModel };
