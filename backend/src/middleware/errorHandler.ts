import type { ErrorRequestHandler } from 'express';
import { env } from '../config/env';
import { HttpError } from '../shared/errors/httpError';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const message = error instanceof HttpError ? error.message : 'Internal server error';

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      details: error instanceof HttpError ? error.details : undefined,
      stack: env.nodeEnv === 'development' ? error.stack : undefined,
    },
  });
};
