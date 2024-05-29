const User = require('../../Models/User');
const bcrypt = require('bcrypt');

exports.changePassword = async (req , res) => {
    try{
        console.log("User " , req.user)
        if(!req.user){
            return res.status(401).json({
                success : false, 
                message : "LogIn required"
            })
        }
		const userDetails = await User.findById(req.user.id);
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        if (newPassword !== confirmNewPassword) {
			return res.status(400).json({
				success: false,
				message: "PLEASE RE-ENTER YOUR NEW PASSWORD",
			});
		}

        const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);

		if (!isPasswordMatch) {
			return res.status(401).json({ 
                success : false, 
                message: "INCORRECT PASSWORD" 
            });
		}

        if(oldPassword === newPassword){
			return res.status(400).json({
				success : false,
				message : "PASSWORD SHOULD BE DIFFER FROM OLDER ONE",
			});
		}
        
		const hasedPass = await bcrypt.hash(newPassword, 10);
        const updatedUser = await User.findByIdAndUpdate( req.user.id,
            {
                password: hasedPass 
            },
            {
                new : true
            }
        )
        return res.status(200).json({ 
            success : true, 
            updatedUser,
            message : "PASSWORD UPDATED SUCCESSFULLY"
        });
    }catch(err){
		return res.status(500).json({
			success: false,
			message: "ERROR WHILE CHANGING PASSWORD ",
			error: err.message,
		});
    }
}
