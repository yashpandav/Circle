const User = require('../../Models/User');
const Review = require('../../Models/review');

exports.addIntoReviewd = async (req, res) => {
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
                message: "REVIEW LIST NOT FOUND",
                reviewList
            });
        }

        let found = false;
        reviewList.byClass.forEach(classReview => {
            if (classReview.notReviedAss.includes(assId)) {
                classReview.reviewdAss.push(assId);
                classReview.notReviedAss.pull(assId);
                found = true;
            }
        });

        if (!found) {
            return res.status(404).json({
                success: false,
                message: "ASSIGNMENT NOT FOUND IN PENDING REVIEWS"
            });
        }

        await reviewList.save();

        return res.status(200).json({
            success: true,
            message: "Added into reviewed"
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while adding into reviewed"
        });
    }
}
