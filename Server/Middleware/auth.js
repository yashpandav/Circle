const JWT = require("jsonwebtoken");
const User = require('../Models/User');
const Class = require('../Models/Class');
require("dotenv").config();

exports.auth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.header("Authorization").replace("Bearer ", "") || req.body.token;

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
        res.status(400).json({
            success: false,
            message: err.message,
            data: "Error during auth"
        });
    }
};