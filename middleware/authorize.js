import { StatusCodes } from "http-status-codes";

const authorizeAdmin = () => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized access. Please log in." });
        }
        
        if (!req.user.isAdmin) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden. You do not have permission to access this resource." });
        }
        
        next();
    };
};

export default authorizeAdmin;