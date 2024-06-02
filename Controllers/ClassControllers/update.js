const Class = require('../../Models/Class');
const {uploadImage} = require('../../Utils/imageUpload');
const convert = require('color-convert');
require('dotenv').config();

exports.updateClass = async (req, res) => {
    try{
        const id = req.params.id;
        const name = req.body?.name;
        const description = req.body?.description;
        const subject = req.body?.subject;
        const roomNo = req.body?.roomNo;
        let classTheme = req.body?.classTheme;
        let thumbnail = req.files?.thumbnail;

        if(!id){
            return res.status(401).json({
                success : false,
                message : "Class Id Required"
            })
        }
        const findClass = await Class.findById(id);
        if(!findClass){
            return res.status(401).json({
                success : false,
                message : "Class Not Found"
            })
        }

        //* AUTHORIZING ADMIN
        if(findClass.admin.toString() !== req.user.id){
            return res.status(401).json({
                success : false,
                message : "Not Authorized , Only Class Creator Allowed"
            })
        }

        if(classTheme){
            let rgb = convert.keyword.rgb(`${classTheme}`);
            classTheme = '#' + convert.rgb.hex(rgb);
        }
        console.log("Thumbnail " , thumbnail)
        if(thumbnail){
            const uploadResponse = await uploadImage(thumbnail , process.env.FOLDER_NAME);
            thumbnail = uploadResponse.secure_url;
        }

        const updatedClass = await Class.findByIdAndUpdate(id, {
            name : name || findClass.name,
            description : description || findClass.description,
            subject : subject || findClass.subject,
            roomNo : roomNo || findClass.roomNo,
            classTheme : classTheme || findClass.classTheme,
            thumbnail : thumbnail || findClass.thumbnail
        }, {new : true});

        return res.status(200).json({
            success : true,
            message : "Class Updated",
            updatedClass
        })

    }catch(err){
        return res.status(401).json({
            success : false,
            message : err.message,
            data : "Error while updating Class"
        })
    }
}