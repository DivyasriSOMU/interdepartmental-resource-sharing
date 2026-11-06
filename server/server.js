require("dotenv").config();
const express = require("express");
const cors = require('cors');
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const resourceRequestRoutes = require("./routes/resourceRequestRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(cors());
// Middleware to read JSON data
app.use(express.json());

// User routes
app.use("/api/users", userRoutes);

// Department routes
app.use("/api/departments", departmentRoutes);

app.use("/api/resources", resourceRoutes);

app.use("/api/resource-requests", resourceRequestRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("Inter-Departmental Platform Backend is Running!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
