"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    IndianRupee,
    ArrowLeft,
    Building2,
    Store,
    Loader2,
    Calendar,
    Mail,
    Phone,
    MapPin,
    TrendingUp,
    FileText,
    Download,
    X,
    History,
    Search,
    Filter
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { format, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import {
    fetchAllTransactionsAdmin,
    exportTransactionsExcelAdmin,
} from "@/api/adminController";
import { parseLocalizedValue } from "@/utils/textUtils";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export default function MerchantLedgerPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const merchantId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [merchantType, setMerchantType] = useState<'temple' | 'seller' | null>(null);
    const [merchant, setMerchant] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("all");
    
    // Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [dateRange, setDateRange] = useState<any>({ from: undefined, to: undefined });
    const handleDateRange = (value: any) => setDateRange(value || { from: undefined, to: undefined });

    useEffect(() => {
        if (merchantId) {
            fetchMerchantDetails();
        }
    }, [merchantId]);

    const fetchMerchantDetails = async () => {
        setLoading(true);
        try {
            let foundType: 'temple' | 'seller' | null = null;
            let foundMerchant: any = null;
            let allTransactions: any[] = [];

            // Try as temple
            let txParams: any = { page: 1, limit: 100 };
            txParams.templeId = merchantId;
            let transRes = await fetchAllTransactionsAdmin(txParams);
            
            if (transRes.success && transRes.data.length > 0) {
                allTransactions = transRes.data;
                foundType = 'temple';
                foundMerchant = {
                    id: merchantId,
                    name: transRes.data[0]?.temple?.name || "Temple",
                    type: 'temple',
                    createdAt: new Date(),
                };
            } else {
                // Try as seller
                txParams = { page: 1, limit: 100, sellerId: merchantId };
                transRes = await fetchAllTransactionsAdmin(txParams);
                
                if (transRes.success && transRes.data.length > 0) {
                    allTransactions = transRes.data;
                    foundType = 'seller';
                    foundMerchant = {
                        id: merchantId,
                        name: transRes.data[0]?.seller?.name || "Seller",
                        type: 'seller',
                        createdAt: new Date(),
                    };
                }
            }

            if (allTransactions.length > 0) {
                setTransactions(allTransactions);
            }
            
            if (foundMerchant && foundType) {
                setMerchant(foundMerchant);
                setMerchantType(foundType);
            } else if (allTransactions.length > 0) {
                setMerchantType('temple');
                setMerchant({
                    id: merchantId,
                    name: "Merchant",
                    type: 'temple',
                    createdAt: new Date(),
                });
            } else {
                console.log("No transactions found for ID:", merchantId);
                setMerchant(null);
            }
        } catch (error) {
            console.error("Failed to fetch merchant details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            toast({ title: "Processing", description: "Preparing your Excel report..." });
            const params: any = {};
            if (merchantType === 'temple') params.templeId = merchantId;
            else params.sellerId = merchantId;
            
            const data = await exportTransactionsExcelAdmin(params);
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${merchant?.name || 'merchant'}_ledger_${new Date().toISOString().slice(0, 10)}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast({ title: "Success", description: "Excel report downloaded successfully" });
        } catch (error) {
            toast({ title: "Export Failed", description: "Failed to generate report", variant: "destructive" });
        }
    };

    const getEntityIcon = () => {
        return merchantType === 'temple' ? 
            <Building2 className="w-8 h-8 text-primary" /> : 
            <Store className="w-8 h-8 text-primary" />;
    };

    // Filter transactions
    const filteredTransactions = transactions.filter(tx => {
        // Search filter
        const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.type?.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const matchesStatus = statusFilter === "ALL" || tx.status === statusFilter;
        
        // Type filter
        const matchesType = typeFilter === "ALL" || tx.type === typeFilter;

        // Date filter
        let matchesDate = true;
        if (dateRange?.from || dateRange?.to) {
            const txDate = new Date(tx.createdAt);
            if (dateRange.from && txDate < startOfDay(dateRange.from)) matchesDate = false;
            if (dateRange.to && txDate > endOfDay(dateRange.to)) matchesDate = false;
        }

        // Tab filter
        let matchesTab = true;
        if (activeTab === "pooja") matchesTab = tx.type === "POOJA_EARNING";
        else if (activeTab === "product") matchesTab = tx.type === "MARKETPLACE_EARNING";
        else if (activeTab === "donation") matchesTab = tx.type === "DONATION_EARNING";
        else if (activeTab === "withdrawal") matchesTab = tx.type === "WITHDRAWAL";

        return matchesSearch && matchesStatus && matchesType && matchesDate && matchesTab;
    });

    // Dynamic summary based on filtered transactions
    const summary = {
        total: filteredTransactions.length,
        gross: filteredTransactions.reduce((s, t) => s + (t.grossAmount || 0), 0),
        commission: filteredTransactions.reduce((s, t) => s + (t.commission || 0), 0),
        net: filteredTransactions.reduce((s, t) => s + (t.amount || 0), 0),
    };

    const resetFilters = () => {
        setSearchTerm("");
        setStatusFilter("ALL");
        setTypeFilter("ALL");
        setDateRange({ from: undefined, to: undefined });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-primary font-medium">Loading merchant details...</p>
            </div>
        );
    }

    if (!merchant) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Building2 className="w-16 h-16 text-slate-300" />
                <p className="text-slate-500">Merchant not found</p>
                <Button onClick={() => router.push('/admin/finance/ledger')} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Ledger
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push('/admin/finance/ledger')}
                        className="rounded-full hover:bg-primary hover:text-white transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            {getEntityIcon()}
                            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
                                {parseLocalizedValue(merchant.name)}
                            </h1>
                            <Badge className={merchantType === 'temple' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}>
                                {merchantType === 'temple' ? 'Temple' : 'Seller'}
                            </Badge>
                        </div>
                        <p className="text-slate-500 mt-1 capitalize">
                            {merchantType} Ledger • Complete financial history
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleExportExcel}
                    className="bg-[#8B5E3C] hover:bg-[#7A5234] text-white rounded-xl flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export to Excel
                </Button>
            </div>

            {/* Filter Section */}
            <Card className="border-none shadow-lg rounded-2xl bg-white">
                <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Filter className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-slate-800">Filters</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search by description, ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-10 rounded-xl bg-slate-50 border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 px-4 rounded-xl bg-slate-50 border-transparent text-sm font-medium"
                        >
                            <option value="ALL">All Status</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PENDING">Pending</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>

                        {/* Type Filter */}
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="h-10 px-4 rounded-xl bg-slate-50 border-transparent text-sm font-medium"
                        >
                            <option value="ALL">All Types</option>
                            <option value="POOJA_EARNING">Pooja Earnings</option>
                            <option value="MARKETPLACE_EARNING">Product Sales</option>
                            <option value="DONATION_EARNING">Donations</option>
                            <option value="WITHDRAWAL">Withdrawals</option>
                        </select>

                        {/* Date Range */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="h-10 justify-start text-left rounded-xl bg-slate-50 border-transparent min-w-[200px]">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? `${format(dateRange.from, "dd MMM")} - ${format(dateRange.to, "dd MMM yyyy")}` : format(dateRange.from, "dd MMM yyyy")
                                    ) : "Select date range"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                                <CalendarComponent
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={handleDateRange}
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Reset Button */}
                        {(searchTerm || statusFilter !== "ALL" || typeFilter !== "ALL" || dateRange?.from) && (
                            <Button
                                variant="ghost"
                                onClick={resetFilters}
                                className="h-10 px-4 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Reset
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Dynamic Summary Stats - Updates with filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-lg rounded-2xl bg-gradient-to-r from-blue-50 to-white">
                    <CardContent className="p-5">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Transactions</p>
                        <p className="text-2xl font-extrabold text-slate-900">{summary.total}</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg rounded-2xl bg-gradient-to-r from-slate-50 to-white">
                    <CardContent className="p-5">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Gross Volume</p>
                        <p className="text-2xl font-extrabold text-slate-900 flex items-center gap-1">
                            <IndianRupee className="w-5 h-5" /> {summary.gross.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg rounded-2xl bg-gradient-to-r from-amber-50 to-white">
                    <CardContent className="p-5">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Commission</p>
                        <p className="text-2xl font-extrabold text-amber-600 flex items-center gap-1">
                            <IndianRupee className="w-5 h-5" /> {summary.commission.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg rounded-2xl bg-gradient-to-r from-emerald-50 to-white">
                    <CardContent className="p-5">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Net Earned</p>
                        <p className="text-2xl font-extrabold text-emerald-600 flex items-center gap-1">
                            <IndianRupee className="w-5 h-5" /> {summary.net.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="px-6 pt-6 border-b border-slate-100 overflow-x-auto">
                            <TabsList className="bg-slate-50/50 p-1">
                                <TabsTrigger value="all" className="rounded-full px-4">All Transactions ({transactions.length})</TabsTrigger>
                                <TabsTrigger value="pooja" className="rounded-full px-4">Pooja Earnings</TabsTrigger>
                                <TabsTrigger value="product" className="rounded-full px-4">Product Sales</TabsTrigger>
                                <TabsTrigger value="donation" className="rounded-full px-4">Donations</TabsTrigger>
                                <TabsTrigger value="withdrawal" className="rounded-full px-4">Withdrawals</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="all" className="mt-0">
                            <TransactionTable transactions={filteredTransactions} />
                        </TabsContent>
                        <TabsContent value="pooja" className="mt-0">
                            <TransactionTable transactions={filteredTransactions} />
                        </TabsContent>
                        <TabsContent value="product" className="mt-0">
                            <TransactionTable transactions={filteredTransactions} />
                        </TabsContent>
                        <TabsContent value="donation" className="mt-0">
                            <TransactionTable transactions={filteredTransactions} />
                        </TabsContent>
                        <TabsContent value="withdrawal" className="mt-0">
                            <TransactionTable transactions={filteredTransactions} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

// Transaction Table Component
function TransactionTable({ transactions }: { transactions: any[] }) {
    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <FileText className="w-12 h-12 mb-3" />
                <p className="font-medium">No transactions found</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-slate-50/80">
                    <tr className="text-[10px] uppercase text-slate-400 font-extrabold">
                        <th className="py-4 pl-6 text-left">Date</th>
                        <th className="py-4 text-left">Description</th>
                        <th className="py-4 text-left">Type</th>
                        <th className="py-4 text-center">Status</th>
                        <th className="py-4 text-right">Gross</th>
                        <th className="py-4 text-right">Commission</th>
                        <th className="py-4 pr-6 text-right">Net</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 pl-6 text-sm font-medium text-slate-500 whitespace-nowrap">
                                {format(new Date(tx.createdAt), "dd MMM yyyy")}
                            </td>
                            <td className="py-4 text-sm font-semibold text-slate-800">{tx.description}</td>
                            <td className="py-4">
                                <Badge variant="outline" className="rounded-full text-[10px] font-extrabold uppercase">
                                    {tx.type?.replace('_', ' ')}
                                </Badge>
                            </td>
                            <td className="py-4 text-center">
                                <Badge className={cn(
                                    "rounded-full px-3 py-1 text-[10px] font-bold",
                                    tx.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" :
                                    tx.status === "PENDING" ? "bg-amber-50 text-amber-700" :
                                    "bg-red-50 text-red-700"
                                )}>
                                    {tx.status}
                                </Badge>
                            </td>
                            <td className="py-4 text-right font-bold text-slate-600">₹{tx.grossAmount?.toLocaleString() || 0}</td>
                            <td className="py-4 text-right font-bold text-amber-600">₹{tx.commission?.toLocaleString() || 0}</td>
                            <td className="py-4 pr-6 text-right font-extrabold text-emerald-600">₹{tx.amount?.toLocaleString() || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 