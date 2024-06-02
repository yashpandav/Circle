const Assignment = require('../../Models/Assignment');
const User = require('../../Models/User');
const Class = require('../../Models/Class');
const Category = require('../../Models/Category');
const submittedAss = require('../../Models/SubmitAssignment');

exports.deleteAss = async (req, res) => {
    try {
        const assId = req.params.assId;
        const classId = req.body.classId;

        if (!assId || !classId) {
            return res.status(401).json({
                success: false,
                message: "All fields are required",
            });
        }

        //* AUTHORIZING TEACHER || ADMIN
        const currClass = await Class.findById(classId);
        let assignment = await Assignment.findById(assId);
        if(currClass.admin.toString() !== req.user.id || assignment.teacher.toString() !== req.user.id) {
            return res.status(403).json({
                success : false,
                message: "You are not authorized to delete this assignment",
            });
        }

        //* Remove the assignment from the class
        await Class.findByIdAndUpdate(classId, {
            $pull: { addedAssignment: assId },
        });

        //* Remove the assignment from all categories
        await Category.updateMany({}, {
            $pull: { assignment: assId },
        });

        //* Delete the assignment and its submissions
        assignment = await Assignment.findByIdAndDelete(assId);
        if (assignment && assignment.submission && assignment.submission.length > 0) {
            await Promise.all(assignment.submission.map(submittedId => {
                return submittedAss.findByIdAndDelete(submittedId);
            }))
        }

        return res.status(200).json({
            success: true,
            message: "Assignment deleted successfully",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting",
        });
    }
};
