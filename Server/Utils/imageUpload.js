const cloudinary = require('cloudinary').v2;

// exports.uploadImage = async (file , folder) => {
//     const options = {folder};
//     options.resource_type = "auto";
//     return await cloudinary.uploader.upload(file.tempFilePath , options);
// }

exports.uploadImage = async (file, folder, fileName) => {
    const isImage = file?.mimetype ? file.mimetype.startsWith('image/') : true;
    const options = {
        folder: folder,
        public_id: fileName,
        use_filename: true,
        resource_type: "auto",
    };

    if (isImage) {
        options.format = 'webp';
        options.quality = 'auto:good';
    }

    return await cloudinary.uploader.upload(file.tempFilePath, options);
};