import { Album } from "../models/Album.model.js"
import { alterAlbumsWithSignedUrls } from "../lib/metadata.js";

export const getAllAlbums = async (req, res, next) => {
    try {
        const albums = await Album.find().lean();
        const updatedAlbums = await alterAlbumsWithSignedUrls(albums);
        res.status(200).json(updatedAlbums);
    } catch (error) {
        console.error("Error in getAllAlbums:", error);
        next(error);
    }
};

export const getAlbum = async (req, res, next) => {
    try {
        const { albumId } = req.params;

        const album = await Album.findById(albumId).lean();
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }

        const [updatedAlbum] = await alterAlbumsWithSignedUrls([album]);
        res.status(200).json(updatedAlbum);
    } catch (error) {
        console.error("Error in getAlbum:", error);
        next(error);
    }
};