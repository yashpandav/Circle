const User = require('../../Models/User');
const Review = require('../../Models/review');

exports.addIntoReviewd = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const assId = req.body.addId || req.body.assId;

        if (!assId) {
            return res.status(400).json({
                success: false,
                message: "Assignment ID is required"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let reviewList = await Review.findById(user.reviewList);
        if (!reviewList) {
            return res.status(404).json({
                success: false,
                message: "Review list not found"
            });
        }

        let found = false;
        reviewList.byClass.forEach(classReview => {
            if (classReview.notReviedAss.some(id => id.toString() === assId.toString())) {
                classReview.reviewdAss.push(assId);
                classReview.notReviedAss.pull(assId);
                found = true;
            }
        });

        if (!found) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found in pending reviews"
            });
        }

        await reviewList.save();

        return res.status(200).json({
            success: true,
            message: "Added into reviewed",
            data: reviewList
        });

    } catch (err) {
        next(err);
    }
};
