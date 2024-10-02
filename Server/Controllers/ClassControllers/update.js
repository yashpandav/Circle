const Class = require('../../Models/Class');
const { uploadImage } = require('../../Utils/imageUpload');
require('dotenv').config();

exports.updateClass = async (req, res) => {
    try {
        const id = req.params.id;
        let { name, description, subject, classTheme } = req.body;
        let thumbnail = req.files?.thumbnail;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Class ID is required"
            });
        }

        const findClass = await Class.findById(id);
        if (!findClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        //* AUTHORIZEED TO EDIT
        const isAuthorized = findClass.admin.toString() === req.user.id;
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this class"
            });
        }

        if (thumbnail) {
            const uploadResponse = await uploadImage(thumbnail, process.env.FOLDER_NAME);
            thumbnail = uploadResponse.secure_url;
        }

        const updatedClass = await Class.findByIdAndUpdate(id, {
            name: name || findClass.name,
            description: description || findClass.description,
            subject: subject || findClass.subject,
            classTheme: classTheme || findClass.classTheme,
            thumbnail: thumbnail || findClass.thumbnail
        }, { new: true });

        console.log(updatedClass);

        return res.status(200).json({
            success: true,
            message: "Class updated",
            date : updatedClass
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error while updating class",
            error: err.message
        });
    }
};