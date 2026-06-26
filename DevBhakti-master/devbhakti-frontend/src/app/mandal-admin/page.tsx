"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Users,
    Calendar,
    TrendingUp,
    ArrowUpRight,
    Video,
    Settings,
    Heart,
    IndianRupee,
    Info,
    Shield,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchMandalProfile, fetchMandalEvents, fetchMandalFinanceSummary, fetchMandalDonations } from "@/api/mandalAdminController";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { parseLocalizedValue } from "@/utils/textUtils";

export default function MandalDashboardPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [mandalProfile, setMandalProfile] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [donations, setDonations] = useState<any[]>([]);
    const [financeSummary, setFinanceSummary] = useState<any>({
        totalEarnings: 0,
        totalCommission: 0,
        netEarnings: 0,
        availableBalance: 0,
        pendingBalance: 0,
        inEscrow: 0,
        processingWithdrawals: 0
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            const [profileRes, eventsRes, financeRes, donationsRes] = await Promise.all([
                fetchMandalProfile(),
                fetchMandalEvents(),
                fetchMandalFinanceSummary(),
                fetchMandalDonations({ limit: 5 })
            ]);

            if (profileRes.success) {
                setMandalProfile(profileRes.data);
            }
            if (eventsRes.success) {
                setEvents(eventsRes.data || []);
            }
            if (financeRes.success) {
                setFinanceSummary(financeRes.data || {});
            }
            if (donationsRes.success) {
                setDonations(donationsRes.data || []);
            }
        } catch (error) {
            console.error("Mandal Dashboard data load error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = [
        { 
            title: "Total Collections", 
            value: `₹${(financeSummary.totalEarnings || 0).toLocaleString()}`, 
            icon: TrendingUp, 
            color: "text-white", 
            bg: "bg-white/20",
            tooltip: "Total gross amount collected from all donations."
        },
        { 
            title: "Net Earnings", 
            value: `₹${(financeSummary.netEarnings || 0).toLocaleString()}`, 
            icon: IndianRupee, 
            color: "text-amber-600", 
            bg: "bg-amber-100/50",
            tooltip: "Gross amount minus the system commission."
        },
        { 
            title: "Available Balance", 
            value: `₹${(financeSummary.availableBalance || 0).toLocaleString()}`, 
            icon: Shield, 
            color: "text-emerald-600", 
            bg: "bg-emerald-100/50",
            tooltip: "Balance ready to be requested for withdrawal."
        },
        { 
            title: "In Escrow (3 Days)", 
            value: `₹${(financeSummary.inEscrow || 0).toLocaleString()}`, 
            icon: Calendar, 
            color: "text-blue-600", 
            bg: "bg-blue-100/50",
            tooltip: "Amounts currently held in escrow (cleared after 3 days)."
        },
        { 
            title: "Upcoming Events", 
            value: events.filter(e => e.status).length.toString(), 
            icon: Users, 
            color: "text-rose-600", 
            bg: "bg-rose-100/50",
            tooltip: "Total number of active upcoming events."
        },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                <p className="text-amber-600 font-medium font-serif">Loading Dashboard Stats...</p>
            </div>
        );
    }

    const recentDonations = donations.slice(0, 5);
    const upcomingEvents = events
        .filter(e => {
            if (!e.date) return false;
            try {
                return new Date(e.date) >= new Date(new Date().setHours(0,0,0,0));
            } catch (err) {
                return false;
            }
        })
        .slice(0, 5);

    return (
        <div className="space-y-4 md:space-y-8 bg-slate-50/20 p-2 md:p-8 rounded-[1.5rem] md:rounded-[2rem] min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 bg-white p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                <div className="relative z-10 space-y-1 md:space-y-2">
                    <h1 className="text-2xl md:text-5xl font-serif font-black text-amber-600 tracking-tight uppercase">
                        Mandal Portal
                    </h1>
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="h-6 md:h-8 w-1.5 md:w-2 bg-amber-600 rounded-full" />
                        <p className="text-lg md:text-3xl font-black text-slate-800 font-serif truncate">
                            {parseLocalizedValue(mandalProfile?.name) || "Sacred Mandal"}
                        </p>
                    </div>
                    <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.15em] flex items-center gap-2 pl-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Mandal Dashboard Control Panel
                    </p>
                </div>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title} className={cn(
                        "hover:shadow-xl transition-all border-none rounded-[1.5rem] overflow-hidden group h-full",
                        stat.title === "Total Collections" ? "bg-amber-600 text-white" : "bg-white"
                    )}>
                        <CardContent className="p-5 md:p-8">
                            <div className="flex justify-between items-start mb-3">
                                <div className={cn("w-9 h-9 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                                    <stat.icon className={cn("w-4 h-4 md:w-6 md:h-6", stat.color)} />
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold group-hover:text-amber-500 cursor-help" title={stat.tooltip}>
                                    <Info className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <p className={cn(
                                    "text-lg md:text-2xl font-black tracking-tight",
                                    stat.title === "Total Collections" ? "text-white" : "text-slate-900"
                                )}>{stat.value}</p>
                                <p className={cn(
                                    "text-[9px] md:text-xs font-bold uppercase tracking-wider",
                                    stat.title === "Total Collections" ? "text-white/60" : "text-slate-400"
                                )}>{stat.title}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                {/* Recent Donations */}
                <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                        <CardTitle className="text-xl font-bold text-slate-800 font-serif">Recent Donations</CardTitle>
                        <button
                            onClick={() => router.push('/mandal-admin/donations')}
                            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 uppercase tracking-widest"
                        >
                            View all
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {recentDonations.length > 0 ? recentDonations.map((donation, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-amber-200 hover:shadow-md transition-all cursor-pointer group"
                                    onClick={() => router.push('/mandal-admin/donations')}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                            <Heart className="w-6 h-6 text-emerald-600 group-hover:text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{donation.donorName || "Anonymous"}</p>
                                            <p className="text-xs text-slate-400">
                                                {donation.createdAt ? format(new Date(donation.createdAt), "MMM d, yyyy") : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-900">₹{donation.amount?.toLocaleString()}</p>
                                        <Badge variant="outline" className="mt-1 font-bold text-[9px] uppercase tracking-tighter bg-emerald-50 text-emerald-700 border-emerald-200">
                                            {donation.status}
                                        </Badge>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center text-slate-400 text-sm italic font-medium">No recent donations found.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                        <CardTitle className="text-xl font-bold text-slate-800 font-serif">Upcoming Events</CardTitle>
                        <button
                            onClick={() => router.push('/mandal-admin/events')}
                            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 uppercase tracking-widest"
                        >
                            View all
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {upcomingEvents.length > 0 ? upcomingEvents.map((event, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-orange-50/50 border border-orange-100 hover:bg-white hover:border-amber-200 hover:shadow-md transition-all cursor-pointer group"
                                    onClick={() => router.push('/mandal-admin/events')}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                                            <Calendar className="w-6 h-6 text-orange-600 group-hover:text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{parseLocalizedValue(event.name) || 'Event'}</p>
                                            <p className="text-xs text-slate-400">
                                                {event.date ? format(new Date(event.date), "MMM d, yyyy") : 'Date TBD'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Scheduled</span>
                                        {event.time && <p className="text-[10px] text-slate-400 font-bold mt-0.5">{event.time}</p>}
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center text-slate-400 text-sm italic font-medium">No upcoming events scheduled.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-none shadow-sm rounded-[1.5rem] md:rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-6 pb-3">
                    <CardTitle className="text-lg md:text-xl font-bold text-slate-800 font-serif">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <button
                            onClick={() => router.push('/mandal-admin/events')}
                            className="flex flex-col items-center gap-2 p-6 rounded-[1.5rem] border border-slate-100 hover:border-amber-200 hover:bg-amber-50/20 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-rose-500/20 text-white">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-slate-800">Manage Events</span>
                        </button>
                        <button
                            onClick={() => router.push('/mandal-admin/finance')}
                            className="flex flex-col items-center gap-2 p-6 rounded-[1.5rem] border border-slate-100 hover:border-amber-200 hover:bg-amber-50/20 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20 text-white">
                                <IndianRupee className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-slate-800">Withdraw Funds</span>
                        </button>
                        <button
                            onClick={() => router.push('/mandal-admin/profile')}
                            className="flex flex-col items-center gap-2 p-6 rounded-[1.5rem] border border-slate-100 hover:border-amber-200 hover:bg-amber-50/20 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/20 text-white">
                                <Settings className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-slate-800">Mandal Settings</span>
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
