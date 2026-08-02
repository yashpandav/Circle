exports.LogOut = async (req, res, next) => {
    try {
        res.clearCookie("token", { path: '/' });
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (err) {
        next(err);
    }
};
