const User = require('../../Models/User');
const OTP = require('../../Models/OTP');
const Profile = require('../../Models/Profile');
const {sendMail} = require('../../Utils/mailSender');
const {successSignUp} = require('../../Mail/successAccount')
const bcrypt = require('bcrypt');
const randomColor = require('randomcolor');

exports.signUp = async (req ,res) => {
    try{
        const{
            firstName,
			lastName,
			email,
			password,
			confirmPassword,
			otp,
        } = req.body;

        if ( !firstName || !lastName || !email || !password || !confirmPassword || !otp ) {
			return res.status(403).send({
				success: false,
				message: "All Fields are required",
			});
        }

        if(password !== confirmPassword){
            return res.status(403).send({
				success: false,
				message: "Password didn't match",
			});
        }

        const findUser = await User.findOne({email : email});

        if(findUser){
            return res.status(400).json({
				success: false,
				message: "USER ALREADY EXISTS",
			});
        }

        const findOTP = await OTP.findOne({email : email}).sort({createdAt : -1}).limit(1);

        if(findOTP.otp !== otp){
            return res.status(400).send({
				success: false,
				message: "OTP didn't Matched",
			});
        }

        const hasedPaas = await bcrypt.hash(password , 10);
        const profileURL = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=${randomColor().replace('#' , '')}&color=${randomColor().replace('#' , '')}&bold=true`;

        const additional = new Profile({
            gender: null,
			dateOfBirth: null,
			about: null,
			contactNumber: null,
        });

        let finalUser = new User({
            firstName,
			lastName,
			email,
            password : hasedPaas,
            image : profileURL,
            additionalDetails : additional,
        })
        finalUser = await finalUser.save();
        
        await sendMail(
            finalUser.email,
            "Account Created Successfully",
            successSignUp(finalUser.firstName , finalUser.lastName)
        ).then(() => {
            console.log("SignUP mail Success");
        }).catch((err) => {
            console.log("SignUP mail Error" , err.message);
        })

        return res.status(200).json({
			success: true,
			finalUser,
			message: "SIGN UP COMPLETED",
		});

    }catch(err){
        return res.status(400).json({
            success: false,
            err : err.message,
            msg : "Error while sign up"
        })
    }
}