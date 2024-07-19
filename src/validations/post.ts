import { body } from "express-validator";

export const postCreateValidation = [
    body('title').isLength({ min: 3}),
    body('text').isLength({ min: 6 }),
    body('tags').optional().isArray(),
    body('imageUrl').optional()
]

export const postEditValidation = [
    body('title').isLength({ min: 3}),
    body('text').isLength({ min: 6 }),
    body('tags').optional().isArray(),
    body('imageUrl').optional()
]