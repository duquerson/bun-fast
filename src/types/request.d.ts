import type { Todo } from '../types/todo.d.ts';

export type ObjectId = string;

export interface RequestById {
	Params: { id: ObjectId; }
}

export interface RequestWithBody {
	Body: { description: string; completed: boolean; }
}

export interface TodoRequest {
	Params: { id: ObjectId };
	Body: Partial<Todo>;
}

export interface UpdateCompletionRequest extends RequestById {
	Body: {
		completed: boolean;
	};
}

export interface RequestWithQuery {
	Querystring: {
		limit?: number;
	};
}