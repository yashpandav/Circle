const Class = require('../../Models/Class');
const User = require('../../Models/User');
const Review = require('../../Models/review');
const Assignment = require('../../Models/Assignment');

async function fetchAssignmentReview(classId, user) {
    const currClass = await Class.findById(classId).populate("addedAssignment").exec();
    if (!currClass) {
        return null;
    }

    const thisTeacherAssignments = currClass.addedAssignment.filter(assignment => assignment.teacher.equals(user.id));
    if (!thisTeacherAssignments.length) {
        return null;
    }

    const reviewData = await Review.findById(user.reviewList).exec();
    const reviewdAss = reviewData ? reviewData.reviewdAss : [];
    const notReviedAss = reviewData ? reviewData.notReviedAss : thisTeacherAssignments.map(ass => ass._id);

    const reviewedAssignments = thisTeacherAssignments.filter(assignment => reviewdAss.includes(assignment._id));
    const pendingAssignments = thisTeacherAssignments.filter(assignment => notReviedAss.includes(assignment._id));

    return { classId, reviewedAssignments, pendingAssignments };
}

exports.pendingReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const classId = req.params.classId;
        const joinedClasses = req.joinedClassAsTeacher;

        if (!joinedClasses || joinedClasses.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No classes joined by the teacher"
            });
        }

        const user = await User.findById(userId).populate("reviewList").exec();
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const classIds = classId ? [classId] : joinedClasses;

        const reviewData = await Promise.all(classIds.map(
            classId => fetchAssignmentReview(classId, user)
        ));

        let revied = await Review.findById(user.reviewList);
        if (!revied) {
            revied = new Review({
                user: userId,
                byClass : reviewData.filter(data => data !== null)
            });
        }else{
            revied.byClass = reviewData.filter(data => data != null);
        }
        await revied.save();
        
        return res.status(200).json({
            success: true,
            message: "Review data fetched successfully",
            data: revied
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching review data"
        });
    }
};
