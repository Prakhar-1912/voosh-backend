const Artist = require('../models/artist')

exports.getArtists = async (req, res) => {
  try {
      const limit = parseInt(req.query.limit) || 5;
      const offset = parseInt(req.query.offset) || 0;
      
      const filter = {};

      if (req.query.grammy) {
          filter.grammy = parseInt(req.query.grammy);
      }
      
      if (req.query.hidden) {
          filter.hidden = req.query.hidden === 'true';
      }

      const artists = await Artist.find(filter)
          .select('artist_id name grammy hidden')
          .limit(limit)
          .skip(offset);
  
      return res.status(200).json({
          status: 200,
          data: artists,
          message: 'Artists retrieved successfully.',
          error: null
      });
  
  } catch (error) {
      console.error('Error fetching artists:', error);
      return res.status(500).json({
          status: 500,
          data: null,
          message: 'Internal server error while fetching artists',
          error: 'Internal server error'
      });
  }
};

exports.getArtistById = async (req, res) => {
    try {
      const artistId = req.params.id;
      
      const artist = await Artist.findById({ _id: artistId });
  
      if (!artist) {
        return res.status(404).json({
          status: 404,
          data: null,
          message: 'Artist not found',
          error: 'Artist with the provided ID does not exist'
        });
      }
  
      return res.status(200).json({
        status: 200,
        data: {
            artist_id: artist._id,
            name: artist.name,
            grammy: artist.grammy,
            hidden: artist.hidden,
        },
        message: 'Artist retrieved successfully.',
        error: null
      });
  
    } 
    catch (error) {
      console.error('Error fetching artist:', error);
      return res.status(500).json({
        status: 500,
        data: null,
        message: 'Internal server error while fetching artist',
        error: 'Internal server error'
      });
    }
};

exports.addArtist = async (req, res) => {
    try {
      const { name, grammy, hidden } = req.body;
      console.log(name, grammy, hidden);
      if(!name || grammy === undefined || hidden === undefined){
        return res.status(400).json({
            status: 400,
            data: null,
            message: 'Bad Request, missing field',
            error: null
        })
      }

      const artist = new Artist({
        name,
        grammy,
        hidden
      });

      await artist.save();

      return res.status(201).json({
        status: 201,
        data: {
          artist_id: artist._id,
          name: artist.name,
          grammy: artist.grammy,
          hidden: artist.hidden
        },
        message: 'Artist created successfully.',
        error: null
      });

    } catch (error) {
      console.error('Error in addArtist:', error);
      return res.status(400).json({
        status: 400,
        data: null,
        message: 'Failed to create artist',
        error: error.message
      });
    }
};

exports.updateArtist = async (req, res) => {
    try {
      const artistId  = req.params.id;
      const updateData = req.body;

      const artist = await Artist.findById({_id : artistId});

      if (!artist) {
        return res.status(404).json({
          status: 404,
          data: null,
          message: 'Artist not found',
          error: 'Not Found'
        });
      }

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          artist[key] = updateData[key];
        }
      });

      await artist.save();

      return res.status(204).send();

    } catch (error) {
      console.error('Error in updateArtist:', error);
      return res.status(400).json({
        status: 400,
        data: null,
        message: 'Failed to update artist',
        error: error.message
      });
    }
};

exports.deleteArtist = async (req, res) => {
  try {
    const artistId  = req.params.id;
  
    const artist = await Artist.findById({_id : artistId});
    
    if (!artist) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: 'Artist not found',
        error: 'Not Found'
      });
    }

    await artist.deleteOne();

    return res.status(200).json({
      status: 200,
      data: {
        artist_id: artistId
      },
      message: `Artist:${artist.name} deleted successfully.`,
      error: null
    });

  } catch (error) {
    console.error('Error in deleteArtist:', error);
    return res.status(400).json({
      status: 400,
      data: null,
      message: 'Failed to delete artist',
      error: error.message
    });
  }
};
