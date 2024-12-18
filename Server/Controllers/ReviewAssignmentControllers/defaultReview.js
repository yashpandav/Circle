const Class = require('../../Models/Class');
const User = require('../../Models/User');
const Review = require('../../Models/review');
const Assignment = require('../../Models/Assignment');

async function fetchAssignmentReview(classId, user) {
    const currClass = await Class.findById(classId).populate("addedAssignment");
    if (!currClass) {
        return null;
    }

    const thisTeacherAssignments = currClass.addedAssignment.filter(assignment => assignment.teacher.equals(user.id));
    if (!thisTeacherAssignments.length) {
        return null;
    }

    const reviewData = await Review.findById(user.reviewList);
    const reviewedAssignments = reviewData ? reviewData.reviewdAss : [];
    const notReviewedAssignments = reviewData ? reviewData.notReviedAss : thisTeacherAssignments.map(ass => ass.id);

    //* seperate pending and reviewed assignments
    const reviewed = thisTeacherAssignments.filter(assignment => reviewedAssignments.includes(assignment.id));
    const pending = thisTeacherAssignments.filter(assignment => notReviewedAssignments.includes(assignment.id));

    return { classId, reviewed, pending };
}


exports.pendingReview = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate("reviewList");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const classId = req.params.classId;
        const joinedClasses = user.joinedClassAsAteacher;

        if (!joinedClasses || joinedClasses.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No classes joined by the teacher"
            });
        }

        const classIds = classId ? [classId] : joinedClasses;

        const reviewData = await Promise.all(classIds.map(classId => fetchAssignmentReview(classId, user)));

        let reviewList = await Review.findById(user.reviewList);
        if (!reviewList) {
            reviewList = new Review({
                user: userId,
                byClass: reviewData.filter(data => data !== null)
            });
        } else {
            reviewList.byClass = reviewData.filter(data => data !== null);
        }

        await reviewList.save();
        user.reviewList = reviewList.id;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Review data fetched successfully",
            data: reviewList
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching review data"
        });
    }
};