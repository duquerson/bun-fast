import { z } from 'zod';
import { configSchema } from '../schema/shema.config';

// Tipo inferido del esquema
export type ConfigType = z.infer<typeof configSchema>;