const ResourceRequest = require("../models/ResourceRequest");
const Resource = require("../models/Resource");

// Create Resource Request

const createResourceRequest = async (req, res) => {
    try {
        const {
            resource,
            requestedFrom,
            startDate,
            endDate,
            purpose
        } = req.body;

        // Get the logged-in user's ID from the verified JWT
        const requestedBy = req.user.id;

        if (
            !resource ||
            !requestedFrom ||
            !startDate ||
            !endDate ||
            !purpose
        ) {
            return res.status(400).json({
                message: "Please provide resource, department, start date, end date, and purpose"
            });
        }

        if (
            isNaN(Date.parse(startDate)) ||
            isNaN(Date.parse(endDate)) ||
            new Date(startDate) >= new Date(endDate)
        ) {
            return res.status(400).json({
                message: "Please provide valid dates and ensure the end date is after the start date"
            });
        }

        const selectedResource = await Resource.findById(resource);

        if (!selectedResource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        const existingRequest = await ResourceRequest.findOne({
            resource,
            status: { $in: ["pending", "approved"] },
            startDate: { $lt: new Date(endDate) },
            endDate: { $gt: new Date(startDate) }
        });

        if (existingRequest) {
            return res.status(409).json({
                message: "Resource is already requested for this time period"
            });
        }

        const resourceRequest = await ResourceRequest.create({
            resource,
            requestedBy,
            requestedFrom,
            startDate,
            endDate,
            purpose
        });

        res.status(201).json(resourceRequest);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create resource request",
            error: error.message
        });
    }
};


// Get All Resource Requests
const getResourceRequests = async (req, res) => {
    try {
        const requests = await ResourceRequest.find()
            .populate("resource", "name type")
            .populate("requestedBy", "name email role")
            .populate("requestedFrom", "name code");

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch resource requests",
            error: error.message
        });
    }
};

// Get Resource Request By ID
const getResourceRequestById = async (req, res) => {
    try {
        const request = await ResourceRequest.findById(req.params.id)
            .populate("resource", "name type")
            .populate("requestedBy", "name email role")
            .populate("requestedFrom", "name code");

        if (!request) {
            return res.status(404).json({
                message: "Resource request not found"
            });
        }

        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch resource request",
            error: error.message
        });
    }
};

// Update Resource Request
const updateResourceRequest = async (req, res) => {
    try {
        const request = await ResourceRequest.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        )
            .populate("resource", "name type")
            .populate("requestedBy", "name email role")
            .populate("requestedFrom", "name code");

        if (!request) {
            return res.status(404).json({
                message: "Resource request not found"
            });
        }

        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update resource request",
            error: error.message
        });
    }
};

// Delete Resource Request
const deleteResourceRequest = async (req, res) => {
    try {
        const request = await ResourceRequest.findByIdAndDelete(req.params.id);

        if (!request) {
            return res.status(404).json({
                message: "Resource request not found"
            });
        }

        res.status(200).json({
            message: "Resource request deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete resource request",
            error: error.message
        });
    }
};

// Find Alternative Resources
const findAlternativeResources = async (req, res) => {
    try {
        const { resource, startDate, endDate } = req.query;
        if (!resource || !startDate || !endDate) {
    return res.status(400).json({
        message: "Resource, startDate, and endDate are required"
    });
}

if (
    isNaN(Date.parse(startDate)) ||
    isNaN(Date.parse(endDate)) ||
    new Date(startDate) >= new Date(endDate)
) {
    return res.status(400).json({
        message: "Please provide valid dates and ensure endDate is after startDate"
    });
}

        const selectedResource = await Resource.findById(resource);

        if (!selectedResource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        const busyRequests = await ResourceRequest.find({
    resource: { $ne: resource },
    status: { $in: ["pending", "approved"] },
    startDate: { $lt: endDate },
    endDate: { $gt: startDate }
}).select("resource");

const busyResourceIds = busyRequests.map(request => request.resource);

const alternatives = await Resource.find({
    _id: {
        $ne: resource,
        $nin: busyResourceIds
    },
    type: selectedResource.type,
    availability: true
}).populate("department", "name code");
        res.status(200).json(alternatives);
    } catch (error) {
        res.status(500).json({
            message: "Failed to find alternative resources",
            error: error.message
        });
    }
};

// Approve or Reject Resource Request

const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be approved or rejected"
            });
        }

        const request = await ResourceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                message: "Resource request not found"
            });
        }

        // Check for overlapping requests before approval
        if (status === "approved") {
            const existingRequest = await ResourceRequest.findOne({
                _id: { $ne: request._id },
                resource: request.resource,
                status: "approved",
                startDate: { $lt: request.endDate },
                endDate: { $gt: request.startDate }
            });

            if (existingRequest) {
                return res.status(409).json({
                    message: "Cannot approve: resource is already allocated during this time period"
                });
            }
        }

        request.status = status;
        await request.save();

        await request.populate([
            { path: "resource", select: "name type" },
            { path: "requestedBy", select: "name email role" },
            { path: "requestedFrom", select: "name code" }
        ]);

        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update request status",
            error: error.message
        });
    }
};

module.exports = {
    createResourceRequest,
    getResourceRequests,
    getResourceRequestById,
    updateResourceRequest,
    deleteResourceRequest,
    findAlternativeResources,
    updateRequestStatus
};