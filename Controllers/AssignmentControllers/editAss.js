const Assignment = require('../../Models/Assignment');
const User = require('../../Models/User');
const Category = require('../../Models/Category');
const {uploadImage} = require('../../Utils/imageUpload');
require('dotenv').config();

exports.editAss = async (req , res) => {
    try{

        const assId = req.params.id; 

        const{
            name ,
            description ,
            category ,
            dueDate ,
        } = req.body;

        let file = req?.files?.file;

        if (!assId) {
            return res.status(400).json({
                success: false,
                message: "Assignment ID is required",
            });
        }

        let findAss = await Assignment.findById(assId);
        if (!findAss) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }

        //* Authorizing teacher
        const isAuthorized = findAss.teacher.toString() === req.user.id;
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this assignment",
            });
        }

        //* Validating due date
        if (dueDate && new Date(dueDate) < new Date(findAss.uploadDate)) {
            return res.status(400).json({
                success: false,
                message: "Due date should be greater than upload date",
            });
        }

        //* Updating category if provided
        if (category) {
            let currCategory = await Category.findOne({ name: category });
            if (!currCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }
            let prevCategory = await Category.findById(findAss.category);
            if (prevCategory) {
                prevCategory.assignment.pull(assId);
                await prevCategory.save();
            }
            currCategory.assignment.push(assId);
            await currCategory.save();
            findAss.category = currCategory.id;
        }

        //* Uploading new file if provided
        if (file) {
            const image = await uploadImage(file, process.env.FOLDER_NAME);
            file = image.secure_url;
            findAss.file = file;
        }

        //* Updating other fields
        findAss.name = name || findAss.name;
        findAss.description = description || findAss.description;
        findAss.dueDate = dueDate || findAss.dueDate;

        await findAss.save();

        return res.status(200).json({
            success: true,
            message: "Assignment edited successfully",
            data: findAss,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while editing the assignment",
        });
    }
};