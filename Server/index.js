//* IMPORT
const express = require('express');
const app = express();
const { dbConnect } = require('./Config/databaseConnection');
const { cloudinaryConnect } = require('./Config/cloudinaryConnection');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const { auth } = require('./Middleware/auth');
require('dotenv').config();

//* DATABASE & CLOUDINARY CONNECTION
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
let allowedOrigins = ["http://localhost:3000"];
try {
    if (process.env.ALLOWD_ORIGIN) {
        allowedOrigins = JSON.parse(process.env.ALLOWD_ORIGIN);
    }
} catch (error) {
    // Fallback if the env variable is a plain string or comma-separated string rather than JSON
    allowedOrigins = process.env.ALLOWD_ORIGIN.split(',').map(origin => origin.trim());
}
// console.log("CORS allowed origins: " + allowedOrigins)
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        maxAge: 14400,
    })
);



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
const reviewlistRoutes = require('./Routes/ReviewRoutes');
app.use('/reviews', reviewlistRoutes);

//* COMMENT ROUTER IMPORTs
const commentRoutes = require('./Routes/CommentRoutes');
app.use('/comment', commentRoutes);

//* POST ROUTER IMPORTs
const postRoutes = require('./Routes/PostRoutes');
app.use('/post', postRoutes);

//* TODOS ROUTER IMPORTs
const todosRoutes = require('./Routes/ToDosRoutes');
app.use('/todos', todosRoutes);

//* CATEGORY ROUTES IMPORTs
const categoryRoutes = require('./Routes/CategoryRoutes');
app.use('/category', categoryRoutes);

//* PORT AND LISTEN
const PORT = process.env.PORT || 5000;
dbConnect().then(() => {
    app.listen(PORT, () => {
        console.log(`App is running on ${PORT}`);
    });
});

app.get('/', (req, res) => {
    res.send({
        message: 'Welcome to CIRCLE'
    });
    console.log("HOME PAGE");
});
