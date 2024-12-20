// Import necessary models
const Track = require('../models/track');
const Artist = require('../models/artist');
const Album = require('../models/album');

const getTracks = async (req, res) => {
    try {
        const {
            limit = 5,
            offset = 0,
            artist_id,
            album_id,
            hidden
        } = req.query;

        const filter = {};

        if (artist_id) {
            const artistExists = await Artist.findById({ _id: artist_id });
            if (!artistExists) {
                return res.status(404).json({
                    status: 404,
                    message: "Artist not found.",
                    error: "Invalid artist_id"
                });
            }
            filter.artist_id = artist_id;
        }

        if (album_id) {
            const albumExists = await Album.findById({ _id: album_id });
            if (!albumExists) {
                return res.status(404).json({
                    status: 404,
                    message: "Album not found.",
                    error: "Invalid album_id"
                });
            }
            filter.album_id = album_id;
        }

        if (hidden !== undefined) {
            filter.hidden = hidden === 'true';
        }

        const tracks = await Track.find(filter)
            .populate('artist_id', 'name')
            .populate('album_id', 'name')
            .skip(parseInt(offset))
            .limit(parseInt(limit));

        if (tracks.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No tracks found.",
                error: "No matching tracks found for the query."
            });
        }

        res.status(200).json({
            status: 200,
            data: tracks.map(track => ({
                    track_id: track._id,
                    artist_name: track.artist_id.name,
                    album_name: track.album_id.name,
                    name: track.name,
                    duration: track.duration,
                    hidden: track.hidden,
            })),
            message: "Tracks retrieved successfully.",
            error: null
        });
    } catch (error) {
        console.error("Error retrieving tracks:", error);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error.",
            error: error.message
        });
    }
};

const getTrackById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request: Track ID is required.",
                error: "Missing track ID"
            });
        }

        const track = await Track.findOne({ track_id: id }).lean(); 

        if (!track) {
            return res.status(404).json({
                status: 404,
                message: "Track not found.",
                error: "Invalid track ID"
            });
        }

        const artist = track.artist_id ? await Artist.findOne({ artist_id: track.artist_id }).lean() : null;
        const album = track.album_id ? await Album.findOne({ album_id: track.album_id }).lean() : null;

        const enrichedTrack = {
            ...track,
            artist_name: artist ? artist.name : null,
            album_name: album ? album.name : null
        };

        res.status(200).json({
            status: 200,
            data: enrichedTrack,
            message: "Track retrieved successfully.",
            error: null
        });
    } catch (error) {
        console.error("Error retrieving track by ID:", error);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error.",
            error: error.message
        });
    }
};

const addTrack = async (req, res) => {
    try {
        const { artist_id, album_id, name, duration, hidden } = req.body;

        console.log(artist_id, album_id);

        if (!artist_id || !album_id || !name || !duration) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request: Missing required fields.",
                error: "artist_id, album_id, name, and duration are required."
            });
        }

        const artist = await Artist.findById(artist_id);
        if (!artist) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Resource Doesn\'t Exist',
                error: 'Artist not found'
            });
        }

        const album = await Album.findById(album_id);
        if (!album) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Resource Doesn\'t Exist',
                error: 'Album not found'
            });
        }

        const newTrack = new Track({
            artist_id,
            album_id,
            name,
            duration,
            hidden: hidden || false 
        });

        await newTrack.save();
        artist.tracks.push(newTrack._id);
        await artist.save();
        album.tracks.push(newTrack._id);
        await album.save();
        
        res.status(201).json({
            status: 201,
            data: null,
            message: "Track created successfully.",
            error: null
        });
    } catch (error) {
        console.error("Error adding track:", error);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error.",
            error: error.message
        });
    }
};

const updateTrack = async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;

        if (!id) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request: Track ID is required.",
                error: "Missing track ID"
            });
        }

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request: No updates provided.",
                error: "Validation error"
            });
        }

        const updatedTrack = await Track.findByIdAndUpdate(
            { _id: id },
            updates,
            { new: true, runValidators: true }
        ).lean();

        if (!updatedTrack) {
            return res.status(404).json({
                status: 404,
                message: "Track not found.",
                error: "Invalid track ID"
            });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Error updating track:", error);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error.",
            error: error.message
        });
    }
};

const deleteTrackById = async (req, res) => {
    try {
        const id  = req.params.id;

        if (!id) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request: Track ID is required.",
                error: "Missing track ID"
            });
        }

        const track = await Track.findById({ _id: id })

        if (!track) {
            return res.status(404).json({
                status: 404,
                message: "Track not found.",
                error: "Invalid track ID"
            });
        }

         await Artist.findByIdAndUpdate(track.artist_id, {
            $pull: { tracks: track._id }
        });
        
         await Album.findByIdAndUpdate(track.album_id, {
            $pull: { tracks: track._id }
        });

        await track.deleteOne();

        res.status(200).json({
            status: 200,
            data: null,
            message: `Track: ${track.name} deleted successfully.`,
            error: null
        });
    } catch (error) {
        console.error("Error deleting track by ID:", error);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error.",
            error: error.message
        });
    }
};

module.exports = { getTracks, getTrackById, addTrack, updateTrack, deleteTrackById };
