const User = require('../../Models/User');

exports.joinedByUser = async (req, res, next) => {
    try {
        const id = req.user.id;
        if (!id) {
            return res.status(409).json({
                success: false,
                message: "User ID is required"
            });
        }

        const selectFields = '_id name description subject classTheme thumbnail entryCode admin';

        const user = await User.findById(id)
            .populate({
                path: 'joinedClassAsAteacher',
                select: selectFields,
                populate: { path: 'admin', select: 'firstName lastName image' }
            })
            .populate({
                path: 'joinedClassAsStudent',
                select: selectFields,
                populate: { path: 'admin', select: 'firstName lastName image' }
            })
            .populate({
                path: 'createdClasses',
                select: selectFields,
                populate: { path: 'admin', select: 'firstName lastName image' }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Combine teaching = createdClasses + joinedClassAsAteacher (deduplicated)
        const createdIds = new Set((user.createdClasses || []).map(c => c._id.toString()));
        const teachingExtra = (user.joinedClassAsAteacher || []).filter(
            c => !createdIds.has(c._id.toString())
        );
        const joinedClassAsAteacher = [...(user.createdClasses || []), ...teachingExtra];

        return res.status(200).json({
            success: true,
            data: {
                joinedClassAsAteacher,
                joinedClassAsStudent: user.joinedClassAsStudent || [],
                createdClasses: user.createdClasses || [],
            },
            message: "Classes joined by this user"
        });
    } catch (err) {
        next(err);
    }
};