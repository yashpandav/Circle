const User = require('../../Models/User');
const Class = require('../../Models/Class');
const {uploadImage} = require('../../Utils/imageUpload');
const randomColor = require('randomcolor');
const convert = require('color-convert');
const randomstring = require("randomstring");
const {sendMail} = require('../../Utils/mailSender');
require('dotenv').config();

exports.createClass = async (req , res) => {
    try{
        console.log(req.user);
        const {
            name ,
            description,
        } = req?.body;

        const banner = req?.files?.banner;

        if(!name || !description){
            return res.status(401).json({
                success : false,
                message : "All Fields are Required"
            })
        }

        let uploadResponse;
        if(banner){
            uploadResponse = await uploadImage(banner , process.env.FOLDER_NAME);
            if(uploadResponse){
                console.log("Banner Uploaded => " , uploadResponse);
            }
        }

        let color = req.body.color;
        if(color){
            let rgb = convert.keyword.rgb(`${color}`);
            color = '#' + convert.rgb.hex(rgb);        
        }
        else{
            color = randomColor();
        }

        const newClass = await Class.create({
            name,
            description,
            subject : req.body.subject || "",
            roomNo : req.body.roomNo || "",
            classTheme : color,
            thumbnail : uploadResponse?.secure_url || "",
            admin : req.user.id,
            entryCode : randomstring.generate(5),
            entryUrl : `http://localhost:4000/class/${randomstring.generate(15).toLowerCase()}`
        });

        await Class.findByIdAndUpdate(newClass.id , {
            $push : {
                teacher : req.user.id
            }
        }) 
        
        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: {
                createdClasses: newClass.id,
                joinedClassAsAteacher: newClass.id
            }
        });

        await sendMail(
            req.user.email,
            "Class Created",
            `Your Class has been created. Your Class Code is ${newClass.entryCode} and your Class URL is ${newClass.entryUrl}`
        ).then(()=>{
            console.log("Created Class => " , newClass);
            return res.status(200).json({
                success : true,
                message : "Class Added",
                newClass,
            })
        }).catch((err) => {
            return res.status(500).json({
                success : false,
                message : err.message,
                data : "Error while sending class mail"
            });
        });

    }catch(err){
        console.log(err)
        return res.status(400).json({
            success : false,
            message : err,
            data : "Error while creting Class"
        })
    }
}