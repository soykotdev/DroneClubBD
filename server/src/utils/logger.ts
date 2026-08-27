import pino from "pino";
import { env, isProduction } from "../config/env.js";

// Redaction paths cover every place a secret or credential could plausibly
// end up in a log line (request bodies, headers, cookies, Mongo connection
// errors that echo their input). This is enforced centrally so no individual
// route/controller has to remember to scrub before logging.
export const logger = pino({
  level: isProduction ? "info" : "debug",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "req.body.currentPassword",
      "req.body.newPassword",
      "req.body.confirmPassword",
      "*.password",
      "*.token",
      "*.tokenHash",
      "*.MONGODB_URI",
      "*.secret",
    ],
    censor: "[REDACTED]",
  },
  transport: env.NODE_ENV === "development" ? { target: "pino-pretty", options: { colorize: true } } : undefined,
});
