import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

import { Song } from "../models/Song.model.js";
import { Album } from "../models/Album.model.js";
import s3 from "../lib/s3.client.js";

export const getAdmin = (req, res) => {
    res.send("Admin controller is working!");
};

// upload function for cloudflare uploads
const uploadToR2 = async (file, key) => {
    try {
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: key,
            Body: file.data,
            ContentType: file.mimetype,
        };
        const res = await s3.send(new PutObjectCommand(params));
        return res.$metadata.httpStatusCode === 200;
    } catch (err) {
        console.error("Upload error:", err.message);
        return false;
    }
};

const deleteFromR2 = async (key) => {
    try {
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: key,
        };
        const res = await s3.send(new DeleteObjectCommand(params));
        return res.$metadata.httpStatusCode === 204 || res.$metadata.httpStatusCode === 200;
    } catch (err) {
        console.error("Delete error:", err.message);
        return false;
    }
};

export const createSong = async (req, res, next) => {
    try {
        if (!req.files?.audioFile || !req.files?.imageFile)
            return res.status(400).json({ message: "Please upload all files" });

        const uniqueId = uuidv4();

        const audioFile = req.files.audioFile;
        const imageFile = req.files.imageFile;
        const audioKey = `songs/${uniqueId}_${audioFile.name}`;
        const imageKey = `images/${uniqueId}_${imageFile.name}`;

        const audioOk = await uploadToR2(audioFile, audioKey);
        const imageOk = await uploadToR2(imageFile, imageKey);

        if (!audioOk || !imageOk) {
            if (audioOk) await deleteFromR2(audioKey);
            if (imageOk) await deleteFromR2(imageKey);
            return res.status(500).json({ message: "Upload failed, rolled back" });
        }

        const { title, artist, duration, albumId } = req.body;

        const song = await Song.create({
            songId: uniqueId,
            title,
            artist,
            audioUrl: audioKey,
            imageUrl: imageKey,
            duration: duration,
            albumId: albumId || null,
        });

        if (albumId)
            await Album.findByIdAndUpdate(albumId, { $push: { songs: song._id } });

        return res.status(201).json({ message: "Song created successfully", song });
    } catch (err) {
        console.error("Error creating song:", err);
        await deleteFromR2(audioKey);
        await deleteFromR2(imageKey);
        next(err);
    }
};

// delete a song
export const deleteSong = async(req, res, next) => {
    try{
        const { id } = req.params;

        const song = await Song.findById(id);
        if (song.albumId){
            await Album.findByIdAndUpdate(song.albumId, {
                $pull: { songs: song._id },
            })
        }
        await Song.findByIdAndDelete(id);
        res.status(200).json({ message: "Song deleted successfully "});
    } catch(error){
        console.log("Error in deleteSong", error);
        next(error);
    }
};

// create an album
export const createAlbum = async (req, res, next) => {
    try {
        const { title, artist, releaseYear } = req.body;

        if (!req.files?.imageFile) {
            return res.status(400).json({ message: "Please upload an album cover image." });
        }
        const albumId = uuidv4();

        const imageFile = req.files.imageFile;
        const imageKey = `images/${albumId}_${imageFile.name}`;

        // Upload image to R2 and get the storage key
        const uploadSuccess = await uploadToR2(imageFile, imageKey);
        if (!uploadSuccess) {
            return res.status(500).json({ message: "Image upload failed." });
        }

        // Create and save album document
        const album = await Album.create({
            albumId,
            title,
            artist,
            imageUrl: imageKey,
            releaseYear,
        });

        return res.status(201).json(album);
    } catch (error) {
        console.error("Error creating album:", error);
        next(error);
    }
};

// delete an album
export const deleteAlbum = async(req, res, next) => {
    try{
        const { id } = req.params;

        await Song.deleteMany({ albumId: id });
        await Album.findByIdAndDelete(id);

        res.status(200).json({ message: "Album deleted successfully "});
    } catch(error){
        console.log("Error in deleteAlbum", error);
        next(error);
    }
};

export const checkAdmin = async (req, res, next) => {
    res.status(200).json({ admin: true });
}