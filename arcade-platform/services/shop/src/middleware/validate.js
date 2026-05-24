const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Error de validación', 
        errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message })) 
      });
    }
    next(error);
  }
};

module.exports = validate;
