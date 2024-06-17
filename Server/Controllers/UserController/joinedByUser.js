const User = require('../../Models/User');
const Class = require('../../Models/Class');

exports.joinedByUser = async (req, res) => {
    try {
        const id = req.user.id;
        if (!id) {
            return res.status(409).json({
                success: false,
                message: "User ID is required"
            });
        }

        //* Fetch user and populate joined classes with all admin details
        const user = await User.findById(id)
            .populate({
                path: 'joinedClassAsAteacher',
                populate: {
                    path: 'admin',
                    select: 'firstName lastName image'
                }
            })
            .populate({
                path: 'joinedClassAsStudent',
                populate: {
                    path: 'admin',
                    select: 'firstName lastName image'
                }
            })
            .populate({
                path: 'createdClasses',
                populate: {
                    path: 'admin',
                    select: 'firstName lastName image'
                }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
            message: "Classes joined by this user"
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while getting classes joined by this user"
        });
    }
};