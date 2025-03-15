import BarangayClearance from "../models/barangay.clearance.model.js";
import BusinessClearance from "../models/business.clearance.model.js";
import TransactionHistory from "../models/transaction.history.model.js";
import BlotterReport from "../models/blotter.report.model.js";
import { STATUS_TYPES } from "../models/barangay.clearance.model.js";

// Get treasurer dashboard data
export const getTreasurerDashboardData = async (req, res) => {
    try {
        const { barangay } = req.user;

        if (!barangay) {
            return res.status(400).json({
                success: false,
                message: "Barangay information is required",
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get start of current year
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        // Get all document requests for today
        const [barangayClearances, businessClearances, blotterReports] = await Promise.all([
            // Get barangay clearances
            BarangayClearance.find({
                barangay,
                createdAt: { $gte: today },
            }).populate("userId", "firstName lastName"),

            // Get business clearances
            BusinessClearance.find({
                barangay,
                createdAt: { $gte: today },
            }).populate("userId", "firstName lastName"),

            // Get blotter reports
            BlotterReport.find({
                createdAt: { $gte: today },
            }).populate("userId", "firstName lastName"),
        ]);

        // Get yearly documents
        const [yearlyBarangayClearances, yearlyBusinessClearances, yearlyBlotterReports] =
            await Promise.all([
                BarangayClearance.find({
                    barangay,
                    createdAt: { $gte: startOfYear },
                }),
                BusinessClearance.find({
                    barangay,
                    createdAt: { $gte: startOfYear },
                }),
                BlotterReport.find({
                    createdAt: { $gte: startOfYear },
                }),
            ]);

        // Count pending requests
        const barangayClearanceRequests = barangayClearances.filter(
            (doc) => doc.status === STATUS_TYPES.PENDING
        ).length;
        const businessClearanceRequests = businessClearances.filter(
            (doc) => doc.status === STATUS_TYPES.PENDING
        ).length;
        const blotterReportsCount = blotterReports.length;

        // Calculate today's collections (excluding only rejected transactions)
        const todayCollections = {
            barangayClearance: barangayClearances
                .filter((doc) => doc.status !== "Rejected")
                .reduce((total, doc) => total + (doc.amount || 0), 0),
            businessClearance: businessClearances
                .filter((doc) => doc.status !== "Rejected")
                .reduce((total, doc) => total + (doc.amount || 0), 0),
            others: blotterReports
                .filter((doc) => doc.status !== "Rejected")
                .reduce((total, doc) => total + (doc.amount || 0), 0),
        };

        // Calculate yearly collections (excluding only rejected transactions)
        const yearlyCollections = {
            barangayClearance: yearlyBarangayClearances
                .filter((doc) => doc.status !== "Rejected")
                .reduce((total, doc) => total + (doc.amount || 0), 0),
            businessClearance: yearlyBusinessClearances
                .filter((doc) => doc.status !== "Rejected")
                .reduce((total, doc) => total + (doc.amount || 0), 0),
            others: yearlyBlotterReports
                .filter((doc) => doc.status !== "Rejected")
                .reduce((total, doc) => total + (doc.amount || 0), 0),
        };

        // Calculate totals
        const totalCollections = Object.values(todayCollections).reduce((a, b) => a + b, 0);
        const yearlyTotal = Object.values(yearlyCollections).reduce((a, b) => a + b, 0);

        // Combine all recent transactions (include all statuses)
        const allTransactions = [
            ...barangayClearances.map((doc) => ({
                requestedDocument: "Barangay Clearance",
                amount: doc.status === "Rejected" ? 0 : doc.amount || 0,
                userId: doc.userId,
                dateRequested: doc.createdAt,
                status: doc.status,
            })),
            ...businessClearances.map((doc) => ({
                requestedDocument: "Business Clearance",
                amount: doc.status === "Rejected" ? 0 : doc.amount || 0,
                userId: doc.userId,
                dateRequested: doc.createdAt,
                status: doc.status,
            })),
            ...blotterReports.map((doc) => ({
                requestedDocument: "Blotter Report",
                amount: doc.status === "Rejected" ? 0 : doc.amount || 0,
                userId: doc.userId,
                dateRequested: doc.createdAt,
                status: doc.status,
            })),
        ];

        // Sort transactions by date and get the 10 most recent
        const recentTransactions = allTransactions
            .sort((a, b) => b.dateRequested - a.dateRequested)
            .slice(0, 10);

        res.status(200).json({
            success: true,
            data: {
                barangayClearanceRequests,
                businessClearanceRequests,
                blotterReportsCount,
                totalCollections,
                recentTransactions,
                collectionSummary: todayCollections,
                yearlyCollectionSummary: yearlyCollections,
                yearlyTotal,
                recentTransactionsCount: recentTransactions.length,
            },
        });
    } catch (error) {
        console.error("Error fetching treasurer dashboard data:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching treasurer dashboard data",
            error: error.message,
        });
    }
};

// Get transaction history with date filtering
export const getTransactionHistory = async (req, res) => {
    try {
        const { barangay } = req.user;
        const { startDate, endDate } = req.query;

        if (!barangay) {
            return res.status(400).json({
                success: false,
                message: "Barangay information is required",
            });
        }

        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        // Fetch all document types with date filtering
        const [barangayClearances, businessClearances, blotterReports] = await Promise.all([
            BarangayClearance.find({
                barangay,
                ...dateFilter,
            }).populate("userId", "firstName lastName"),
            BusinessClearance.find({
                barangay,
                ...dateFilter,
            }).populate("userId", "firstName lastName"),
            BlotterReport.find({
                ...dateFilter,
            }).populate("userId", "firstName lastName"),
        ]);

        // Combine and format all transactions
        const allTransactions = [
            ...barangayClearances.map((doc) => ({
                id: doc._id,
                requestedDocument: "Barangay Clearance",
                amount: doc.amount || 0,
                requestedBy: `${doc.userId.firstName} ${doc.userId.lastName}`,
                dateRequested: doc.createdAt,
                status: doc.status,
                paymentDetails: {
                    method: doc.paymentMethod,
                    referenceNumber: doc.referenceNumber,
                    date: doc.dateOfPayment,
                    status: doc.paymentStatus || "Pending",
                },
                receipt: doc.receipt
                    ? {
                          filename: doc.receipt.filename,
                          contentType: doc.receipt.contentType,
                          data: doc.receipt.data,
                          url: doc.receipt.data.startsWith("data:")
                              ? doc.receipt.data
                              : `data:${doc.receipt.contentType};base64,${doc.receipt.data}`,
                      }
                    : null,
                purpose: doc.purpose,
                address: {
                    barangay: doc.barangay,
                    municipality: doc.municipality,
                    province: doc.province,
                },
            })),
            ...businessClearances.map((doc) => ({
                id: doc._id,
                requestedDocument: "Business Clearance",
                amount: doc.amount || 0,
                requestedBy: `${doc.userId.firstName} ${doc.userId.lastName}`,
                dateRequested: doc.createdAt,
                status: doc.status,
                paymentDetails: {
                    method: doc.paymentMethod,
                    referenceNumber: doc.referenceNumber,
                    date: doc.dateOfPayment,
                    status: doc.paymentStatus || "Pending",
                },
                receipt: doc.receipt
                    ? {
                          filename: doc.receipt.filename,
                          contentType: doc.receipt.contentType,
                          data: doc.receipt.data,
                          url: doc.receipt.data.startsWith("data:")
                              ? doc.receipt.data
                              : `data:${doc.receipt.contentType};base64,${doc.receipt.data}`,
                      }
                    : null,
                businessDetails: {
                    name: doc.businessName,
                    type: doc.businessType,
                    nature: doc.businessNature,
                    address: doc.businessAddress,
                },
            })),
            ...blotterReports.map((doc) => ({
                id: doc._id,
                requestedDocument: "Blotter Report",
                amount: doc.amount || 0,
                requestedBy: `${doc.userId.firstName} ${doc.userId.lastName}`,
                dateRequested: doc.createdAt,
                status: doc.status,
                paymentDetails: {
                    method: doc.paymentMethod,
                    referenceNumber: doc.referenceNumber,
                    date: doc.dateOfPayment,
                    status: doc.paymentStatus || "Pending",
                },
                receipt: doc.receipt
                    ? {
                          filename: doc.receipt.filename,
                          contentType: doc.receipt.contentType,
                          data: doc.receipt.data,
                          url: doc.receipt.data.startsWith("data:")
                              ? doc.receipt.data
                              : `data:${doc.receipt.contentType};base64,${doc.receipt.data}`,
                      }
                    : null,
                incidentDetails: {
                    type: doc.incidentType,
                    location: doc.incidentLocation,
                    date: doc.incidentDate,
                    description: doc.narrative,
                },
            })),
        ].sort((a, b) => b.dateRequested - a.dateRequested);

        // Calculate total amount (excluding rejected transactions)
        const totalAmount = allTransactions
            .filter((transaction) => transaction.status !== "Rejected")
            .reduce((sum, transaction) => sum + transaction.amount, 0);

        res.status(200).json({
            success: true,
            data: {
                transactions: allTransactions,
                totalAmount,
                totalCount: allTransactions.length,
            },
        });
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching transaction history",
            error: error.message,
        });
    }
};
