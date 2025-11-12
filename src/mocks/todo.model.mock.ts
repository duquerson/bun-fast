import type { Todo } from '../types/todo.d.ts';
import { NotFoundError, ValidationError } from '../helpers/app.errors.ts';

// Interface para definir la API del mock
export interface TodoModelInstance {
	validateMongoId(id: string): void;
	getAllTodos(limit?: number): Promise<(Todo & { id: string })[]>;
	getTodoById(id: string): Promise<Todo & { id: string }>;
	createTodo(data: Todo): Promise<Todo & { id: string }>;
	updateTodo(id: string, data: Partial<Todo>): Promise<Todo & { id: string }>;
	updateTodoCompletion(id: string, completed: boolean): Promise<Todo & { id: string }>;
	deleteTodo(id: string): Promise<boolean>;
	reset(): void;

	// Nuevos métodos para setup controlado
	setupKnownData(count: number, customData?: (Todo & { id: string })[]): Promise<void>;
	getKnownTodos(): (Todo & { id: string })[];
	getKnownTodoIds(): string[];
	ensureDataCount(count: number): Promise<void>;
}

// Función para generar un ObjectId determinístico basado en semilla
function generateObjectId(seed?: number): string {
	const timestamp = (seed || Date.now()).toString(16);
	const random = Math.random().toString(16).substring(2, 10);
	return (timestamp + random).padEnd(24, '0').substring(0, 24);
}

// Datos predefinidos para testing determinístico
const KNOWN_TEST_DATA = [
	{ id: generateObjectId(1), description: 'Comprar leche', completed: false },
	{ id: generateObjectId(2), description: 'Estudiar TypeScript', completed: true },
	{ id: generateObjectId(3), description: 'Hacer ejercicio', completed: false },
	{ id: generateObjectId(4), description: 'Leer un libro', completed: false },
	{ id: generateObjectId(5), description: 'Cocinar cena', completed: true },
	{ id: generateObjectId(6), description: 'Llamar a familia', completed: false },
	{ id: generateObjectId(7), description: 'Revisar emails', completed: true },
	{ id: generateObjectId(8), description: 'Planificar semana', completed: false }
];

// Factory function que crea instancias aisladas
export function createTodoModelMock(seedData?: (Todo & { id: string })[]): TodoModelInstance {
	// Estado privado encapsulado
	let mockTodos: (Todo & { id: string })[] = [...(seedData || KNOWN_TEST_DATA)];

	class TodoModelMockInstance {
		// Validación de ID determinística
		validateMongoId(id: string): void {
			if (!/^[0-9a-fA-F]{24}$/.test(id)) {
				throw new ValidationError('Invalid ID format');
			}
		}

		// Setup controlado: LIMPIAR ESTADO + cargar datos conocidos
		async setupKnownData(count: number, customData?: (Todo & { id: string })[]): Promise<void> {
			// NUEVO: Primero limpiar cualquier estado existente
			mockTodos = [];

			if (customData) {
				// Usar datos personalizados si se proporcionan
				mockTodos = [...customData.slice(0, count)];
			} else {
				// Usar datos predefinidos
				mockTodos = [...KNOWN_TEST_DATA.slice(0, count)];
			}
		}

		// Asegurar que hay al menos una cantidad específica de datos
		async ensureDataCount(count: number): Promise<void> {
			if (mockTodos.length < count) {
				const toAdd = count - mockTodos.length;
				for (let i = 0; i < toAdd; i++) {
					const index = mockTodos.length + 1;
					mockTodos.push({
						id: generateObjectId(index),
						description: `Test todo ${index}`,
						completed: false
					});
				}
			}
		}

		// Obtener todos los datos conocidos
		getKnownTodos(): (Todo & { id: string })[] {
			return [...mockTodos];
		}

		// Obtener IDs de todos los datos conocidos
		getKnownTodoIds(): string[] {
			return mockTodos.map(todo => todo.id);
		}

		// Recuperar todos los todos con límite opcional
		async getAllTodos(limit: number = 100): Promise<(Todo & { id: string })[]> {
			return mockTodos.slice(0, Math.min(limit, mockTodos.length));
		}

		// Buscar todo por ID
		async getTodoById(id: string): Promise<Todo & { id: string }> {
			this.validateMongoId(id);
			const todo = mockTodos.find(t => t.id === id);
			if (!todo) {
				throw new NotFoundError(`Todo with ID ${id} not found`, { status: 404 });
			}
			return { ...todo }; // Retornar copia para evitar mutación externa
		}

		// Crear nuevo todo
		async createTodo(data: Todo): Promise<Todo & { id: string }> {
			const newTodo: Todo & { id: string } = {
				...data,
				id: generateObjectId()
			};
			mockTodos.push({ ...newTodo });
			return newTodo;
		}

		// Actualizar todo existente
		async updateTodo(id: string, data: Partial<Todo>): Promise<Todo & { id: string }> {
			this.validateMongoId(id);
			const index = mockTodos.findIndex(t => t.id === id);
			if (index === -1) {
				throw new NotFoundError(`Todo with ID ${id} not found`, { status: 404 });
			}
			const currentTodo = mockTodos[index]!; // Type assertion - el elemento existe
			// Asegurar que las propiedades requeridas estén presentes
			const updatedTodo: Todo & { id: string } = {
				description: currentTodo.description, // Preservar description obligatoria
				completed: currentTodo.completed, // Preservar completed obligatoria
				id: currentTodo.id,
				...data // Aplicar actualizaciones
			};
			mockTodos[index] = updatedTodo;
			return { ...updatedTodo };
		}

		// Actualizar solo el estado de completado
		async updateTodoCompletion(id: string, completed: boolean): Promise<Todo & { id: string }> {
			this.validateMongoId(id);
			const index = mockTodos.findIndex(t => t.id === id);
			if (index === -1) {
				throw new NotFoundError(`Todo with ID ${id} not found`, { status: 404 });
			}
			const currentTodo = mockTodos[index]!; // Type assertion - el elemento existe
			const updatedTodo: Todo & { id: string } = {
				description: currentTodo.description,
				completed, // Actualizar solo completed
				id: currentTodo.id
			};
			mockTodos[index] = updatedTodo;
			return { ...updatedTodo };
		}

		// Eliminar todo
		async deleteTodo(id: string): Promise<boolean> {
			this.validateMongoId(id);
			const index = mockTodos.findIndex(t => t.id === id);
			if (index === -1) {
				throw new NotFoundError(`Todo with ID ${id} not found`, { status: 404 });
			}
			mockTodos.splice(index, 1);
			return true;
		}

		// NUEVO: Limpiar completamente el estado
		clearState(): void {
			mockTodos = [];
		}

		// Resetear al estado inicial conocido
		reset(): void {
			// Asegurar estado completamente limpio antes de cargar
			this.clearState();
			mockTodos = [...KNOWN_TEST_DATA];
		}

		// Método para acceder a datos internos (solo para testing)
		_getInternalState(): (Todo & { id: string })[] {
			return [...mockTodos];
		}

		// Método para establecer estado personalizado (testing avanzado)
		_setCustomState(data: (Todo & { id: string })[]): void {
			mockTodos = [...data];
		}

		// Obtener cantidad actual de datos
		getDataCount(): number {
			return mockTodos.length;
		}

		// Verificar si un ID existe
		hasId(id: string): boolean {
			return mockTodos.some(todo => todo.id === id);
		}
	}

	return new TodoModelMockInstance();
}

