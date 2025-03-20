import BarangayClearance from "../models/barangay.clearance.model.js";
import {
    sendNotificationToBarangaySecretaries,
    createNotification,
} from "../utils/notifications.js";
import User from "../models/user.model.js";
import { createLog } from "./log.controller.js";
import { createTransactionHistory } from "./transaction.history.controller.js";

export const createBarangayClearance = async (req, res, next) => {
    try {
        const {
            userId,
            name,
            email,
            contactNumber,
            purpose,
            barangay,
            age,
            purok,
            dateOfBirth,
            sex,
            placeOfBirth,
            civilStatus,
            paymentMethod,
            referenceNumber,
            dateOfPayment,
            receipt,
            amount,
        } = req.body;

        // Validate only the essential required fields
        if (
            !purpose ||
            !paymentMethod ||
            !dateOfPayment ||
            !placeOfBirth ||
            !civilStatus ||
            !receipt
        ) {
            console.log("Missing required fields:", {
                purpose: !purpose,
                paymentMethod: !paymentMethod,
                dateOfPayment: !dateOfPayment,
                placeOfBirth: !placeOfBirth,
                civilStatus: !civilStatus,
                receipt: !receipt,
            });
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
                missingFields: {
                    purpose: !purpose,
                    paymentMethod: !paymentMethod,
                    dateOfPayment: !dateOfPayment,
                    placeOfBirth: !placeOfBirth,
                    civilStatus: !civilStatus,
                    receipt: !receipt,
                },
            });
        }

        // Validate reference number for digital payments
        if (["GCash", "Paymaya"].includes(paymentMethod) && !referenceNumber) {
            return res.status(400).json({
                success: false,
                message: "Reference number is required for digital payments",
            });
        }

        // check if reference number is unique
        const existingClearance = await BarangayClearance.findOne({ referenceNumber });
        if (existingClearance) {
            return res.status(400).json({
                success: false,
                message: "Reference number already exists",
            });
        }
        
        try {
            // Get user data to ensure we have complete information
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // Create new clearance document with complete user data
            const barangayClearance = new BarangayClearance({
                userId,
                name:
                    user.firstName +
                    (user.middleName ? ` ${user.middleName} ` : " ") +
                    user.lastName,
                email: user.email,
                age: user.age || age,
                contactNumber: user.contactNumber,
                barangay: user.barangay,
                purpose,
                purok: user.purok,
                dateOfBirth: user.dateOfBirth,
                sex: user.sex || sex,
                placeOfBirth,
                civilStatus,
                paymentMethod,
                referenceNumber,
                dateOfPayment: new Date(dateOfPayment),
                amount,
                receipt: receipt
                    ? {
                          filename: receipt.filename,
                          contentType: receipt.contentType,
                          data: receipt.data,
                      }
                    : null,
            });

            // Create log entry
            await createLog(
                userId,
                "Barangay Clearance Request",
                "Barangay Clearance",
                `${name} has requested a barangay clearance for ${purpose}`
            );

            const savedClearance = await barangayClearance.save();
            console.log("Clearance saved successfully:", savedClearance._id);

            // Create transaction history
            await createTransactionHistory({
                userId,
                transactionId: savedClearance._id,
                residentName: name,
                requestedDocument: "Barangay Clearance",
                dateRequested: new Date(),
                barangay,
                action: "created",
                status: "Pending",
            });

            // Create and send notification to secretaries
            const staffNotification = createNotification(
                "New Barangay Clearance Request",
                `${name} has requested a barangay clearance for ${purpose}`,
                "request",
                savedClearance._id,
                "BarangayClearance"
            );

            // Send notification to secretaries of the user's barangay
            await sendNotificationToBarangaySecretaries(barangay, staffNotification);

            res.status(201).json({
                success: true,
                message: "Barangay clearance request created successfully",
                data: {
                    ...savedClearance.toObject(),
                    type: "Barangay Clearance",
                },
            });
        } catch (saveError) {
            console.error("Error saving barangay clearance:", {
                error: saveError.message,
                stack: saveError.stack,
                validationErrors: saveError.errors,
            });
            throw saveError;
        }
    } catch (error) {
        console.error("Error creating barangay clearance:", {
            error: error.message,
            stack: error.stack,
            validationErrors: error.errors,
        });
        res.status(500).json({
            success: false,
            message: "Error creating barangay clearance",
            error: error.message,
        });
    }
};

