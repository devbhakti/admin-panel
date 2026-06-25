"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
    IndianRupee, Loader2, ArrowUpRight, ArrowDownRight, 
    Shield, Building2, Download, AlertCircle, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchMandalFinanceSummary, fetchMandalLedger, requestMandalWithdrawal } from "@/api/mandalAdminController";
import { useToast } from "@/hooks/use-toast";

export default function MandalFinancePage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState<any>(null);
    const [ledger, setLedger] = useState<any[]>([]);
    
    // Withdrawal state
    const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [bankDetails, setBankDetails] = useState({
        accountNumber: "",
        ifscCode: "",
        accountName: "",
        bankName: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [sumRes, ledRes] = await Promise.all([
                fetchMandalFinanceSummary(),
                fetchMandalLedger()
            ]);
            
            if (sumRes.success) setSummary(sumRes.data);
            if (ledRes.success) setLedger(ledRes.data || []);
        } catch (error) {
            toast({ title: "Error", description: "Failed to load finance data", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = parseFloat(withdrawAmount);
        
        if (isNaN(amt) || amt < 100) {
            toast({ title: "Invalid Amount", description: "Minimum withdrawal is ₹100", variant: "destructive" });
            return;
        }
        if (amt > (summary?.availableBalance || 0)) {
            toast({ title: "Insufficient Balance", description: "Cannot withdraw more than available balance", variant: "destructive" });
            return;
        }
        if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountName) {
            toast({ title: "Missing Details", description: "Please fill all required bank details", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await requestMandalWithdrawal({
                amount: amt,
                bankDetails
            });
            if (res.success) {
                toast({ title: "Success", description: "Withdrawal request submitted successfully" });
                setIsWithdrawDialogOpen(false);
                setWithdrawAmount("");
                loadData(); // Refresh balances
            } else {
                toast({ title: "Error", description: res.message || "Failed to submit request", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to process withdrawal", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading && !summary) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-amber-600 mb-4" />
                <p className="text-amber-600 font-medium">Loading ledger...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto px-4 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif font-black text-slate-800 tracking-tight">Earnings & Settlement</h1>
                    <p className="text-slate-500 mt-1">Track your mandal's donations, platform fees, and request payouts.</p>
                </div>
                
                <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-amber-600/20">
                            Request Withdrawal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-6">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-serif font-black text-slate-800">Request Payout</DialogTitle>
                            <DialogDescription>Transfer available balance to your mandal's bank account.</DialogDescription>
                        </DialogHeader>
                        
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center justify-between my-4">
                            <span className="text-sm font-bold text-amber-800">Available to Withdraw</span>
                            <span className="text-xl font-black text-amber-600">₹{(summary?.availableBalance || 0).toLocaleString()}</span>
                        </div>

                        <form onSubmit={handleWithdraw} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-400">Withdrawal Amount (₹)</Label>
                                <Input 
                                    type="number" 
                                    min="100" 
                                    max={summary?.availableBalance || 0}
                                    required
                                    className="h-12 rounded-xl text-lg font-bold"
                                    placeholder="Enter amount"
                                    value={withdrawAmount}
                                    onChange={e => setWithdrawAmount(e.target.value)}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-400">Bank Name</Label>
                                    <Input required value={bankDetails.bankName} onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})} className="h-11 rounded-xl" placeholder="e.g. HDFC Bank" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-400">Account Name</Label>
                                    <Input required value={bankDetails.accountName} onChange={e => setBankDetails({...bankDetails, accountName: e.target.value})} className="h-11 rounded-xl" placeholder="Mandal Trust Name" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-400">Account Number</Label>
                                    <Input required type="password" value={bankDetails.accountNumber} onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})} className="h-11 rounded-xl" placeholder="Account No" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-400">IFSC Code</Label>
                                    <Input required value={bankDetails.ifscCode} onChange={e => setBankDetails({...bankDetails, ifscCode: e.target.value})} className="h-11 rounded-xl uppercase" placeholder="HDFC0001234" />
                                </div>
                            </div>

                            <Button type="submit" disabled={isSubmitting || !summary?.availableBalance || summary.availableBalance < 100} className="w-full h-12 mt-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Building2 className="w-5 h-5 mr-2" />}
                                Submit Request
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-slate-800 tracking-tight mb-1">₹{(summary?.availableBalance || 0).toLocaleString()}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Available Balance</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-slate-800 tracking-tight mb-1">₹{(summary?.inEscrow || 0).toLocaleString()}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">In Escrow (3 Days)</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <IndianRupee className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-slate-800 tracking-tight mb-1">₹{(summary?.totalEarnings || 0).toLocaleString()}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Gross Income</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <AlertCircle className="w-6 h-6 text-rose-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-slate-800 tracking-tight mb-1">₹{(summary?.processingWithdrawals || 0).toLocaleString()}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Withdrawals Processing</p>
                    </CardContent>
                </Card>
            </div>

            {/* Ledger Table */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-serif font-bold text-slate-800 mb-6">Recent Ledger Entries</h3>
                <div className="border border-slate-100 rounded-3xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow>
                                <TableHead className="py-4 font-bold text-slate-700">Date</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700">Description</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 text-right">Credit</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 text-right">Debit</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 text-right">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ledger.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                        No ledger entries found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                ledger.map((entry, index) => (
                                    <TableRow key={index} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-800">{format(new Date(entry.createdAt), "MMM d, yyyy")}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${entry.type === 'CREDIT' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                                                    {entry.type === 'CREDIT' ? <ArrowDownRight className="w-4 h-4 text-emerald-600" /> : <ArrowUpRight className="w-4 h-4 text-rose-600" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800">{entry.description}</span>
                                                    {entry.referenceId && <span className="text-[10px] text-slate-400 font-mono">Ref: {entry.referenceId}</span>}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {entry.type === 'CREDIT' && <span className="font-black text-emerald-600">+₹{entry.amount?.toLocaleString()}</span>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {entry.type === 'DEBIT' && <span className="font-black text-rose-600">-₹{entry.amount?.toLocaleString()}</span>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="font-bold text-slate-800">₹{entry.runningBalance?.toLocaleString()}</span>
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
