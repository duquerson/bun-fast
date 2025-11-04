import { z } from 'zod';
import dotenv from 'dotenv';
import type { ConfigType } from '../types/config';
import { configSchema } from '../schema/shema.config';
//-----------------------------------------------------------------
// Cargar variables de entorno
//-----------------------------------------------------------------
dotenv.config({ quiet: true });
//-----------------------------------------------------------------
// Función para validar y obtener configuración
//-----------------------------------------------------------------
const getConfig = (): ConfigType => {
	try {
		return configSchema.parse({
			mongoUrl: process.env.APIMONGODB?.trim(),
			port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
			host: process.env.HOST?.trim(),
			nodeEnv: process.env.NODE_ENV?.trim(),
		});
	} catch (error) {
		if (error instanceof z.ZodError) {

			console.error('❌ Error de configuración:', error.issues);
			throw new Error('Configuración inválida. Revisa las variables de entorno.');
		}
		throw error;
	}
};

// Exportar configuración validada
export const config = getConfig();