import { Song } from "../models/Song.model.js";
import { Album } from "../models/Album.model.js";
import { alterAlbumsWithSignedUrls, alterSongsWithSignedUrls } from "../lib/metadata.js";

export const searchMedia = async (req, res, next) => {
	try {
		const query = req.params.query?.trim();
		if (!query) return res.status(400).json({ message: "Missing search query" });

		const regex = new RegExp(query, "i");

		const [songs, albums] = await Promise.all([
			Song.find({ title: regex }),
			Album.find({ title: regex }),
		]);

        const updatedSongs = await alterSongsWithSignedUrls(songs);
        const updatedAlbums = await alterAlbumsWithSignedUrls(albums);

		res.json({ updatedSongs, updatedAlbums });
	} catch (error) {
		next(error);
	}
};
