"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Gift,
    ArrowLeft,
    Banknote,
    QrCode,
    CreditCard,
    Wallet,
    Landmark,
    CheckCircle2,
    Sparkles,
    IndianRupee,
    Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/config/apiConfig";
import { parseLocalizedValue } from "@/utils/textUtils";
import { generateReceiptHTML } from "@/utils/donationReceipt";
import axios from "axios";
import { fetchAllTemplesAdmin, createDonationAdmin } from "@/api/adminController";

export default function AddOfflineDonationPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [temples, setTemples] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [templeId, setTempleId] = useState("");
    const [amount, setAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [donorName, setDonorName] = useState("");
    const [donorPhone, setDonorPhone] = useState("");
    const [donorEmail, setDonorEmail] = useState("");
    const [panNumber, setPanNumber] = useState("");
    const [address, setAddress] = useState("");
    const [message, setMessage] = useState("");

    const amountPresets = [101, 501, 1001, 2101, 5001];

    const paymentMethods = [
        { value: "CASH", label: "Cash", icon: Banknote, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        { value: "UPI", label: "UPI", icon: QrCode, color: "bg-blue-50 text-blue-700 border-blue-200" },
        { value: "CARD", label: "Card", icon: CreditCard, color: "bg-purple-50 text-purple-700 border-purple-200" },
        { value: "CHEQUE", label: "Cheque", icon: Wallet, color: "bg-amber-50 text-amber-700 border-amber-200" },
        { value: "BANK", label: "Bank Transfer", icon: Landmark, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    ];

    useEffect(() => {
        loadTemples();
    }, []);

    const loadTemples = async () => {
        try {
            setLoading(true);
            const data = await fetchAllTemplesAdmin();
            if (data.success) {
                setTemples(data.data || []);
            }
        } catch (error) {
            console.error("Load Temples Error:", error);
            toast({ title: "Error", description: "Failed to load temples", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const sanitizePhone = (phone: string) => phone.replace(/\D/g, "").slice(0, 11);
    const isValidPhone = (phone: string) => /^\d{10,11}$/.test(phone);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!templeId) {
            toast({ title: "Error", description: "Please select a temple", variant: "destructive" });
            return;
        }

        if (!amount || Number(amount) <= 0) {
            toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
            return;
        }

        if (!donorName.trim() || !donorPhone.trim() || !donorEmail.trim()) {
            toast({ title: "Error", description: "Please fill in all required donor information", variant: "destructive" });
            return;
        }

        if (!isValidPhone(donorPhone.trim())) {
            toast({ title: "Error", description: "Please enter a valid 10 or 11 digit phone number", variant: "destructive" });
            return;
        }

        try {
            setIsSubmitting(true);

            const selectedTemple = temples.find((t: any) => (t.temple?.id || t.id) === templeId);
            const templeName = parseLocalizedValue(selectedTemple?.temple?.name || selectedTemple?.name);

            const donationData = {
                templeId,
                amount: Number(amount),
                status: "SUCCESS",
                paymentMethod,
                donorName,
                donorPhone: sanitizePhone(donorPhone),
                donorEmail,
                panNumber: panNumber || null,
                address: address || null,
                message: message || null,
                isAnonymous: false,
                is80GRequired: !!panNumber,
                commissionAmount: 0,
                netEarning: Number(amount),
            };

            const response = await axios.post(
                `${API_URL}/admin/donations`,
                donationData,
                { validateStatus: () => true }
            );

            if (response.data?.success) {
                const newDonation = response.data.data;

                // Generate and print receipt
                const receiptHTML = generateReceiptHTML({
                    ...newDonation,
                    templeName,
                });

                const printWindow = window.open("", "_blank");
                if (printWindow) {
                    printWindow.document.write(receiptHTML);
                    printWindow.document.close();
                    printWindow.print();
                }

                toast({
                    title: "Success",
                    description: "Offline donation recorded successfully!",
                    variant: "success",
                });

                // Redirect back to offline donations
                setTimeout(() => router.push("/admin/donation"), 1000);
            } else {
                toast({
                    title: "Error",
                    description: response.data?.message || "Failed to create donation",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Submit Error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create donation",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTempleId("");
        setAmount("");
        setPaymentMethod("CASH");
        setDonorName("");
        setDonorPhone("");
        setDonorEmail("");
        setPanNumber("");
        setAddress("");
        setMessage("");
    };

    const selectedPaymentMethod = paymentMethods.find(m => m.value === paymentMethod) || paymentMethods[0];

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 to-transparent p-4 sm:p-6 lg:p-8">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-semibold mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Donations
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#7c4624] to-[#a0522d] rounded-2xl flex items-center justify-center shadow-lg">
                            <Gift className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-foreground">Add Offline Donation</h1>
                            <p className="text-muted-foreground mt-1">Record a manual donation with instant receipt</p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="border-none shadow-sacred overflow-hidden">
                    <CardContent className="p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Temple Selection */}
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-[0.2em] mb-3 block font-semibold">
                                    Select Temple <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={templeId}
                                    onChange={(e) => setTempleId(e.target.value)}
                                    disabled={loading}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#7c4624] focus:ring-[#7c4624]/20 disabled:opacity-50"
                                >
                                    <option value="">Select temple...</option>
                                    {temples.map((temple: any) => {
                                        const id = temple.temple?.id || temple.id;
                                        const name = parseLocalizedValue(temple.temple?.name || temple.name);
                                        return (
                                            <option key={id} value={id}>
                                                {name}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Amount & Payment Method */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-[0.2em] mb-3 block font-semibold">
                                        Donation Amount <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative mb-4">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                        <Input
                                            type="number"
                                            placeholder="Enter amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="pl-7 bg-slate-50 border-slate-200 rounded-xl text-lg font-semibold focus:border-[#7c4624] focus:ring-[#7c4624]/20"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {amountPresets.map((value) => (
                                            <button
                                                type="button"
                                                key={value}
                                                onClick={() => setAmount(value.toString())}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                                    amount === value.toString()
                                                        ? "bg-[#7c4624] text-white shadow-md"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                )}
                                            >
                                                ₹{value}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-[0.2em] mb-3 block font-semibold">
                                        Payment Method <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#7c4624] focus:ring-[#7c4624]/20"
                                    >
                                        {paymentMethods.map((method) => (
                                            <option key={method.value} value={method.value}>
                                                {method.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Status Info */}
                            <div className="bg-emerald-50 rounded-xl p-4 flex items-center justify-between border border-emerald-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-emerald-800">Donation Status: Success</p>
                                        <p className="text-xs text-emerald-600 mt-0.5">Manual donations are recorded as successful. Receipt & ledger entry will be created automatically.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Donor Information */}
                            <div className="border-t pt-6">
                                <label className="text-xs text-slate-500 uppercase tracking-[0.2em] mb-4 block font-semibold">
                                    Donor Information
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Full Name <span className="text-rose-500">*</span></label>
                                        <Input
                                            placeholder="Enter donor's full name"
                                            value={donorName}
                                            onChange={(e) => setDonorName(e.target.value)}
                                            className="bg-slate-50 border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Phone Number <span className="text-rose-500">*</span></label>
                                        <Input
                                            placeholder="10 or 11 digit mobile number"
                                            value={donorPhone}
                                            onChange={(e) => setDonorPhone(sanitizePhone(e.target.value))}
                                            className="bg-slate-50 border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Email Address <span className="text-rose-500">*</span></label>
                                        <Input
                                            type="email"
                                            placeholder="donor@example.com"
                                            value={donorEmail}
                                            onChange={(e) => setDonorEmail(e.target.value)}
                                            className="bg-slate-50 border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">PAN Number (Optional)</label>
                                        <Input
                                            placeholder="ABCDE1234F"
                                            value={panNumber}
                                            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                                            className="bg-slate-50 border-slate-200 rounded-xl uppercase"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-[0.2em] mb-2 block font-semibold">
                                    Address (Optional)
                                </label>
                                <Input
                                    placeholder="Full address for receipt"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="bg-slate-50 border-slate-200 rounded-xl"
                                />
                            </div>

                            {/* Prayer Message */}
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-[0.2em] mb-2 block font-semibold">
                                    Prayer / Sankalp Message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none focus:border-[#7c4624] focus:ring-2 focus:ring-[#7c4624]/20"
                                    placeholder="Enter prayer, sankalp or special message..."
                                />
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetForm}
                                    className="sm:flex-1"
                                    disabled={isSubmitting}
                                >
                                    Clear Form
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="sm:flex-1 bg-gradient-to-r from-[#7c4624] to-[#a0522d] hover:from-[#63361c] hover:to-[#7c4624] text-white shadow-lg"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Gift className="w-4 h-4 mr-2" />
                                            Record Donation & Print Receipt
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
