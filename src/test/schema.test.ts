import { describe, it, expect } from 'bun:test';
import { TodoCreateSchema, TodoUpdateSchema, CompletionUpdateSchema } from '../schema/schema.todo.ts';

describe('Zod Schemas', () => {
	describe('TodoCreateSchema', () => {
		it('should validate valid data', () => {
			const data = { description: 'Valid description', completed: false };
			const result = TodoCreateSchema.parse(data);
			expect(result).toEqual(data);
		});

		it('should throw on empty description', () => {
			const data = { description: '', completed: false };
			expect(() => TodoCreateSchema.parse(data)).toThrow('Description cannot be empty');
		});

		it('should throw on too long description', () => {
			const data = { description: 'a'.repeat(2001), completed: false };
			expect(() => TodoCreateSchema.parse(data)).toThrow('Description too long');
		});

		it('should throw on missing completed', () => {
			const data = { description: 'Test' };
			expect(() => TodoCreateSchema.parse(data)).toThrow();
		});
	});

	describe('TodoUpdateSchema', () => {
		it('should validate with description', () => {
			const data = { description: 'Updated' };
			const result = TodoUpdateSchema.parse(data);
			expect(result.description).toBe('Updated');
		});

		it('should validate with completed', () => {
			const data = { completed: true };
			const result = TodoUpdateSchema.parse(data);
			expect(result.completed).toBe(true);
		});

		it('should validate with both', () => {
			const data = { description: 'Updated', completed: true };
			const result = TodoUpdateSchema.parse(data);
			expect(result).toEqual(data);
		});

		it('should throw on empty object', () => {
			expect(() => TodoUpdateSchema.parse({})).toThrow('At least one field must be provided');
		});

		it('should throw on empty description', () => {
			const data = { description: '' };
			expect(() => TodoUpdateSchema.parse(data)).toThrow('Description cannot be empty');
		});

		it('should throw on too long description', () => {
			const data = { description: 'a'.repeat(2001) };
			expect(() => TodoUpdateSchema.parse(data)).toThrow('Description too long');
		});
	});

	describe('CompletionUpdateSchema', () => {
		it('should validate boolean', () => {
			const result = CompletionUpdateSchema.parse({ completed: true });
			expect(result.completed).toBe(true);
		});

		it('should throw on missing completed', () => {
			expect(() => CompletionUpdateSchema.parse({})).toThrow();
		});

		it('should throw on non-boolean', () => {
			expect(() => CompletionUpdateSchema.parse({ completed: 'true' })).toThrow();
		});
	});
});