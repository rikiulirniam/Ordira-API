export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

export const errorResponse = (res, error) => {
  const statusCode = error?.statusCode || 500;
  const message = error?.message || 'Internal Server Error';
  const details = error?.details || null;
  return res.status(statusCode).json({
    status: 'error',
    message,
    details,
  });
};
