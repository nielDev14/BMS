import BusinessClearance from "../models/business.clearance.model.js";
import {
    createNotification,
    sendNotificationToBarangaySecretaries,
} from "../utils/notifications.js";
import User from "../models/user.model.js";
import { createLog } from "./log.controller.js";
import { createTransactionHistory } from "./transaction.history.controller.js";
import { STATUS_TYPES } from "../models/business.clearance.model.js";

export const createBusinessClearance = async (req, res, next) => {
    try {
        const data = req.body;
        const requiredFields = [
            "ownerName",
            "businessName",
            "barangay",
            "municipality",
            "province",
            "businessType",
            "businessNature",
            "purpose",
            "businessLocation",
            "operatorManager",
            "contactNumber",
            "email",
            "dtiSecRegistration",
            "barangayClearance",
            "validId",
            "paymentMethod",
            "dateOfPayment",
            "receipt",
        ];

        // Validate required fields
        const missingFields = requiredFields.filter((field) => !data[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: " + missingFields.join(", "),
            });
        }

        // Validate reference number for digital payments
        if (["GCash", "Paymaya"].includes(data.paymentMethod) && !data.referenceNumber) {
            return res.status(400).json({
                success: false,
                message: "Reference number is required for digital payments",
            });
        }

        // Construct owner's address from location fields
        const ownerAddress = `${data.barangay}, ${data.municipality}, ${data.province}`;

        const businessClearance = new BusinessClearance({
            ...data,
            ownerAddress,
            dateOfPayment: new Date(data.dateOfPayment),
        });

        await createLog(
            data.userId,
            "Business Clearance Request",
            "Business Clearance",
            `${data.ownerName} has requested a business clearance for ${data.businessName}`
        );

        const savedClearance = await businessClearance.save();

        await createTransactionHistory({
            userId: data.userId,
            transactionId: savedClearance._id,
            residentName: data.ownerName,
            requestedDocument: "Business Clearance",
            dateRequested: new Date(),
            barangay: data.barangay,
            action: "created",
            status: STATUS_TYPES.PENDING,
        });

        const staffNotification = createNotification(
            "New Business Clearance Request",
            `${data.ownerName} has requested a business clearance for ${data.businessName}`,
            "request",
            savedClearance._id,
            "BusinessClearance"
        );

        await sendNotificationToBarangaySecretaries(data.barangay, staffNotification);

        res.status(201).json({
            success: true,
            message: "Business clearance request created successfully",
            data: savedClearance,
        });
    } catch (error) {
        console.error("Error creating business clearance:", error);
        res.status(500).json({ message: "Error creating business clearance" });
    }
};

export const getUserBusinessClearances = async (req, res, next) => {
    try {
        const businessClearances = await BusinessClearance.find({ userId: req.user.id });
        res.status(200).json({
            success: true,
            data: businessClearances,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllBusinessClearances = async (req, res, next) => {
    try {
        const businessClearances = await BusinessClearance.find()
            .populate("userId", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: businessClearances,
        });
    } catch (error) {
        next(error);
    }
};

export const updateBusinessClearanceStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { name: secretaryName, barangay } = req.user;

        if (!["secretary", "chairman"].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to verify business clearance requests",
            });
        }

        const businessClearance = await BusinessClearance.findOne({ _id: id, barangay });
        if (!businessClearance) {
            return res.status(404).json({
                success: false,
                message: "Business clearance not found",
            });
        }

        const currentDate = new Date();
        businessClearance.status = status;
        businessClearance.isVerified = [
            STATUS_TYPES.APPROVED,
            STATUS_TYPES.FOR_PICKUP,
            STATUS_TYPES.COMPLETED,
        ].includes(status);

        if (status === STATUS_TYPES.APPROVED) {
            businessClearance.dateApproved = currentDate;
            businessClearance.dateOfIssuance = currentDate;
        } else if (status === STATUS_TYPES.COMPLETED) {
            businessClearance.dateCompleted = currentDate;
        }

        await businessClearance.save();

        res.status(200).json({
            success: true,
            message: `Business clearance ${status.toLowerCase()} successfully`,
            data: businessClearance,
        });
    } catch (error) {
        console.error("Error updating business clearance:", error);
        next(error);
    }
};

export const printBusinessClearance = async (req, res) => {
    try {
        const { id } = req.params;
        const { barangay } = req.user;

        const clearance = await BusinessClearance.findOne({ _id: id, barangay }).populate(
            "userId",
            "firstName middleName lastName"
        );

        if (!clearance) {
            return res.status(404).json({
                success: false,
                message: "Business Clearance document not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                ...clearance.toObject(),
                dateIssued: clearance.dateApproved || clearance.createdAt,
                type: "Business Clearance",
            },
        });
    } catch (error) {
        console.error("Error fetching business clearance document:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching business clearance document",
        });
    }
};
