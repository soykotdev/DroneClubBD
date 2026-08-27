// A typed, expected error that the central error handler renders as a clean
// JSON error response (never a stack trace) with the given HTTP status.
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, status = 400, code = "BAD_REQUEST", fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  static notFound(message = "Resource not found"): AppError {
    return new AppError(message, 404, "NOT_FOUND");
  }

  static unauthorized(message = "Authentication required"): AppError {
    return new AppError(message, 401, "UNAUTHORIZED");
  }

  static forbidden(message = "You do not have permission to perform this action"): AppError {
    return new AppError(message, 403, "FORBIDDEN");
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409, "CONFLICT");
  }
}
