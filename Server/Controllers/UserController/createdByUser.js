const User = require('../../Models/User');
const Class = require('../../Models/Class');


exports.cretedByUser = async (req, res, next) => {
    try{
        const id = req.user.id;
        if(!id){
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            })
        }
        const user = await User.findById(id)?.populate("createdClasses").exec();

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        return res.status(200).json({
            success: true,
            data: user
        })

    }catch(err){
        next(err);
    }
}