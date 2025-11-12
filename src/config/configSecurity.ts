import type { FastifyInstance } from 'fastify';

// Store simple en memoria para rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Función para generar clave de rate limiting
function getRateLimitKey(request: any): string {
	const ip = request.headers['x-forwarded-for'] || request.ip || '127.0.0.1';
	return `rate_limit:${ip}`;
}

// Función para configurar seguridad
export async function configSecurity(app: FastifyInstance) {
	//-------------------------------------------------------------------------
	// CORS simple
	//-------------------------------------------------------------------------

	app.addHook('preHandler', async (request, reply) => {
		if (request.method === 'OPTIONS') {
			const origin = request.headers.origin;
			const isProduction = process.env.NODE_ENV === 'production';

			// En desarrollo, permitir todos los orígenes
			if (!isProduction) {
				reply.header('Access-Control-Allow-Origin', '*');
			} else {
				// En producción, restringir orígenes
				const allowedOrigins = [
					'https://yourdomain.com',
					'https://www.yourdomain.com',
					process.env.FRONTEND_URL
				].filter(Boolean);

				if (allowedOrigins.includes(origin) || !origin) {
					reply.header('Access-Control-Allow-Origin', origin || '*');
				} else {
					reply.header('Access-Control-Allow-Origin', 'null');
				}
			}

			reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
			reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent, DNT, Cache-Control, X-Mx-ReqToken, X-API-Key');
			reply.header('Access-Control-Allow-Credentials', 'true');
			reply.header('Access-Control-Max-Age', '86400');
			reply.header('Access-Control-Expose-Headers', 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset');

			await reply.send('');
			return;
		}
	});

	//-------------------------------------------------------------------------
	// Rate Limiting simple
	//-------------------------------------------------------------------------

	const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
	const timeWindow = 60000; // 1 minuto

	app.addHook('preHandler', async (request, reply) => {
		// IPs permitidas (sin rate limiting)
		const allowList = ['127.0.0.1', '::1', 'localhost'];
		const clientIp = request.headers['x-forwarded-for'] || request.ip || '127.0.0.1';
		const clientIpString = Array.isArray(clientIp) ? clientIp[0] : clientIp;

		if (clientIpString && allowList.includes(clientIpString)) {
			return;
		}

		const key = getRateLimitKey(request);
		const now = Date.now();
		const record = rateLimitStore.get(key);

		// Si expiró, resetear
		if (record && record.resetTime <= now) {
			rateLimitStore.delete(key);
		}

		const currentRecord = rateLimitStore.get(key);
		const currentCount = currentRecord?.count || 0;

		if (currentCount >= maxRequests) {
			const resetTime = now + timeWindow;

			reply.header('X-RateLimit-Limit', maxRequests.toString());
			reply.header('X-RateLimit-Remaining', '0');
			reply.header('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
			reply.header('Retry-After', Math.ceil(timeWindow / 1000).toString());

			await reply.status(429).send({
				success: false,
				error: {
					type: 'RateLimitError',
					message: 'Demasiadas solicitudes',
					code: 'RATE_LIMIT_EXCEEDED'
				}
			});
			return;
		}

		// Incrementar contador
		const newCount = currentCount + 1;
		rateLimitStore.set(key, {
			count: newCount,
			resetTime: now + timeWindow
		});

		// Headers informativos
		reply.header('X-RateLimit-Limit', maxRequests.toString());
		reply.header('X-RateLimit-Remaining', (maxRequests - newCount).toString());
		reply.header('X-RateLimit-Reset', Math.ceil((now + timeWindow) / 1000).toString());
	});

	//-------------------------------------------------------------------------
	// Headers de seguridad simples
	//-------------------------------------------------------------------------

	app.addHook('onSend', (request, reply, _payload, done) => {
		// Remover headers de información del servidor
		reply.header('Server', '');
		reply.header('X-Powered-By', '');

		// Headers de seguridad básicos
		reply.header('X-Content-Type-Options', 'nosniff');
		reply.header('X-Frame-Options', 'DENY');
		reply.header('X-XSS-Protection', '1; mode=block');
		reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');

		// HSTS para producción
		if (request.protocol === 'https' || process.env.NODE_ENV === 'production') {
			reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
		}

		// CSP básico
		reply.header('Content-Security-Policy', 'default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\';');

		done();
	});

	//-------------------------------------------------------------------------
	// Configuración final
	//-------------------------------------------------------------------------

	app.log.info('✅ Security configuration applied (simplified)');
}
