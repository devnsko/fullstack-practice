import { configDotenv } from "dotenv";
import { Request, Response, NextFunction } from "express";
configDotenv;
import jwt from "jsonwebtoken";

export default (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
        console.debug(process.env.ADMIN, token)
        if ( token ) {
            const decoded = jwt.verify(token, 'secret123') as jwt.JwtPayload;
            if (decoded._id == process.env.ADMIN){
                
                const decoded = jwt.verify(token, 'secret123') as jwt.JwtPayload;
                req.userId = decoded._id;
                next()
                
            } else {
                return res.status(403).json({
                message: 'Only for admin'
            })
        }
        }   
    } catch (err) {
        return res.status(500).json({
            message: 'Only for admin'
        })
    }
}