import Movie from "../models/Movie.js";

async function filterMoviesByGenreAndContent({genres, contentAdvisory}){
    try{
        const query = {};
        if(genres && genres.length > 0){
            query.genres = {$in: genres};
        }

        if(contentAdvisory){
            Object.keys(contentAdvisory).forEach(key => {
                if(contentAdvisory[key] === true){
                    query[`contentAdvisory.${key}`] = true;
                }
            });
        }

        const movies = await Movie.find(query);
        return movies;
    }catch(error){
        console.log("Error filtering movies: ", error);
        throw error;
    }
}

export default filterMoviesByGenreAndContent;