import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DB_HOST: z.string().default('db.fudakvecbveugqfelxul.supabase.co'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().default('postgres'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default(''),
  DB_SSL: z.coerce.boolean().default(true),
  PASETO_SECRET: z.string().min(32).default('change-this-paseto-secret-in-env-now'),
  ADMIN_USERNAME: z.string().min(3).default('admin'),
  ADMIN_PASSWORD: z.string().min(8).default('ChangeMe123!'),
  ADMIN_DISPLAY_NAME: z.string().default('Backoffice Admin'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_ALLOWED_EMAILS: z.string().optional(),
})

export const env = envSchema.parse(process.env)

export const allowedGoogleEmails = new Set(
  env.GOOGLE_ALLOWED_EMAILS?.split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean) ?? [],
)