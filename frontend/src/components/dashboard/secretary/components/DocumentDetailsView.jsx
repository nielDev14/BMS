import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    User,
    Mail,
    Phone,
    Calendar,
    FileText,
    CreditCard,
    Wallet,
    Building2,
    Eye,
    Download,
    ZoomIn,
    ZoomOut,
    RotateCw,
    MapPin,
    Info,
    Clock,
    Check,
    X,
    AlertCircle,
    Package,
    Receipt,
    Store,
    Briefcase,
    FileCheck,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { STATUS_TYPES } from "@/lib/constants";

export function DocumentDetailsView({
    request,
    handleStatusChange,
    updating,
    getAvailableStatuses,
}) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [activeTab, setActiveTab] = useState("details");
    const containerRef = useRef(null);

    // Image manipulation functions
    const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 5));
    const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
    const resetZoom = () => {
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    };
    const rotate = () => setRotation((prev) => (prev + 90) % 360);

    // Add drag handlers
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    // Add wheel handler for zoom with finer control
    const handleWheel = (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY * -0.005;
            setScale((prev) => Math.min(Math.max(0.25, prev + delta), 8));
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        switch (status) {
            case STATUS_TYPES.PENDING:
                return {
                    color: "bg-amber-100 text-amber-700 border-amber-200",
                    icon: <Clock className="w-3.5 h-3.5 mr-1" />,
                };
            case STATUS_TYPES.APPROVED:
                return {
                    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
                    icon: <Check className="w-3.5 h-3.5 mr-1" />,
                };
            case STATUS_TYPES.FOR_PICKUP:
                return {
                    color: "bg-blue-100 text-blue-700 border-blue-200",
                    icon: <Package className="w-3.5 h-3.5 mr-1" />,
                };
            case STATUS_TYPES.COMPLETED:
                return {
                    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
                    icon: <Check className="w-3.5 h-3.5 mr-1" />,
                };
            case STATUS_TYPES.REJECTED:
                return {
                    color: "bg-rose-100 text-rose-700 border-rose-200",
                    icon: <X className="w-3.5 h-3.5 mr-1" />,
                };
            default:
                return {
                    color: "bg-gray-100 text-gray-700 border-gray-200",
                    icon: <Info className="w-3.5 h-3.5 mr-1" />,
                };
        }
    };

    const statusBadge = getStatusBadge(request.status);

    // Get document type icon
    const getDocTypeIcon = (type) => {
        switch (type) {
            case "Barangay Clearance":
                return <FileCheck className="h-4 w-4 text-primary" />;
            case "Barangay Indigency":
                return <FileCheck className="h-4 w-4 text-violet-500" />;
            case "Business Clearance":
                return <Store className="h-4 w-4 text-indigo-500" />;
            case "Cedula":
                return <Briefcase className="h-4 w-4 text-emerald-500" />;
            default:
                return <FileText className="h-4 w-4 text-primary" />;
        }
    };

    const docTypeIcon = getDocTypeIcon(request.type);

    // Determine which tabs to show based on document type
    const getTabs = () => {
        const tabs = [
            { id: "details", label: "Basic Info", icon: <User className="h-4 w-4 mr-1.5" /> },
        ];

        if (request.type === "Business Clearance") {
            tabs.push({
                id: "business",
                label: "Business Info",
                icon: <Store className="h-4 w-4 mr-1.5" />,
            });
        }

        if (request.receipt?.data) {
            tabs.push({
                id: "receipt",
                label: "Receipt",
                icon: <Receipt className="h-4 w-4 mr-1.5" />,
            });
        }

        return tabs;
    };

    return (
        <div className="space-y-6 py-2 max-h-[calc(100vh-180px)] overflow-y-auto">
            {/* Header with status badge and document type */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <div className="flex items-center gap-3">
                    <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}
                    >
                        {statusBadge.icon}
                        {request.status}
                    </span>

                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 bg-slate-50">
                        {docTypeIcon}
                        <span className="ml-1">{request.type}</span>
                    </span>
                </div>

                <span className="text-xs text-gray-500">
                    Request Date: {formatDate(request.requestDate || request.createdAt)}
                </span>
            </div>

            {/* Main content with tabs */}
            <Tabs
                defaultValue="details"
                className="w-full"
                onValueChange={setActiveTab}
                value={activeTab}
            >
                <TabsList className={`grid grid-cols-${getTabs().length} mb-4`}>
                    {getTabs().map((tab) => (
                        <TabsTrigger key={tab.id} value={tab.id} className="text-sm">
                            {tab.icon}
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="details" className="space-y-6 focus:outline-none">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Personal Information Card */}
                        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-5 border border-blue-100 shadow-sm mb-6">
                            <h3 className="text-sm font-semibold text-blue-800 mb-4 flex items-center">
                                <User className="h-4 w-4 mr-1.5 text-blue-600" />
                                Personal Details
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500">Name</span>
                                    <span className="text-sm font-medium">
                                        {request.name ||
                                            request.residentName ||
                                            request.ownerName ||
                                            "N/A"}
                                    </span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500">Email</span>
                                    <span className="text-sm font-medium">
                                        {request.email || "N/A"}
                                    </span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500">Contact</span>
                                    <span className="text-sm font-medium">
                                        {request.contactNumber || "N/A"}
                                    </span>
                                </div>

                                {request.age && (
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Age</span>
                                        <span className="text-sm font-medium">{request.age}</span>
                                    </div>
                                )}

                                {request.civilStatus && (
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Civil Status</span>
                                        <span className="text-sm font-medium">
                                            {request.civilStatus}
                                        </span>
                                    </div>
                                )}

                                {request.placeOfBirth && (
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">
                                            Place of Birth
                                        </span>
                                        <span className="text-sm font-medium">
                                            {request.placeOfBirth}
                                        </span>
                                    </div>
                                )}

                                {request.purpose && (
                                    <div className="flex flex-col sm:col-span-2">
                                        <span className="text-xs text-gray-500">Purpose</span>
                                        <span className="text-sm font-medium">
                                            {request.purpose}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 p-5 border border-violet-100 shadow-sm mb-6">
                            <h3 className="text-sm font-semibold text-violet-800 mb-4 flex items-center">
                                <MapPin className="h-4 w-4 mr-1.5 text-violet-600" />
                                Address Information
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                {request.purok && (
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Purok</span>
                                        <span className="text-sm font-medium">{request.purok}</span>
                                    </div>
                                )}

                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500">Barangay</span>
                                    <span className="text-sm font-medium">{request.barangay}</span>
                                </div>

                                {request.municipality && (
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Municipality</span>
                                        <span className="text-sm font-medium">
                                            {request.municipality}
                                        </span>
                                    </div>
                                )}

                                {request.province && (
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Province</span>
                                        <span className="text-sm font-medium">
                                            {request.province}
                                        </span>
                                    </div>
                                )}

                                {request.ownerAddress && (
                                    <div className="flex flex-col sm:col-span-2">
                                        <span className="text-xs text-gray-500">Owner Address</span>
                                        <span className="text-sm font-medium">
                                            {request.ownerAddress}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Information */}
                        {request.paymentMethod && (
                            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5 border border-emerald-100 shadow-sm">
                                <h3 className="text-sm font-semibold text-emerald-800 mb-4 flex items-center">
                                    <Wallet className="h-4 w-4 mr-1.5 text-emerald-600" />
                                    Payment Information
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">
                                            Payment Method
                                        </span>
                                        <span className="text-sm font-medium">
                                            {request.paymentMethod}
                                        </span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Amount</span>
                                        <span className="text-sm font-medium">
                                            ₱{request.amount || "N/A"}
                                        </span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">
                                            Date of Payment
                                        </span>
                                        <span className="text-sm font-medium">
                                            {formatDate(request.dateOfPayment)}
                                        </span>
                                    </div>

                                    {request.referenceNumber && (
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500">
                                                Reference Number
                                            </span>
                                            <span className="text-sm font-medium">
                                                {request.referenceNumber}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </TabsContent>

                {/* Business Information Tab */}
                {request.type === "Business Clearance" && (
                    <TabsContent value="business" className="space-y-6 focus:outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Business Information */}
                            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 p-5 border border-indigo-100 shadow-sm mb-6">
                                <h3 className="text-sm font-semibold text-indigo-800 mb-4 flex items-center">
                                    <Store className="h-4 w-4 mr-1.5 text-indigo-600" />
                                    Business Information
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Business Name</span>
                                        <span className="text-sm font-medium">
                                            {request.businessName}
                                        </span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Business Type</span>
                                        <span className="text-sm font-medium">
                                            {request.businessType}
                                        </span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">
                                            Business Nature
                                        </span>
                                        <span className="text-sm font-medium">
                                            {request.businessNature}
                                        </span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">
                                            Operator/Manager
                                        </span>
                                        <span className="text-sm font-medium">
                                            {request.operatorManager}
                                        </span>
                                    </div>

                                    <div className="flex flex-col sm:col-span-2">
                                        <span className="text-xs text-gray-500">
                                            Business Location
                                        </span>
                                        <span className="text-sm font-medium">
                                            {request.businessLocation}
                                        </span>
                                    </div>

                                    <div className="flex flex-col sm:col-span-2">
                                        <span className="text-xs text-gray-500">Purpose</span>
                                        <span className="text-sm font-medium">
                                            {request.purpose}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Required Documents */}
                            <div className="rounded-xl bg-white p-5 border shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                                    <FileText className="h-4 w-4 mr-1.5 text-gray-600" />
                                    Required Documents
                                </h3>

                                <div className="grid grid-cols-1 gap-y-4 divide-y divide-gray-100">
                                    <DocumentItem
                                        label="DTI/SEC Registration"
                                        value={request.dtiSecRegistration}
                                    />
                                    <DocumentItem
                                        label="Barangay Clearance"
                                        value={request.barangayClearance}
                                    />
                                    <DocumentItem label="Valid ID" value={request.validId} />
                                    {request.mayorsPermit && (
                                        <DocumentItem
                                            label="Mayor's Permit"
                                            value={request.mayorsPermit}
                                        />
                                    )}
                                    {request.leaseContract && (
                                        <DocumentItem
                                            label="Lease Contract"
                                            value={request.leaseContract}
                                        />
                                    )}
                                    {request.fireSafetyCertificate && (
                                        <DocumentItem
                                            label="Fire Safety Certificate"
                                            value={request.fireSafetyCertificate}
                                        />
                                    )}
                                    {request.sanitaryPermit && (
                                        <DocumentItem
                                            label="Sanitary Permit"
                                            value={request.sanitaryPermit}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Status Information */}
                            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 p-5 border border-amber-100 shadow-sm">
                                <h3 className="text-sm font-semibold text-amber-800 mb-4 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1.5 text-amber-600" />
                                    Status Information
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Status</span>
                                        <span className="text-sm font-medium">
                                            {request.status}
                                        </span>
                                    </div>

                                    {request.dateApproved && (
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500">
                                                Date Approved
                                            </span>
                                            <span className="text-sm font-medium">
                                                {formatDate(request.dateApproved)}
                                            </span>
                                        </div>
                                    )}

                                    {request.dateCompleted && (
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500">
                                                Date Completed
                                            </span>
                                            <span className="text-sm font-medium">
                                                {formatDate(request.dateCompleted)}
                                            </span>
                                        </div>
                                    )}

                                    {request.dateOfIssuance && (
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500">
                                                Date of Issuance
                                            </span>
                                            <span className="text-sm font-medium">
                                                {formatDate(request.dateOfIssuance)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </TabsContent>
                )}

                {/* Receipt Tab */}
                {request.receipt?.data && (
                    <TabsContent value="receipt" className="space-y-6 focus:outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-xl bg-white p-5 border shadow-sm"
                        >
                            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                                <Receipt className="h-4 w-4 mr-1.5 text-gray-600" />
                                Payment Receipt
                            </h3>

                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <p className="text-xs text-gray-500 truncate">
                                        {request.receipt.filename || "receipt.jpg"}
                                    </p>
                                </div>

                                {/* Preview image */}
                                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100 aspect-video flex items-center justify-center">
                                    <img
                                        src={
                                            request.receipt.data.startsWith("data:")
                                                ? request.receipt.data
                                                : `data:${request.receipt.contentType || "image/jpeg"};base64,${request.receipt.data}`
                                        }
                                        alt="Receipt"
                                        className="max-h-[300px] object-contain"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                                        }}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Full Screen
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl p-1">
                                            <DialogHeader className="px-4 pt-4 pb-0">
                                                <DialogTitle>Receipt Image</DialogTitle>
                                            </DialogHeader>
                                            <div className="p-6">
                                                {/* Zoom controls */}
                                                <div className="flex justify-end items-center gap-2 mb-4">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={zoomOut}
                                                    >
                                                        <ZoomOut className="h-4 w-4" />
                                                    </Button>
                                                    <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded">
                                                        {Math.round(scale * 100)}%
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={zoomIn}
                                                    >
                                                        <ZoomIn className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={rotate}
                                                    >
                                                        <RotateCw className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={resetZoom}
                                                    >
                                                        <span className="text-xs">Reset</span>
                                                    </Button>
                                                </div>

                                                {/* Image container */}
                                                <div
                                                    className="bg-black/5 rounded-lg overflow-hidden h-[60vh]"
                                                    onMouseDown={handleMouseDown}
                                                    onMouseMove={handleMouseMove}
                                                    onMouseUp={handleMouseUp}
                                                    onMouseLeave={handleMouseUp}
                                                    onWheel={handleWheel}
                                                >
                                                    <div
                                                        className="w-full h-full flex items-center justify-center"
                                                        style={{
                                                            cursor: isDragging
                                                                ? "grabbing"
                                                                : "grab",
                                                        }}
                                                    >
                                                        <img
                                                            src={
                                                                request.receipt.data.startsWith(
                                                                    "data:"
                                                                )
                                                                    ? request.receipt.data
                                                                    : `data:${request.receipt.contentType || "image/jpeg"};base64,${request.receipt.data}`
                                                            }
                                                            alt="Receipt"
                                                            style={{
                                                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                                                                transition: isDragging
                                                                    ? "none"
                                                                    : "transform 0.15s ease",
                                                                transformOrigin: "center center",
                                                                pointerEvents: "none",
                                                            }}
                                                            className="max-h-full select-none"
                                                            draggable="false"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => {
                                            try {
                                                const imageUrl = request.receipt.data.startsWith(
                                                    "data:"
                                                )
                                                    ? request.receipt.data
                                                    : `data:${request.receipt.contentType || "image/jpeg"};base64,${request.receipt.data}`;
                                                const link = document.createElement("a");
                                                link.href = imageUrl;
                                                link.download =
                                                    request.receipt.filename || "receipt.jpg";
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                toast.success("Receipt downloaded successfully");
                                            } catch (error) {
                                                console.error("Download error:", error);
                                                toast.error("Failed to download receipt");
                                            }
                                        }}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </TabsContent>
                )}
            </Tabs>

            {/* Status Update Footer */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="sticky bottom-0 bg-white bg-opacity-80 backdrop-blur-sm border-t pt-5"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-700">Update Status</h3>
                        <p className="text-sm text-gray-500">
                            Change the current status of this document request
                        </p>
                    </div>
                    <Select
                        onValueChange={(value) => {
                            const requestId = request.id || request._id;
                            if (!requestId) {
                                console.error("Missing request ID:", request);
                                toast.error("Cannot update status: Request ID is missing");
                                return;
                            }
                            handleStatusChange(requestId.toString(), request.type, value);
                        }}
                        defaultValue={request.status}
                        disabled={
                            updating ||
                            (request.type === "Barangay Clearance" && request.status === "Pending") || (request.type === "Business Clearance" && request.status === "Pending") || request.status === "Completed"
                        }
                    >
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue>{request.status}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {getAvailableStatuses(request.status).map((status) => (
                                <SelectItem
                                    key={status}
                                    value={status}
                                    className={
                                        status === "Rejected"
                                            ? "text-destructive"
                                            : status === "Completed"
                                              ? "text-primary"
                                              : status === "Approved"
                                                ? "text-green-500"
                                                : status === "For Pickup"
                                                  ? "text-blue-500"
                                                  : ""
                                    }
                                >
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>
        </div>
    );
}

// Helper component for document items
function DocumentItem({ label, value }) {
    return (
        <div className="py-3 first:pt-0 last:pb-0">
            <span className="text-xs text-gray-500 block mb-1">{label}</span>
            <span className="text-sm font-medium">{value}</span>
        </div>
    );
}
