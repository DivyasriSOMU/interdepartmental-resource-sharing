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

router.post("/", createUser);
router.get("/", protect, authorize("admin"), getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/login", loginUser);

module.exports = router;