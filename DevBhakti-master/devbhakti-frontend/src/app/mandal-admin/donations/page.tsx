"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Search, Heart, Loader2, IndianRupee, Download, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchMandalDonations } from "@/api/mandalAdminController";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

export default function MandalDonationsPage() {
    const { toast } = useToast();
    const [donations, setDonations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadDonations();
    }, []);

    const loadDonations = async () => {
        setIsLoading(true);
        try {
            const res = await fetchMandalDonations();
            if (res.success) {
                setDonations(res.data || []);
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to load donations", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        const exportData = filteredDonations.map(d => ({
            "Date": format(new Date(d.createdAt), "PPp"),
            "Donor Name": d.donorName || "Anonymous",
            "Phone": d.donorPhone || "N/A",
            "PAN": d.donorPan || "N/A",
            "Amount (INR)": d.amount,
            "Payment ID": d.razorpayPaymentId || "N/A",
            "Status": d.status
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Donations");
        XLSX.writeFile(wb, `Mandal_Donations_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    };

    const filteredDonations = donations.filter(d => 
        (d.donorName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.donorPhone || "").includes(searchTerm) ||
        (d.razorpayPaymentId || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalCollected = filteredDonations.filter(d => d.status === "SUCCESS").reduce((sum, d) => sum + (d.amount || 0), 0);
    const successCount = filteredDonations.filter(d => d.status === "SUCCESS").length;

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto px-4 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif font-black text-slate-800 tracking-tight">Donations History</h1>
                    <p className="text-slate-500 mt-1">View and manage contributions received by your mandal.</p>
                </div>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                >
                    <Download className="w-5 h-5" /> Export Excel
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="border-none shadow-sm rounded-[2rem] bg-amber-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                    <CardContent className="p-6 md:p-8">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <IndianRupee className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-3xl font-black tracking-tight mb-1">₹{totalCollected.toLocaleString()}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-white/70">Total Collections (Filtered)</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
                    <CardContent className="p-6 md:p-8">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-800 tracking-tight mb-1">{successCount}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Successful Donations</p>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        placeholder="Search by name, phone, or payment ID..."
                        className="pl-12 h-12 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="border border-slate-100 rounded-3xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow>
                                <TableHead className="py-4 font-bold text-slate-700">Date</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700">Donor Details</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700">Amount</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700">Payment ID</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredDonations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                        No donations found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDonations.map((donation) => (
                                    <TableRow key={donation.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-800">{format(new Date(donation.createdAt), "MMM d, yyyy")}</span>
                                                <span className="text-xs text-slate-400 font-medium">{format(new Date(donation.createdAt), "h:mm a")}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                                    <Heart className="w-5 h-5 text-amber-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800">{donation.donorName || "Anonymous"}</span>
                                                    {donation.donorPhone && <span className="text-xs text-slate-500 font-medium">{donation.donorPhone}</span>}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-black text-slate-800">₹{donation.amount?.toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                                {donation.razorpayPaymentId || "N/A"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={donation.status === "SUCCESS" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}>
                                                {donation.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
