import BarangayClearance from "../models/barangay.clearance.model.js";
import BarangayIndigency from "../models/barangay.indigency.model.js";
import BusinessClearance from "../models/business.clearance.model.js";
import Cedula from "../models/cedula.model.js";
import User from "../models/user.model.js";
import {
    sendDocumentRequestNotification,
    sendDocumentStatusNotification,
    createNotification,
} from "../utils/notifications.js";
import { updateTransactionStatus } from "./transaction.history.controller.js";
import { STATUS_TYPES } from "../models/barangay.clearance.model.js";

// Generic function to update document status
export const updateDocumentStatus = async (Model, requestType, id, status, secretaryName) => {
    try {
        const document = await Model.findById(id);
        if (!document) {
            throw new Error(`${requestType} not found`);
        }

        // Normalize status value to match enum
        const normalizedStatus = Object.values(STATUS_TYPES).find(
            (s) => s.toLowerCase() === status.toLowerCase()
        );

        if (!normalizedStatus) {
            throw new Error(`Invalid status: ${status}`);
        }

        // Update document fields
        document.isVerified = [
            STATUS_TYPES.APPROVED,
            STATUS_TYPES.FOR_PICKUP,
            STATUS_TYPES.COMPLETED,
        ].includes(normalizedStatus);

        document.status = normalizedStatus;
        document.approvedBy = secretaryName;

        // Handle dates based on status
        const currentDate = new Date();

        switch (normalizedStatus) {
            case STATUS_TYPES.APPROVED:
                if (!document.dateApproved) {
                    document.dateApproved = currentDate;
                }
                break;
            case STATUS_TYPES.FOR_PICKUP:
                if (!document.dateApproved) {
                    document.dateApproved = currentDate;
                }
                break;
            case STATUS_TYPES.COMPLETED:
                document.dateCompleted = currentDate;
                if (!document.dateApproved) {
                    document.dateApproved = currentDate;
                }
                break;
        }

        await document.save();

        console.log("Updating document with secretary:", secretaryName, {
            status: normalizedStatus,
            dateApproved: document.dateApproved,
            dateCompleted: document.dateCompleted,
        });

        // Update transaction history
        await updateTransactionStatus(id, {
            status: normalizedStatus,
            dateApproved: document.dateApproved,
            dateCompleted: document.dateCompleted,
            action: "updated",
            approvedBy: secretaryName,
        });

        // Map display names to enum values
        const docModelMap = {
            "Business Clearance": "BusinessClearance",
            "Barangay Clearance": "BarangayClearance",
            "Barangay Indigency": "BarangayIndigency",
            Cedula: "Cedula",
        };

        // Get the correct enum value
        const docModel = docModelMap[requestType];
        if (!docModel) {
            throw new Error(`Invalid document type: ${requestType}`);
        }

        // Create status update notification with secretary info
        const statusNotification = createNotification(
            `${requestType} Status Update`,
            `Your ${requestType.toLowerCase()} request has been ${normalizedStatus.toLowerCase()} by the barangay secretary.`,
            "status_update",
            document._id,
            docModel
        );

        // Find user and update their notifications
        if (document.userId) {
            await User.findByIdAndUpdate(document.userId, {
                $push: { notifications: statusNotification },
                $inc: { unreadNotifications: 1 },
            });
        } else if (document.email) {
            const user = await User.findOne({ email: document.email });
            if (user) {
                user.notifications.push(statusNotification);
                user.unreadNotifications += 1;
                await user.save();
            }
        }

        return document;
    } catch (error) {
        console.error("Error updating document status:", error);
        throw error;
    }
};

