import { z } from 'zod';

// Esquema de validación para configuración
export const configSchema = z.object({
	// Base de datos
	mongoUrl: z.string().url('La URL de MongoDB debe ser una URL válida'),

	// Servidor
	port: z.number().int().positive().default(4321),
	host: z.string().default('localhost'),

	// Entorno
	nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
});