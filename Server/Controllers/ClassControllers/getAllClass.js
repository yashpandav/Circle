const Class = require('../../Models/Class');
exports.getAllClass = async (req, res) => {
    try {

        const findClass = await Class.find({});
        
        return res.status(200).json({
            success: true,
            message: "Class Found",
            data: findClass
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};