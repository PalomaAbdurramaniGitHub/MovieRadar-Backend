import mongoose from "mongoose";
import moment from "moment";

const directorSchema = new mongoose.Schema({
    name: {type: String, required: true},
    bio: {
        type: String,
        maxlength: [500, "Biography must be 500 characters of fewer."]
    }, 
    birthdate: {
        type: Date,
        validate: {
            validator: function(value){
                return value < Date.now();
            },
            message: props => `${props.value} is not a vaild birthdate!`
        }
    },
    nationality: [String],
    awards: [{
        awardName: String,
        year: {
            type: Number,
            validate: {
                validator: function(value){
                    const currentYear = moment().year();
                    return Number.isInteger(value) && value >= 0 && value <= currentYear;
                },
                message: props => `${props.value} is not a valid year.`
            }
        }
    }],
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
    createdAt: {type: Date, default: Date.now},
    lastModified: {type: Date, default: Date.now}
});

directorSchema.statics.findByName = async function (name) {
    try {
        return await this.findOne({ name });
    } catch (error) {
        console.error("An error occurred while finding directors by name: ", error.message);
        throw error;
    }
};

directorSchema.pre("save", function(next){
    this.lastModified = Date.now();
    next();
});

directorSchema.post("findOneAndDelete", async function(doc){
    try{
        await mongoose.model("Movie").updateMany(
            {directors: doc._id},
            {$pull: {directors: doc._id}}
        );
    } catch (error) {
        console.error("An error occurred: ", error.message);
    }
});

const Director = mongoose.model("Director", directorSchema);
export default Director;                                 