const mongoose = require('mongoose');
const Class = require('../../Models/Class');
const User = require('../../Models/User');
const Review = require('../../Models/review');
const Assignment = require('../../Models/Assignment');

async function fetchAssignmentReview(classId, user) {
    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
        return null;
    }

    const userIdStr = user._id ? user._id.toString() : user.id.toString();

    const currClass = await Class.findById(classId)
        .select('_id name subject classTheme entryCode admin teacher addedAssignment')
        .lean();

    if (!currClass) {
        return null;
    }

    const isClassAdmin = currClass.admin && currClass.admin.toString() === userIdStr;
    const isClassTeacher = Array.isArray(currClass.teacher) && currClass.teacher.some(t => t && t.toString() === userIdStr);

    if (!isClassAdmin && !isClassTeacher) {
        return null;
    }

    const addedAssignments = Array.isArray(currClass.addedAssignment) ? currClass.addedAssignment : [];
    if (addedAssignments.length === 0) {
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
            reviewdAss: [],
            notReviedAss: []
        };
    }

    const [validAssignments, reviewData] = await Promise.all([
        Assignment.find({
            _id: { $in: addedAssignments },
            teacher: userIdStr
        })
        .populate('category', 'name')
        .populate('teacher', 'firstName lastName image email')
        .populate({
            path: 'submission',
            select: '_id student submitDate data file status marks maxMarks feedback reviewedAt reviewedBy',
            populate: [
                { path: 'student', select: 'firstName lastName image email' },
                { path: 'reviewedBy', select: 'firstName lastName image email' }
            ]
        })
        .populate('pendingStudent', '_id firstName lastName image email')
        .lean(),
        user.reviewList ? Review.findById(user.reviewList).lean() : null
    ]);

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

        const [user, adminAndTeacherClasses] = await Promise.all([
            User.findById(userId).populate("reviewList"),
            Class.find({
                $or: [
                    { admin: userId },
                    { teacher: userId }
                ]
            }).select('_id').lean()
        ]);

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

        // Fetch teaching classes metadata leanly
        const classes = await Class.find({ _id: { $in: classIdsToFetch } })
            .select('_id name subject classTheme entryCode admin teacher addedAssignment')
            .lean();

        const userIdStr = user._id ? user._id.toString() : user.id.toString();
        const allAssIds = classes.flatMap(c => (Array.isArray(c.addedAssignment) ? c.addedAssignment : []));

        // Single batch fetch of only teacher's assignments across all teaching classes
        const teacherAssignments = allAssIds.length > 0
            ? await Assignment.find({
                _id: { $in: allAssIds },
                teacher: userIdStr
            })
            .populate('category', 'name')
            .populate('teacher', 'firstName lastName image email')
            .populate({
                path: 'submission',
                select: '_id student submitDate data file status marks maxMarks feedback reviewedAt reviewedBy',
                populate: [
                    { path: 'student', select: 'firstName lastName image email' },
                    { path: 'reviewedBy', select: 'firstName lastName image email' }
                ]
            })
            .populate('pendingStudent', '_id firstName lastName image email')
            .lean()
            : [];

        // Map assignments by string ID for quick lookup
        const assMap = new Map(teacherAssignments.map(a => [a._id.toString(), a]));
        const reviewDataDoc = user.reviewList;
        const validReviewData = [];

        for (const currClass of classes) {
            if (!currClass) continue;

            const isClassAdmin = currClass.admin && currClass.admin.toString() === userIdStr;
            const isClassTeacher = Array.isArray(currClass.teacher) && currClass.teacher.some(t => t && (t._id ? t._id.toString() === userIdStr : t.toString() === userIdStr));

            if (!isClassAdmin && !isClassTeacher) continue;

            const addedAssignmentIds = Array.isArray(currClass.addedAssignment) ? currClass.addedAssignment : [];
            const validAssignments = [];
            addedAssignmentIds.forEach(aId => {
                const found = assMap.get(aId.toString());
                if (found) validAssignments.push(found);
            });

            let classReviewData = null;
            if (reviewDataDoc && Array.isArray(reviewDataDoc.byClass)) {
                classReviewData = reviewDataDoc.byClass.find(c => c.classId && c.classId.toString() === currClass._id.toString());
            }

            const reviewedAssignmentIds = classReviewData && Array.isArray(classReviewData.reviewdAss)
                ? classReviewData.reviewdAss.map(id => id.toString())
                : [];

            const reviewed = validAssignments.filter(assignment => reviewedAssignmentIds.includes(assignment._id.toString()));
            const pending = validAssignments.filter(assignment => !reviewedAssignmentIds.includes(assignment._id.toString()));

            validReviewData.push({
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
            });
        }

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