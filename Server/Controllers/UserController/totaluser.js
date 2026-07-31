const User = require('../../Models/User');

exports.totalUser = async (req, res, next) => {
    try{
        const userCount = await User.countDocuments({});

        return res.status(200).json({
            success: true,
            message: "All the users",
            data: userCount
        })
    }catch(err){
        next(err);
    }
}