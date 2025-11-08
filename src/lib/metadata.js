import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../lib/s3.client.js";


import dotenv from 'dotenv';
import { Song } from "../models/Song.model.js";
dotenv.config();

// Bucket is private -> so, issuing a temp signed url for data access.
const tempSignedUrl = async (imageKey) => {
    const url = await getSignedUrl(s3, new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: imageKey
    }), { expiresIn: 60 * 30 }); // valid for 10 minutes
    return url;
};

// safer helper – signs only valid relative keys
const safeSignedUrl = async (key) => {
    if (!key || typeof key !== "string") return key;
    if (/^https?:\/\//i.test(key)) return key; // skip already absolute URLs
    try {
        return await tempSignedUrl(key);
    } catch (err) {
        console.error("URL signing failed for", key, err);
        return key;
    }
};


// helper to alter songs with signed URLs
// handles both single song objects and arrays
export const alterSongsWithSignedUrls = async (songs) => {
    if (!songs) return songs;

    // Case 1: single song object
    if (!Array.isArray(songs)) {
        const plainSong = songs.toObject ? songs.toObject() : songs;
        return {
            ...plainSong,
            imageUrl: await safeSignedUrl(plainSong.imageUrl),
            audioUrl: await safeSignedUrl(plainSong.audioUrl),
        };
    }

    // Case 2: array of songs
    if (songs.length === 0) return songs;

    return Promise.all(
        songs.map(async (song) => {
            const plainSong = song.toObject ? song.toObject() : song;
            return {
                ...plainSong,
                imageUrl: await safeSignedUrl(plainSong.imageUrl),
                audioUrl: await safeSignedUrl(plainSong.audioUrl),
            };
        })
    );
};


// helper to alter albums with signed URLs and populated songs
export const alterAlbumsWithSignedUrls = async (albums) => {
    if (!Array.isArray(albums) || albums.length === 0) return albums ?? [];

    return Promise.all(
        albums.map(async (album) => {
            const plainAlbum = album.toObject ? album.toObject() : album;

            // fetch song metadata manually if songs are stored as IDs
            let songs = [];
            if (Array.isArray(plainAlbum.songs) && plainAlbum.songs.length > 0) {
                // find song metadata for all IDs in album
                songs = await Song.find({ _id: { $in: plainAlbum.songs } }).lean();
                songs = await alterSongsWithSignedUrls(songs);
            }

            return {
                ...plainAlbum,
                imageUrl: await safeSignedUrl(plainAlbum.imageUrl),
                songs, // replace IDs with full signed metadata
            };
        })
    );
};