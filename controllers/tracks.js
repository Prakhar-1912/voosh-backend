// Import necessary models
const Track = require('../models/track');
const Artist = require('../models/artist');
const Album = require('../models/album');

// Controller to handle GET /tracks
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
            const artistExists = await Artist.findOne({ artist_id });
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
            const albumExists = await Album.findOne({ album_id });
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
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .lean(); // Return plain JS objects for easier manipulation

        // If no tracks found
        if (tracks.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No tracks found.",
                error: "No matching tracks found for the query."
            });
        }

        // Prepare the response data with additional artist and album names
        const enrichedTracks = await Promise.all(tracks.map(async track => {
            const artist = artist_id ? await Artist.findOne({ artist_id: track.artist_id }) : null;
            const album = album_id ? await Album.findOne({ album_id: track.album_id }) : null;
            return {
                ...track,
                artist_name: artist ? artist.name : null,
                album_name: album ? album.name : null
            };
        }));

        // Return the response
        res.status(200).json({
            status: 200,
            data: enrichedTracks,
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

// Controller to handle POST /tracks/add-track
const addTrack = async (req, res) => {
    try {
        // Extract track details from the request body
        const { artist_id, album_id, name, duration, hidden } = req.body;

        // Validate required fields
        if (!artist_id || !album_id || !name || !duration) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request: Missing required fields.",
                error: "artist_id, album_id, name, and duration are required."
            });
        }

        // Create a new track document
        const newTrack = new Track({
            track_id: require('uuid').v4(), // Generate a unique UUID
            artist_id,
            album_id,
            name,
            duration,
            hidden: hidden || false // Default to false if not provided
        });

        // Save the track to the database
        await newTrack.save();

        // Respond with success message
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

// Controller to handle PUT /tracks/:id
const updateTrack = async (req, res) => {
    try {
        // Extract track ID from the request parameters
        const { id } = req.params;

        // Extract fields to update from the request body
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
        const updatedTrack = await Track.findOneAndUpdate(
            { track_id: id },
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

// Controller to handle DELETE /tracks/:id
const deleteTrackById = async (req, res) => {
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

        // Find and delete the track
        const deletedTrack = await Track.findOneAndDelete({ track_id: id }).lean();

        // If track not found
        if (!deletedTrack) {
            return res.status(404).json({
                status: 404,
                message: "Track not found.",
                error: "Invalid track ID"
            });
        }

        // Respond with success
        res.status(200).json({
            status: 200,
            data: null,
            message: `Track: ${deletedTrack.name} deleted successfully.`,
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
