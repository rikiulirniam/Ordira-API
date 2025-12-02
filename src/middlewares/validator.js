// Placeholder for request validators (e.g., using express-validator / zod)
export const validate = (schema) => (req, res, next) => {
  try {
    if (schema) {
      schema.parse?.({ body: req.body, params: req.params, query: req.query });
    }
    next();
  } catch (e) {
    next(e);
  }
};
