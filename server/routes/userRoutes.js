
const express = require("express");

const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    loginUser
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Public routes
router.post("/", createUser);
router.post("/login", loginUser);

// Admin-only route
router.get("/", protect, authorize("admin"), getUsers);

// Protected user routes
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);

// Admin-only delete
router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
