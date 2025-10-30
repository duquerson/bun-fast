import type { ErrorOptions } from '../types/error';

function createErrorFactory<Name extends string>(name: Name) {
	if (!name?.trim()) {
		throw new Error('Error name cannot be empty');
	}
	return class BusinessError extends Error {
		public override readonly name: Name = name;
		public readonly status: number;
		public readonly code?: string;
		public readonly details?: unknown;
		constructor(message: string, options: ErrorOptions = {}) {
			if (!message?.trim()) {
				throw new Error('Error message cannot be empty');
			}
			super(message.trim());
			Object.setPrototypeOf(this, new.target.prototype);
			this.status = options.status ?? 400;
			this.code = options.code;
			this.details = options.details;
		}
	};
}

export const NotFoundError = createErrorFactory('NotFoundError');
export const ClientError = createErrorFactory('ClientError');
export const ValidationError = createErrorFactory('ValidationError');
