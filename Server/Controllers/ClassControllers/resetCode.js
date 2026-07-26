const Class = require('../../Models/Class');
const randomstring = require('randomstring');

exports.resetEntryCode = async (req , res) => {
    try{
        const id = req.params.id;
        let currClass = await Class.findById(id);
        if(!currClass){
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        if (!currClass.admin || currClass.admin.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to reset the entry code"
            });
        }

        currClass.entryCode =  randomstring.generate(8);

        await currClass.save();

        return res.status(200).json({
            success: true,
            message: "Entry code reset successfully",
            data: currClass
        });

    }catch(err){
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error while resetting entry code",
            error: err.message
        });
    }
}

exports.toggleEntryCode = async (req, res) => {
    try {
        const id = req.params.id;
        let currClass = await Class.findById(id);
        if (!currClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        if (!currClass.admin || currClass.admin.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to modify the entry code settings"
            });
        }

        currClass.isCodeActive = !currClass.isCodeActive;
        await currClass.save();

        return res.status(200).json({
            success: true,
            message: currClass.isCodeActive ? "Invitations enabled" : "Invitations disabled",
            data: currClass
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error while toggling entry code",
            error: err.message
        });
    }
}