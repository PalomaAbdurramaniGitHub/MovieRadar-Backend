import moment from "moment";
import { StatusCodes } from "http-status-codes";

function checkAgeForRegistration(req, res, next) {
    if (!req.body.birthdate) {
        return res.status(StatusCodes.BAD_REQUEST).json("Birthdate is required.");
    }

    const today = moment();
    const birthdate = moment(req.body.birthdate);

    if (!birthdate.isValid()) {
        return res.status(StatusCodes.BAD_REQUEST).json("Invalid birthdate format.");
    }

    const age = today.diff(birthdate, 'years');
    if (age < 8) {
        return res.status(StatusCodes.BAD_REQUEST).json("You should be older than 8 years old to create an account!");
    }

    next();
}

export default checkAgeForRegistration;