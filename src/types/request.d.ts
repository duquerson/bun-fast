import type { Todo } from '../types/todo.d.ts';
export interface RequestById {
	Params: { id: string; }
}

export interface RequestWithBody {
	Body: { description: string; completed: boolean; }
}

export interface TodoRequest {
	Params: { id: string };
	Body: Required<Todo>;
}

export interface UpdateCompletionRequest extends RequestById {
	Body: {
		completed: boolean;
	};
}