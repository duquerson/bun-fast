// Logger de seguridad para auditoría y monitoreo
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface SecurityLogEntry {
	timestamp: string;
	level: LogLevel;
	event: string;
	category: 'authentication' | 'authorization' | 'rate_limiting' | 'input_validation' | 'access' | 'error';
	message: string;
	metadata?: Record<string, any>;
	userId?: string;
	ipAddress?: string;
	userAgent?: string;
	requestId?: string;
}

class SecurityLogger {
	private static instance: SecurityLogger | null = null;

	static getInstance(): SecurityLogger {
		if (!SecurityLogger.instance) {
			SecurityLogger.instance = new SecurityLogger();
		}
		return SecurityLogger.instance;
	}

	// Métodos para diferentes tipos de eventos de seguridad
	static logAccess(
		message: string,
		metadata?: Record<string, any>,
		ipAddress?: string,
		userAgent?: string,
		requestId?: string
	): void {
		const entry: SecurityLogEntry = {
			timestamp: new Date().toISOString(),
			level: 'info',
			event: 'access',
			category: 'access',
			message,
			metadata,
			ipAddress,
			userAgent,
			requestId
		};

		this.getInstance().writeLog(entry);
	}

	static logAuthentication(
		message: string,
		metadata?: Record<string, any>,
		ipAddress?: string,
		userAgent?: string,
		requestId?: string
	): void {
		const entry: SecurityLogEntry = {
			timestamp: new Date().toISOString(),
			level: 'info',
			event: 'authentication',
			category: 'authentication',
			message,
			metadata,
			ipAddress,
			userAgent,
			requestId
		};

		this.getInstance().writeLog(entry);
	}

	static logAuthorization(
		message: string,
		metadata?: Record<string, any>,
		userId?: string,
		ipAddress?: string,
		userAgent?: string,
		requestId?: string
	): void {
		const entry: SecurityLogEntry = {
			timestamp: new Date().toISOString(),
			level: 'info',
			event: 'authorization',
			category: 'authorization',
			message,
			metadata,
			userId,
			ipAddress,
			userAgent,
			requestId
		};

		this.getInstance().writeLog(entry);
	}

	static logRateLimiting(
		message: string,
		metadata?: Record<string, any>,
		ipAddress?: string,
		userAgent?: string,
		requestId?: string
	): void {
		const entry: SecurityLogEntry = {
			timestamp: new Date().toISOString(),
			level: 'warn',
			event: 'rate_limiting',
			category: 'rate_limiting',
			message,
			metadata,
			ipAddress,
			userAgent,
			requestId
		};

		this.getInstance().writeLog(entry);
	}

	static logInputValidation(
		message: string,
		metadata?: Record<string, any>,
		ipAddress?: string,
		userAgent?: string,
		requestId?: string
	): void {
		const entry: SecurityLogEntry = {
			timestamp: new Date().toISOString(),
			level: 'info',
			event: 'input_validation',
			category: 'input_validation',
			message,
			metadata,
			ipAddress,
			userAgent,
			requestId
		};

		this.getInstance().writeLog(entry);
	}

	static logError(
		message: string,
		error?: any,
		metadata?: Record<string, any>,
		ipAddress?: string,
		userAgent?: string,
		requestId?: string
	): void {
		const entry: SecurityLogEntry = {
			timestamp: new Date().toISOString(),
			level: 'error',
			event: 'error',
			category: 'error',
			message,
			metadata: {
				...metadata,
				errorMessage: error?.message,
				errorStack: error?.stack
			},
			ipAddress,
			userAgent,
			requestId
		};

		this.getInstance().writeLog(entry);
	}

	// Escribir log interno
	private writeLog(entry: SecurityLogEntry): void {
		const consoleMethod = entry.level === 'error' ? 'error' :
			entry.level === 'warn' ? 'warn' : 'info';

		const logMessage = {
			SECURITY: entry,
			['timestamp']: entry.timestamp,
			['level']: entry.level,
			['category']: entry.category,
			['event']: entry.event,
			['message']: entry.message
		};

		// Log a consola con formato estructurado
		console[consoleMethod](JSON.stringify(logMessage, null, 2));

		// En producción, aquí se enviaría a un servicio como:
		// - Elasticsearch
		// - Splunk
		// - CloudWatch
		// - Datadog
		// - etc.
	}

	// Métodos para generar métricas
	static getSecurityMetrics(): Record<string, number> {
		// En implementación real, esto consultaría una base de datos
		// o servicio de métricas
		return {
			totalRequests: 0,
			blockedRequests: 0,
			rateLimitHits: 0,
			authenticationAttempts: 0,
			authorizationFailures: 0,
			validationErrors: 0
		};
	}

	// Middleware helper para Fastify
	static createSecurityMiddleware() {
		return async (request: any, reply: any) => {
			// Extraer información del request
			const ipAddress = request.headers['x-forwarded-for'] || request.ip;
			const userAgent = request.headers['user-agent'];
			const requestId = request.id || Math.random().toString(36).substring(2, 9);

			// Agregar metadata al request para usar en handlers
			request.securityContext = {
				ipAddress,
				userAgent,
				requestId
			};

			// Log de acceso
			SecurityLogger.logAccess(
				`${request.method} ${request.url} - ${reply.statusCode}`,
				{
					method: request.method,
					url: request.url,
					statusCode: reply.statusCode
				},
				ipAddress,
				userAgent,
				requestId
			);

			return;
		};
	}
}

// Hook para Fastify
export async function setupSecurityLogging(app: any) {
	app.addHook('onRequest', SecurityLogger.createSecurityMiddleware());

	app.log.info('🔒 Security logging configured');
}

// Helper para usar en controladores
export function createSecureLogger(request: any) {
	const context = request.securityContext || {};

	return {
		logAccess: (message: string, metadata?: Record<string, any>) =>
			SecurityLogger.logAccess(message, metadata, context.ipAddress, context.userAgent, context.requestId),

		logAuthentication: (message: string, metadata?: Record<string, any>) =>
			SecurityLogger.logAuthentication(message, metadata, context.ipAddress, context.userAgent, context.requestId),

		logAuthorization: (message: string, metadata?: Record<string, any>, userId?: string) =>
			SecurityLogger.logAuthorization(message, metadata, userId, context.ipAddress, context.userAgent, context.requestId),

		logRateLimiting: (message: string, metadata?: Record<string, any>) =>
			SecurityLogger.logRateLimiting(message, metadata, context.ipAddress, context.userAgent, context.requestId),

		logInputValidation: (message: string, metadata?: Record<string, any>) =>
			SecurityLogger.logInputValidation(message, metadata, context.ipAddress, context.userAgent, context.requestId),

		logError: (message: string, error?: any, metadata?: Record<string, any>) =>
			SecurityLogger.logError(message, error, metadata, context.ipAddress, context.userAgent, context.requestId)
	};
}

export { SecurityLogger };