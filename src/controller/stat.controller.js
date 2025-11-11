import { User } from "../models/User.model.js";
import { Song } from "../models/Song.model.js";
import { Album } from "../models/Album.model.js";



export const getStats = async (req, res, next) => {
    try {
        const [ totalSongs, totalAlbums, totalUsers, uniqueArtists ] = await Promise.all([
            Song.countDocuments(),
            Album.countDocuments(),
            User.countDocuments(),

            Song.aggregate([
                {
                    $unionWith:{
                        coll:"albums",
                        pipeline:[]
                    }
                },
                {
                    $group:{
                        _id:"$artist",
                    }
                },
                {
                    $count: "count",
                },
            ]),
        ]);

        console.log("albums:",totalAlbums);

        res.status(200).json({
            totalAlbums,
            totalSongs,
            totalUsers,
            totalArtists: uniqueArtists[0]?.count || 0,
        });
    } catch (error) {
        next(error);
    }
};