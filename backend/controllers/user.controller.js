import User from "../models/user.model.js";
import {
    sendVerificationConfirmationEmail,
    sendDeactivationEmail,
    sendActivationEmail,
} from "../utils/emails.js";
import bcrypt from 'bcryptjs';

export const getUsersByBarangay = async (req, res, next) => {
    try {
        const { role, barangay } = req.user;

        // Check if user has permission to access this data
        if (role !== "secretary" && role !== "chairman") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Not authorized.",
            });
        }

        // Find users from the same barangay, including inactive ones
        const users = await User.find({
            barangay,
            // Exclude admin users from results
            role: { $nin: ["admin"] },
        })
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

// Get a single user by ID
export const getUserById = async (req, res, next) => {
    try {
        const { role, barangay } = req.user;
        const { userId } = req.params;

        // Check if user has permission
        if (role !== "secretary" && role !== "chairman") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Not authorized.",
            });
        }

        const user = await User.findOne({
            _id: userId,
            barangay, // Ensure user belongs to same barangay
        }).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// Add this method to the existing user.controller.js
export const verifyUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.user;

        console.log('Verifying user:', userId);

        // Check if user has permission
        if (role !== "secretary" && role !== "chairman" && role !== "superAdmin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Not authorized.",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Update verification status
        user.isVerified = true;
        await user.save();

        // Send verification email
        try {
            const emailSent = await sendVerificationConfirmationEmail(user);
            if (!emailSent) {
                console.log("Failed to send verification email");
            }
        } catch (emailError) {
            console.log("Error sending verification email:", emailError);
        }

        res.status(200).json({
            success: true,
            message: "User verified successfully",
            data: user,
        });
    } catch (error) {
        console.error('Verification error:', error);
        next(error);
    }
};

export const rejectUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.user;

        console.log('Rejecting user:', userId);

        // Check if user has permission
        if (role !== "secretary" && role !== "chairman" && role !== "superAdmin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Not authorized.",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Set user as rejected
        user.isVerified = false;
        await user.save();

        // Add email notification if needed
        try {
            // You can add rejection email notification here if needed
            console.log('User rejected:', user.email);
        } catch (emailError) {
            console.log('Error sending rejection email:', emailError);
        }

        res.status(200).json({
            success: true,
            message: "User rejected successfully",
            data: user,
        });
    } catch (error) {
        console.error('Rejection error:', error);
        next(error);
    }
};

// Add this new controller method
export const deactivateUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        const { role } = req.user;

        console.log('Deactivating user:', userId); // Add logging

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Deactivation reason is required",
            });
        }

        // Check if user has permission
        if (role !== "secretary" && role !== "chairman" && role !== "superAdmin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Not authorized.",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Don't allow deactivation of admin/chairman/secretary accounts
        if (user.role === "superAdmin" || user.role === "chairman" || user.role === "secretary") {
            return res.status(403).json({
                success: false,
                message: "Cannot deactivate admin or staff accounts",
            });
        }

        // Set user as inactive
        user.isActive = false;
        await user.save();

        // Send deactivation email
        try {
            const emailSent = await sendDeactivationEmail(user, reason);
            if (!emailSent) {
                console.log("Failed to send deactivation email");
            }
        } catch (emailError) {
            console.log("Error sending deactivation email:", emailError);
        }

        res.status(200).json({
            success: true,
            message: "User deactivated successfully",
            data: user,
        });
    } catch (error) {
        console.error('Deactivation error:', error);
        next(error);
    }
};

export const activateUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Add some logging
        console.log('Activating user:', userId);

        const user = await User.findById(userId);

        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.isActive = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: "User activated successfully",
            data: user,
        });
    } catch (error) {
        console.error('Activation error:', error);
        next(error);
    }
};

// Update this method to get all users from secretary's barangay
export const getResidentsByBarangay = async (req, res, next) => {
    try {
        const { barangay, role } = req.user;

        // Check if user is authorized
        if (role !== "secretary" && role !== "chairman") {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access resident information",
            });
        }

        // Find all users from the same barangay except superAdmin
        const residents = await User.find({
            barangay,
            role: { $ne: "superAdmin" },
        })

            .select("-password") // Exclude password
            .sort({ createdAt: -1 });

        // Add verification status badges
        const formattedResidents = residents.map((resident) => ({
            ...resident.toObject(),
            status: getResidentStatus(resident),
            statusVariant: getStatusVariant(resident),
        }));

        res.status(200).json({
            success: true,
            count: residents.length,
            data: formattedResidents,
        });
    } catch (error) {
        console.error("Error fetching residents:", error);
        next(error);
    }
};

// Helper function to determine resident status
const getResidentStatus = (resident) => {
    if (!resident.isVerified) return "Unverified";
    if (!resident.isActive) return "Inactive";
    return "Active";
};

// Helper function to determine badge variant
const getStatusVariant = (resident) => {
    if (!resident.isVerified) return "warning";
    if (!resident.isActive) return "destructive";
    return "success";
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, "-password -notifications");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { oldPassword, newPassword } = req.body;

        // Validate inputs
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Both old and new passwords are required",
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password does not match",
                isPasswordError: true
            });
        }

        // Password validation
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters long",
            });
        }

        try {
            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update password
            user.password = hashedPassword;
            await user.save();

            return res.status(200).json({
                success: true,
                message: "Password updated successfully",
            });
        } catch (saveError) {
            console.error("Error saving new password:", saveError);
            return res.status(500).json({
                success: false,
                message: "Error updating password",
            });
        }
    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, contactNumber, dateOfBirth } = req.body;
        const { role } = req.user;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if user is updating their own profile or has admin privileges
        if (userId !== req.user.id && role !== "superAdmin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this profile",
            });
        }

        // Check if email is being changed and if it's already taken
        if (email !== user.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: userId } });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists",
                });
            }
        }

        // Update fields based on role
        const updateFields = {};

        if (role === "superAdmin") {
            // SuperAdmin can update all fields
            if (name) updateFields.name = name;
            if (email) updateFields.email = email;
            if (contactNumber) updateFields.contactNumber = contactNumber;
            if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
        } else {
            // All other users can update these fields
            if (name) updateFields.name = name;
            if (contactNumber) updateFields.contactNumber = contactNumber;
            if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true }
        ).select("-password");

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: error.message,
        });
    }
};

// Add this new controller method
export const getBarangayChairman = async (req, res, next) => {
    try {
        const { barangay } = req.user;

        const chairman = await User.findOne({
            barangay,
            role: "chairman",
            isActive: true,
            isVerified: true
        }).select("-password");

        if (!chairman) {
            return res.status(404).json({
                success: false,
                message: "Barangay chairman not found",
            });
        }

        res.status(200).json({
            success: true,
            data: chairman,
        });
    } catch (error) {
        next(error);
    }
};

