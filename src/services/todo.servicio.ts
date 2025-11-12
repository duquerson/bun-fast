import { TodoModel } from '../model/todo.model.ts';
import { ValidadorTodo } from '../helpers/validadorTodo.ts';
import { TodoResponseDto } from '../dto/todo.dto.ts';
import { InputSanitizer } from '../helpers/inputSanitizer.ts';

// Service Layer - Lógica de negocio separada del Controller
export class TodoServicio {

	async obtenerTodos(limit: number) {
		// Validar parámetros
		const limiteValido = ValidadorTodo.validarLimit(limit);

		// Lógica de negocio aquí si es necesaria
		const todos = await TodoModel.getAllTodos(limiteValido);

		return TodoResponseDto.fromMany(todos);
	}

	async obtenerPorId(id: string) {
		// Validar ID
		const idValido = ValidadorTodo.validarId(id);

		// Obtener del modelo
		const todo = await TodoModel.getTodoById(idValido);

		return TodoResponseDto.from(todo);
	}

	async crearTodo(data: any) {
		// Sanitización adicional en el Service Layer
		const sanitizedData = InputSanitizer.sanitizeObject(data);

		// Validar datos de entrada
		const datosValidados = ValidadorTodo.validarCrear(sanitizedData);

		// Lógica de negocio adicional si es necesaria
		this.validarReglasNegocio(datosValidados);

		// Crear en el modelo
		const todo = await TodoModel.createTodo({
			description: datosValidados.description,
			completed: datosValidados.completed
		});

		return TodoResponseDto.from(todo);
	}

	async actualizarTodo(id: string, data: any) {
		// Validar ID y datos
		const idValido = ValidadorTodo.validarId(id);
		const datosValidados = ValidadorTodo.validarActualizar(data);

		// Lógica de negocio adicional
		this.validarReglasNegocio(datosValidados);

		// Actualizar en el modelo
		const todo = await TodoModel.updateTodo(idValido, datosValidados);

		return TodoResponseDto.from(todo);
	}

	async actualizarCompletado(id: string, completed: boolean) {
		// Validar ID y completed
		const idValido = ValidadorTodo.validarId(id);
		const completedValido = ValidadorTodo.validarCompletion(completed);

		// Actualizar en el modelo
		const todo = await TodoModel.updateTodoCompletion(idValido, completedValido);

		return TodoResponseDto.from(todo);
	}

	async eliminarTodo(id: string) {
		// Validar ID
		const idValido = ValidadorTodo.validarId(id);

		// Eliminar del modelo
		await TodoModel.deleteTodo(idValido);

		return { success: true, message: 'Todo eliminado correctamente' };
	}

	// Reglas de negocio específicas
	private validarReglasNegocio(data: any) {
		// Ejemplo: No permitir contenido ofensivo
		const palabrasProhibidas = ['spam', 'test123', 'malicioso'];
		const contenido = data.description?.toLowerCase() || '';

		for (const palabra of palabrasProhibidas) {
			if (contenido.includes(palabra)) {
				throw new Error('Contenido no permitido');
			}
		}
	}
}