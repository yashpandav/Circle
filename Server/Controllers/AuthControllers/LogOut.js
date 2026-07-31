exports.LogOut = async (req, res, next) => {
    try {
        console.log("LOG OUT API HEATED");
        // console.log("COOKIE 1 ");
        // console.log(req.cookies);
        // console.log(req.cookies.token);
        res.clearCookie("token");
        res.clearCookie("token");
        // console.log("COOKIE 2 " );
        // console.log(req.cookies);
        // console.log(req.cookies.token);
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
        res.end();
    }
    catch (err) {
        next(err);
    }
}
