const User = require('../../Models/User');
const otpgenerator = require('otp-generator');
const OTP = require('../../Models/OTP');
exports.genrateOtp = async (req , res) => {
    try{
        const email = req.body.email;

        if(!email){
            return res.status(401).json({
                success: false,
                msg : "Field Required"
            })
        }

        const findUser = await User.findOne({email : this.email});

        if(findUser){
            return res.status(401).json({
                success: false,
                msg : "User Registered"
            })
        }

        console.log(findUser)

        let otp = otpgenerator.generate(6 , {
            specialChars : false,
            upperCaseAlphabets : false,
            lowerCaseAlphabets : false  
            }
        )

        let findOTP = await OTP.findOne({otp : otp});

        while(findOTP){
            otp = otpgenerator.generate(6 , {
                specialChars : false,
                upperCaseAlphabets : false,
                lowerCaseAlphabets : false
            }
        )
        console.log(otp)
        findOTP = await OTP.findOne({otp : otp})
        }

        const finalOTP = await OTP.create({
            email , 
            otp,
            }
        );

        console.log("Generated OTP => " , finalOTP);

        return res.status(200).json({
            success : true,
            message : "OTP Generated",
            OTP : finalOTP
        })

    }catch(err){
        return res.status(400).json({
            success: false,
            err : err.message,
            message : "Error while generating OTP"
        })
    }
}