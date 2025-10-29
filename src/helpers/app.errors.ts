import type { ErrorOptions } from "../types/error";

function createErrorFactory<Name extends string>(name: Name) {
	return class BusinessError extends Error {
		public override readonly name: Name = name;
		public readonly status: number;
		public readonly code?: string;
		public readonly details?: unknown;
		constructor(message: string, options: ErrorOptions = {}) {
			super(message);
			this.name = name
			Object.setPrototypeOf(this, new.target.prototype);
			this.status = options.status ?? 400;
			this.code = options.code;
			this.details = options.details;
		}
	}
}

export const NotFoundError = createErrorFactory('NotFoundError');
export const ClientError = createErrorFactory('ClientError');
export const ValidationError = createErrorFactory('ValidationError');
export const ServerError = createErrorFactory('ServerError');