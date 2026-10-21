const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    createResourceRequest,
    getResourceRequests,
    getResourceRequestById,
    updateResourceRequest,
    deleteResourceRequest,
    findAlternativeResources,
     updateRequestStatus
} = require("../controllers/resourceRequestController");

// Create Resource Request
router.post("/", protect, createResourceRequest);

// Get All Resource Requests
router.get("/", getResourceRequests);

router.get("/alternatives", findAlternativeResources);

router.put("/:id/status", protect, authorize("admin"), updateRequestStatus);

// Get Resource Request By ID
router.get("/:id", getResourceRequestById);

// Update Resource Request
router.put("/:id", updateResourceRequest);

// Delete Resource Request
router.delete("/:id", deleteResourceRequest);

module.exports = router;