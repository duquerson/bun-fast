
export interface Todo {
	description: string;
	completed: boolean;
}

export interface ITodo extends Todo {
	id: string;
}

export type UpdateTodo = Partial<Todo>;
