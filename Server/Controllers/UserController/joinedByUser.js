const User = require('../../Models/User');
const Class = require('../../Models/Class');

exports.joinedByUser = async (req , res) => {
    try{
        const id = req.user.id;
        if(!id){
            return res.status(409).json({
                success: false,
                message: "User ID is required"
            })
        }
        const user = await User.findById(id)?.populate("joinedClassAsAteacher").populate("joinedClassAsStudent").exec();

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        return res.status(200).json({
            success: true,
            data: user,
            message: "Class joined by this user"
        })

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while getting class joined by this user"
        })
    }
}