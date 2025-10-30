import type { FastifyInstance } from 'fastify';
import { TodoController } from '../controller/todo.controller.ts';
import { NotFoundError } from '../helpers/app.errors.ts';
import { SchemaBODY, SchemaID, SchemaUpdateTodo, SchemaCompletion, SchemaGetAll, SchemaDelete } from '../schema/shema.routes.ts';
import type { RequestById, RequestWithBody, TodoRequest, UpdateCompletionRequest } from '../types/request.ts';

async function todoRoutes(app: FastifyInstance) {

	app.get('/', {
		schema: SchemaGetAll
	}, async (request, reply) => {
		const todos = await TodoController.getAllTodos();
		return reply.send({
			success: true,
			data: todos || []
		});
	});

	app.get<RequestById>('/:id', {
		schema: SchemaID
	}, async (request, reply) => {
		const { id } = request.params;
		const todo = await TodoController.getTodoById(id);

		if (!todo) {
			throw new NotFoundError(`Todo with ID ${id} not found`);
		}

		return reply.send({ success: true, data: todo });
	});

	app.post<RequestWithBody>('/', {
		schema: SchemaBODY
	}, async (request, reply) => {
		const data = request.body;
		data.description = data.description.trim();
		const todo = await TodoController.createTodo(data);

		return reply.status(201).send({
			success: true,
			message: 'Todo created successfully',
			data: todo
		});
	});

	app.put<TodoRequest>('/:id', {
		schema: SchemaUpdateTodo
	}, async (request, reply) => {
		const { id } = request.params;
		const data = request.body;
		data.description = data.description.trim();
		const todo = await TodoController.updateTodo(id, data);

		if (!todo) {
			throw new NotFoundError(`Todo with ID ${id} not found`);
		}

		return reply.send({
			success: true,
			message: 'Todo updated successfully',
			data: todo
		});
	});

	app.patch<UpdateCompletionRequest>('/:id', {
		schema: SchemaCompletion
	}, async (request, reply) => {
		const { id } = request.params;
		const { completed } = request.body;
		const todo = await TodoController.updateTodoCompletion(id, completed);

		if (!todo) {
			throw new NotFoundError(`Todo with ID ${id} not found`);
		}

		return reply.send({
			success: true,
			message: 'Completion status updated',
			data: todo
		});
	});

	app.delete<RequestById>('/:id', {
		schema: SchemaDelete
	}, async (request, reply) => {
		const { id } = request.params;
		await TodoController.deleteTodo(id);

		return reply.status(204).send();
	});

}

export { todoRoutes };
