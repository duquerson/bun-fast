import mongoose, { model } from 'mongoose';
import type { Todo } from '../types/todo.d.ts';
import { NotFoundError, ValidationError } from '../helpers/app.errors.ts';
import { schema } from '../schema/schema.model.ts';
//--------------------------------------------------------------------------

const TodoMongoose = model('Todos', schema);

//--------------------------------------------------------------------------

class TodoModel {

	static validateMongoId(id: string) {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			throw new ValidationError('Invalid ID format');
		}
	}

	static async getAllTodos(limit: number = 100) {
		const todos = await TodoMongoose.find({}).limit(limit);
		return todos.map(todo => todo.toJSON());
	}

	static async getTodoById(id: string) {
		await this.validateMongoId(id);
		const todo = await TodoMongoose.findById(id);
		if (!todo) {
			throw new NotFoundError(`Todo with ID ${id} not found`);
		}
		return todo.toJSON();
	}

	static async createTodo(data: Todo) {
		const todo = await TodoMongoose.create(data);
		return todo.toJSON();
	}

	static async updateTodo(id: string, data: Partial<Todo>) {
		await this.validateMongoId(id);
		const todo = await TodoMongoose.findByIdAndUpdate(id, data, {
			new: true,
			runValidators: true
		});

		if (!todo) {
			throw new NotFoundError(`Todo with ID ${id} not found`);
		}

		return todo.toJSON();
	}


	static async updateTodoCompletion(id: string, completed: boolean) {
		await this.validateMongoId(id);
		const todo = await TodoMongoose.findByIdAndUpdate(
			id,
			{ completed },
			{
				new: true,
				runValidators: true
			}
		);

		if (!todo) {
			throw new NotFoundError(`Todo with ID ${id} not found`);
		}

		return todo.toJSON();
	}

	static async deleteTodo(id: string) {
		await this.validateMongoId(id);
		const todo = await TodoMongoose.findByIdAndDelete(id);
		if (!todo) {
			throw new NotFoundError(`Todo with ID ${id} not found`);
		}


		return true;
	}
}

Object.freeze(TodoModel);

export { TodoModel };
