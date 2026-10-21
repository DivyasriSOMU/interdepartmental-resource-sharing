const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb://localhost:27017/InterDepartmentalDB"
        );

        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.log("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;