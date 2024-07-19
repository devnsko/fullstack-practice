import { body } from 'express-validator'

export const registerValidator = [
    body('email').isEmail(),
    body('username').isLength({ min: 3 }),
    body('password').isLength({ min: 5 }),
    body('avatarUrl').optional().isURL(),
]

export const loginValidator = [
    body('username').isLength({ min: 3 }),
    body('password').isLength({ min: 5 })
]

export const editValidator = [
    body('username').isLength({ min: 3}),
    body('name').optional(),
    body('avatarUrl').optional().isURL()
]