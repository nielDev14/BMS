import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Receipt, CreditCard, History, AlertTriangle } from "lucide-react";
import api from "@/lib/axios";
import { useSelector } from "react-redux";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardTreasurer() {
    const { currentUser } = useSelector((state) => state.user);
    const [dashboardData, setDashboardData] = useState({
        barangayClearanceRequests: 0,
        businessClearanceRequests: 0,
        blotterReportsCount: 0,
        totalCollections: 0,
        recentTransactionsCount: 0,
        recentTransactions: [],
        collectionSummary: {
            barangayClearance: 0,
            businessClearance: 0,
            others: 0,
        },
        yearlyCollectionSummary: {
            barangayClearance: 0,
            businessClearance: 0,
            others: 0,
        },
        yearlyTotal: 0,
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (!currentUser?.barangay) return;

                const response = await api.get("/treasurer/dashboard", {
                    params: { barangay: currentUser.barangay },
                });

                if (response.data?.success) {
                    setDashboardData(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        if (currentUser?.barangay) {
            fetchDashboardData();
            // Refresh data every 5 minutes
            const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [currentUser]);

    return (
        <div className="grid gap-8 p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Barangay Clearance Requests
                        </CardTitle>
                        <div className="rounded-full bg-gray-50 p-2.5">
                            <FileText className="h-4 w-4 text-gray-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight">
                            {dashboardData.barangayClearanceRequests}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Pending requests today</p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Business Permit Applications
                        </CardTitle>
                        <div className="rounded-full bg-gray-50 p-2.5">
                            <Receipt className="h-4 w-4 text-gray-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight">
                            {dashboardData.businessClearanceRequests}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Pending applications today
                        </p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Collections Today
                        </CardTitle>
                        <div className="rounded-full bg-gray-50 p-2.5">
                            <CreditCard className="h-4 w-4 text-gray-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight">
                            ₱{dashboardData.totalCollections.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Total collections (excl. rejected)
                        </p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Blotter Reports</CardTitle>
                        <div className="rounded-full bg-gray-50 p-2.5">
                            <AlertTriangle className="h-4 w-4 text-gray-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tight">
                            {dashboardData.blotterReportsCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">New reports today</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity and Collection Summary Section */}
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-lg">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-xl font-semibold tracking-tight">
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {dashboardData.recentTransactions.length > 0 ? (
                            <ScrollArea className="h-[450px] pr-6">
                                <div className="space-y-5">
                                    {dashboardData.recentTransactions.map((transaction, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-4 rounded-xl hover:bg-gray-50/80 transition-all border border-transparent hover:border-gray-100"
                                        >
                                            <div className="space-y-1.5">
                                                <p className="text-sm font-medium flex items-center gap-3">
                                                    {transaction.requestedDocument}
                                                    <span
                                                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                                                            transaction.status === "Rejected"
                                                                ? "bg-red-50 text-red-600"
                                                                : transaction.status === "Pending"
                                                                  ? "bg-yellow-50 text-yellow-600"
                                                                  : transaction.status ===
                                                                      "Approved"
                                                                    ? "bg-emerald-50 text-emerald-600"
                                                                    : "bg-blue-50 text-blue-600"
                                                        }`}
                                                    >
                                                        {transaction.status}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {transaction.userId?.firstName}{" "}
                                                    {transaction.userId?.lastName}
                                                </p>
                                            </div>
                                            <div className="text-sm font-semibold">
                                                {transaction.status === "Rejected" ? (
                                                    "₱0.00"
                                                ) : (
                                                    <>₱{transaction.amount?.toFixed(2)}</>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <p className="text-sm text-muted-foreground">No recent activity</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3 overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-lg">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-xl font-semibold tracking-tight">
                            Collection Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-10">
                            {/* Today's Collections */}
                            <div>
                                <h3 className="text-sm font-semibold mb-5 text-gray-900">Today</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50/80 transition-all">
                                        <span className="text-sm">Barangay Clearance</span>
                                        <span className="text-sm font-semibold">
                                            ₱
                                            {dashboardData.collectionSummary.barangayClearance.toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50/80 transition-all">
                                        <span className="text-sm">Business Permit</span>
                                        <span className="text-sm font-semibold">
                                            ₱
                                            {dashboardData.collectionSummary.businessClearance.toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50/80 transition-all">
                                        <span className="text-sm">Other Collections</span>
                                        <span className="text-sm font-semibold">
                                            ₱{dashboardData.collectionSummary.others.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="pt-3 border-t">
                                        <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl">
                                            <span className="text-sm font-semibold">
                                                Total Today
                                            </span>
                                            <span className="text-sm font-bold">
                                                ₱{dashboardData.totalCollections.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Yearly Collections */}
                            <div>
                                <h3 className="text-sm font-semibold mb-5 text-gray-900">
                                    This Year
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50/50 transition-colors">
                                        <span className="text-sm">Barangay Clearance</span>
                                        <span className="text-sm font-medium text-gray-600">
                                            ₱
                                            {dashboardData.yearlyCollectionSummary.barangayClearance.toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50/50 transition-colors">
                                        <span className="text-sm">Business Permit</span>
                                        <span className="text-sm font-medium text-gray-600">
                                            ₱
                                            {dashboardData.yearlyCollectionSummary.businessClearance.toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50/50 transition-colors">
                                        <span className="text-sm">Other Collections</span>
                                        <span className="text-sm font-medium text-gray-600">
                                            ₱
                                            {dashboardData.yearlyCollectionSummary.others.toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <div className="flex justify-between items-center p-2">
                                            <span className="text-sm font-semibold">
                                                Total This Year
                                            </span>
                                            <span className="text-sm font-bold text-black">
                                                ₱{dashboardData.yearlyTotal.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
