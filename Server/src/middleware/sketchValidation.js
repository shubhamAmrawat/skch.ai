import {body , param , validationResult} from 'express-validator';


export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(e => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

export const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid sketch ID'),
  validate,
];

export const validateSketchId = [
  param('sketchId')
    .isMongoId()
    .withMessage('Invalid sketch ID'),
  validate,
];

export const createSketchValidation = [
  body('title')
    .optional()
    .trim()
    .isString()
    .withMessage('Title must be a string')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),

  body('code')
    .notEmpty()
    .withMessage('Code is required')
    .isString()
    .withMessage('Code must be a string')
    .isLength({ max: 500000 }) // 500KB max — generous but bounded
    .withMessage('Code is too large'),

  body('tags')
    .notEmpty()
    .withMessage('At least one tag is required')
    .isArray({ min: 1, max: 10 })
    .withMessage('Tags must be an array with 1-10 items'),

  body('tags.*')
    .isString()
    .withMessage('Each tag must be a string')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters')
    // Prevent injection via tags
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Tags can only contain letters, numbers, spaces, hyphens, and underscores'),

  body('visibility')
    .optional()
    .isIn(['public', 'private'])
    .withMessage('Visibility must be public or private'),

  body('conversationHistory')
    .optional()
    .isArray()
    .withMessage('Conversation history must be an array'),

  body('conversationHistory.*.role')
    .optional()
    .isIn(['user', 'assistant'])
    .withMessage('Role must be user or assistant'),

  body('conversationHistory.*.content')
    .optional()
    .isString()
    .withMessage('Content must be a string')
    .isLength({ max: 100000 })
    .withMessage('Message content too large'),

  // tldrawSnapshot and thumbnail are URLs or JSON strings — just type check
  body('tldrawSnapshot')
    .optional({ nullable: true })
    .isString()
    .withMessage('Snapshot must be a string'),

  body('thumbnail')
    .optional({ nullable: true })
    .isString()
    .withMessage('Thumbnail must be a string'),

  validate,
];


export const updateSketchValidation = [
  body('title')
    .optional()
    .trim()
    .isString()
    .withMessage('Title must be a string')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),

  body('code')
    .optional()
    .isString()
    .withMessage('Code must be a string')
    .isLength({ max: 500000 })
    .withMessage('Code is too large'),

  body('tags')
    .optional()
    .isArray({ min: 1, max: 10 })
    .withMessage('Tags must be an array with 1-10 items'),

  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Tags can only contain letters, numbers, spaces, hyphens, and underscores'),

  body('visibility')
    .optional()
    .isIn(['public', 'private'])
    .withMessage('Visibility must be public or private'),

  body('conversationHistory')
    .optional()
    .isArray()
    .withMessage('Conversation history must be an array'),

  body('conversationHistory.*.role')
    .optional()
    .isIn(['user', 'assistant'])
    .withMessage('Role must be user or assistant'),

  body('conversationHistory.*.content')
    .optional()
    .isString()
    .withMessage('Content must be a string')
    .isLength({ max: 100000 })
    .withMessage('Message content too large'),

  body('tldrawSnapshot')
    .optional({ nullable: true })
    .isString()
    .withMessage('Snapshot must be a string'),

  body('thumbnail')
    .optional({ nullable: true })
    .isString()
    .withMessage('Thumbnail must be a string'),

  validate,
];