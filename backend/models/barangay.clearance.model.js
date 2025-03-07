import mongoose from "mongoose";

const STATUS_TYPES = {
    PENDING: "Pending",
    APPROVED: "Approved",
    FOR_PICKUP: "For Pickup",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
};

const PUROK_TYPES = [
    "Purok I",
    "Purok II",
    "Purok III",
    "Purok IV",
    "Purok V",
    "Purok VI",
    "Purok VII",
];

const barangayClearanceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        contactNumber: {
            type: String,
            required: true,
        },
        barangay: {
            type: String,
            required: true,
        },
        purpose: {
            type: String,
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
            required: true,
            enum: PUROK_TYPES,
        },
        dateOfBirth: {
            type: Date,
            required: true,
        },
        sex: {
            type: String,
            required: true,
            enum: ["Male", "Female"],
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
    },
    { timestamps: true }
);

const BarangayClearance = mongoose.model("BarangayClearance", barangayClearanceSchema);

export { STATUS_TYPES, PUROK_TYPES };
export default BarangayClearance;
