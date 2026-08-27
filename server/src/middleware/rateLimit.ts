import rateLimit from "express-rate-limit";

// Public form submissions — generous enough for real visitors, tight enough
// to blunt scripted abuse of an unauthenticated endpoint.
export const publicFormRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many submissions. Please try again later.", code: "RATE_LIMITED" } },
});

// Login — deliberately strict; paired with the account lockout/delay logic
// in the auth controller for repeated failures against a single account.
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many login attempts. Please try again later.", code: "RATE_LIMITED" } },
});

// General API traffic ceiling.
export const generalApiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
