const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: ["equipment", "room", "lab", "software", "other"],
            required: true
        },

        description: {
            type: String
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true
        },

        availability: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Resource = mongoose.model("Resource", resourceSchema);

module.exports = Resource;