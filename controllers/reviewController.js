import mongoose from "mongoose";
import Review from "../models/Review.js";
import { StatusCodes } from "http-status-codes";

//GET - all
const getAllReviews = async (req, res) =>{
    try {
        const reviews = await Review.find();
        res.status(StatusCodes.OK).json(reviews);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};
//GET - one using ID
const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if(!review){
            return res.status(StatusCodes.NOT_FOUND).json({message: "Review not found!"});
        }
        res.status(StatusCodes.OK).json(review);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};
//POST - create a new instance in db
const createReview = async (req, res) => {
    const review = new Review(req.body);
    try {
      const newReview = await review.save();
      if (!newReview) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Failed to create review" });
      }
  
      res.status(StatusCodes.CREATED).json(newReview);
    } catch (error) {
      console.error('Error creating review:', error.message);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "The server encountered an error and could not complete your request." });
    }
};
  
//PUT - update or create if the ID doesnot exist
const updateReview = async (req, res) => {
    try {
        const updatedReview = await Review.findByIdAndUpdate(req.params.id, {...req.body, lastModified: Date.now()}, {new: true});
        if(updatedReview){
            return res.status(StatusCodes.OK).json(updatedReview);
        }
        const newReview = new Review(req.body);
        await newReview.save();
        res.status(StatusCodes.CREATED).json(newReview);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};
//DELETE - delete using ID
const deleteReview = async (req, res) => {
    try {
        const deletedReview = await Review.findByIdAndDelete(req.params.id);
        if(!deletedReview){
            return res.status(StatusCodes.NOT_FOUND).json({message: "Review not found!"});
        }
        res.status(StatusCodes.OK).json({message: "Review deleted successfully!", data: deletedReview});
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};

//Export all functions
export {getAllReviews, getReviewById, createReview, updateReview, deleteReview};