import mongoose from "mongoose";
import moment from "moment";

const movieSchema = new mongoose.Schema({
    title: {type: String, required: true},
    year: {
        type: Number,
        validate: {
            validator: function(value){
                const currentYear = moment().year();
                return Number.isInteger(value) && value >= 0 && value <= currentYear;
            },
            message: props => `${props.value} is not a valid year.`
        }
    },
    directors: [{type: mongoose.Schema.Types.ObjectId, ref: "Director"}],
    actors: [{type: mongoose.Schema.Types.ObjectId, ref: "Actor"}],
    languages: [String],
    countriesOfOrigin: [String],
    ageRestriction: {
        type: Number,
        validate: {
            validator: function(value){
                return Number.isInteger(value) && value > 0 && value <= 21;
            },
            message: props => `${props.value} is not a valid age.`
        }
    },
    contentAdvisory: {
        violence: {type: Boolean, default: false},
        vulgarLanguage: {type: Boolean, default: false},
        sexualContent: {type: Boolean, default: false},
        drugUse: {type: Boolean, default: false}
    },
    rating: {
        type: Number,
        validate: {
            validator: function(value){
                return value >= 0 && value <= 10;
            },
            message: props => `${props.value} is not a valid rating.`
        }
    },
    genres: [String],
    themes: [String],
    duration: {
        type: String,
        validate: {
            validator: function(value){
                return /^(\d{1,2}h \d{1,2}m|\d{1,2}h)|\d{1,2,3}m$/.test(value);
            },
            message: props => `${props.value} is not a valid duration form.`
        }
    },
    plot: {type: String},
    availableOn: [String],
    poster: {
        type: String,
        default: null
    },
    createdAt: {type: Date, default: Date.now},
    lastModified: {type: Date, default: Date.now}
});

movieSchema.pre("save", function(next){
    this.lastModified = Date.now();
    next();
});

movieSchema.pre("findOneAndDelete", async function (next) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const doc = await this.model.findOne(this.getFilter()).session(session);

        if (!doc) {
            throw new Error("Movie not found");
        }

        await mongoose.model("Actor").updateMany(
            { movies: doc._id },
            { $pull: { movies: doc._id } },
            { session }
        );

        await mongoose.model("Director").updateMany(
            { movies: doc._id },
            { $pull: { movies: doc._id } },
            { session }
        );

        await mongoose.model("Review").deleteMany(
            { movieId: doc._id },
            { session }
        );

        await mongoose.model("Suggestion").deleteMany(
            { movieId: doc._id },
            { session }
        );

        await session.commitTransaction();
        session.endSession();
        next();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("An error occurred: ", error.message);
        next(error);
    }
});


const Movie = mongoose.model('Movie', movieSchema);
export default Movie;