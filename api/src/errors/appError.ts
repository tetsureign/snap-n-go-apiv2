export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", code?: string) {
    super(400, message, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", code?: string) {
    super(401, message, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", code?: string) {
    super(403, message, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", code?: string) {
    super(404, message, code);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = "External service error", code?: string) {
    super(502, message, code);
  }
}
