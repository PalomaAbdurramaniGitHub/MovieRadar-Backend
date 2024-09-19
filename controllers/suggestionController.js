import Suggestion from "../models/Suggestion.js";
import { StatusCodes } from "http-status-codes";

//GET - all
const getAllSuggestions = async (req, res) =>{
    try {
        const suggestions = await Suggestion.find();
        res.status(StatusCodes.OK).json(suggestions);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};
// GET - all suggestions for a user by userId
const getSuggestionById = async (req, res) => {
    const { userId } = req.query;
    try {
        const suggestions = await Suggestion.find({ userId })
            .populate('movieId', 'poster title year duration rating')
            .exec();

        res.status(StatusCodes.OK).json(suggestions);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'An error occurred while fetching suggestions.' });
    }
};

// POST - create a new suggestion
const createSuggestion = async (req, res) => {
    const suggestion = new Suggestion(req.body);
    try {
        const newSuggestion = await suggestion.save();
        res.status(StatusCodes.CREATED).json(newSuggestion);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "The server encountered an error and could not complete your request." });
    }
};
//PUT - update or create if the ID doesnot exist
const updateSuggestion = async (req, res) => {
    try {
        const updatedSuggestion = await Suggestion.findByIdAndUpdate(req.params.id, {...req.body, lastModified: Date.now()}, {new: true});
        if(updatedSuggestion){
            return res.status(StatusCodes.OK).json(updatedSuggestion);
        }
        const newSuggestion = new Suggestion(req.body);
        await newSuggestion.save();
        res.status(StatusCodes.CREATED).json(newSuggestion);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};
//DELETE - delete using ID
const deleteSuggestion = async (req, res) => {
    try {
        const deletedSuggestion = await Suggestion.findByIdAndDelete(req.params.id);
        if(!deletedSuggestion){
            return res.status(StatusCodes.NOT_FOUND).json({message: "Suggestion not found!"});
        }
        res.status(StatusCodes.OK).json({message: "Suggestion deleted successfully!", data: deletedSuggestion});
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};

//Export all functions
export {getAllSuggestions, getSuggestionById, createSuggestion, updateSuggestion, deleteSuggestion};