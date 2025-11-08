import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    songId:{
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    artist: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    audioUrl: {
        type: String,
        required: true,
        unique: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    albumId: {
        type: String,
        required: false,
    },
}, { timestamps: true });

export const Song = mongoose.model("Song", songSchema);