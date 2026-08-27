import "dotenv/config";
import { z } from "zod";

// Fails fast (and loudly, in the error message only — never the value) if a
// required variable is missing. This is the ONLY module allowed to read
// process.env directly; everything else imports `env` from here.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_DATABASE: z.string().min(1).default("droneclub"),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be a long random string"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be a long random string"),
  COOKIE_SECRET: z.string().min(32, "COOKIE_SECRET must be a long random string"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("30d"),

  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_INITIAL_PASSWORD: z.string().min(12).optional(),

  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  UPLOAD_DIRECTORY: z.string().default("uploads"),

  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASSWORD: z.string().optional().default(""),
  EMAIL_FROM: z.string().optional().default(""),

  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Print only field names/messages — never the offending values.
  const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
  console.error(`Invalid environment configuration:\n${issues}`);
  process.exit(1);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === "production";
export const corsAllowedOrigins = env.CORS_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());
export const isSmtpConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);