// Exportar también la versión legacy con nombre antiguo para compatibilidad
export const TodoModelMock = {
	// Estas funciones proporcionan compatibilidad con código existente
	validateMongoId(id: string): void {
		const instance = createTodoModelMock();
		instance.validateMongoId(id);
	},

	async getAllTodos(limit?: number) {
		const instance = createTodoModelMock();
		return instance.getAllTodos(limit);
	},

	async getTodoById(id: string) {
		const instance = createTodoModelMock();
		return instance.getTodoById(id);
	},

	async createTodo(data: Todo) {
		const instance = createTodoModelMock();
		return instance.createTodo(data);
	},

	async updateTodo(id: string, data: Partial<Todo>) {
		const instance = createTodoModelMock();
		return instance.updateTodo(id, data);
	},

	async updateTodoCompletion(id: string, completed: boolean) {
		const instance = createTodoModelMock();
		return instance.updateTodoCompletion(id, completed);
	},

	async deleteTodo(id: string) {
		const instance = createTodoModelMock();
		return instance.deleteTodo(id);
	},

	reset(): void {
		// No-op para compatibilidad legacy
	}
};

// Utilidades para setup de tests
export const TestDataSetup = {
	// Setup rápido con cantidad específica
	async setupWithCount(mock: TodoModelInstance, count: number): Promise<void> {
		await mock.setupKnownData(count);
	},

	// Setup con datos personalizados
	async setupWithCustomData(mock: TodoModelInstance, data: (Todo & { id: string })[]): Promise<void> {
		await mock.setupKnownData(data.length, data);
	},

	// Datos de ejemplo para diferentes escenarios
	getScenarios() {
		return {
			empty: [] as (Todo & { id: string })[],
			single: KNOWN_TEST_DATA.slice(0, 1),
			few: KNOWN_TEST_DATA.slice(0, 3),
			moderate: KNOWN_TEST_DATA.slice(0, 5),
			many: KNOWN_TEST_DATA.slice(0, 8)
		};
	},

	// Generar datos de prueba específicos
	generateTestData(count: number, baseDescription = 'Test todo'): (Todo & { id: string })[] {
		return Array.from({ length: count }, (_, i) => ({
			id: generateObjectId(i + 100),
			description: `${baseDescription} ${i + 1}`,
			completed: i % 2 === 0 // Completado alternado
		}));
	}
};
