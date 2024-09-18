import mongoose from "mongoose";

const suggestionSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    movieId: {type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true},
    suggestedBecause: {type: String},
    relevance: {type: String},
    status: {
        type: String,
        enum: ["accepted", "dismissed", "no-response"],
        default: "no-response"
    },
    createdAt: {type: Date, default: Date.now},
    lastModified: {type: Date, default: Date.now}
});

suggestionSchema.pre("save", function(next){
    this.lastModified = Date.now();
    next();
});

const Suggestion = mongoose.model("Suggestion", suggestionSchema);
export default Suggestion;