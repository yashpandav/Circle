const User = require('../../Models/User');

exports.totalUser = async (req , res) => {
    try{
        const user = await User.find({});

        return res.status(200).json({
            success: true,
            message: "All the users",
            data: user
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while getting all the users"
        })
    }
}