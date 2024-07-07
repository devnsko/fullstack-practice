import express, { Express, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { JsonWebTokenError } from 'jsonwebtoken';
import { registerValidator, loginValidator } from './validations/auth.js'
import { validationResult } from 'express-validator';
import UserModel from './models/User.js'
import checkAuth from './utils/checkAuth.js';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import morgan from 'morgan';
dotenv.config()


mongoose.connect(
    'mongodb+srv://admin:root@cluster0.7ryog7a.mongodb.net/practice',
).then(() => {
    console.log('⚡️[Database] DB connected');
}).catch((err) => console.log('db err:', err))

const app: Express = express();
app.use(cors());
app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);
const port = process.env.PORT;

const scryptAsync = promisify(scrypt);

async function hashPass(password: string) {
    const salt = randomBytes(16).toString('hex');
    const buff = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buff.toString('hex')}.${salt}`
}

async function comparePas(storedPassword: string, suppliedPassword: string): Promise<boolean> {
    const [hashedPassword, salt] = storedPassword.split('.');
    const hashedPasswordBuff = Buffer.from(hashedPassword, 'hex');
    const suppliedPasswordBuff = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    return timingSafeEqual(hashedPasswordBuff, suppliedPasswordBuff)
}

async function userToken(user_id: mongoose.Types.ObjectId) {
    const token = jwt.sign({
        _id: user_id,
    }, 'secret123', {
        expiresIn: '1d',
    });
    return token;
}

app.get('/me', checkAuth, async (req: Request, res: Response) => {
    try {
        const user = await UserModel.findById(req.userId) 

        if(user) {
            const {passwordHash, ...userData} = user;
            return res.json(userData)
        }
        return res.status(400).json({
            message: 'Error with user'
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'No auth'
        })
    }
})

app.post('/login', loginValidator, async (req: Request, res: Response) => {
    try {
        const errs = validationResult(req);
        if(!errs.isEmpty()){
            console.log(errs.array)
            return res.status(400).json({
                message: 'Non valid!'
            })
        }

        const password = req.body.password;

        const user = await UserModel.findOne({username: req.body.username});

        if (!user) {
            return res.status(400).json({
                message: 'Wrong pass or login'
            })
        }

        const validatePass = await comparePas(user.passwordHash, password);
        if (!validatePass) {
            return res.status(400).json({
                message: 'Wrong pass or login'
            })
        }
        const token = await userToken(user._id);

        const {passwordHash, ...userData} = user.toObject();

        res.json({
            ...userData,
            token
        })

    } catch (err){
        console.log('0_0 FUCK: ', err)
        return res.status(500).json({
            message: 'Fail'
        })
    }
})

app.post('/reg', registerValidator, async (req: Request, res: Response) => {
    try {
        const errs = validationResult(req);
        if(!errs.isEmpty()){
            return res.status(400).json(errs.array());
        }

        const hash = await hashPass(req.body.password);
        const username = req.body.email.split('@')[0];
        console.log(username);
        
        const doc = new UserModel({
            email: req.body.email,
            username: username,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash
        })
        
        const user = await doc.save();
        
        const token = await userToken(user._id);

        const { passwordHash, ...userData} = user.toObject();


        res.json({
            ...userData,
            token
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Fail'
        })
    }
    
})

server.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
  
  