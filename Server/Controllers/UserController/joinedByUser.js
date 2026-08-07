const User = require('../../Models/User');
const Class = require('../../Models/Class');

exports.joinedByUser = async (req, res, next) => {
    try {
        const id = req.user.id;
        if (!id) {
            return res.status(409).json({
                success: false,
                message: "User ID is required"
            });
        }

        const selectFields = '_id name description subject classTheme thumbnail entryCode admin student teacher';

        const [user, teachingClassesFromDB, studentClassesFromDB] = await Promise.all([
            User.findById(id)
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
                }),
            Class.find({
                $or: [
                    { admin: id },
                    { teacher: id }
                ]
            })
                .select(selectFields)
                .populate('admin', 'firstName lastName image'),
            Class.find({
                student: id,
                admin: { $ne: id },
                teacher: { $nin: [id] }
            })
                .select(selectFields)
                .populate('admin', 'firstName lastName image')
        ]);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 1. Build map of all teaching classes (created + co-teacher)
        const teachingMap = new Map();

        // From Class collection directly (source of truth)
        (teachingClassesFromDB || []).forEach(c => {
            if (c && c._id) teachingMap.set(c._id.toString(), c);
        });

        // From user object
        (user.createdClasses || []).forEach(c => {
            if (c && c._id) teachingMap.set(c._id.toString(), c);
        });
        (user.joinedClassAsAteacher || []).forEach(c => {
            if (c && c._id) teachingMap.set(c._id.toString(), c);
        });

        const joinedClassAsAteacher = Array.from(teachingMap.values());
        const teachingIds = new Set(teachingMap.keys());

        // 2. Build map of enrolled student classes (strictly excluding any teaching class)
        const studentMap = new Map();
        (studentClassesFromDB || []).forEach(c => {
            if (c && c._id && !teachingIds.has(c._id.toString())) {
                studentMap.set(c._id.toString(), c);
            }
        });
        (user.joinedClassAsStudent || []).forEach(c => {
            if (c && c._id && !teachingIds.has(c._id.toString())) {
                studentMap.set(c._id.toString(), c);
            }
        });

        const joinedClassAsStudent = Array.from(studentMap.values());

        // 3. Created classes specifically
        const createdMap = new Map();
        (user.createdClasses || []).forEach(c => {
            if (c && c._id) createdMap.set(c._id.toString(), c);
        });
        (teachingClassesFromDB || []).forEach(c => {
            const adminId = c?.admin?._id ? c.admin._id.toString() : c?.admin?.toString();
            if (adminId === id.toString()) {
                createdMap.set(c._id.toString(), c);
            }
        });
        const createdClasses = Array.from(createdMap.values());

        return res.status(200).json({
            success: true,
            data: {
                joinedClassAsAteacher,
                joinedClassAsStudent,
                createdClasses,
            },
            message: "Classes joined by this user"
        });
    } catch (err) {
        next(err);
    }
};