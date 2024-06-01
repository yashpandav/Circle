const Assignment = require('../../Models/Assignment');

exports.getAssDetails = async (req , res) => {
    try{
        const id = req.body.id;

        if(!id){
            return res.status(401).json({
                success: false,
                message: "Assignment Id is required"
            })
        }

        const currAss = await Assignment.findById(id)
        ?.populate("comment")
        .populate("teacher")
        .populate("submitedStudent")
        .populate("pendingStudent");

        if(!currAss){
            return res.status(401).json({
                success: false,
                message: "Assignment Not Found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Assignment Found",
            data: currAss
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Errot while getting details of assignment"
        });
    }
}