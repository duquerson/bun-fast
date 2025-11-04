// schemas/todo.schema.ts
import { z } from 'zod';

export const TodoCreateSchema = z.object({
	description: z.string()
		.min(1, 'Description cannot be empty')
		.max(2000, 'Description too long')
		.trim(),
	completed: z.boolean()
});

export const TodoUpdateSchema = z.object({
	description: z.string()
		.min(1, 'Description cannot be empty')
		.max(2000, 'Description too long')
		.trim()
		.optional(),
	completed: z.boolean().optional()
}).refine(
	(data) => data.description !== undefined || data.completed !== undefined,
	{ message: 'At least one field must be provided' }
);

export const CompletionUpdateSchema = z.object({
	completed: z.boolean()
});

export type TodoCreate = z.infer<typeof TodoCreateSchema>;
export type TodoUpdate = z.infer<typeof TodoUpdateSchema>;
export type CompletionUpdate = z.infer<typeof CompletionUpdateSchema>;