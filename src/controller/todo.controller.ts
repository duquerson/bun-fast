import { TodoServicio } from '../services/todo.servicio.ts';
import { ResponseHelper } from '../dto/todo.dto.ts';
import type { Todo } from '../types/todo.d.ts';

// Interface para el modelo de dependencias (para testing)
export interface TodoModelInterface {
  validateMongoId(id: string): void;
  getAllTodos(limit?: number): Promise<(Todo & { id: string })[]>;
  getTodoById(id: string): Promise<Todo & { id: string }>;
  createTodo(data: Todo): Promise<Todo & { id: string }>;
  updateTodo(id: string, data: Partial<Todo>): Promise<Todo & { id: string }>;
  updateTodoCompletion(id: string, completed: boolean): Promise<Todo & { id: string }>;
  deleteTodo(id: string): Promise<boolean>;
}

// Controller refactorizado - Thin Controller Pattern para MVC
class TodoController {
	private servicio = new TodoServicio();

	// Métodos estáticos para compatibilidad con tests existentes (solo delegación)
	static async getAllTodos(limit: number) {
		const controller = new TodoController();
		return await controller.servicio.obtenerTodos(limit);
	}

	static async getTodoById(id: string) {
		const controller = new TodoController();
		return await controller.servicio.obtenerPorId(id);
	}

	static async createTodo(data: Todo) {
		const controller = new TodoController();
		return await controller.servicio.crearTodo(data);
	}

	static async updateTodo(id: string, data: Partial<Todo>) {
		const controller = new TodoController();
		return await controller.servicio.actualizarTodo(id, data);
	}

	static async updateTodoCompletion(id: string, completed: boolean) {
		const controller = new TodoController();
		return await controller.servicio.actualizarCompletado(id, completed);
	}

	static async deleteTodo(id: string) {
		const controller = new TodoController();
		return await controller.servicio.eliminarTodo(id);
	}

	// Métodos de instancia para API con responses - Thin Controller Pattern
	async getAllTodosAPI(request: any, reply: any) {
		const limit = Number(request.query?.limit) || 100;
		const resultado = await this.servicio.obtenerTodos(limit);
		return ResponseHelper.sendSuccess(reply, resultado, 'Todos obtenidos correctamente');
	}

	async getTodoByIdAPI(request: any, reply: any) {
		const id = request.params?.id;
		const resultado = await this.servicio.obtenerPorId(id);
		return ResponseHelper.sendSuccess(reply, resultado, 'Todo encontrado');
	}

	async createTodoAPI(request: any, reply: any) {
		const resultado = await this.servicio.crearTodo(request.body);
		return ResponseHelper.sendSuccess(reply, resultado, 'Todo creado correctamente', 201);
	}

	async updateTodoAPI(request: any, reply: any) {
		const id = request.params?.id;
		const data = request.body;
		const resultado = await this.servicio.actualizarTodo(id, data);
		return ResponseHelper.sendSuccess(reply, resultado, 'Todo actualizado correctamente');
	}

	async updateTodoCompletionAPI(request: any, reply: any) {
		const id = request.params?.id;
		const completed = request.body?.completed;
		const resultado = await this.servicio.actualizarCompletado(id, completed);
		return ResponseHelper.sendSuccess(reply, resultado, 'Estado de completado actualizado');
	}

	async deleteTodoAPI(request: any, reply: any) {
		const id = request.params?.id;
		const resultado = await this.servicio.eliminarTodo(id);
		return ResponseHelper.sendSuccess(reply, resultado, 'Todo eliminado correctamente', 204);
	}
}

Object.freeze(TodoController);

export { TodoController };