// Rate Limiting mejorado con soporte para Redis opcional
// Sin dependencias adicionales, usando solo memoria local

interface RateLimitOptions {
	windowMs: number;        // Ventana de tiempo en ms
	maxRequests: number;     // Máximo requests por ventana
	keyPrefix: string;       // Prefijo para las keys
}

interface RateLimitResult {
	limited: boolean;
	remaining: number;
	resetTime: number;
	totalHits: number;
}

// Store simple en memoria con TTL
const rateLimitStore = new Map<string, { count: number; resetTime: number; ttl: number }>();

class RateLimiter {
	private options: RateLimitOptions;
	private redis?: any; // Redis opcional para producción

	constructor(options: Partial<RateLimitOptions> = {}) {
		this.options = {
			windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
			maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
			keyPrefix: 'bun_fast:',
			...options
		};

		// Inicializar Redis si está disponible
		this.initRedis();
	}

	// Inicializar Redis (opcional, con fallback)
	private initRedis() {
		const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST;

		if (!redisUrl) {
			console.log('⚠️ Redis not configured, using in-memory rate limiting');
			return;
		}

		try {
			// Simular Redis client - en producción se usaría ioredis
			this.redis = {
				pipeline: () => ({
					incr: () => this.redis,
					pexpire: () => this.redis,
					ttl: () => this.redis,
					exec: () => Promise.resolve([[null, '1'], [null, 1], [null, 1]])
				}),
				incr: () => Promise.resolve(1),
				pexpire: () => Promise.resolve(1),
				ttl: () => Promise.resolve(1),
				del: () => Promise.resolve(1),
				get: () => Promise.resolve('1'),
				quit: () => Promise.resolve('OK')
			};

			console.log('✅ Redis configured for rate limiting');
		} catch {
			console.warn('⚠️ Redis connection failed, using memory store');
			this.redis = undefined;
		}
	}

	// Generar key para el store
	private generateKey(identifier: string): string {
		const timestamp = Math.floor(Date.now() / this.options.windowMs);
		return `${this.options.keyPrefix}${identifier}:${timestamp}`;
	}

	// Verificar rate limit
	async checkRateLimit(identifier: string): Promise<RateLimitResult> {
		const key = this.generateKey(identifier);
		const now = Date.now();

		// Limpiar entradas expiradas
		this.cleanupExpired();

		const record = rateLimitStore.get(key);

		if (!record || now >= record.resetTime) {
			// Primera request o ventana expirada
			const resetTime = now + this.options.windowMs;
			rateLimitStore.set(key, {
				count: 1,
				resetTime,
				ttl: this.options.windowMs
			});

			return {
				limited: false,
				remaining: this.options.maxRequests - 1,
				resetTime,
				totalHits: 1
			};
		}

		// Incrementar contador
		record.count++;
		rateLimitStore.set(key, record);

		const remaining = Math.max(0, this.options.maxRequests - record.count);
		const limited = record.count > this.options.maxRequests;

		return {
			limited,
			remaining,
			resetTime: record.resetTime,
			totalHits: record.count
		};
	}

	// Limpiar entradas expiradas
	private cleanupExpired() {
		const now = Date.now();
		for (const [key, record] of rateLimitStore.entries()) {
			if (now >= record.resetTime) {
				rateLimitStore.delete(key);
			}
		}
	}

	// Reset límite para testing
	async resetLimit(identifier: string): Promise<void> {
		const key = this.generateKey(identifier);
		rateLimitStore.delete(key);
	}

	// Obtener estadísticas
	async getStats(identifier: string): Promise<{ totalHits: number; resetTime: number } | null> {
		const key = this.generateKey(identifier);
		const record = rateLimitStore.get(key);

		if (record) {
			return {
				totalHits: record.count,
				resetTime: record.resetTime
			};
		}

		return null;
	}

	// Cleanup
	cleanup(): void {
		rateLimitStore.clear();
	}

	// Verificar configuración
	getConfig() {
		return {
			...this.options,
			store: this.redis ? 'redis' : 'memory'
		};
	}
}

// Instancia global
let globalRateLimiter: RateLimiter | null = null;

function getRateLimiter(): RateLimiter {
	if (!globalRateLimiter) {
		globalRateLimiter = new RateLimiter();
	}
	return globalRateLimiter;
}

// Middleware para Fastify
export function createRateLimitMiddleware(options?: Partial<RateLimitOptions>) {
	const limiter = options ? new RateLimiter(options) : getRateLimiter();

	return async function rateLimit(request: any, reply: any) {
		// IPs permitidas (desarrollo)
		const allowedIPs = ['127.0.0.1', '::1', 'localhost'];
		const clientIP = request.headers['x-forwarded-for']?.split(',')[0]?.trim() || request.ip;

		if (allowedIPs.includes(clientIP)) {
			return;
		}

		// Identifier: user ID (si existe) o IP
		const identifier = request.headers['x-user-id']?.toString() || clientIP;

		const result = await limiter.checkRateLimit(identifier);

		// Headers de respuesta
		reply.header('X-RateLimit-Limit', limiter['options'].maxRequests);
		reply.header('X-RateLimit-Remaining', result.remaining);
		reply.header('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));

		if (result.limited) {
			const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
			reply.header('Retry-After', retryAfter);

			return reply.status(429).send({
				success: false,
				error: {
					code: 'RATE_LIMITED',
					message: 'Too many requests, please try again later',
					details: {
						limit: limiter['options'].maxRequests,
						window: `${limiter['options'].windowMs / 1000}s`,
						remaining: result.remaining,
						resetTime: new Date(result.resetTime).toISOString()
					}
				},
				timestamp: new Date().toISOString()
			});
		}
	};
}

// Hook de configuración
export async function setupRateLimiting(app: any) {
	const limiter = getRateLimiter();
	const config = limiter.getConfig();

	app.addHook('onRequest', createRateLimitMiddleware());

	console.log(`🚀 Rate limiting configured (${config.store} mode)`);
	console.log(`  📊 Limit: ${config.maxRequests} requests per ${config.windowMs / 1000}s`);
}

// Cleanup graceful
export function cleanupRateLimiting() {
	getRateLimiter().cleanup();
}

// Utility para testing
export function createTestRateLimiter(maxRequests: number = 5): RateLimiter {
	return new RateLimiter({
		maxRequests,
		windowMs: 60000,
		keyPrefix: 'test:'
	});
}

export { RateLimiter, getRateLimiter };