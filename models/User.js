import mongoose from "mongoose";
import bcrypt from "bcrypt";
import moment from "moment";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(value){
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
            },
            message: props => `${props.value} is not a valid email address.`
        }
    },
    password: {
        type: String, 
        required: true,
        minlength: [5, "Password must be at least 5 characters long"]
    },
    profilePhoto: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        maxlength: [200, "Biography must be 200 characters of fewer."],
        default: null
    },
    birthdate: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                const dateNow = moment();
                const hundredYearsAgo = dateNow.subtract(100, 'years');
                return value < Date.now() && value > hundredYearsAgo;
            },
            message: props => `Birthdate must be less than 100 years ago and in the past.`
        }
    },
    age: {type: Number},
    gender: {
        type: String,
        enum: ["Male","Female","Not-defined",""],
        default: "Not-defined"
    },
    location: {type: String},
    themePreferences: {
        type: String,
        enum: ["Light","Dark","Default",""],
        default: "Default"
    },
    emotionalState: {
        type: String,
        enum: ["happy","sad","anxious","excited","nostalgic","romantic","curious","relaxed","angry","adventurous","inspired",""],
        default: null
    },
    preferences: {
        genres: [String],
        themes: [String],
        languages: [String],
        countriesOfOrigin: [String],
        minRating: {
            type: Number,
            validate: {
                validator: function(value){
                    return value >= 1 && value <= 10;
                },
                message: props => `${props.value} is not a valid rating.`
            }
        }
    },
    isAdmin: {type: Boolean},
    isVerified: { type: Boolean, default: false },
    verificationCode: String,
    keepMeLogged: {type: Boolean},
    createdAt: {type: Date, default: Date.now},
    lastModified: {type: Date, default: Date.now},
    lastLogIn: {type: Date, default: Date.now},
    passwordChangedAt: {type: Date}
});

userSchema.pre("save", async function(next){
    this.lastModified = Date.now();
    if(this.isModified("password") || this.isNew){
        try{
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }catch(error){
            return next(error);
        }
    }
    if(this.birthdate){
        const today = moment();
        const birthdate = moment(this.birthdate);
        this.age = today.diff(birthdate, 'years');
    }
    next();
});

userSchema.methods.comparePassword = async function (userPassword){
    return bcrypt.compare(userPassword, this.password);
};

userSchema.post("findOneAndDelete", async function(doc){
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        await mongoose.model("Review").deleteMany(
            {userId: doc._id},
            {session}
        );
        await mongoose.model("Suggestion").deleteMany(
            {userId: doc._id},
            {session}
        );

        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("An error occurred: ", error.message);
    }
});

const User = mongoose.model('User', userSchema);
export default User;