const mongoose = require('mongoose');
const Class = require('../../Models/Class');
const User = require('../../Models/User');
const Review = require('../../Models/review');
const Assignment = require('../../Models/Assignment');

async function fetchAssignmentReview(classId, user) {
    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
        return null;
    }

    const currClass = await Class.findById(classId)
        .populate({
            path: "addedAssignment",
            populate: [
                { path: "category", select: "name" },
                { path: "teacher", select: "firstName lastName image email" },
                { 
                    path: "submission", 
                    select: "_id student submitDate data file status marks maxMarks feedback reviewedAt reviewedBy",
                    populate: [
                        { path: "student", select: "firstName lastName image email" },
                        { path: "reviewedBy", select: "firstName lastName image email" }
                    ]
                },
                { path: "pendingStudent", select: "_id firstName lastName image email" }
            ]
        });

    if (!currClass) {
        return null;
    }

    const userIdStr = user._id ? user._id.toString() : user.id.toString();
    const isClassAdmin = currClass.admin && currClass.admin.toString() === userIdStr;
    const isClassTeacher = currClass.teacher && currClass.teacher.some(t => t && t.toString() === userIdStr);

    if (!isClassAdmin && !isClassTeacher) {
        return null;
    }

    const addedAssignments = Array.isArray(currClass.addedAssignment) ? currClass.addedAssignment : [];
    // Only include assignments created/uploaded by this specific teacher
    const validAssignments = addedAssignments.filter(a => {
        if (!a || !a._id) return false;
        const teacherId = a.teacher?._id ? a.teacher._id.toString() : (a.teacher ? a.teacher.toString() : null);
        return teacherId === userIdStr;
    });

    const reviewData = user.reviewList ? await Review.findById(user.reviewList) : null;
    let classReviewData = null;
    if (reviewData && Array.isArray(reviewData.byClass)) {
        classReviewData = reviewData.byClass.find(c => c.classId && c.classId.toString() === classId.toString());
    }

    const reviewedAssignmentIds = classReviewData && Array.isArray(classReviewData.reviewdAss)
        ? classReviewData.reviewdAss.map(id => id.toString())
        : [];

    // Separate into reviewed and not reviewed (pending)
    const reviewed = validAssignments.filter(assignment => reviewedAssignmentIds.includes(assignment._id.toString()));
    const pending = validAssignments.filter(assignment => !reviewedAssignmentIds.includes(assignment._id.toString()));

    return { 
        classId: currClass._id, 
        className: currClass.name || 'Untitled Class',
        classSubject: currClass.subject || '',
        classTheme: currClass.classTheme || '#00a896',
        entryCode: currClass.entryCode || '',
        classInfo: {
            _id: currClass._id,
            name: currClass.name || 'Untitled Class',
            subject: currClass.subject || '',
            classTheme: currClass.classTheme || '#00a896',
            entryCode: currClass.entryCode || ''
        },
        reviewdAss: reviewed, 
        notReviedAss: pending 
    };
}

exports.pendingReview = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User identification missing"
            });
        }

        const user = await User.findById(userId).populate("reviewList");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const requestedParam = req.params.classId || req.query.classId;
        const targetClassId = (requestedParam && requestedParam !== 'all' && requestedParam !== 'null' && requestedParam !== 'undefined')
            ? requestedParam
            : null;

        // Collect all teaching classes (where user is admin or in teacher array or joinedClassAsAteacher)
        const teachingClassSet = new Set();

        if (Array.isArray(user.joinedClassAsAteacher)) {
            user.joinedClassAsAteacher.forEach(c => {
                if (c) teachingClassSet.add(c.toString());
            });
        }

        const adminAndTeacherClasses = await Class.find({
            $or: [
                { admin: userId },
                { teacher: userId }
            ]
        }).select('_id');

        adminAndTeacherClasses.forEach(c => {
            if (c?._id) teachingClassSet.add(c._id.toString());
        });

        const allTeachingClassIds = Array.from(teachingClassSet);

        if (allTeachingClassIds.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No teaching classes found",
                data: []
            });
        }

        let classIdsToFetch = allTeachingClassIds;
        if (targetClassId) {
            if (!mongoose.Types.ObjectId.isValid(targetClassId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Class ID format"
                });
            }
            if (allTeachingClassIds.includes(targetClassId)) {
                classIdsToFetch = [targetClassId];
            } else {
                return res.status(200).json({
                    success: true,
                    message: "No matching teaching class found",
                    data: []
                });
            }
        }

        const reviewData = await Promise.all(classIdsToFetch.map(cId => fetchAssignmentReview(cId, user)));
        const validReviewData = reviewData.filter(data => data !== null);

        // Sync user Review document
        let reviewList = user.reviewList ? await Review.findById(user.reviewList) : null;
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
        if (!user.reviewList || user.reviewList.toString() !== reviewList._id.toString()) {
            user.reviewList = reviewList._id;
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: "Review data fetched successfully",
            data: validReviewData
        });
    } catch (err) {
        next(err);
    }
};