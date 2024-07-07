import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    author_id: {
        type: Number,
        required: true
    },
    text: {
        type: String,
        required: true
    }
})