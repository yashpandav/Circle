const User = require('../../Models/User');
const JWT = require('jsonwebtoken');
const { sendMail } = require('../../Utils/mailSender');
const bcrypt = require('bcrypt');
require('dotenv').config();

exports.LogIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please Enter Email and Password"
            });
        }

        let findUser = await User.findOne({ email });

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
                expiresIn: "48h"
            }
        );

        findUser.token = token;
        await findUser.save(); //* Save the user with the new token

        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        };

        res.cookie("token", token, options).status(200).json({
            success: true,
            token,
            data : findUser,
            message: "Logged In Successfully",
        });

        try {
            await sendMail(
                findUser.email,
                "LogIn Successfully",
                `Hello ${findUser.firstName} ${findUser.lastName}, Your account has been logged in successfully`
            );
            console.log("Login mail sent successfully");
        } catch (mailError) {
            console.error("Login mail error:", mailError.message);
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Login Failed",
            error: err.message
        });
    }
};
