import mongoose from "mongoose";
import moment from "moment";

const actorSchema = new mongoose.Schema({
    name: {type: String, required: true},
    bio: {
        type: String,
        maxlength: [500, "Biography must be 500 characters of fewer."]
    },
    birthdate: {
        type: Date,
        required: true,
        validate: {
            validator: function(value){
                return value < Date.now();
            },
            message: props => `${props.value} is not a vaild birthdate!`
        }
    },
    nationality: [String],
    awards: [{
        awardName: {type: String},
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

actorSchema.pre("save", function(next){
    this.lastModified = Date.now();
    next();
});

actorSchema.statics.findByName = async function (name) {
    try {
        return await this.findOne({ name });
    } catch (error) {
        console.error("An error occurred while finding actor by name: ", error.message);
        throw error;
    }
};

actorSchema.post("findOneAndDelete", async function(doc){
    try{
        await mongoose.model("Movie").updateMany(
            {actors: doc._id},
            {$pull: {actors: doc._id}}
        );
    } catch (error) {
        console.error("An error occurred: ", error.message);
    }
});

const Actor = mongoose.model("Actor", actorSchema);
export default Actor;