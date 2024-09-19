import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import connectDB from "./config/configDB.js";
import actorRoutes from "./routes/actorRoutes.js";
import directorRoutes from "./routes/directorRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import suggestionRoutes from "./routes/suggestionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import getMovieDirectors from "./services/getMovieDirectors.js";
import getMovieActors from "./services/getMovieActors.js";
import getDirectorMovies from "./services/getDirectorMovies.js";
import getActorMovies from "./services/getActorMovies.js";
import getMovieReviews from "./services/getMovieReviews.js";
import getReviewAuthor from "./services/getReviewAuthor.js";
import authRoutes from "./routes/auth.js";
import contactRoute from "./routes/contactRoute.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import session from "express-session";

const app = express();

// set up session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,
            httpOnly: true
        }
    })  
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// connect db
connectDB();

// routing
app.use("/api/actors", actorRoutes);
app.use("/api/directors", directorRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/users", userRoutes);
app.use("/api", authRoutes);

app.get('/api/movies/:movieId/directors', getMovieDirectors);
app.get('/api/movies/:movieId/actors', getMovieActors);

app.get('/api/directors/:directorId/movies', getDirectorMovies);
app.get('/api/actors/:actorId/movies', getActorMovies);

app.get('/api/movies/:movieId/reviews', getMovieReviews);
app.get('/api/users/:reviewId/author', getReviewAuthor);

app.use("/api/contact", contactRoute);

// global error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// link to port
const port = process.env.PORT;
app.listen(port, (req, res)=>{
    console.log(`Listening on port ${port}`);
});