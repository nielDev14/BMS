import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Search, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { TransactionDetailsView } from "./components/TransactionDetailsView";

export default function TransactionHistory() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [totalAmount, setTotalAmount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            let url = "/treasurer/transactions";
            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }
            const response = await api.get(url);
            setTransactions(response.data.data.transactions);
            setTotalAmount(response.data.data.totalAmount);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [startDate, endDate]);

    const formatDate = (date) => {
        return format(new Date(date), "MMM dd, yyyy h:mm a");
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "bg-yellow-500 hover:bg-yellow-600";
            case "approved":
                return "bg-green-500 hover:bg-green-600";
            case "for pickup":
                return "bg-purple-500 hover:bg-purple-600";
            case "completed":
                return "bg-blue-500 hover:bg-blue-600";
            case "rejected":
                return "bg-red-500 hover:bg-red-600";
            case "under investigation":
                return "bg-orange-500 hover:bg-orange-600";
            case "resolved":
                return "bg-green-500 hover:bg-green-600";
            case "closed":
                return "bg-gray-500 hover:bg-gray-600";
            default:
                return "bg-gray-500 hover:bg-gray-600";
        }
    };

    // Filter transactions based on search term and document type
    const filteredTransactions = transactions.filter((transaction) => {
        const matchesSearch =
            transaction.requestedDocument.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.status.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType =
            selectedType === "all" || transaction.requestedDocument === selectedType;
        return matchesSearch && matchesType;
    });

    // Calculate pagination
    const totalTransactions = filteredTransactions.length;
    const totalPages = Math.ceil(totalTransactions / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

    // Calculate total amount excluding rejected transactions
    const totalAmountExcludingRejected = filteredTransactions
        .filter((transaction) => transaction.status.toLowerCase() !== "rejected")
        .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);

    const documentTypes = ["all", "Barangay Clearance", "Business Clearance", "Blotter Report"];

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Loading transactions...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Search, Filter, and Date Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search transactions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8"
                                />
                            </div>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="w-[200px]">
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
                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-[150px]"
                            />
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-[150px]"
                            />
                        </div>
                    </div>

                    {/* Total Amount Display */}
                    <div className="text-right">
                        <p className="text-lg font-semibold">
                            Total Amount (Excluding Rejected):{" "}
                            {formatAmount(totalAmountExcludingRejected)}
                        </p>
                    </div>

                    {/* Transactions Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Document Type</TableHead>
                                    <TableHead>Requested By</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>{transaction.requestedDocument}</TableCell>
                                        <TableCell>{transaction.requestedBy}</TableCell>
                                        <TableCell>
                                            {formatDate(transaction.dateRequested)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(transaction.status)}>
                                                {transaction.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatAmount(transaction.amount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            setSelectedTransaction(transaction)
                                                        }
                                                    >
                                                        View Details
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-3xl">
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Transaction Details
                                                            <span className="block text-sm font-normal text-muted-foreground mt-1">
                                                                {formatDate(
                                                                    transaction.dateRequested
                                                                )}
                                                            </span>
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <TransactionDetailsView
                                                        transaction={transaction}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {searchTerm
                                ? `${filteredTransactions.length} results found`
                                : `${totalTransactions} transactions in total`}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Select
                                value={pageSize.toString()}
                                onValueChange={(value) => {
                                    setPageSize(Number(value));
                                    setCurrentPage(1);
                                }}
                            >
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
                            <div className="flex items-center gap-1">
                                <p className="text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                }
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
