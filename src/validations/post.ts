import { body } from "express-validator";

export const postCreateValidation = [
    body('title').isLength({ min: 3}),
    body('text').isLength({ min: 6 }),
    body('tags').optional().isArray(),
    body('imageUrl').optional().isURL()
]

export const postEditValidation = [
    body('postId').notEmpty(),
    body('title').isLength({ min: 3}),
    body('text').isLength({ min: 6 }),
    body('tags').optional().isArray(),
    body('imageUrl').optional().isURL()
]