import User from "../models/User.js";
import Movie from "../models/Movie.js";
import Suggestion from "../models/Suggestion.js";
import { StatusCodes } from "http-status-codes";

const buildRegexConditions = (preferences) => {
    return preferences.map(pref => new RegExp(`\\b${pref}\\b`, 'i'));
};

async function generateSuggestions(req, res) {
    const { userId } = req.body;
    if (!userId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "User ID is required." });
    }

    try {
        const user = await User.findById(userId).exec();
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "User not found." });
        }

        const userPreferences = {
            genres: user.preferences.genres ? user.preferences.genres[0].split(',').map(g => g.trim()) : [],
            themes: user.preferences.themes ? user.preferences.themes[0].split(',').map(t => t.trim()) : [],
            languages: user.preferences.languages ? user.preferences.languages[0].split(',').map(l => l.trim()) : [],
            countriesOfOrigin: user.preferences.countriesOfOrigin ? user.preferences.countriesOfOrigin[0].split(',').map(c => c.trim()) : [],
            minRating: user.preferences.minRating
        };

        const existingSuggestions = await Suggestion.find({ userId }).select("movieId").exec();
        const suggestedMovieIDs = new Set(existingSuggestions.map(suggestion => suggestion.movieId.toString()));

        // Create the query for movies based on preferences
        const queryConditions = [];
        if (userPreferences.genres.length > 0) {
            queryConditions.push({ genres: { $in: buildRegexConditions(userPreferences.genres) } });
        }
        if (userPreferences.themes.length > 0) {
            queryConditions.push({ themes: { $in: buildRegexConditions(userPreferences.themes) } });
        }
        if (userPreferences.languages.length > 0) {
            queryConditions.push({ languages: { $in: buildRegexConditions(userPreferences.languages) } });
        }
        if (userPreferences.countriesOfOrigin.length > 0) {
            queryConditions.push({ countriesOfOrigin: { $in: buildRegexConditions(userPreferences.countriesOfOrigin) } });
        }

        let movies = [];
        if (queryConditions.length > 0) {
            movies = await Movie.find({
                $or: queryConditions
            }).exec();
        } else {
            movies = await Movie.aggregate([{ $sample: { size: 20 } }]).exec();
        }

        movies = movies.filter(movie => !suggestedMovieIDs.has(movie._id.toString()));

        const suggestions = movies.map(movie => {
            let relevanceScore = 0;
            let matchedPreferences = [];

            // Check and match preferences
            const checkAndAddMatch = (field, preferenceArray) => {
                const movieFieldArray = Array.isArray(movie[field]) ? movie[field] : (movie[field] || '').split(',').map(item => item.trim());
                const matches = movieFieldArray.filter(item => preferenceArray.includes(item));
                if (matches.length > 0) {
                    relevanceScore += matches.length;
                    matchedPreferences.push(...matches);
                }
            };

            checkAndAddMatch('genres', userPreferences.genres);
            checkAndAddMatch('themes', userPreferences.themes);
            checkAndAddMatch('languages', userPreferences.languages);
            checkAndAddMatch('countriesOfOrigin', userPreferences.countriesOfOrigin);

            if (userPreferences.minRating !== undefined && movie.rating >= userPreferences.minRating) {
                relevanceScore++;
                matchedPreferences.push(movie.rating);
            }

            const { age } = user;
            const ageRestriction = movie.ageRestriction || 0;
            if (age < ageRestriction) return null;

            // Build suggestion data
            const suggestedBecause = matchedPreferences.length > 0
                ? `Suggested because your preferences contain: ${matchedPreferences.join(", ")}`
                : "Suggested randomly";

            // Determine relevance text based on score
            let relevanceText = "Minimally Relevant";
            if (relevanceScore > 3) relevanceText = "Slightly Relevant";
            if (relevanceScore > 6) relevanceText = "Moderately Relevant";
            if (relevanceScore > 9) relevanceText = "Very Relevant";
            if (relevanceScore > 12) relevanceText = "Highly Relevant";

            return new Suggestion({
                userId: userId,
                movieId: movie._id,
                suggestedBecause,
                relevance: relevanceText,
                status: "no-response",
            });
        }).filter(Boolean);

        // Insert suggestions into the database
        if (suggestions.length > 0) {
            await Suggestion.insertMany(suggestions);
            console.log("Suggestions inserted into the database.");
        } else {
            console.log("No suggestions to insert.");
        }

        res.status(StatusCodes.OK).json({ message: "Suggestions generated successfully." });

    } catch (error) {
        console.error("Error generating suggestions:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while generating suggestions." });
    }
}

export default generateSuggestions;