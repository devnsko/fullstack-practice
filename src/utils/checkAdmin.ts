import { configDotenv } from "dotenv";
import { Request, Response, NextFunction } from "express";
configDotenv;
import jwt from "jsonwebtoken";

export default (req: Request, res: Response, next: NextFunction) => {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
    if ( token && token == process.env.ADMIN){
        try {
            const decoded = jwt.verify(token, 'secret123') as jwt.JwtPayload;
            req.userId = decoded._id;
            next()
        } catch (err) {
            return res.status(500).json({
                message: 'Only for admin'
            })
        }
    } else {
        return res.status(403).json({
            message: 'Only for admin'
        })
    }
}