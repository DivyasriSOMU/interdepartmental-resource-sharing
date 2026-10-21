
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
} = require("../controllers/departmentController");

// Admin-only: Create department
router.post("/", protect, authorize("admin"), createDepartment);

// View departments
router.get("/", getDepartments);
router.get("/:id", getDepartmentById);

// Admin-only: Update or delete department
router.put("/:id", protect, authorize("admin"), updateDepartment);
router.delete("/:id", protect, authorize("admin"), deleteDepartment);

module.exports = router;
