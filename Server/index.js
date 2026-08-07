// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
    console.error(`[Process] Uncaught Exception: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
});

//* IMPORT
const express = require('express');
const app = express();
const { createServer } = require('http');
const { dbConnect } = require('./Config/databaseConnection');
const { cloudinaryConnect } = require('./Config/cloudinaryConnection');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const socketModule = require('./socket');
const errorHandler = require('./Middleware/errorHandler');
require('dotenv').config();

//* SECURITY
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const { generalLimiter } = require('./Middleware/rateLimiter');
const { sanitizeBody, sanitizeParams } = require('./Middleware/sanitize');

//* CLOUDINARY CONNECTION
cloudinaryConnect();

//* SECURITY HEADERS (Helmet)
app.use(helmet());

//* MIDDLEWARE
app.use(express.json({ limit: '2mb' }));   // Prevent oversized JSON payloads
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp',
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB Limit
    abortOnLimit: true,
    limitHandler: (req, res, next) => {
        return res.status(413).json({
            success: false,
            message: "File size limit exceeded. Maximum allowed size is 100MB."
        });
    }
}));

//* NoSQL INJECTION PREVENTION – strip $ and . from request data
app.use(mongoSanitize());

//* XSS PROTECTION – sanitise HTML tags from req.body, params, query
app.use(xssClean());

//* HTTP PARAMETER POLLUTION PREVENTION
app.use(hpp());

//* CUSTOM DEEP SANITISATION (trims, length-caps, blocks Mongo operators)
app.use(sanitizeBody);
app.use(sanitizeParams);

//* GLOBAL RATE LIMITER – 100 requests / minute per IP across all API endpoints
app.use('/auth', generalLimiter);
app.use('/class', generalLimiter);
app.use('/user', generalLimiter);
app.use('/assignment', generalLimiter);
app.use('/comment', generalLimiter);
app.use('/post', generalLimiter);
app.use('/todos', generalLimiter);
app.use('/category', generalLimiter);
app.use('/reviews', generalLimiter);

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
    // Client joins a classroom room when they open a class page
    socket.on('join:room', (classId) => {
        if (classId) socket.join(`room:${classId}`);
    });

    // Client leaves a classroom room
    socket.on('leave:room', (classId) => {
        if (classId) socket.leave(`room:${classId}`);
    });

    // Client joins personal user room for direct user-specific events (ToDo, notifications)
    socket.on('join:user', (userId) => {
        if (userId) socket.join(`user:${userId}`);
    });

    // Client leaves personal user room
    socket.on('leave:user', (userId) => {
        if (userId) socket.leave(`user:${userId}`);
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

//* GLOBAL ERROR HANDLER
app.use(errorHandler);

// PORT AND LISTEN — Connect DB before accepting traffic
const PORT = process.env.PORT || 5000;

(async () => {
    try {
        await dbConnect();
        const server = httpServer.listen(PORT, () => {
            console.log(`App is running on ${PORT}`);
        });

        // Handle Unhandled Promise Rejections
        process.on('unhandledRejection', (err) => {
            console.error(`[Process] Unhandled Rejection: ${err.message}`);
            console.error(err.stack);
            server.close(() => {
                process.exit(1);
            });
        });
    } catch (err) {
        console.error(`[Server] Failed to start server: ${err.message}`);
        process.exit(1);
    }
})();
