const Album = require('../models/album');

exports.getAlbums = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const offset = parseInt(req.query.offset) || 0;

        const filter = {};

        if (req.query.artist_id) {
            // Verify artist exists
            const artist = await Artist.findById(req.query.artist_id);
            if (!artist) {
                return res.status(404).json({
                    status: 404,
                    data: null,
                    message: 'Artist not found, not valid artist ID',
                    error: 'Not Found'
                });
            }
            filter.artist_id = req.query.artist_id;
        }

        if (req.query.hidden !== undefined) {
            filter.hidden = req.query.hidden === 'true';
        }

        // Join with Artist model to get artist_name
        const albums = await Album.findAll({
            where: filter,
            limit,
            offset,
            include: [{
                model: Artist,
                attributes: ['name'],
                as: 'artist'
            }],
            attributes: ['album_id', 'name', 'year', 'hidden']
        });

        // Format the response to match the specification
        const formattedAlbums = albums.map(album => ({
            album_id: album.album_id,
            artist_name: album.artist.name,
            name: album.name,
            year: album.year,
            hidden: album.hidden
        }));

        return res.status(200).json({
            status: 200,
            data: formattedAlbums,
            message: 'Albums retrieved successfully.',
            error: null
        });

    } catch (error) {
        console.error('Error fetching albums:', error);
        return res.status(500).json({
            status: 500,
            data: null,
            message: 'Internal server error while fetching albums',
            error: 'Internal server error'
        });
    }
};

exports.getAlbumById = async (req, res) => {
    try {
        const albumId = req.params.id;

        const album = await Album.findOne({
            where: { album_id: albumId },
            include: [{
                model: Artist,
                attributes: ['name'],
                as: 'artist'
            }]
        });

        if (!album) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Resource Doesn\'t Exist',
                error: 'Not Found'
            });
        }

        return res.status(200).json({
            status: 200,
            data: {
                album_id: album.album_id,
                artist_name: album.artist.name,
                name: album.name,
                year: album.year,
                hidden: album.hidden
            },
            message: 'Album retrieved successfully.',
            error: null
        });

    } catch (error) {
        console.error('Error fetching album:', error);
        return res.status(500).json({
            status: 500,
            data: null,
            message: 'Internal server error while fetching album',
            error: 'Internal server error'
        });
    }
};

exports.addAlbum = async (req, res) => {
    try {
        const { artist_id, name, year, hidden } = req.body;

        if (!artist_id || !name || !year === undefined || hidden === undefined) {
            return res.status(400).json({
                status: 400,
                data: null,
                message: 'Bad Request, missing required fields',
                error: 'Bad Request'
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

        // Create new album
        const album = new Album({
            artist_id,
            name,
            year,
            hidden
        });

        await album.save();

        return res.status(201).json({
            status: 201,
            data: null,
            message: 'Album created successfully.',
            error: null
        });

    } catch (error) {
        console.error('Error in addAlbum:', error);
        return res.status(400).json({
            status: 400,
            data: null,
            message: 'Failed to create album',
            error: error.message
        });
    }
};

exports.updateAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const album = await Album.findById(id);

        if (!album) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Resource Doesn\'t Exist',
                error: 'Not Found'
            });
        }

        // Update only provided fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                album[key] = updateData[key];
            }
        });

        await album.save();

        return res.status(204).send();

    } catch (error) {
        console.error('Error in updateAlbum:', error);
        return res.status(400).json({
            status: 400,
            data: null,
            message: 'Failed to update album',
            error: error.message
        });
    }
};

exports.deleteAlbum = async (req, res) => {
    try {
        const { id } = req.params;

        const album = await Album.findById(id);

        if (!album) {
            return res.status(404).json({
                status: 404,
                data: null,
                message: 'Resource Doesn\'t Exist',
                error: 'Not Found'
            });
        }

        await album.deleteOne();

        return res.status(200).json({
            status: 200,
            data: null,
            message: `Album:${album.name} deleted successfully.`,
            error: null
        });

    } catch (error) {
        console.error('Error in deleteAlbum:', error);
        return res.status(400).json({
            status: 400,
            data: null,
            message: 'Failed to delete album',
            error: error.message
        });
    }
};