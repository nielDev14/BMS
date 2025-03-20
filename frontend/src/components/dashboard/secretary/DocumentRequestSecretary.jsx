import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import { DocumentTableView } from "./components/DocumentTableView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_TYPES } from "@/lib/constants"; // Update import path
import { generateIndigencyTemplate } from "@/components/templates/BarangayIndigencyTemplate";
import { generateClearanceTemplate } from "@/components/templates/BarangayClearanceTemplate";
import { generateBusinessClearanceTemplate } from "@/components/templates/BusinessClearanceTemplate";
import { format } from "date-fns";

export function DocumentRequestSecretary() {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const { currentUser } = useSelector((state) => state.user);

    // Add pagination and search states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("all");

    // Replace the isPrinting boolean with an object to track printing state by request ID
    const [printingStates, setPrintingStates] = useState({});

    const fetchRequests = async () => {
        try {
            const res = await api.get("/document-requests", {
                params: {
                    page: currentPage,
                    limit: pageSize,
                },
            });

            if (res.data.success) {
                const transformedRequests = res.data.data.map((request) => {
                    // Ensure name is properly set
                    const name =
                        request.name ||
                        request.ownerName ||
                        (request.user
                            ? `${request.user.firstName} ${request.user.middleName ? request.user.middleName + " " : ""}${request.user.lastName}`
                            : "N/A");

                    // Ensure we have a valid ID
                    if (!request._id) {
                        console.error("Request missing ID:", request);
                    }

                    return {
                        id: request._id.toString(),
                        _id: request._id.toString(),
                        requestDate: request.createdAt,
                        type: request.type || request.documentType,
                        name: name,
                        status: request.status,
                        // Business Owner Information
                        ownerName: request.ownerName,
                        email: request.email,
                        contactNumber: request.contactNumber,
                        // Business Information
                        businessName: request.businessName,
                        businessType: request.businessType,
                        businessNature: request.businessNature,
                        businessLocation: `${request.businessLocation}, ${request.barangay}, ${request.municipality}, ${request.province}`,
                        operatorManager: request.operatorManager,
                        // Location Information
                        barangay: request.barangay,
                        municipality: request.municipality,
                        province: request.province,
                        // Purpose
                        purpose: request.purpose,
                        // Required Documents
                        dtiSecRegistration: request.dtiSecRegistration,
                        mayorsPermit: request.mayorsPermit,
                        leaseContract: request.leaseContract,
                        barangayClearance: request.barangayClearance,
                        fireSafetyCertificate: request.fireSafetyCertificate,
                        sanitaryPermit: request.sanitaryPermit,
                        validId: request.validId,
                        // Payment Details
                        paymentMethod: request.paymentMethod,
                        amount: request.amount,
                        dateOfPayment: request.dateOfPayment,
                        referenceNumber: request.referenceNumber,
                        receipt: request.receipt,
                        // Status Information
                        createdAt: request.createdAt,
                        updatedAt: request.updatedAt,
                        isVerified: request.isVerified,
                        dateApproved: request.dateApproved,
                        dateCompleted: request.dateCompleted,
                        dateOfIssuance: request.dateOfIssuance,
                    };
                });

                setRequests(transformedRequests);
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
            toast.error(
                error.response?.data?.message ||
                    "Failed to fetch requests. Please check if the server is running."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchRequests();
        }
    }, [currentUser, currentPage, pageSize]); // Add pagination dependencies

    // Add this function to normalize status values
    const normalizeStatus = (status) => {
        const statusMap = {
            pending: STATUS_TYPES.PENDING,
            approved: STATUS_TYPES.APPROVED,
            "for pickup": STATUS_TYPES.FOR_PICKUP,
            completed: STATUS_TYPES.COMPLETED,
            rejected: STATUS_TYPES.REJECTED,
        };
        return statusMap[status.toLowerCase()] || status;
    };

    const handleStatusChange = async (requestId, requestType, newStatus) => {
        try {
            if (!requestId) {
                toast.error("Cannot update status: Invalid request ID");
                return;
            }

            setUpdating(true);

            // Convert document type to route format
            const typeToRoute = {
                "Barangay Clearance": "barangay-clearance",
                "Barangay Indigency": "barangay-indigency",
                "Business Clearance": "business-clearance",
                Cedula: "cedula",
            };

            const typeSlug = typeToRoute[requestType];
            if (!typeSlug) {
                throw new Error(`Invalid document type: ${requestType}`);
            }

            // Normalize the status value
            const normalizedStatus = normalizeStatus(newStatus);

            console.log("Updating status with:", {
                requestId,
                typeSlug,
                status: normalizedStatus,
                secretaryName: currentUser.name,
            });

            const res = await api.patch(`/document-requests/${typeSlug}/${requestId}/status`, {
                status: normalizedStatus,
                secretaryName: currentUser.name,
            });

            if (res.data.success) {
                await fetchRequests();
                toast.success("Status updated successfully");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error(
                error.response?.data?.message || "Failed to update status. Please try again."
            );
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case STATUS_TYPES.PENDING:
                return "bg-yellow-500";
            case STATUS_TYPES.APPROVED:
                return "bg-green-500";
            case STATUS_TYPES.FOR_PICKUP:
                return "bg-purple-500";
            case STATUS_TYPES.COMPLETED:
                return "bg-blue-500";
            case STATUS_TYPES.REJECTED:
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    // Update getAvailableStatuses to use consistent casing
    const getAvailableStatuses = (currentStatus) => {
        const normalizedStatus = normalizeStatus(currentStatus);
        switch (normalizedStatus) {
            case STATUS_TYPES.PENDING:
                return [STATUS_TYPES.APPROVED, STATUS_TYPES.REJECTED];
            case STATUS_TYPES.APPROVED:
                return [STATUS_TYPES.FOR_PICKUP];
            case STATUS_TYPES.FOR_PICKUP:
                return [STATUS_TYPES.COMPLETED];
            case STATUS_TYPES.COMPLETED:
                return [STATUS_TYPES.COMPLETED];
            case STATUS_TYPES.REJECTED:
                return [STATUS_TYPES.REJECTED];
            default:
                return Object.values(STATUS_TYPES);
        }
    };

    // Update the filteredRequests logic to include type filtering
    const filteredRequests = requests.filter((request) => {
        const matchesSearch = Object.values(request)
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesType = selectedType === "all" || request.type === selectedType;
        return matchesSearch && matchesType;
    });

    // Update the documentTypes constant
    const documentTypes = [
        "all",
        "Barangay Clearance",
        "Barangay Indigency",
        "Business Clearance",
        "Cedula",
    ];

    // Calculate pagination
    const totalRequests = filteredRequests.length;
    const totalPages = Math.ceil(totalRequests / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentRequests = filteredRequests.slice(startIndex, endIndex);

    // Handle page size change
    const handlePageSizeChange = (value) => {
        setPageSize(Number(value));
        setCurrentPage(1); // Reset to first page when changing page size
    };

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Update the handlePrint function
    const handlePrint = async (request) => {
        try {
            setPrintingStates((prev) => ({ ...prev, [request.id]: true }));

            if (!["Barangay Indigency", "Barangay Clearance", "Business Clearance"].includes(request.type)) {
                toast.error("Print functionality is only available for Barangay Indigency, Clearance, and Business Clearance");
                return;
            }

            // Fetch officials for all document types
            const officialsResponse = await api.get(`/officials/get-officials/${currentUser.barangay}`);
            let officials = [];
            if (officialsResponse.data.success) {
                officials = officialsResponse.data.officials;
            }

            const response = await api.get(`/${request.type.toLowerCase().replace(/\s+/g, "-")}/${request.id}/print`);

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            const document = response.data.data;
            let printContent;

            if (request.type === "Barangay Indigency") {
                printContent = generateIndigencyTemplate(document, officials, currentUser);
            } else if (request.type === "Barangay Clearance") {
                printContent = generateClearanceTemplate(document, officials, currentUser);
            } else if (request.type === "Business Clearance") {
                printContent = generateBusinessClearanceTemplate(document, officials, currentUser);
            }

            const printWindow = window.open("", "_blank");
            printWindow.document.write(printContent);
            printWindow.document.close();
        } catch (error) {
            console.error("Error preparing print document:", error);
            toast.error("Failed to prepare document for printing");
        } finally {
            setPrintingStates((prev) => ({ ...prev, [request.id]: false }));
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Loading requests...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Document Requests</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Search, Filter, and Page Size Controls */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search requests..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8"
                                />
                            </div>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="w-[200px] text-left">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {documentTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type === "all" ? "All Types" : type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                            <SelectTrigger className="w-[130px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[5, 10, 20, 30, 40, 50].map((size) => (
                                    <SelectItem key={size} value={size.toString()}>
                                        {size} per page
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table View */}
                    <DocumentTableView
                        currentRequests={currentRequests}
                        setSelectedRequest={setSelectedRequest}
                        selectedRequest={selectedRequest}
                        getStatusColor={getStatusColor}
                        handleStatusChange={handleStatusChange}
                        updating={updating}
                        getAvailableStatuses={getAvailableStatuses}
                        handlePrint={handlePrint}
                        printingStates={printingStates}
                    />

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {searchTerm
                                ? `${filteredRequests.length} results found`
                                : `${totalRequests} requests in total`}
                        </p>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </p>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}