import { Request, Response } from 'express';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import UserModel from '../models/User.js'
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

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


export const register = async (req: Request, res: Response) => {
    try {

        const hash = await hashPass(req.body.password);
        
        const doc = new UserModel({
            email: req.body.email,
            username: req.body.username,
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
    
}

export const login = async (req: Request, res: Response) => {
    try {
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
}

export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await UserModel.findById(req.userId) 

        if(user) {
            const {passwordHash, ...userData} = user.toObject();
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
}

export const editProfile = async (req: Request, res: Response) => {
    try {
        await UserModel.findByIdAndUpdate(
            req.userId,
            {
                username: req.body.username,
                name: req.body.name ?? "",
                avatarUrl: req.body.avatarUrl ?? ""
            }
        )
        res.json({
            message: "success"
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            error: error
        })
    }
}

export const deleteProfile = async (req: Request, res: Response) => {
    try {
        const deletedUser = await UserModel.findByIdAndDelete(req.userId)
        res.json({
            success: true,
            message: "Profile deleted.",
            ...deleteProfile
        })
    } catch (error) {
        res.json(error)
    }
}

export const getAll = async (req: Request, res: Response) => {
    const profiles = await UserModel.find();

    res.json({
        profiles
    })
}