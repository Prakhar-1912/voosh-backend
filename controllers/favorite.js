// Import necessary models
const Favorite = require('../models/favorites');
const User = require('../models/User');

// Controller to handle POST /favorites/add-favorite
const addFavorite = async (req, res) => {
    try {
        const { category, item_id } = req.body;

        // Validate category
        if (!['artist', 'album', 'track'].includes(category)) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: null,
                error: "Invalid category. Must be artist, album, or track."
            });
        }

        // Create new favorite
        const favorite = new Favorite({
            user: req.user.userId,
            category,
            item_id
        });

        await favorite.save();

        // Add favorite reference to user
        const user = await User.findById({_id: req.user.userId});
        console.log("user", user);

        user.favorites.push(favorite._id);
        await user.save();
        

        return res.status(201).json({
            status: 201,
            data: null,
            message: "Favorite added successfully.",
            error: null
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: null,
                error: "Item is already in favorites."
            });
        }

        return res.status(500).json({
            status: 500,
            data: null,
            message: null,
            error: "Internal server error."
        });
    }
};

// Controller to handle GET /favorites/:category
const getFavoritesByCategory = async (req, res) => {
    try {
        const category  = req.params.category;
        const limit = parseInt(req.query.limit) || 5;
        const offset = parseInt(req.query.offset) || 0;

        // Validate category
        if (!['artist', 'album', 'track'].includes(category)) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: null,
                error: "Invalid category. Must be artist, album, or track."
            });
        }

        console.log(req.user, category)

        const favorites = await Favorite.find({
            user: req.user.userId,
            category: category
        })
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 });

        

        console.log('favorites', favorites)

        return res.status(200).json({
            status: 200,
            data: null,
            message: "Favorites retrieved successfully.",
            error: null
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            data: null,
            message: null,
            error: "Internal server error."
        });
    }
};

// Controller to handle DELETE /favorites/remove-favorite/:id
const removeFavoriteById = async (req, res) => {
    try {
        const id  = req.params.id;

        const favorite = await Favorite.findOne({
            _id: id
        });

        if (!favorite) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: null,
                error: "Favorite not found."
            });
        }

        // Remove favorite
        await Favorite.findByIdAndDelete(id);

        // Remove favorite reference from user
        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { favorites: id } }
        );

        return res.status(200).json({
            status: 200,
            data: null,
            message: "Favorite removed successfully.",
            error: null
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            data: null,
            message: null,
            error: "Internal server error."
        });
    }
};


module.exports = { addFavorite, getFavoritesByCategory, removeFavoriteById };
