const JWT = require("jsonwebtoken");
const User = require('../Models/User');
const Class = require('../Models/Class');
require("dotenv").config();

exports.auth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Could Not Find Token",
            });
        }

        const verifyToken = JWT.verify(token, process.env.JWT_SECRET);

        req.user = verifyToken;

        next();
    } catch (err) {
        res.clearCookie("token", { path: '/' });

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                isExpired: true,
                message: "Session expired. Please login again.",
            });
        }

        return res.status(401).json({
            success: false,
            message: "Authentication failed. Invalid token.",
            error: err.message
        });
    }
};