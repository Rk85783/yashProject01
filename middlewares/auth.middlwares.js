import { findUser } from "../services/auth.service.js";
import { verifyToken } from "../services/jwt.service.js";

export const authenticate = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token not provided"
            });
        }

        token = token.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        const { id, email, role } = verifyToken(token);
        
        const findOptions = {
            attributes: {
                exclude: ["password", "emailOtp"]
            },
            where: {
                id,
                email,
                role
            },
            raw: true
            
        };
        const user = await findUser(findOptions);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }    
};

export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You do not have access to this resource"
            });
        }
        next();
    };
};