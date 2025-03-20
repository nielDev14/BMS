import mongoose from "mongoose";

const STATUS_TYPES = {
    PENDING: "Pending",
    APPROVED: "Approved",
    FOR_PICKUP: "For Pickup",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
};

const barangayClearanceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        name: {
            type: String,
            required: false,
        },
        age: {
            type: Number,
            required: false,
        },
        email: {
            type: String,
            required: false,
        },
        contactNumber: {
            type: String,
            required: false,
        },
        barangay: {
            type: String,
            required: false,
        },
        purpose: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            default: 50,
        },
        paymentMethod: {
            type: String,
            enum: ["Cash", "GCash", "Paymaya"],
            required: true,
        },
        referenceNumber: {
            type: String,
            unique: true,
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
                filename: String,
                contentType: String,
                data: String,
            },
            required: true,
        },
        dateOfIssuance: {
            type: Date,
            default: null,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: Object.values(STATUS_TYPES),
            default: STATUS_TYPES.PENDING,
        },
        dateApproved: {
            type: Date,
            default: null,
        },
        dateCompleted: {
            type: Date,
            default: null,
        },
        purok: {
            type: String,
            required: false,
        },
        dateOfBirth: {
            type: Date,
            required: false,
        },
        sex: {
            type: String,
            enum: ["Male", "Female"],
            required: false,
        },
        placeOfBirth: {
            type: String,
            required: true,
        },
        civilStatus: {
            type: String,
            required: true,
            enum: ["Single", "Married", "Widowed", "Separated"],
        },
        // Add OR Number field
        orNumber: {
            type: String,
            default: null,
            unique: true,
        },

        // Add field to track who processed the request
        treasurerName: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const BarangayClearance = mongoose.model("BarangayClearance", barangayClearanceSchema);

export { STATUS_TYPES };
export default BarangayClearance;