// Get all document requests for a barangay
export const getAllDocumentRequests = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { barangay } = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

        // Fetch requests from all document types
        const [clearances, indigency, business, cedulas] = await Promise.all([
            BarangayClearance.find({ barangay }).sort({ createdAt: -1 }),
            BarangayIndigency.find({ barangay }).sort({ createdAt: -1 }),
            BusinessClearance.find({ barangay }).sort({ createdAt: -1 }),
            Cedula.find({ barangay }).sort({ createdAt: -1 }),
        ]);

        // Transform and combine all requests
        const allRequests = [
            ...clearances.map((doc) => ({
                id: doc._id.toString(), // Primary ID field
                _id: doc._id.toString(), // Backup ID field
                type: "Barangay Clearance",
                name: doc.name,
                residentName: doc.name,
                email: doc.email,
                contactNumber: doc.contactNumber,
                age: doc.age,
                sex: doc.sex,
                dateOfBirth: doc.dateOfBirth,
                civilStatus: doc.civilStatus,
                purok: doc.purok,
                placeOfBirth: doc.placeOfBirth,
                barangay: doc.barangay,
                purpose: doc.purpose,
                paymentMethod: doc.paymentMethod,
                amount: doc.amount,
                dateOfPayment: doc.dateOfPayment,
                referenceNumber: doc.referenceNumber,
                orNumber: doc.orNumber,
                receipt: doc.receipt
                    ? {
                          filename: doc.receipt.filename,
                          contentType: doc.receipt.contentType,
                          data: doc.receipt.data,
                      }
                    : null,
                status: doc.status,
                requestDate: doc.createdAt,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
                dateApproved: doc.dateApproved,
                dateCompleted: doc.dateCompleted,
                isVerified: doc.isVerified,
            })),
            ...indigency.map((doc) => ({
                id: doc._id.toString(),
                _id: doc._id.toString(),
                type: "Barangay Indigency",
                name: doc.name,
                residentName: doc.name,
                email: doc.email,
                contactNumber: doc.contactNumber,
                age: doc.age,
                purok: doc.purok,
                purpose: doc.purpose,
                barangay: doc.barangay,
                paymentMethod: doc.paymentMethod,
                amount: doc.amount,
                dateOfPayment: doc.dateOfPayment,
                referenceNumber: doc.referenceNumber,
                receipt: doc.receipt
                    ? {
                          filename: doc.receipt.filename,
                          contentType: doc.receipt.contentType,
                          data: doc.receipt.data,
                      }
                    : null,
                status: doc.status,
                requestDate: doc.createdAt,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            })),
            ...business.map((doc) => ({
                id: doc._id.toString(),
                _id: doc._id.toString(),
                type: "Business Clearance",
                ...doc.toObject(),
                requestDate: doc.createdAt,
            })),
            ...cedulas.map((doc) => ({
                id: doc._id.toString(),
                _id: doc._id.toString(),
                type: "Cedula",
                name: doc.name,
                residentName: doc.name,
                dateOfBirth: doc.dateOfBirth,
                placeOfBirth: doc.placeOfBirth,
                civilStatus: doc.civilStatus,
                occupation: doc.occupation,
                salary: doc.salary,
                paymentMethod: doc.paymentMethod,
                amount: doc.amount,
                dateOfPayment: doc.dateOfPayment,
                referenceNumber: doc.referenceNumber,
                receipt: doc.receipt
                    ? {
                          filename: doc.receipt.filename,
                          contentType: doc.receipt.contentType,
                          data: doc.receipt.data,
                      }
                    : null,
                status: doc.status,
                requestDate: doc.createdAt,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            })),
        ];

        // Debug log to check IDs
        console.log(
            "Document IDs being sent:",
            allRequests.map((r) => ({
                id: r.id,
                _id: r._id,
                type: r.type,
            }))
        );

        // Sort by creation date
        const sortedRequests = allRequests.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Apply pagination
        const paginatedRequests = sortedRequests.slice(skip, skip + limit);

        res.status(200).json({
            success: true,
            data: paginatedRequests,
            pagination: {
                total: allRequests.length,
                page,
                limit,
                totalPages: Math.ceil(allRequests.length / limit),
            },
        });
    } catch (error) {
        console.error("Error in getAllDocumentRequests:", error);
        next(error);
    }
};

// Generic function to create document request
const createDocumentRequest = async (Model, documentType, data, barangay) => {
    try {
        const document = new Model({
            ...data,
            userId: data.userId,
            email: data.email,
            barangay,
            status: "pending",
            documentType,
        });

        await document.save();
        return document;
    } catch (error) {
        console.error(`Error creating ${documentType}:`, error);
        throw error;
    }
};

// Create document request handlers
export const createBarangayClearance = async (req, res, next) => {
    try {
        const document = await createDocumentRequest(
            BarangayClearance,
            "Barangay Clearance",
            req.body,
            req.user.barangay
        );

        res.status(201).json({
            success: true,
            message: "Barangay clearance request created successfully",
            data: document,
        });
    } catch (error) {
        console.error("Error creating barangay clearance:", error);
        next(error);
    }
};

export const createBarangayIndigency = async (req, res, next) => {
    try {
        const document = await createDocumentRequest(
            BarangayIndigency,
            "Barangay Indigency",
            req.body,
            req.user.barangay
        );

        res.status(201).json({
            success: true,
            message: "Barangay indigency request created successfully",
            data: document,
        });
    } catch (error) {
        console.error("Error creating barangay indigency:", error);
        next(error);
    }
};

// Update status handlers
export const updateBarangayClearanceStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, secretaryName } = req.body;
        const approver = secretaryName || req.user.name;

        const document = await updateDocumentStatus(
            BarangayClearance,
            "Barangay Clearance",
            id,
            status,
            approver
        );

        res.status(200).json({
            success: true,
            message: `Document ${status.toLowerCase()} successfully`,
            data: document,
        });
    } catch (error) {
        console.error("Error updating barangay clearance status:", error);
        next(error);
    }
};

