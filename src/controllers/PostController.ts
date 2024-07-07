import PostModel from "../models/Post.js"
import { validationResult } from 'express-validator';
import { Request, Response } from "express";
import mongoose from "mongoose";

export const create = async (req: Request, res: Response) => {
    try {
        const errs = validationResult(req);
        if(!errs.isEmpty()){
            return res.status(400).json(errs.array());
        }

        const doc = new PostModel({
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags,
            author_id: req.userId
        });
        
        const post = await doc.save();

        res.json(post);
    } catch (error) {
        res.json(error)
        throw error
    }
}

export const edit = async (req)