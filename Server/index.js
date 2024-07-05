//* IMPORT
const express = require('express');
const app = express();
const { dbConnect } = require('./Config/databaseConnection');
const { cloudinaryConnect } = require('./Config/cloudinaryConnection');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const { auth } = require('./Middleware/auth');
require('dotenv').config();
const uniqolor = require('uniqolor');

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

//* CORS
const cors = require("cors");
const allowedOrigins = JSON.parse(process.env.ALLOWD_ORIGIN);
// console.log("CORS allowed origins: " + allowedOrigins)
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        maxAge: 14400,
    })
);

//* MAIL ROUTES
const { sendMail } = require('./Utils/mailSender')
app.use('/sendMail', sendMail);


//* AUTH ROUTER IMPORTs
const userRoute = require('./Routes/UserAuthRoutes');
app.use('/auth/user', userRoute);

//* CLASS ROUTER IMPORTs
const classRoute = require('./Routes/ClassRoutes');
app.use('/class', classRoute);

//* USER ROUTER IMPORTs
const userProfileRoute = require('./Routes/UserRoutes');
app.use('/user', userProfileRoute);

//* ASSIGNMENT ROUTER IMPORTs
const assignmentRoutes = require('./Routes/AssignmentRoutes');
app.use('/assignment', assignmentRoutes);

//* REVIEWS LIST ROUTER IMPORTs
const { pendingReview } = require('./Controllers/ReviewAssignmentControllers/defaultReview');
app.post('/reviews/:classId', auth, pendingReview);
const reviewlistRoutes = require('./Routes/ReviewRoutes');
app.use('/reviews', reviewlistRoutes);

//* COMMENT ROUTER IMPORTs
const commentRoutes = require('./Routes/CommentRoutes');
app.use('/comment', commentRoutes);

//* POST ROUTER IMPORTs
const postRoutes = require('./Routes/PostRoutes');
app.use('/post', postRoutes);

//* TODOS ROUTER IMPORTs
const { updateToDo } = require('./Controllers/ToDoControllers/addAss');
app.post('/todos:classId', auth, updateToDo);

//* CATEGORY ROUTES IMPORTs
const categoryRoutes = require('./Routes/CategoryRoutes');
app.use('/category', categoryRoutes);

//* PORT AND LISTEN
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
})

app.get('/', (req, res) => {
    res.send({
        message: 'Welcome to CIRCLE'
    });
    console.log("HOME PAGE");
});
