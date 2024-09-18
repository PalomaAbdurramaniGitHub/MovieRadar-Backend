import mongoose from "mongoose";
import Movie from "../models/Movie.js";

const getMovieDirectors = async (req, res) => {
  try {
    const {movieId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(movieId)){
        return res.status(400).json({ message: 'Invalid movie ID format' });
    }

    const movie = await Movie.findById(movieId)
      .populate('directors', 'name')
      .select('directors');

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json(movie.directors);
  } catch (error) {
    console.error('Error fetching directors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default getMovieDirectors;