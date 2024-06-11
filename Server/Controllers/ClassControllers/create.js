const User = require('../../Models/User');
const Class = require('../../Models/Class');
const { uploadImage } = require('../../Utils/imageUpload');
const randomColor = require('randomcolor');
const convert = require('color-convert');
const randomstring = require('randomstring');
const { sendMail } = require('../../Utils/mailSender');
const bannerURL = require('../../Data/banerUrl');
exports.createClass = async (req, res) => {
    try {
        const { name, description, subject, roomNo } = req?.body;
        const banner = req?.files?.banner;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "Name and description are required fields"
            });
        }

        let uploadResponse;
        if (banner) {
            uploadResponse = await uploadImage(banner, process.env.FOLDER_NAME);
            if (uploadResponse) {
                console.log("Banner Uploaded => ", uploadResponse);
            }
        }

        //* Generate class theme color
        let color = req.body.color;
        if (color) {
            let rgb = convert.keyword.rgb(`${color}`);
            color = '#' + convert.rgb.hex(rgb);
        } else {
            color = randomColor();
        }

        //* Create new class
        const newClass = await Class.create({
            name,
            description,
            subject: subject || "",
            roomNo: roomNo || "",
            classTheme: color,
            thumbnail: uploadResponse?.secure_url || bannerURL[(Math.floor(Math.random() * bannerURL.length))],
            admin: req.user.id,
            entryCode: randomstring.generate(8),
            entryUrl: `${process.env.BASE_URL}/class/${randomstring.generate(15).toLowerCase()}`
        });

        //* Update user's created and joined classes
        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: {
                createdClasses: newClass.id,
                joinedClassAsAteacher: newClass.id
            }
        });

        //* Send email notification
        await sendMail(
            req.user.email,
            "Class Created",
            `Your Class has been created. Your Class Code is ${newClass.entryCode} and your Class URL is ${newClass.entryUrl}`
        );

        console.log("Created Class => ", newClass);
        return res.status(200).json({
            success: true,
            message: "Class Added",
            data : newClass,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error while creating class",
            error: err.message
        });
    }
};
