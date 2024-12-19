// Import necessary models
const Favorites = require('../models/favorites');

// Controller to handle POST /favorites/add-favorite
const addFavorite = async (req, res) => {
    try {
        // Extract category and item_id from the request body
        const { category, item_id } = req.body;

        // Validate the request body
        if (!category || !item_id) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request: Category and item ID are required.",
                error: "Missing required fields"
            });
        }

        // Validate category type
        const validCategories = ["artist", "album", "track"];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request: Invalid category type.",
                error: "Invalid category"
            });
        }

        // Create a new favorite
        const favorite = new Favorites({
            favorite_id: item_id,
            category: category
        });

        // Save the favorite to the database
        await favorite.save();

        // Respond with success
        res.status(201).json({
            status: 201,
            data: null,
            message: "Favorite added successfully.",
            error: null
        });
    } catch (error) {
        console.error("Error adding favorite:", error);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error.",
            error: error.message
        });
    }
};

// Controller to handle GET /favorites/:category
const getFavoritesByCategory = async (req, res) => {
    try {
        // Extract category, limit, and offset from request
        const { category } = req.params;
        const limit = parseInt(req.query.limit) || 5;
        const offset = parseInt(req.query.offset) || 0;

        // Validate the category
        if (!category || !['artist', 'album', 'track'].includes(category)) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request: Invalid or missing category.",
                error: "Invalid category"
            });
        }

        // Fetch favorites from the database
        const favorites = await Favorites.find({ category })
            .skip(offset)
            .limit(limit)
            .lean();

        // If no favorites found
        if (!favorites || favorites.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No favorites found for the specified category.",
                error: "No data"
            });
        }

        // Respond with the fetched favorites
        res.status(200).json({
            status: 200,
            data: favorites,
            message: "Favorites retrieved successfully.",
            error: null
        });
    } catch (error) {
        console.error("Error retrieving favorites by category:", error);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error.",
            error: error.message
        });
    }
};

// Controller to handle DELETE /favorites/remove-favorite/:id
const removeFavoriteById = async (req, res) => {
    try {
        // Extract favorite ID from the request parameters
        const { id } = req.params;

        // Validate the favorite ID
        if (!id) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request: Favorite ID is required.",
                error: "Missing favorite ID"
            });
        }

        // Find and delete the favorite
        const deletedFavorite = await Favorite.findOneAndDelete({ favorite_id: id }).lean();

        // If favorite not found
        if (!deletedFavorite) {
            return res.status(404).json({
                status: 404,
                message: "Favorite not found.",
                error: "Invalid favorite ID"
            });
        }

        // Respond with success
        res.status(200).json({
            status: 200,
            data: null,
            message: "Favorite removed successfully.",
            error: null
        });
    } catch (error) {
        console.error("Error removing favorite by ID:", error);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error.",
            error: error.message
        });
    }
};


module.exports = { addFavorite, getFavoritesByCategory, removeFavoriteById };
