const mongoose = require('mongoose');
require('dotenv').config();

exports.dbConnect = async() => {
    try{
        await mongoose.connect(process.env.MONGODB_URL , {
            // useNewUrlParser: true,
            // useUnifiedTopology : true
        })
       console.log("DB CONNECTION SUCCESSFULL");
    }catch(err){
        console.log("DB CONNECTION UNSUCCESSFULL");
        console.log(err.message);
        process.exit(1);
    }
}