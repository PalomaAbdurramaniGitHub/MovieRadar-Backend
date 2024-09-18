import mongoose from "mongoose";
import Director from "../models/Director.js";

const getDirectorMovies = async (req, res) => {
  try {
    const {directorId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(directorId)){
        return res.status(400).json({ message: 'Invalid director ID format' });
    }

    const director = await Director.findById(directorId)
      .populate('movies', 'title')
      .select('movies');
      
    if (!director) {
      return res.status(404).json({ message: 'Director not found' });
    }

    res.json(director.movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default getDirectorMovies;