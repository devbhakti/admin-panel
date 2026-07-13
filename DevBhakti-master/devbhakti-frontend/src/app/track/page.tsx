"use client";

import React, { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Search, MapPin, CheckCircle2, Truck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_URL } from "@/config/apiConfig";

export default function TrackPrasadPage() {
    const [awbCode, setAwbCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [trackingData, setTrackingData] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const handleTrack = async () => {
        const code = awbCode.trim();
        if (!code) {
            setError("Please enter a valid AWB / Tracking ID.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setTrackingData(null);
        setSearched(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/bookings/track-awb?awb=${encodeURIComponent(code)}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const res = await response.json();

            if (res.success && res.trackingData) {
                setTrackingData(res.trackingData);
            } else {
                setError(res.message || "No tracking information found for this AWB code.");
            }
        } catch (err) {
            setError("Unable to fetch tracking details. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const activities = trackingData?.tracking_data?.shipment_track_activities || [];
    const currentInfo = trackingData?.tracking_data?.shipment_track?.[0];

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
            <Navbar />

            <main className="flex-1 flex flex-col items-center px-4 py-16 gap-10">

                {/* Hero Header */}
                <div className="text-center space-y-3 max-w-xl">
                    <div className="inline-flex items-center gap-2 bg-orange-100 text-[#794A05] text-xs font-bold px-4 py-1.5 rounded-full">
                        <Package className="w-3.5 h-3.5" />
                        Prasad Tracking
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">
                        Track Your Prasad 🙏
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        Enter your AWB / Tracking ID (sent via SMS or email) to check your Prasad delivery status right here on DevBhakti.
                    </p>
                </div>

                {/* Search Box */}
                <div className="w-full max-w-lg">
                    <div className="bg-white rounded-3xl border border-orange-100 shadow-xl shadow-orange-50 p-6 space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            AWB / Tracking ID
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={awbCode}
                                onChange={(e) => setAwbCode(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                                placeholder="e.g. 987654321 or SR1234567"
                                className="flex-1 h-12 px-4 rounded-2xl border border-slate-200 bg-[#FAF9F6] text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                            />
                            <Button
                                onClick={handleTrack}
                                disabled={isLoading}
                                className="h-12 px-6 bg-[#794A05] hover:bg-[#5a3504] text-white rounded-2xl font-bold shadow-md transition-all duration-300 flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4" />
                                )}
                                Track
                            </Button>
                        </div>
                        {error && (
                            <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5">
                                ⚠️ {error}
                            </p>
                        )}
                    </div>
                </div>

                {/* Results */}
                {isLoading && (
                    <div className="flex flex-col items-center gap-3 py-10 text-slate-500">
                        <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
                        <p className="text-sm font-semibold">Fetching live tracking info...</p>
                    </div>
                )}

                {!isLoading && searched && trackingData && (
                    <div className="w-full max-w-lg space-y-5">

                        {/* Current Status Card */}
                        <div className="bg-white rounded-3xl border border-orange-100 shadow-lg p-6 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Shipment Status</span>
                                <span className="bg-orange-100 text-[#794A05] text-xs font-bold px-3 py-1 rounded-full">
                                    {currentInfo?.current_status || "In Transit"}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AWB Code</p>
                                    <p className="text-sm font-bold text-slate-800">{currentInfo?.awb_code || awbCode}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Courier</p>
                                    <p className="text-sm font-bold text-slate-800">{currentInfo?.courier_name || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Estimated Delivery</p>
                                    <p className="text-sm font-bold text-slate-800">{currentInfo?.edd || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Destination</p>
                                    <p className="text-sm font-bold text-slate-800">{currentInfo?.destination || "—"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Live Timeline */}
                        {activities.length > 0 && (
                            <div className="bg-white rounded-3xl border border-orange-100 shadow-lg p-6 space-y-5">
                                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-orange-600" />
                                    Live Shipment Log
                                </h2>
                                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                                    {activities.map((act: any, idx: number) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={cn(
                                                    "w-4 h-4 rounded-full border-2 flex items-center justify-center shadow-sm flex-shrink-0",
                                                    idx === 0 ? "bg-orange-500 border-orange-600 scale-110" : "bg-[#794A05] border-[#794A05]"
                                                )}>
                                                    {idx === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                </div>
                                                {idx < activities.length - 1 && (
                                                    <div className="w-0.5 flex-1 bg-slate-200 min-h-[40px] my-1" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-3">
                                                <p className={cn(
                                                    "text-sm font-bold",
                                                    idx === 0 ? "text-orange-600" : "text-slate-800"
                                                )}>
                                                    {act.activity || act.status}
                                                </p>
                                                {act.location && (
                                                    <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {act.location}
                                                    </p>
                                                )}
                                                <p className="text-[11px] text-slate-400 mt-1 font-medium flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {act.date}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!isLoading && searched && !trackingData && !error && (
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                        <Package className="w-12 h-12 text-slate-300" />
                        <p className="text-sm font-bold text-slate-600">No tracking data found.</p>
                        <p className="text-xs text-slate-400 max-w-xs">Please check your AWB code and try again. Make sure you entered it exactly as received.</p>
                    </div>
                )}

            </main>

            <Footer />
        </div>
    );
}
