import Director from "../models/Director.js";
import { StatusCodes } from "http-status-codes";

//GET - all
const getAllDirectors = async (req, res) =>{
    try {
        const directors = await Director.find();
        res.status(StatusCodes.OK).json(directors);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};
//GET - one using ID
const getDirectorById = async (req, res) => {
    try {
        const director = await Director.findById(req.params.id);
        if(!director){
            return res.status(StatusCodes.NOT_FOUND).json({message: "Director not found!"});
        }
        res.status(StatusCodes.OK).json(director);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};
// Controller method to find director by name
const findDirectorByName = async (req, res) => {
    const { name } = req.query;
    try {
        const directors = await Director.find({ name: new RegExp(name, 'i') });
        res.status(200).json(directors);
    } catch (error) {
        res.status(500).json({ error: "Error searching for directors." });
    }
};
//POST - create a new instance in db
const createDirector = async (req, res) => {
    const { name, bio, birthdate, nationality, awards } = req.body;
    const director = new Director({ name, bio, birthdate, nationality, awards });
    try {
        const newDirector = await director.save();
        res.status(StatusCodes.CREATED).json(newDirector);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "The server encountered an error and could not complete your request." });
    }
};
//PUT - update or create if the ID doesnot exist
const updateDirector = async (req, res) => {
    try {
        const updatedDirector = await Director.findByIdAndUpdate(req.params.id, {...req.body, lastModified: Date.now()}, {new: true});
        if(updatedDirector){
            return res.status(StatusCodes.OK).json(updatedDirector);
        }
        const newDirector = new Director(req.body);
        await newDirector.save();
        res.status(StatusCodes.CREATED).json(newDirector);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};
//DELETE - delete using ID
const deleteDirector = async (req, res) => {
    try {
        const deletedDirector = await Director.findByIdAndDelete(req.params.id);
        if(!deletedDirector){
            return res.status(StatusCodes.NOT_FOUND).json({message: "Director not found!"});
        }
        res.status(StatusCodes.OK).json({message: "Director deleted successfully!", data: deletedDirector});
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};

//Export all functions
export {getAllDirectors, getDirectorById, findDirectorByName, createDirector, updateDirector, deleteDirector};