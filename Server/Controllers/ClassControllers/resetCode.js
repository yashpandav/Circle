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
            message: "Error while creating class",
            error: err.message
        });
    }
}