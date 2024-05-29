//* IMPORT
const express = require('express');
const app = express();
const {dbConnect} = require('./Config/databaseConnection');
const {cloudinaryConnect} = require('./Config/cloudinaryConnection');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
require('dotenv').config();

//* DATABASE & CLOUDINARY CONNECTION
dbConnect();
cloudinaryConnect();

//* MIDDLEWARE
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp',
}));

//* MAIL ROUTES
const {sendMail} = require('./Utils/mailSender'); 
app.use('/sendMail' , sendMail);

//* PORT AND LISTEN
const PORT = process.env.PORT || 3000;
app.listen(PORT , () => {
    console.log(`App is running on ${PORT}`);
})

app.get('/' , (req , res) => {
    res.send({
        message : 'Welcome to CIRCLE'
    })
    console.log("HOME PAGE");
})

//* ROUTER IMPORT
const userRoute = require('./Routes/UserAuthRoutes'); 
app.use('/auth/user' , userRoute);
const classRoute = require('./Routes/ClassRoutes');
app.use('/class' , classRoute);
const userProfileRoute = require('./Routes/UserRoutes');
app.use('/user' , userProfileRoute);