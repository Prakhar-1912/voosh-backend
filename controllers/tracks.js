// Import necessary models
const Track = require('../models/track');
const Artist = require('../models/artist');
const Album = require('../models/album');

const getTracks = async (req, res) => {
    try {
        // Extract query parameters with defaults
        const {
            limit = 5,
            offset = 0,
            artist_id,
            album_id,
            hidden
        } = req.query;

        // Construct filter object
        const filter = {};

        if (artist_id) {
            // Ensure the artist exists before querying tracks
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
            // Ensure the album exists before querying tracks
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
            filter.hidden = hidden === 'true'; // Convert string to boolean
        }

        // Fetch tracks based on filter, limit, and offset
        const tracks = await Track.find(filter)
            .populate('artist_id', 'name')
            .populate('album_id', 'name')
            .skip(parseInt(offset))
            .limit(parseInt(limit));

        // If no tracks found
        if (tracks.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No tracks found.",
                error: "No matching tracks found for the query."
            });
        }

        // Return the response
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
        // Extract track ID from the request parameters
        const { id } = req.params;

        // Validate the track ID
        if (!id) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request: Track ID is required.",
                error: "Missing track ID"
            });
        }

        // Fetch the track by ID
        const track = await Track.findOne({ track_id: id }).lean(); // Return plain JS object

        // If track not found
        if (!track) {
            return res.status(404).json({
                status: 404,
                message: "Track not found.",
                error: "Invalid track ID"
            });
        }

        // Fetch related artist and album details
        const artist = track.artist_id ? await Artist.findOne({ artist_id: track.artist_id }).lean() : null;
        const album = track.album_id ? await Album.findOne({ album_id: track.album_id }).lean() : null;

        // Enrich track data with artist and album names
        const enrichedTrack = {
            ...track,
            artist_name: artist ? artist.name : null,
            album_name: album ? album.name : null
        };

        // Return the enriched track data
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


        // Validate required fields
        if (!artist_id || !album_id || !name || !duration) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request: Missing required fields.",
                error: "artist_id, album_id, name, and duration are required."
            });
        }

        // Verify artist exists
        const artist = await Artist.findById(artist_id);
        if (!artist) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Resource Doesn\'t Exist',
                error: 'Artist not found'
            });
        }

        // Verify album exists
        const album = await Album.findById(album_id);
        if (!album) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Resource Doesn\'t Exist',
                error: 'Album not found'
            });
        }

        // Create a new track document
        const newTrack = new Track({
            artist_id,
            album_id,
            name,
            duration,
            hidden: hidden || false 
        });

        // Save the track to the database
        await newTrack.save();

        // Add the album ID to the artist's albums array
        artist.tracks.push(newTrack._id);
        await artist.save();

        // Add the album ID to the artist's albums array
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

        // Validate track ID
        if (!id) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request: Track ID is required.",
                error: "Missing track ID"
            });
        }

        // Validate that updates are provided
        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request: No updates provided.",
                error: "Validation error"
            });
        }

        // Find and update the track
        const updatedTrack = await Track.findByIdAndUpdate(
            { _id: id },
            updates,
            { new: true, runValidators: true }
        ).lean();

        // If track not found
        if (!updatedTrack) {
            return res.status(404).json({
                status: 404,
                message: "Track not found.",
                error: "Invalid track ID"
            });
        }

        // Respond with success (204 No Content)
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

         // Remove the album ID from the artist's albums array
         await Artist.findByIdAndUpdate(track.artist_id, {
            $pull: { tracks: track._id }
        });
        
         // Remove the album ID from the artist's albums array
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
