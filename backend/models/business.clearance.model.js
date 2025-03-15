import mongoose from "mongoose";

const STATUS_TYPES = {
    PENDING: "Pending",
    APPROVED: "Approved",
    FOR_PICKUP: "For Pickup",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
};

const businessClearanceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Business Owner Information
        ownerName: {
            type: String,
            required: true,
        },
        contactNumber: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },

        // Business Information
        businessName: {
            type: String,
            required: true,
        },
        businessType: {
            type: String,
            required: true,
        },
        businessNature: {
            type: String,
            enum: ["Single Proprietorship", "Partnership", "Corporation"],
            required: true,
        },
        businessLocation: {
            type: String,
            required: true,
        },
        operatorManager: {
            type: String,
            required: true,
        },

        // Location (Owner's Address)
        barangay: {
            type: String,
            required: true,
        },
        municipality: {
            type: String,
            required: true,
        },
        province: {
            type: String,
            required: true,
        },

        // Purpose
        purpose: {
            type: String,
            enum: [
                "Renewal of Permit",
                "New Business",
                "Change of Business Name",
                "Change of Location",
                "Additional Business Activity",
            ],
            required: true,
        },

        // Required Documents
        dtiSecRegistration: {
            type: String,
            required: true,
        },
        barangayClearance: {
            type: String,
            required: true,
        },
        validId: {
            type: String,
            required: true,
        },
        mayorsPermit: String,
        leaseContract: String,
        fireSafetyCertificate: String,
        sanitaryPermit: String,

        // Payment Information
        amount: {
            type: Number,
            required: true,
            default: 100,
        },
        paymentMethod: {
            type: String,
            enum: ["Cash", "GCash", "Paymaya"],
            required: true,
        },
        referenceNumber: {
            type: String,
            required: function () {
                return ["GCash", "Paymaya"].includes(this.paymentMethod);
            },
        },
        dateOfPayment: {
            type: Date,
            required: true,
        },
        receipt: {
            type: {
                filename: {
                    type: String,
                    required: true,
                },
                contentType: {
                    type: String,
                    required: true,
                },
                data: {
                    type: String,
                    required: true,
                },
            },
            required: true,
        },

        // Status Information
        status: {
            type: String,
            enum: Object.values(STATUS_TYPES),
            default: STATUS_TYPES.PENDING,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        dateApproved: Date,
        dateCompleted: Date,
        dateOfIssuance: Date,
    },
    { timestamps: true }
);

const BusinessClearance = mongoose.model("BusinessClearance", businessClearanceSchema);

export { STATUS_TYPES };
export default BusinessClearance;
