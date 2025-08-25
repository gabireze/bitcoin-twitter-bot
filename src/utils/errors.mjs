export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

export class APIError extends AppError {
  constructor(message, service, statusCode = 503) {
    super(`${service} API Error: ${message}`, statusCode);
    this.service = service;
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(`Validation Error: ${message}`, 400);
  }
}

export class ConfigurationError extends AppError {
  constructor(message) {
    super(`Configuration Error: ${message}`, 500);
  }
}
