const JWT = require('jsonwebtoken');
const User = require('../../Models/User');
require('dotenv').config();

exports.validateLogin = async (req, res, next) => {
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
                expiresIn : "24h" // 1 day session expiry
            }
        );

        const options = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day cookie expiry
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        };

        user.password = undefined;

        res.cookie("token", token, options).status(200).json({
            success: true,
            token,
            data : user,
            message: "Logged In Successfully",
        });
    
    }catch(err){
        next(err);
    }
}