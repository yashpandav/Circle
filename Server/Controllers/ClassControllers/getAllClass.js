const Class = require('../../Models/Class');
exports.getAllClass = async (req, res, next) => {
    try {

        const classes = await Class.find({}, 'student teacher admin').lean();
        let totalClass = classes.length;
        let totalTeacher = 0;
        let totalStudent = 0;
        
        classes.forEach((c) => {
            totalTeacher += c.teacher.length + (c.admin ? 1 : 0);
            totalStudent += c.student.length;
        });

        return res.status(200).json({
            success: true,
            message: "Class aggregations found",
            data: {
                totalClass,
                totalTeacher,
                totalStudent
            }
        });

    } catch (err) {
        next(err);
    }
};