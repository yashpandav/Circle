const cloudinary = require('cloudinary').v2;

// exports.uploadImage = async (file , folder) => {
//     const options = {folder};
//     options.resource_type = "auto";
//     return await cloudinary.uploader.upload(file.tempFilePath , options);
// }

exports.uploadImage = async (file, folder, fileName) => {
    return await cloudinary.uploader.upload(file.tempFilePath, {
        folder: folder,
        public_id: fileName,
        use_filename: true, 
    });
};