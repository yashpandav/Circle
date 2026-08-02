const mongoose = require('mongoose');
require('dotenv').config();

exports.dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
    } catch (err) {
        console.error('[Database] Connection failed:', err.message);
        process.exit(1);
    }
}