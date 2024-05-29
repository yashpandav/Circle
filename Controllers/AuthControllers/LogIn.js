const User = require('../../Models/User');
const JWT = require('jsonwebtoken');
const {sendMail} = require('../../Utils/mailSender');
const bcrypt = require('bcrypt');
require('dotenv').config();

exports.LogIn = async (req , res , next) => {
    try{
        const {email , password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                success : false ,
                message : "Please Enter Email and Password"
            })
        }

        const findUser = await User.findOne({email : email});

        if(!findUser){
            return res.status(401).json({
                success : false ,
                message : "User Not Found"
            })
        }

        if(await bcrypt.compare(password , findUser.password)){
            const token = JWT.sign(
                {
                id : findUser.id,
                email : findUser.email,
                }, 
                process.env.JWT_SECRET,
                {
                    expiresIn : "48h"
                }
            )
            findUser.token = token;
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };

            await sendMail(
                findUser.email,
                "LogIn Successfully",
                `Hello ${findUser.firstName} ${findUser.lastName} , Your account has been LogIn successfully`
            ).then(() => {
                console.log("LogIn mail Success");
                res.cookie("token", token, options).status(200).json({
                    success: true,
                    token,
                    findUser,
                    message : "Logged In Successfully",
                });
                next();
            }).catch((err) => {
                console.log("LogIn mail Error" , err.message);
            })
        }
        else{
            return res.status(401).json({
				success: false,
				message: "INCORRECT PASSWORD",
			});
        }
    }catch(err){
		return res.status(400).json({
			success: false,
			message: "Login Failed",
            data : err.message
		});
    }
}