import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    text: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        default: []
    },
    viewsCount: {
        type: Number,
        default: 0
    },
    imageUrl: String,
    author_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
},
{
    timestamps: true,
});

export default mongoose.model('Post', PostSchema)
