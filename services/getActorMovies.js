import mongoose from "mongoose";
import Actor from "../models/Actor.js";

const getActorMovies = async (req, res) => {
  try {
    const {actorId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(actorId)){
        return res.status(400).json({ message: 'Invalid actor ID format' });
    }

    const actor = await Actor.findById(actorId)
      .populate('movies', 'title')
      .select('movies');
      
    if (!actor) {
      return res.status(404).json({ message: 'Actor not found' });
    }

    res.json(actor.movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default getActorMovies;