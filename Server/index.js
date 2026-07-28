//* IMPORT
const express = require('express');
const app = express();
const { createServer } = require('http');
const { dbConnect } = require('./Config/databaseConnection');
const { cloudinaryConnect } = require('./Config/cloudinaryConnection');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const socketModule = require('./socket');
require('dotenv').config();

//* CLOUDINARY CONNECTION
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
    allowedOrigins = process.env.ALLOWD_ORIGIN.split(',').map(origin => origin.trim());
}
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        maxAge: 14400,
    })
);

//* CREATE HTTP SERVER & INITIALISE SOCKET.IO (via singleton — no circular deps)
const httpServer = createServer(app);
const io = socketModule.init(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    }
});

//* SOCKET.IO — ROOM MANAGEMENT
io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Client joins a classroom room when they open a class page
    socket.on('join:room', (classId) => {
        socket.join(`room:${classId}`);
        console.log(`[Socket] ${socket.id} joined room:${classId}`);
    });

    // Client leaves a classroom room
    socket.on('leave:room', (classId) => {
        socket.leave(`room:${classId}`);
        console.log(`[Socket] ${socket.id} left room:${classId}`);
    });

    socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});

//* AUTH ROUTER IMPORTS
const userRoute = require('./Routes/UserAuthRoutes');
app.use('/auth/user', userRoute);

//* CLASS ROUTER IMPORTS
const classRoute = require('./Routes/ClassRoutes');
app.use('/class', classRoute);

//* USER ROUTER IMPORTS
const userProfileRoute = require('./Routes/UserRoutes');
app.use('/user', userProfileRoute);

//* ASSIGNMENT ROUTER IMPORTS
const assignmentRoutes = require('./Routes/AssignmentRoutes');
app.use('/assignment', assignmentRoutes);

//* REVIEWS LIST ROUTER IMPORTS
const reviewlistRoutes = require('./Routes/ReviewRoutes');
app.use('/reviews', reviewlistRoutes);

//* COMMENT ROUTER IMPORTS
const commentRoutes = require('./Routes/CommentRoutes');
app.use('/comment', commentRoutes);

//* POST ROUTER IMPORTS
const postRoutes = require('./Routes/PostRoutes');
app.use('/post', postRoutes);

//* TODOS ROUTER IMPORTS
const todosRoutes = require('./Routes/ToDosRoutes');
app.use('/todos', todosRoutes);

//* CATEGORY ROUTES IMPORTS
const categoryRoutes = require('./Routes/CategoryRoutes');
app.use('/category', categoryRoutes);

app.get('/', (req, res) => {
    res.send({ message: 'Welcome to CIRCLE' });
});

//* PORT AND LISTEN — Start only after DB is connected
const PORT = process.env.PORT || 5000;
dbConnect().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`App is running on ${PORT}`);
    });
});
