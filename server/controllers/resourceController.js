const Resource = require("../models/Resource");

// Create Resource
const createResource = async (req, res) => {
    try {
        const { name, type, description, department, availability } = req.body;

        const resource = await Resource.create({
            name,
            type,
            description,
            department,
            availability
        });

        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create resource",
            error: error.message
        });
    }
};

// Get All Resources
const getResources = async (req, res) => {
    try {
        const resources = await Resource.find()
            .populate("department", "name code");

        res.status(200).json(resources);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch resources",
            error: error.message
        });
    }
};

// Get Resource By ID
const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate("department", "name code");

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        res.status(200).json(resource);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch resource",
            error: error.message
        });
    }
};

// Update Resource
const updateResource = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate("department", "name code");

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        res.status(200).json(resource);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update resource",
            error: error.message
        });
    }
};

// Delete Resource
const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndDelete(req.params.id);

        if (!resource) {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        res.status(200).json({
            message: "Resource deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete resource",
            error: error.message
        });
    }
};

module.exports = {
    createResource,
    getResources,
    getResourceById,
    updateResource,
    deleteResource
};