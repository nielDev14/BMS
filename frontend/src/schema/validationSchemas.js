import { z } from "zod";

export const barangayClearanceSchema = z.object({
    userId: z.string().optional(),
    name: z.string().optional(),
    firstName: z.string().optional(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
    age: z.number().optional(),
    email: z.string().optional(),
    contactNumber: z.string().optional(),
    barangay: z.string().optional(),
    purok: z.string().optional(),
    dateOfBirth: z.string().optional(),
    amount: z.number().min(50).max(50, "Amount must be exactly PHP 50"),
    paymentMethod: z.enum(["Cash", "GCash", "Paymaya"], {
        required_error: "Payment method is required",
    }),
    referenceNumber: z.string().optional().or(z.literal("")),
    dateOfPayment: z.string().min(1, "Date of payment is required"),
    receipt: z.object({
        filename: z.string().min(1, "Receipt is required"),
        contentType: z.string().min(1, "Receipt is required"),
        data: z.string().min(1, "Receipt is required"),
    }),
    purpose: z.enum(
        [
            "Employment",
            "Business",
            "Travel",
            "Identification",
            "Permit",
            "Legal",
            "Residency",
            "Banking",
        ],
        {
            required_error: "Purpose is required",
        }
    ),
    sex: z.enum(["Male", "Female"]).optional(),
    placeOfBirth: z.string().min(1, "Place of birth is required"),
    civilStatus: z.enum(["Single", "Married", "Widowed", "Separated"], {
        required_error: "Civil status is required",
    }),
    orNumber: z.string().optional(),
    treasurerName: z.string().optional(),
});

export const barangayIndigencySchema = z.object({
    name: z.string().min(1, "Full name is required"),
    age: z.number().min(1, "Age is required"),
    barangay: z.string().min(1, "Barangay is required"),
    contactNumber: z.string().min(1, "Contact number is required"),
    purpose: z.enum(
        ["Medical Assistance", "Financial Assistance", "Food Assistance", "Burial Assistance"],
        {
            required_error: "Purpose is required",
        }
    ),
});

export const sedulaSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    address: z.string().min(1, "Address is required"),
    occupation: z.string().min(1, "Occupation is required"),
    civilStatus: z.string().min(1, "Civil status is required"),
    grossAnnualIncome: z.string().min(1, "Gross annual income is required"),
});

