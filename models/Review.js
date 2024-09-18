import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    movieId: {type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true},
    rating: {
        type: Number,
        required: true,
        validate: {
            validator: function(value){
                return Number.isInteger(value) && value >= 1 && value <= 10;
            },
            message: "Rating should be a full number between 1 to 10."
        }
    },
    comment: {
        type: String, 
        maxlength: [300, "Comment must be at most 300 characters long."]
    },
    status: {
        type: String,
        enum: ["active","deleted"],
        default: "active"
    },
    createdAt: {type: Date, default: Date.now},
    lastModified: {type: Date, default: Date.now}
});

reviewSchema.pre("save", function(next){
    this.lastModified = Date.now();
    next();
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;