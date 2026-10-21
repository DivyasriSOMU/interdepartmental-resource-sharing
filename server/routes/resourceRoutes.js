
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    createResource,
    getResources,
    getResourceById,
    updateResource,
    deleteResource
} = require("../controllers/resourceController");

// Admin-only: Create a resource
router.post("/", protect, authorize("admin"), createResource);

// View resources
router.get("/", getResources);
router.get("/:id", getResourceById);

// Admin-only: Update or delete resources
router.put("/:id", protect, authorize("admin"), updateResource);
router.delete("/:id", protect, authorize("admin"), deleteResource);

module.exports = router;
