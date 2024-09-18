import mongoose from "mongoose";
import Movie from "../models/Movie.js";

const getMovieActors = async (req, res) => {
  try {
    const {movieId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(movieId)){
        return res.status(400).json({ message: 'Invalid movie ID format' });
    }

    const movie = await Movie.findById(movieId)
      .populate('actors', 'name')
      .select('actors');
      
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json(movie.actors);
  } catch (error) {
    console.error('Error fetching actors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default getMovieActors;