export const approveBarangayClearance = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, orNumber, treasurerName } = req.body;

        console.log("Received status update request:", { id, status, orNumber, treasurerName });

        const barangayClearance = await BarangayClearance.findById(id);

        if (!barangayClearance) {
            return res.status(404).json({
                success: false,
                message: "Barangay clearance not found",
            });
        }

        // Validate OR number is provided when approving
        if (status === "Approved" && !orNumber) {
            return res.status(400).json({
                success: false,
                message: "OR number is required when approving a clearance",
            });
        }

        // check if or number is unique
        const existingClearance = await BarangayClearance.findOne({ orNumber });
        if (existingClearance) {
            return res.status(400).json({
                success: false,
                message: "OR number already exists",
            });
        }

        const currentDate = new Date();
        // Update status-related fields
        barangayClearance.status = status;
        barangayClearance.isVerified = status === "Approved";

        // Add OR Number when approving
        if (status === "Approved") {
            barangayClearance.orNumber = orNumber;
            barangayClearance.treasurerName = treasurerName || (req.user ? req.user.name : null);
            barangayClearance.dateApproved = currentDate;
            barangayClearance.dateOfIssuance = currentDate;
        } else if (status === "Completed") {
            barangayClearance.dateCompleted = currentDate;
        }

        await barangayClearance.save();

        // Create log entry for the status update
        try {
            if (req.user && req.user._id) {
                const logMessage = `Barangay clearance request ID: ${id} status updated to ${status}${
                    orNumber ? ` with OR Number: ${orNumber}` : ""
                }`;

                await createLog(
                    req.user._id,
                    "Barangay Clearance Status Update",
                    "Status Update",
                    logMessage
                );
            }
        } catch (logError) {
            console.error("Error creating log entry:", logError);
            // Continue even if log creation fails
        }

        // Create and send notification to the requestor
        try {
            const user = await User.findOne({ email: barangayClearance.email });
            if (user) {
                const staffInfo = treasurerName || (req.user ? req.user.name : "staff");

                const notification = createNotification(
                    "Barangay Clearance Status Update",
                    `Your barangay clearance request has been ${status} by ${staffInfo}${
                        orNumber ? ` with OR Number: ${orNumber}` : ""
                    }`,
                    "status_update",
                    barangayClearance._id,
                    "BarangayClearance"
                );

                // Update user's notifications
                user.notifications.push(notification);
                user.unreadNotifications += 1;
                await user.save();
            }
        } catch (notificationError) {
            console.error("Error sending notification:", notificationError);
            // Continue even if notification fails
        }

        // Update transaction history
        try {
            await createTransactionHistory({
                userId: barangayClearance.userId,
                transactionId: barangayClearance._id,
                residentName: barangayClearance.name,
                requestedDocument: "Barangay Clearance",
                dateRequested: barangayClearance.createdAt,
                barangay: barangayClearance.barangay,
                action: "updated",
                status: status,
                orNumber: orNumber || null,
            });
        } catch (historyError) {
            console.error("Error updating transaction history:", historyError);
            // Continue even if history update fails
        }

        res.status(200).json({
            success: true,
            message: `Barangay clearance status updated to ${status} successfully`,
            data: barangayClearance,
        });
    } catch (error) {
        console.error("Error updating barangay clearance status:", error);
        res.status(500).json({
            success: false,
            message: "Error updating barangay clearance status",
            error: error.message,
        });
    }
};

export const getBarangayClearanceForPrint = async (req, res) => {
    try {
        const { id } = req.params;
        const barangayClearance = await BarangayClearance.findById(id);

        if (!barangayClearance) {
            return res.status(404).json({
                success: false,
                message: "Barangay clearance not found",
            });
        }

        // Format the date fields
        const formattedClearance = {
            ...barangayClearance.toObject(),
            dateIssued: barangayClearance.dateApproved || barangayClearance.createdAt,
            dateOfBirth: new Date(barangayClearance.dateOfBirth).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
            }),
        };

        res.status(200).json({
            success: true,
            data: formattedClearance,
        });
    } catch (error) {
        console.error("Error fetching barangay clearance for print:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching barangay clearance",
        });
    }
};
