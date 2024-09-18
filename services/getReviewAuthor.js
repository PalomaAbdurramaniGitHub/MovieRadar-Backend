import mongoose from "mongoose";
import User from "../models/User.js";
import Review from "../models/Review.js";

const getReviewAuthor = async (req, res) => {
    const {reviewId} = req.params;
    try {
        const review = await Review.findById(reviewId);
        if(!review){
            return res.status(400).json({ message: 'Review not found'});
        }

        const author = await User.findById(review.userId);
        if(!author){
            return res.status(400).json({ message: 'Author not found'});
        }

        //res.json({ name: author.name, email: author.email, profilePhoto: author.profilePhoto });
        res.json({name: author.name});
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export default getReviewAuthor;