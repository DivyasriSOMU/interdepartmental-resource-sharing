
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register a new student
const createUser = async (req, res) => {
    try {
        const { name, email, password, department } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("UPDATED CREATE USER FUNCTION IS RUNNING");

        console.log("USER DATA:", {
           name,
           email,
           role: "student",
           department
        });
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: "student",
            department
        });

        await user.save();

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {
        res.status(error.code === 11000 ? 409 : 400).json({
            message: "Failed to create user",
            error: error.message
        });
    }
};

// Get all users (admin only)
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};

// Get user by ID (admin or account owner)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (
            req.user.role !== "admin" &&
            req.user.id !== user._id.toString()
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        res.status(200).json(user);

    } catch (error) {
        res.status(400).json({
            message: "Failed to fetch user"
        });
    }
};

// Update user (admin or account owner)
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isAdmin = req.user.role === "admin";
        const isOwner = req.user.id === user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        // Password changes must use a separate secure process
        if (req.body.password !== undefined) {
            return res.status(400).json({
                message: "Password cannot be changed through this endpoint"
            });
        }

        // Only admins can change another user's role
        if (req.body.role !== undefined) {
            if (!isAdmin || isOwner) {
                return res.status(403).json({
                    message: "You cannot change this role"
                });
            }

            user.role = req.body.role;
        }

        // Update only permitted fields
        if (req.body.name !== undefined) {
            user.name = req.body.name;
        }

        if (req.body.email !== undefined) {
            user.email = req.body.email;
        }

        if (req.body.department !== undefined) {
            user.department = req.body.department;
        }

        await user.save();

        res.status(200).json({
            message: "User updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {
        res.status(error.code === 11000 ? 409 : 400).json({
            message: "Failed to update user",
            error: error.message
        });
    }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to delete user"
        });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id.toString(),
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed"
        });
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    loginUser
};
