const mongoose = require('mongoose');
const User = require('../../Models/User');
const Review = require('../../Models/review');
const Class = require('../../Models/Class');
const { getIO } = require('../../socket');

exports.removeFromReviewed = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User identification missing"
            });
        }

        const assId = req.body.assId || req.body.addId || req.body.assignmentId;

        if (!assId || !mongoose.Types.ObjectId.isValid(assId)) {
            return res.status(400).json({
                success: false,
                message: "Valid Assignment ID is required"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let reviewList = user.reviewList ? await Review.findById(user.reviewList) : null;
        if (!reviewList) {
            reviewList = new Review({
                user: userId,
                byClass: []
            });
        }

        const assClass = await Class.findOne({ addedAssignment: assId }).select('_id');
        const classIdStr = assClass?._id?.toString();

        let found = false;
        reviewList.byClass.forEach(classReview => {
            const matchesClass = classIdStr && classReview.classId && classReview.classId.toString() === classIdStr;
            const hasInReviewed = classReview.reviewdAss && classReview.reviewdAss.some(id => id.toString() === assId.toString());

            if (matchesClass || hasInReviewed) {
                if (!classReview.notReviedAss.some(id => id.toString() === assId.toString())) {
                    classReview.notReviedAss.push(assId);
                }
                if (classReview.reviewdAss) {
                    classReview.reviewdAss.pull(assId);
                }
                found = true;
            }
        });

        if (!found) {
            if (classIdStr) {
                reviewList.byClass.push({
                    classId: assClass._id,
                    reviewdAss: [],
                    notReviedAss: [assId]
                });
            } else if (reviewList.byClass.length > 0) {
                reviewList.byClass[0].notReviedAss.push(assId);
            }
        }

        await reviewList.save();
        if (!user.reviewList || user.reviewList.toString() !== reviewList._id.toString()) {
            user.reviewList = reviewList._id;
            await user.save();
        }

        try {
            getIO().to(`user:${userId.toString()}`).emit('review:updated', {
                assignmentId: assId.toString(),
                status: 'To Review'
            });
        } catch (socketErr) {
            // non-fatal
        }

        return res.status(200).json({
            success: true,
            message: "Moved back to To Review successfully",
            data: reviewList
        });

    } catch (err) {
        next(err);
    }
};
