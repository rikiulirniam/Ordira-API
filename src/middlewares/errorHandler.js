import { errorResponse } from '../core/response.js';
import { ApiError } from '../core/apiError.js';

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, 'Route not found'));
};

export const globalErrorHandler = (err, req, res, next) => {
  if (!(err instanceof ApiError)) {
    const wrapped = new ApiError(err.statusCode || 500, err.message || 'Internal Server Error');
    return errorResponse(res, wrapped);
  }
  return errorResponse(res, err);
};
