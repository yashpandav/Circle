const cloudinary = require('cloudinary').v2;

exports.uploadImage = async (file , folder) => {
    const options = {folder};
    options.resource_type = "auto";
    return await cloudinary.uploader.upload(file.tempFilePath , options);
}