const mongoose = require("mongoose");

const resourceRequestSchema = new mongoose.Schema(
    {
        resource: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resource",
            required: true
        },

        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        requestedFrom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        purpose: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

const ResourceRequest = mongoose.model(
    "ResourceRequest",
    resourceRequestSchema
);

module.exports = ResourceRequest;