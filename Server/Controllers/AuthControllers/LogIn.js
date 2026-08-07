const User = require('../../Models/User');
const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

exports.LogIn = async (req, res, next) => {
    try {
        const normalizedEmail = email ? email.toLowerCase().trim() : '';

        if (!normalizedEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "Please Enter Email and Password"
            });
        }

        let findUser = await User.findOne({ email: normalizedEmail });

        if (!findUser) {
            return res.status(400).json({
                success: false,
                message: "User Not Found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, findUser.password);
        if (!isPasswordCorrect) {
            return res.status(403).json({
                success: false,
                message: "Incorrect Password"
            });
        }

        const token = JWT.sign(
            {
                id: findUser.id,
                email: findUser.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h" // 1 day session expiry
            }
        );

        const options = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day cookie expiry
            httpOnly: true,   // JS cannot access the cookie
            secure: process.env.NODE_ENV === 'production', // HTTPS-only in prod
            sameSite: 'lax',
            path: '/',
        };

        findUser.password = undefined;

        res.cookie("token", token, options).status(200).json({
            success: true,
            token,
            data : findUser,
            message: "Logged In Successfully",
        });

    } catch (err) {
        next(err);
    }
};
