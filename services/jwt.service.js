import jwt from "jsonwebtoken";

export const generateAccessToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY_TIME }
    );
};

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);