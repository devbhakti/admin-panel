"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowRight, ShieldCheck, Key, CheckCircle2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyOTP, sendOTP } from "@/api/authController";
import { useRouter } from "next/navigation";
import { clearAllTokens } from "@/lib/auth-utils";

export default function MandalLoginPage() {
    const router = useRouter();
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [devOtp, setDevOtp] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const normalizedPhone = phone.replace(/\D/g, '');
        try {
            const response = await sendOTP({ phone: normalizedPhone, role: "MANDAL", mode: "login" });
            setShowOtpInput(true);
            if (response.data?.otp) {
                setDevOtp(response.data.otp);
            }
        } catch (error: any) {
            setError(error.response?.data?.message || "Failed to send OTP. Please check if your Mandal is approved.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const normalizedPhone = phone.replace(/\D/g, '');
        try {
            const response = await verifyOTP(normalizedPhone, otp, "MANDAL");
            const { token, user } = response.data;

            if (user.role !== "MANDAL") {
                setError("Unauthorized access role.");
                return;
            }

            clearAllTokens();
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            router.push("/mandal-admin");
        } catch (error: any) {
            setError(error.response?.data?.message || "Invalid or expired OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg relative z-10 px-6"
            >
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                    {/* Top bar with design */}
                    <div className="h-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

                    <div className="p-8 md:p-12">
                        {/* Logo & Intro */}
                        <div className="flex flex-col items-center text-center mb-10">
                            <motion.div
                                className="mb-6 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10"
                            >
                                <Landmark className="w-12 h-12 text-amber-600" />
                            </motion.div>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2">
                                Mandal Admin Portal
                            </h1>
                            <p className="text-slate-500 max-w-xs mx-auto">
                                Secure access for registered local mandals and pandal committees
                            </p>
                        </div>

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-start gap-3"
                                >
                                    <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form Section */}
                        {!showOtpInput ? (
                            <form onSubmit={handleSendOTP} className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="phone" className="text-slate-700 font-medium ml-1">Registered Phone Number</Label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <Phone className="w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                            <span className="text-slate-400 font-semibold border-l pl-2 border-slate-300 leading-none">+91</span>
                                        </div>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            maxLength={10}
                                            placeholder="XXXXX XXXXX"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            className="h-14 pl-24 bg-slate-50 border-slate-200 focus:border-amber-500 focus:ring-amber-500/10 rounded-2xl text-lg tracking-wide"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 ml-1">
                                        We will send a one-time password to verify your identity.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl text-lg font-bold shadow-lg shadow-amber-500/20"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            Send Secure OTP
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                {devOtp && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-amber-50 border border-amber-500/10 p-4 rounded-xl mb-4 text-center shadow-sm"
                                    >
                                        <p className="text-slate-600 text-xs font-medium mb-1">Development OTP</p>
                                        <p className="text-2xl font-serif font-bold text-amber-600 tracking-widest">{devOtp}</p>
                                    </motion.div>
                                )}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center ml-1">
                                        <Label htmlFor="otp" className="text-slate-700 font-medium">One-Time Password</Label>
                                        <button
                                            type="button"
                                            onClick={() => setShowOtpInput(false)}
                                            className="text-xs text-amber-600 font-bold hover:underline"
                                        >
                                            Change Number
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors">
                                            <Key className="w-5 h-5" />
                                        </div>
                                        <Input
                                            id="otp"
                                            type="text"
                                            maxLength={6}
                                            placeholder="· · · · · ·"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="h-14 pl-12 bg-slate-50 border-slate-200 focus:border-amber-500 focus:ring-amber-500/10 rounded-2xl text-2xl text-center tracking-[0.5em] font-bold"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 text-center">
                                        OTP has been sent to <span className="text-slate-600 font-bold">{phone}</span>
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-lg font-bold shadow-lg shadow-emerald-600/20"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Verifying...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            Verify & Enter Panel
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}
                                </Button>

                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        onClick={handleSendOTP}
                                        className="text-sm text-slate-500 hover:text-amber-600 transition-colors"
                                    >
                                        Didn't receive the code? <span className="font-bold underline">Resend</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500">
                            Want to register a new Mandal? <a href="/register-mandal" className="text-amber-600 font-bold hover:underline">Register here</a>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
