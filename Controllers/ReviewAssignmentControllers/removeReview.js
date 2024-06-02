const User = require('../../Models/User');
const Review = require('../../Models/review');

exports.removeFromReviewd = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const assId = req.body.addId;

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "USER NOT FOUND"
            });
        }

        let reviewList = await Review.findById(user.reviewList);

        if (!reviewList) {
            return res.status(404).json({
                success: false,
                message: "REVIEW LIST NOT FOUND"
            });
        }

        let found = false;
        reviewList.byClass.forEach(classReview => {
            if (classReview.reviewdAss.includes(assId)) {
                classReview.notReviedAss.push(assId);
                classReview.reviewdAss.pull(assId);
                found = true;
            }
        });

        if (!found) {
            return res.status(404).json({
                success: false,
                message: "ASSIGNMENT NOT FOUND IN DONE REVIEWS"
            });
        }

        await reviewList.save();

        return res.status(200).json({
            success: true,
            message: "Removed from reviewed",
            reviewList
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while removing from reviewed"
        });
    }
}
