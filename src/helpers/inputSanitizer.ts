// Sanitizador simple para protección XSS y NoSQL
export class InputSanitizer {
	// Sanitización básica XSS
	static sanitizeXSS(input: unknown): string | null {
		if (input === null || input === undefined) {
			return input as null;
		}

		if (typeof input !== 'string') {
			return String(input);
		}

		return input
			.replace(/&/g, '&')
			.replace(/</g, '<')
			.replace(/>/g, '>')
			.replace(/"/g, '"')
			.replace(/'/g, '\'');
	}

	// Sanitización básica NoSQL
	static sanitizeNoSQL(input: unknown): string {
		if (input === null || input === undefined) {
			return String(input);
		}

		if (typeof input !== 'string') {
			return String(input);
		}

		return input
			.replace(/\$/g, '\\$')
			.replace(/"/g, '\\"')
			.replace(/'/g, '\\\'');
	}

	// Validación de consultas MongoDB
	static validateMongoQuery(query: unknown): boolean {
		if (typeof query !== 'object' || query === null) {
			return true;
		}

		const queryString = JSON.stringify(query);

		const dangerousOperators = [
			'$where', '$ne', '$gt', '$gte', '$lt', '$lte',
			'$in', '$nin', '$or', '$and', '$not', '$exists',
			'$regex', '$options', '$text', '$slice', '$elemMatch'
		];

		for (const operator of dangerousOperators) {
			if (queryString.includes(operator)) {
				return false;
			}
		}

		return true;
	}

	// Sanitización de objetos
	static sanitizeObject(obj: unknown): unknown {
		if (obj === null || obj === undefined) {
			return obj;
		}

		if (typeof obj === 'string') {
			return this.sanitizeXSS(this.sanitizeNoSQL(obj));
		}

		if (typeof obj === 'number' || typeof obj === 'boolean') {
			return obj;
		}

		if (typeof obj === 'object') {
			if (Array.isArray(obj)) {
				return obj.map(item => this.sanitizeObject(item));
			}

			const sanitized: Record<string, unknown> = {};
			for (const [key, value] of Object.entries(obj)) {
				sanitized[key] = this.sanitizeObject(value);
			}
			return sanitized;
		}

		return String(obj);
	}

	// Detección de contenido sospechoso
	static isSuspicious(input: unknown): boolean {
		if (typeof input !== 'string') {
			return false;
		}

		const suspiciousPatterns = [
			/\$where/i,
			/;.*return.*db/i,
			/\beval\(/i,
			/\bselect\b.*\bfrom\b/i,
			/\bunion\b.*\bselect\b/i
		];

		return suspiciousPatterns.some(pattern => pattern.test(input));
	}

	// Sanitización de query params
	static sanitizeQueryParams(params: Record<string, unknown>): Record<string, unknown> {
		const sanitized: Record<string, unknown> = {};

		for (const [key, value] of Object.entries(params)) {
			if (typeof value === 'string') {
				sanitized[key] = this.sanitizeXSS(this.sanitizeNoSQL(value));
			} else if (typeof value === 'number') {
				sanitized[key] = isNaN(Number(value)) ? 0 : Number(value);
			} else if (typeof value === 'boolean') {
				sanitized[key] = Boolean(value);
			} else {
				sanitized[key] = this.sanitizeObject(value);
			}
		}

		return sanitized;
	}

	// Sanitización de headers
	static sanitizeHeaders(headers: Record<string, unknown>): Record<string, string> {
		const sanitized: Record<string, string> = {};

		for (const [key, value] of Object.entries(headers)) {
			const sanitizedValue = this.sanitizeXSS(this.sanitizeNoSQL(String(value)));
			sanitized[key] = sanitizedValue || '';
		}

		return sanitized;
	}

	// Middleware para sanitización automática
	static createSanitizationMiddleware() {
		return async (request: any) => {
			// Sanitizar body
			if (request.body && typeof request.body === 'object') {
				request.body = this.sanitizeObject(request.body);
			}

			// Sanitizar query params
			if (request.query && typeof request.query === 'object') {
				request.query = this.sanitizeQueryParams(request.query);
			}

			// Sanitizar params
			if (request.params && typeof request.params === 'object') {
				request.params = this.sanitizeQueryParams(request.params);
			}

			// Sanitizar headers
			if (request.headers && typeof request.headers === 'object') {
				request.headers = this.sanitizeHeaders(request.headers);
			}
		};
	}
}

// Decorator para sanitización automática
export function SanitizeInput() {
	return function (target: any, _propertyName: string, descriptor: PropertyDescriptor) {
		const method = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const sanitizedArgs = args.map(arg =>
				typeof arg === 'object' ? InputSanitizer.sanitizeObject(arg) : arg
			);

			return method.apply(this, sanitizedArgs);
		};

		return descriptor;
	};
}