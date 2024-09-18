import Movie from "../models/Movie.js";
import filterMoviesByGenreAndContent from "../middleware/movieRecommendations.js";
import { StatusCodes } from "http-status-codes";

//GET - all
const getAllMovies = async (req, res) =>{
    try {
        const movies = await Movie.find();
        res.status(StatusCodes.OK).json(movies);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};
//GET - one using ID
const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if(!movie){
            return res.status(StatusCodes.NOT_FOUND).json({message: "Movie not found!"});
        }
        res.status(StatusCodes.OK).json(movie);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};
// Controller method to find movie by title
const findMovieByTitle = async (req, res) => {
    const { title } = req.query;
    try {
        const movies = await Movie.find({ title: new RegExp(title, 'i') });
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ error: "Error searching for movies" });
    }
};
//POST - create a new instance in db
const createMovie = async (req, res) => {
    try {
        let posterPath;
        if(req.file){
            posterPath = `uploads/${req.file.filename}`
        }

        const movieData = {
            ...req.body,
            ...(posterPath && {poster: posterPath})
        };

        const movie = new Movie(movieData);
        const newMovie = await movie.save();
        res.status(StatusCodes.CREATED).json(newMovie);
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};
//PUT - update or create if the ID doesnot exist
const updateMovie = async (req, res) => {
    try {
        let posterPath;
        if(req.file){
            posterPath = `uploads/${req.file.filename}`;
        }

        const { _id, ...updateData } = req.body;

        if(posterPath){
            updateData.poster = posterPath;
        }
        updateData.lastModified = Date.now();

        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, updateData, {new: true, runValidators: true});
        if(updatedMovie){
            return res.status(StatusCodes.OK).json(updatedMovie);
        }else{
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Movie not found" });
        }
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};
//DELETE - delete using ID
const deleteMovie = async (req, res) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        if(!deletedMovie){
            return res.status(StatusCodes.NOT_FOUND).json({message: "Movie not found!"});
        }
        res.status(StatusCodes.OK).json({message: "Movie deleted successfully!", data: deletedMovie});
    } catch (error) {
        console.error("An error occurred: ", error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
};
// get filtered movies
async function getFilteredMovies(req, res){
    const {genres, violence, vulgarLanguage, sexualContent, drugUse} = req.query;

    const genresArray = genres ? genres.split(',') : [];
    const contentAdvisory = {
        violence: violence === "true",
        vulgarLanguage: vulgarLanguage === "true",
        sexualContent: sexualContent === "true",
        drugUse: drugUse === "true"
    };
    
    try{
        const movies = await filterMoviesByGenreAndContent({genres: genresArray, contentAdvisory});
        
        res.status(StatusCodes.OK).json(movies);
    }catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "The server encountered an error and could not complete your request."});
    }
}

//Export all functions
export {getAllMovies, getMovieById, findMovieByTitle, createMovie, updateMovie, deleteMovie, getFilteredMovies};