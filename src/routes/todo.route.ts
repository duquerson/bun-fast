import type { FastifyInstance } from 'fastify';
import { todoController } from '../controller/todo.controller.ts';
import { NotFoundError, ServerError, ValidationError, ClientError } from '../middleware/errors.ts';


async function todoRoutes(app: FastifyInstance) {

	app.get('/', async (request, reply) => {
		const todos = await todoController.getAllTodos();
		if (!todos) {
			throw new ServerError('No se pudieron obtener los todos');
		}
		return reply.send({ success: true, data: todos });
	});

	app.get<{ Params: { id: string } }>('/:id', {
		schema: {
			params: {
				type: 'object',
				properties: {
					id: { type: 'string', minLength: 1 }
				},
				required: ['id'],
				additionalProperties: false
			}
		}
	}, async (request, reply) => {
		const { id } = request.params;
		const todo = await todoController.getTodoById(id);

		if (!todo) {
			throw new NotFoundError(`Todo con ID ${id} no encontrado`);
		}

		return reply.send({ success: true, data: todo });
	});


	app.post<{ Body: { description: string; completed: boolean } }>('/', {
		schema: {
			body: {
				type: 'object',
				properties: {
					description: {
						type: 'string',
						minLength: 1,
						maxLength: 500
					},
					completed: { type: 'boolean' }
				},
				required: ['description', 'completed'],
				additionalProperties: false,
			}
		}
	}, async (request, reply) => {
		const data = request.body;
		data.description = data.description.trim();
		const todo = await todoController.createTodo(data);
		if (!todo) {
			throw new ValidationError('No se pudo crear el todo');
		}
		return reply.status(201).send({
			success: true,
			message: 'Todo creado exitosamente',
			data: todo
		});
	});


	app.put<{ Params: { id: string }, Body: Required<{ description: string; completed: boolean }> }>('/:id', {
		schema: {
			params: {
				type: 'object',
				properties: {
					id: { type: 'string', minLength: 1 }
				},
				required: ['id'],
				additionalProperties: false
			},
			body: {
				type: 'object',
				properties: {
					description: {
						type: 'string',
						minLength: 1,
						maxLength: 500
					},
					completed: { type: 'boolean' }
				},
				required: ['description', 'completed'],
				additionalProperties: false,
			}
		}
	}, async (request, reply) => {
		const { id } = request.params;
		const data = request.body;
		data.description = data.description.trim();
		const todo = await todoController.updateTodo(id, data);

		if (!todo) {
			throw new ClientError(`Todo con ID ${id} no puede ser actualizado`);
		}

		return reply.send({
			success: true,
			message: 'Todo actualizado',
			data: todo
		});
	});


	app.patch<{ Params: { id: string }, Body: { description?: string; completed?: boolean } }>('/:id', {
		schema: {
			params: {
				type: 'object',
				properties: {
					id: { type: 'string', minLength: 1 }
				},
				required: ['id'],
				additionalProperties: false
			},
			body: {
				type: 'object',
				properties: {
					description: {
						type: 'string',
						minLength: 1,
						maxLength: 500
					},
					completed: { type: 'boolean' }
				},
				additionalProperties: false,
				minProperties: 1
			}
		}
	}, async (request, reply) => {
		const { id } = request.params;
		const data = request.body;
		if (data.description !== undefined) {
			data.description = data.description.trim();
		}
		const todo = await todoController.updateTodo(id, data);

		if (!todo) {
			throw new ClientError(`Todo con ID ${id} no puede ser actualizado`);
		}

		return reply.send({
			success: true,
			message: 'Todo actualizado parcialmente',
			data: todo
		});
	});


	app.delete<{ Params: { id: string } }>('/:id', {
		schema: {
			params: {
				type: 'object',
				properties: {
					id: { type: 'string', minLength: 1 }
				},
				required: ['id'],
				additionalProperties: false
			}
		}
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
