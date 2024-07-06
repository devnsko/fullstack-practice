import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export default (req: Request, res: Response, next: NextFunction) => {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
    if ( token ){
        try {
            const decoded = jwt.verify(token, 'secret123') as jwt.JwtPayload;
            req.userId = decoded._id;
            next()
        } catch (err) {
            return res.status(500).json({
                message: '???'
            })
        }
    } else {
        return res.status(403).json({
            message: 'No'
        })
    }
}