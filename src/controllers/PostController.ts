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
            author: req.userId
        });
        
        const post = await doc.save();

        res.json(post);
    } catch (error) {
        res.status(500).json(error)
        throw error
    }
}

export const edit = async (req: Request, res: Response) => {
    try {
        const errs = validationResult(req);
        if(!errs.isEmpty()){
            return res.status(400).json(errs.array());
        }
        const postId = req.params.id;
        await PostModel.findByIdAndUpdate(
        postId,
        {
            title: req.body.title,
            text: req.body.text,
            tags: req.body.tags ?? [],
            imageUrl: req.body.imageUrl
        });
            
        return res.json({
            success: true
        });
    
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getAll = async (req: Request, res: Response) => {
    try {
        
        const posts = await PostModel.find().populate('author').exec();
        // posts.map((post) => {
            
        //     const {passwordHash, ...author} = post.author;
        // })
        res.json(posts)
    } catch (error) {
        console.log(error)
        res.status(500).json(error) 
    }
}

export const getOne = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id as string;
        
        const post = await PostModel.findOneAndUpdate(
            {
                _id: postId,
            },
            {
                $inc: {viewsCount: 1},
            },
            {
                returnDocument: 'after',
            }
        ).populate('author').exec();
        if (post) {
            console.log(typeof(post.author));
            const author = await post.populated('author');
            const {passwordHash, ...authorData} = author;
            post.author = {...author};
            return res.json(post)
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const deleteOne = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id as string;
        const post = await PostModel.findByIdAndDelete(postId);
        res.json({
            ...post,
            message: "Post was deleted successfuly!"
        })
    } catch (error) {
        res.status(500).json(error)
    }
}

export const deleteAll = async (req: Request, res: Response) => {
    try {
        const post = await PostModel.deleteMany();
        res.json({
            ...post,
            message: "All posts was deleted!"
        })
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getLastTags = async (req: Request, res: Response) => {
    try {
        const posts = await PostModel.find().limit(5).exec();
        const tags = posts.map((post) => post.tags).flat().slice(0, 5);
        res.json(tags)
    } catch (error) {
        res.status(500).json(error)
    }
}
