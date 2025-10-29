import type { FastifyInstance } from 'fastify';
import { todoController } from '../controller/todo.controller.ts';
import { NotFoundError, ServerError, ValidationError, ClientError } from '../helpers/app.errors.ts';
import { SchemaBODY, SchemaID, SchemaUpdateTodo, SchemaCompletion } from '../schema/shema.routes.ts';
import type { RequestById, RequestWithBody, TodoRequest, UpdateCompletionRequest } from '../types/request.ts';

async function todoRoutes(app: FastifyInstance) {

	app.get('/', async (request, reply) => {
		const todos = await todoController.getAllTodos();
		if (!todos) {
			throw new ServerError('Cannot be get the Todos');
		}
		return reply.send({ success: true, data: todos });
	});

	app.get<RequestById>('/:id', {
		schema: SchemaID
	}, async (request, reply) => {
		const { id } = request.params;
		const todo = await todoController.getTodoById(id);

		if (!todo) {
			throw new NotFoundError(`Todo whit ID ${id} cannot be Found`);
		}

		return reply.send({ success: true, data: todo });
	});


	app.post<RequestWithBody>('/', {
		schema: SchemaBODY
	}, async (request, reply) => {
		const data = request.body;
		data.description = data.description.trim();
		const todo = await todoController.createTodo(data);
		if (!todo) {
			throw new ValidationError('No se pudo crear el todo');
		}
		return reply.status(201).send({
			success: true,
			message: 'Success Create Todo',
			data: todo
		});
	});


	app.put<TodoRequest>('/:id', {
		schema: SchemaUpdateTodo
	}, async (request, reply) => {
		const { id } = request.params;
		const data = request.body;
		data.description = data.description.trim();
		const todo = await todoController.updateTodo(id, data);

		if (!todo) {
			throw new ClientError(`Todo whit ID ${id} cannot be Update`);
		}

		return reply.send({
			success: true,
			message: 'Upgrade Todo Success',
			data: todo
		});
	});


	app.patch<UpdateCompletionRequest>('/:id', {
		schema: SchemaCompletion
	}, async (request, reply) => {
		const { id } = request.params;
		const data = request.body;
		const todo = await todoController.updateTodo(id, data);
		if (!todo) {
			throw new ClientError(`Todo whit ID ${id} cannot be Update`);
		}

		return reply.send({
			success: true,
			message: 'Update Completed Success',
			data: todo
		});
	});


	app.delete<RequestById>('/:id', {
		schema: SchemaID
	}, async (request, reply) => {
		const { id } = request.params;

		const deleted = await todoController.deleteTodo(id);

		if (!deleted) {
			throw new NotFoundError(`Todo con ID ${id} no encontrado`);
		}

		return reply.status(204).send();
	});
}

export { todoRoutes };
