import Actor from "../models/Actor.js";
import { StatusCodes } from "http-status-codes";

//GET - all
const getAllActors = async (req, res) =>{
    try {
        const actors = await Actor.find();
        res.status(StatusCodes.OK).json(actors);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};
//GET - one using ID
const getActorById = async (req, res) => {
    try {
        const actor = await Actor.findById(req.params.id);
        if(!actor){
            return res.status(StatusCodes.NOT_FOUND).json({message: "Actor not found!"});
        }
        res.status(StatusCodes.OK).json(actor);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};
// Controller method to find actor by name
const findActorByName = async (req, res) => {
    const { name } = req.query;
    try {
        const actors = await Actor.find({ name: new RegExp(name, 'i') });
        res.status(200).json(actors);
    } catch (error) {
        res.status(500).json({ error: "Error searching for actors" });
    }
};
//POST - create a new instance in db
const createActor = async (req, res) => {
    const { name, bio, birthdate, nationality, awards } = req.body;
    const actor = new Actor({ name, bio, birthdate, nationality, awards });
    try {
        const newActor = await actor.save();
        res.status(StatusCodes.CREATED).json(newActor);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "The server encountered an error and could not complete your request." });
    }
};
//PUT - update or create if the ID doesnot exist
const updateActor = async (req, res) => {
    try {
        const updatedActor = await Actor.findByIdAndUpdate(req.params.id, {...req.body, lastModified: Date.now()}, {new: true});
        if(updatedActor){
            return res.status(StatusCodes.OK).json(updatedActor);
        }
        const newActor = new Actor(req.body);
        await newActor.save();
        res.status(StatusCodes.CREATED).json(newActor);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};
//DELETE - delete using ID
const deleteActor = async (req, res) => {
    try {
        const deletedActor = await Actor.findByIdAndDelete(req.params.id);
        if(!deletedActor){
            return res.status(StatusCodes.NOT_FOUND).json({message: "Actor not found!"});
        }
        res.status(StatusCodes.OK).json({message: "Actor deleted successfully!", data: deletedActor});
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};

//Export all functions
export {getAllActors, getActorById, findActorByName, createActor, updateActor, deleteActor};