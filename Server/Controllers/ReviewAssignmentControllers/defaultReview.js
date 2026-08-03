const Class = require('../../Models/Class');
const User = require('../../Models/User');
const Review = require('../../Models/review');
const Assignment = require('../../Models/Assignment');

async function fetchAssignmentReview(classId, user) {
    const currClass = await Class.findById(classId).populate({
        path: "addedAssignment",
        populate: [
            { path: "category", select: "name" },
            { path: "submission", select: "_id student submitDate" },
            { path: "pendingStudent", select: "_id" }
        ]
    });

    if (!currClass || !currClass.addedAssignment || currClass.addedAssignment.length === 0) {
        return null;
    }

    const userIdStr = user._id ? user._id.toString() : user.id.toString();
    const isClassAdmin = currClass.admin && currClass.admin.toString() === userIdStr;

    // Filter assignments created by this teacher or all assignments if admin/teacher in class
    const thisTeacherAssignments = currClass.addedAssignment.filter(assignment => {
        if (!assignment) return false;
        if (assignment.teacher && assignment.teacher.toString() === userIdStr) return true;
        if (isClassAdmin) return true;
        return true;
    });

    if (!thisTeacherAssignments.length) {
        return null;
    }

    const reviewData = await Review.findById(user.reviewList);
    let classReviewData = null;
    if (reviewData && reviewData.byClass) {
        classReviewData = reviewData.byClass.find(c => c.classId && c.classId.toString() === classId.toString());
    }

    const reviewedAssignments = classReviewData ? classReviewData.reviewdAss.map(id => id.toString()) : [];
    const notReviewedAssignments = classReviewData ? classReviewData.notReviedAss.map(id => id.toString()) : thisTeacherAssignments.map(ass => ass._id.toString());

    // Seperate pending and reviewed assignments
    const reviewed = thisTeacherAssignments.filter(assignment => reviewedAssignments.includes(assignment._id.toString()));
    const pending = thisTeacherAssignments.filter(assignment => !reviewedAssignments.includes(assignment._id.toString()));

    return { 
        classId, 
        reviewdAss: reviewed, 
        notReviedAss: pending 
    };
}

exports.pendingReview = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate("reviewList");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const classId = req.params.classId === 'all' ? null : req.params.classId;
        
        // Collect all classes where user is teacher or admin
        const joinedClasses = user.joinedClassAsAteacher ? user.joinedClassAsAteacher.map(c => c.toString()) : [];
        const adminClasses = await Class.find({ admin: userId }).select('_id');
        adminClasses.forEach(c => {
            const cId = c._id.toString();
            if (!joinedClasses.includes(cId)) {
                joinedClasses.push(cId);
            }
        });

        if (!joinedClasses || joinedClasses.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No teaching classes found",
                data: []
            });
        }

        const classIds = classId ? [classId] : joinedClasses;
        const reviewData = await Promise.all(classIds.map(cId => fetchAssignmentReview(cId, user)));
        const validReviewData = reviewData.filter(data => data !== null);

        let reviewList = await Review.findById(user.reviewList);
        if (!reviewList) {
            reviewList = new Review({
                user: userId,
                byClass: validReviewData.map(d => ({
                    classId: d.classId,
                    reviewdAss: d.reviewdAss.map(a => a._id),
                    notReviedAss: d.notReviedAss.map(a => a._id)
                }))
            });
        } else {
            validReviewData.forEach(newClassData => {
                const existingIndex = reviewList.byClass.findIndex(c => c.classId && c.classId.toString() === newClassData.classId.toString());
                const cleanData = {
                    classId: newClassData.classId,
                    reviewdAss: newClassData.reviewdAss.map(a => a._id),
                    notReviedAss: newClassData.notReviedAss.map(a => a._id)
                };
                if (existingIndex !== -1) {
                    reviewList.byClass[existingIndex] = cleanData;
                } else {
                    reviewList.byClass.push(cleanData);
                }
            });
        }

        await reviewList.save();
        user.reviewList = reviewList._id;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Review data fetched successfully",
            data: validReviewData
        });
    } catch (err) {
        next(err);
    }
};