export const updateBarangayIndigencyStatus = async (req, res, next) => {
    try {
        const { status, secretaryName } = req.body;
        const approver = secretaryName || req.user.name;

        const document = await updateDocumentStatus(
            BarangayIndigency,
            "Barangay Indigency",
            req.params.id,
            status,
            approver
        );

        res.status(200).json({
            success: true,
            data: document,
        });
    } catch (error) {
        console.error("Error updating barangay indigency status:", error);
        next(error);
    }
};

// Add these exports for business clearance and cedula
export const createBusinessClearance = async (req, res, next) => {
    try {
        const document = await createDocumentRequest(
            BusinessClearance,
            "Business Clearance",
            req.body,
            req.user.barangay
        );

        res.status(201).json({
            success: true,
            message: "Business clearance request created successfully",
            data: document,
        });
    } catch (error) {
        next(error);
    }
};

export const createCedula = async (req, res, next) => {
    try {
        const document = await createDocumentRequest(Cedula, "Cedula", req.body, req.user.barangay);

        res.status(201).json({
            success: true,
            message: "Cedula request created successfully",
            data: document,
        });
    } catch (error) {
        console.error("Error creating cedula request:", error);
        next(error);
    }
};

export const updateBusinessClearanceStatus = async (req, res, next) => {
    try {
        const { status, secretaryName } = req.body;
        const approver = secretaryName || req.user.name;

        const document = await updateDocumentStatus(
            BusinessClearance,
            "Business Clearance",
            req.params.id,
            status,
            approver
        );

        res.status(200).json({
            success: true,
            data: document,
        });
    } catch (error) {
        next(error);
    }
};

export const updateCedulaStatus = async (req, res, next) => {
    try {
        const { status, secretaryName } = req.body;
        const approver = secretaryName || req.user.name;

        const document = await updateDocumentStatus(
            Cedula,
            "Cedula",
            req.params.id,
            status,
            approver
        );

        res.status(200).json({
            success: true,
            data: document,
        });
    } catch (error) {
        console.error("Error updating cedula status:", error);
        next(error);
    }
};

// Update getUserDocumentRequests function
export const getUserDocumentRequests = async (req, res, next) => {
    try {
        // Extract user info from the authenticated request
        const userId = req.user.id; // Get the user ID
        const userEmail = req.user.email;
        const { barangay } = req.user;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Create base query with both userId and email
        const baseQuery = {
            barangay,
            $or: [{ userId: userId }, { email: userEmail }],
        };

        // Update queries to use both userId and email
        const [clearances, indigency, business, cedulas] = await Promise.all([
            BarangayClearance.find(baseQuery).sort({ createdAt: -1 }),
            BarangayIndigency.find(baseQuery).sort({ createdAt: -1 }),
            BusinessClearance.find(baseQuery).sort({ createdAt: -1 }),
            Cedula.find(baseQuery).sort({ createdAt: -1 }),
        ]);

        // Combine and format all requests
        const allRequests = [
            ...clearances.map((doc) => ({
                ...doc.toObject(),
                documentType: "Barangay Clearance",
            })),
            ...indigency.map((doc) => ({
                ...doc.toObject(),
                documentType: "Barangay Indigency",
            })),
            ...business.map((doc) => ({
                ...doc.toObject(),
                documentType: "Business Clearance",
            })),
            ...cedulas.map((doc) => ({
                ...doc.toObject(),
                documentType: "Cedula",
            })),
        ];

        // Sort by creation date
        const sortedRequests = allRequests.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Apply pagination
        const paginatedRequests = sortedRequests.slice(skip, skip + limit);

        res.status(200).json({
            success: true,
            data: paginatedRequests,
            pagination: {
                total: allRequests.length,
                page,
                limit,
                totalPages: Math.ceil(allRequests.length / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

// Add this function to get a specific document request
export const getDocumentRequestById = async (req, res, next) => {
    try {
        const { id, type } = req.params;
        const userId = req.user._id;
        const { barangay } = req.user;

        let document;
        switch (type.toLowerCase()) {
            case "clearance":
                document = await BarangayClearance.findOne({ _id: id, userId, barangay });
                break;
            case "indigency":
                document = await BarangayIndigency.findOne({ _id: id, userId, barangay });
                break;
            case "business":
                document = await BusinessClearance.findOne({ _id: id, userId, barangay });
                break;
            case "cedula":
                document = await Cedula.findOne({ _id: id, userId, barangay });
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid document type",
                });
        }

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document request not found",
            });
        }

        res.status(200).json({
            success: true,
            data: document,
        });
    } catch (error) {
        console.error("Error fetching document request:", error);
        next(error);
    }
};
