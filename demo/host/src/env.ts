import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3001').transform(Number),
    API_PORT: z.string().default('3000').transform(Number),
    CORS_ORIGIN: z.string().optional(),
    
    // Add other secrets here as needed by plugins
    REDIS_URL: z.string().optional(),
    NEAR_INTENTS_API_KEY: z.string().optional(),
    DUNE_API_KEY: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
