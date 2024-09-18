import axios from 'axios';
import dotenv from 'dotenv';
import Movie from '../models/Movie.js';

dotenv.config();

const fetchAndSaveMovies = async () => {
  const options = {
    method: 'POST',
    url: process.env.BASE_URL,
    headers: {
      'x-rapidapi-key': process.env.API_KEY,
      'x-rapidapi-host': 'imdb188.p.rapidapi.com',
      'Content-Type': 'application/json'
    }
  };
  try {
    const response = await axios.request(options);
    const movies = response.data.data.list;

    for(const movie of movies) {
      const newTitle = movie.originalTitleText && movie.originalTitleText.text 
      ? movie.originalTitleText.text 
      : 'Unknown Title';

      const movieData = {
          title: newTitle,
          year: movie.year,
          languages: movie.languages,
          countriesOfOrigin: movie.countriesOfOrigin,
          ageRestriction: movie.ageRestriction,
          rating: movie.rating,
          genres: movie.genres,
          themes: movie.themes,
          duration: movie.duration,
          plot: movie.plot,
          availableOn: movie.availableOn,
          poster: movie.poster
      };
      await Movie.create(movieData);
    }

    console.log('Movies have been saved successfully.');
  }catch(error){
    console.error('Error fetching or saving movies:', error);
  }
};

export default fetchAndSaveMovies;