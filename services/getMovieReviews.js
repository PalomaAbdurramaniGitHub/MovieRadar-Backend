import mongoose from 'mongoose';
import Review from '../models/Review.js';

const getMovieReviews = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: 'Invalid movie ID format' });
    }

    const reviews = await Review.find({ movieId });
    if (!reviews) {
      return res.status(404).json({ message: 'No reviews found for this movie' });
    }

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default getMovieReviews;