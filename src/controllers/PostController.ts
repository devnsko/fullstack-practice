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
        const post = await PostModel.findById(postId);
        if(post){
            post.title = req.body.title;
            post.text = req.body.text;
            
            const editedPost = await post.save();
            return res.json({
                success: "true",
                message: "Edit successfuly",
                ...editedPost
            });
        }
        // return res.status(404).json({
        //     message: 'Invalid'
        // })

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
