const JWT = require('jsonwebtoken');
const User = require('../../Models/User');
require('dotenv').config();

exports.validateLogin = async (req , res) => {
    try{
        const { email , id} = req?.user;

        if(!id){
            return res.status(400).json({
                success : false,
                message : "User ID is required"
            }
        )
        }

        let user = await User.findById(id);
        if(!user){
            return res.status(400).json({
                success : false,
                message : "User not found"
            })
        }

        const token = JWT.sign(
            {
                id : user.id,
                email : user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn : "48h"
            }
        );

        user.token = token;
        await user.save();

        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        };

        res.cookie("token", token, options).status(200).json({
            success: true,
            token,
            data : user,
            message: "Logged In Successfully",
        });
    
    }catch(err){
        res.status(500).json({
            success : false,
            message : "Login Failed",
            err : err.message
        })
    }
}