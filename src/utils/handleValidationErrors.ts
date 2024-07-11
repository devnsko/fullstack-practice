import { validationResult } from "express-validator";
import {Request, Response} from 'express';

export default (req: Request, res: Response, next: Function) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(403).json(errors.array());
    }
    
    next();
}