export const incidentReportSchema = z.object({
    category: z.string().min(1, "Category is required"),
    subCategory: z.string().min(1, "Sub-category is required"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    location: z.string().min(1, "Location is required"),
    description: z.string().min(10, "Description must be at least 10 characters long"),
    reporterName: z.string().min(1, "Your name is required"),
    reporterContact: z.string().min(1, "Contact information is required"),
    evidenceFile: z
        .object({
            filename: z.string(),
            contentType: z.string(),
            data: z.string(),
        })
        .nullable()
        .optional(),
});

export const cedulaSchema = z.object({
    name: z.string().min(1, "Full name is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    placeOfBirth: z.string().min(1, "Place of birth is required"),
    barangay: z.string().min(1, "Barangay is required"),
    civilStatus: z.enum(["Single", "Married", "Widowed", "Separated"], {
        required_error: "Civil status is required",
    }),
    occupation: z.string().min(1, "Occupation is required"),
    employerName: z.string().optional(),
    employerAddress: z.string().optional(),
    salary: z.number().min(0, "Salary must be a positive number"),
});

export const businessClearanceSchema = z.object({
    // Business Owner Information
    ownerName: z.string().min(1, "Business owner's name is required"),
    contactNumber: z.string().min(1, "Contact number is required"),
    email: z.string().email("Invalid email format"),

    // Business Information
    businessName: z.string().min(1, "Business name is required"),
    businessType: z.string().min(1, "Type of business is required"),
    businessNature: z.enum(["Single Proprietorship", "Partnership", "Corporation"], {
        required_error: "Nature of business is required",
    }),
    businessLocation: z.string().min(1, "Business location is required"),
    operatorManager: z.string().min(1, "Operator/Manager name is required"),

    // Location
    barangay: z.string().min(1, "Barangay is required"),
    municipality: z.string().min(1, "Municipality is required"),
    province: z.string().min(1, "Province is required"),

    // Purpose
    purpose: z.enum(
        [
            "Renewal of Permit",
            "New Business",
            "Change of Business Name",
            "Change of Location",
            "Additional Business Activity",
        ],
        {
            required_error: "Purpose is required",
        }
    ),

    // Required Documents
    dtiSecRegistration: z.string().min(1, "DTI/SEC registration number is required"),
    barangayClearance: z.string().min(1, "Barangay clearance is required"),
    validId: z.string().min(1, "Valid ID information is required"),
    mayorsPermit: z.string().optional(),
    leaseContract: z.string().optional(),
    fireSafetyCertificate: z.string().optional(),
    sanitaryPermit: z.string().optional(),

    // Payment Information
    amount: z.number().min(100).max(100, "Amount must be exactly PHP 100"),
    paymentMethod: z.enum(["Cash", "GCash", "Paymaya"], {
        required_error: "Payment method is required",
    }),
    referenceNumber: z
        .string()
        .optional()
        .refine((val) => {
            if (!val) return true;
            return val.length > 0;
        }, "Reference number is required for digital payments"),
    dateOfPayment: z.string().min(1, "Date of payment is required"),
    receipt: z.object({
        filename: z.string().min(1, "Receipt filename is required"),
        contentType: z.string().min(1, "Receipt content type is required"),
        data: z.string().min(1, "Receipt data is required"),
    }),
});

export const blotterReportSchema = z.object({
    // Complainant Information
    complainantName: z.string().min(1, "Full name is required"),
    complainantAge: z.string().min(1, "Age is required"),
    complainantGender: z.string().min(1, "Gender is required"),
    complainantCivilStatus: z.string().min(1, "Civil status is required"),
    complainantAddress: z.string().min(1, "Address is required"),
    complainantContact: z.string().min(1, "Contact number is required"),

    // Respondent Information
    respondentName: z.string().min(1, "Respondent name is required"),
    respondentAddress: z.string().optional(),
    respondentContact: z.string().optional(),

    // Incident Details
    incidentDate: z.string().min(1, "Date of incident is required"),
    incidentTime: z.string().min(1, "Time of incident is required"),
    incidentLocation: z.string().min(1, "Location is required"),
    incidentType: z.string().min(1, "Type of incident is required"),
    narrative: z.string().min(1, "Narrative is required"),
    motive: z.string().optional(),

    // Witnesses
    witnessName: z.string().optional(),
    witnessContact: z.string().optional(),

    // Evidence
    evidenceFile: z
        .object({
            filename: z.string(),
            contentType: z.string(),
            data: z.string(),
        })
        .nullable()
        .optional(),

    // Action Requested
    actionRequested: z.enum(["Mediation", "Barangay Intervention", "Police/Court Action"], {
        required_error: "Please select an action",
    }),

    // Add Payment Information validation
    amount: z.number().min(100).max(100, "Amount must be exactly PHP 100"),
    paymentMethod: z.enum(["Cash", "GCash", "Paymaya"], {
        required_error: "Payment method is required",
    }),
    referenceNumber: z
        .string()
        .optional()
        .refine((val) => {
            if (!val) return true;
            return val.length > 0;
        }, "Reference number is required for digital payments"),
    dateOfPayment: z.string().min(1, "Date of payment is required"),
    receipt: z
        .object({
            filename: z.string().min(1, "Receipt filename is required"),
            contentType: z.string().min(1, "Receipt content type is required"),
            data: z.string().min(1, "Receipt data is required"),
        })
        .nullable()
        .optional(),
});

export const officialSchema = z.object({
    name: z.string().min(1, "Name is required"),
    position: z.enum(["Chairman", "SK Chairman", "Kagawad", "Secretary", "Treasurer"], {
        required_error: "Position is required",
    }),
    contactNumber: z.string().min(1, "Contact number is required"),
    barangay: z.string().min(1, "Barangay is required"),
    image: z
        .object({
            filename: z.string(),
            contentType: z.string(),
            data: z.string(),
        })
        .optional()
        .nullable(),
});

// Add schema specifically for Barangay Clearance status updates with OR number
export const clearanceStatusUpdateSchema = z.object({
    status: z.string().min(1, "Status is required"),
    treasurerName: z.string().optional(),
    orNumber: z
        .string()
        .optional()
        .refine(
            (val, ctx) => {
                if (ctx.parent.status === "Approved" && (!val || !val.trim())) {
                    return false;
                }
                return true;
            },
            {
                message: "OR Number is required when approving a clearance",
                path: ["orNumber"],
            }
        ),
});

// Add more schemas for other document types as needed
