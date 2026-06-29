"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Users,
    Calendar,
    TrendingUp,
    Heart,
    Shield,
    IndianRupee,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseLocalizedValue } from "@/utils/textUtils";

import { fetchMandalProfile, fetchMandalEvents, fetchMandalDonations } from "@/api/mandalAdminController";

export default function MandalDashboardPage() {
    const router = useRouter();
    const { hasPermission } = useAdminAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [donations, setDonations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mandalProfile, setMandalProfile] = useState<any>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            const [profileRes, eventsRes, donationsRes] = await Promise.all([
                fetchMandalProfile(),
                fetchMandalEvents(),
                fetchMandalDonations()
            ]);

            if (profileRes.success) {
                setMandalProfile(profileRes.data);
            }

            if (eventsRes.success) {
                setEvents(eventsRes.data || []);
            }

            if (donationsRes.success) {
                setDonations(donationsRes.data || []);
            }
        } catch (error) {
            console.error("Dashboard data load error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'lifetime'>('week');

    const getFilteredData = (data: any[], period: string) => {
        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        
        return data.filter(item => {
            const itemDate = new Date(item.createdAt);
            if (period === 'today') {
                return itemDate >= startOfToday;
            } else if (period === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return itemDate >= weekAgo;
            } else if (period === 'month') {
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                return itemDate >= monthAgo;
            } else if (period === 'year') {
                const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                return itemDate >= yearAgo;
            }
            return true; // lifetime
        });
    };

    const filteredDonations = getFilteredData(donations, selectedPeriod);
    const filteredEvents = getFilteredData(events, selectedPeriod);

    const totalDonationAmount = filteredDonations.reduce((acc, d) => acc + (d.amount || 0), 0);
    const totalDonationsCount = filteredDonations.length;
    const activeEventsCount = events.filter(e => e.isActive).length;

    const uniqueDevotees = new Set([
        ...filteredDonations.map(d => d.user?.phone || d.user?.email || d.user?.name).filter(Boolean)
    ]).size;

    const stats = [
        { 
            title: "Total Donation Amount", 
            value: `₹${totalDonationAmount.toLocaleString()}`, 
            icon: TrendingUp, 
            color: "text-white", 
            bg: "bg-white/20",
            tooltip: `Total donation received in the selected ${selectedPeriod}.`
        },
        { 
            title: "Donations Received", 
            value: totalDonationsCount.toString(), 
            icon: Heart, 
            color: "text-orange-600", 
            bg: "bg-orange-100/50",
            tooltip: `Number of donations in the selected ${selectedPeriod}.`
        },
        { 
            title: "Active Events", 
            value: activeEventsCount.toString(), 
            icon: Calendar, 
            color: "text-blue-600", 
            bg: "bg-blue-100/50",
            tooltip: `Current active events for the mandal.`
        },
        { 
            title: "Total Devotees", 
            value: uniqueDevotees.toString(), 
            icon: Users, 
            color: "text-indigo-600", 
            bg: "bg-indigo-100/50",
            tooltip: `Unique devotees who donated or participated in the selected ${selectedPeriod}.`
        },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-sidebar-primary" />
                <p className="text-sidebar-primary font-medium font-serif">Loading Dashboard Stats...</p>
            </div>
        );
    }

    if (!hasPermission('dashboard.view')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center border-4 border-red-100">
                    <Shield className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-800">Access Restricted</h2>
                <p className="text-slate-500 text-center max-w-md">
                    You don't have permission to view the main dashboard analytics. Please use the sidebar menu to access your permitted areas.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-8 bg-orange-50/20 p-2 md:p-8 rounded-[1.5rem] md:rounded-[2rem] min-h-screen">
            {/* Page header - Premium Style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 bg-white p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-orange-100/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                <div className="relative z-10 space-y-1 md:space-y-2">
                    <h1 className="text-2xl md:text-5xl font-serif font-black text-amber-600 tracking-tight uppercase">
                        Mandal Dashboard
                    </h1>
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="h-6 md:h-8 w-1.5 md:w-2 bg-amber-600 rounded-full" />
                        <p className="text-lg md:text-3xl font-black text-slate-800 font-serif truncate max-w-[220px] md:max-w-none">
                            {parseLocalizedValue(mandalProfile?.name) || "Sacred Mandal"}
                        </p>
                    </div>
                    <p className="text-slate-400 text-xs md:text-sm font-black uppercase tracking-[0.15em] md:tracking-[0.2em] flex items-center gap-2 pl-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Administrator Control Center
                    </p>
                </div>
            </div>

            {/* Performance Overview Filter */}
            <div className="flex flex-col gap-3 bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-orange-100/20">
                <div className="flex items-center gap-2 md:gap-3">
                    <h2 className="text-lg md:text-2xl font-serif font-black text-slate-800">Performance Overview</h2>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-black uppercase text-[9px] md:text-[10px] tracking-widest px-2 md:px-3 py-1">
                        {selectedPeriod === 'today' ? 'Daily' : selectedPeriod === 'week' ? 'Weekly' : selectedPeriod === 'month' ? 'Monthly' : selectedPeriod === 'year' ? 'Yearly' : 'Lifetime'}
                    </Badge>
                </div>
                
                <div className="flex bg-slate-100/80 p-1 md:p-1.5 rounded-xl md:rounded-2xl gap-0.5 md:gap-1 overflow-x-auto">
                    {['today', 'week', 'month', 'year', 'lifetime'].map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period as any)}
                            className={cn(
                                "px-3 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider md:tracking-widest transition-all whitespace-nowrap flex-shrink-0",
                                selectedPeriod === period 
                                    ? "bg-white text-amber-600 shadow-sm" 
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                        <Card className={cn(
                            "hover:shadow-xl transition-all border-none rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group h-full",
                            stat.title === "Total Donation Amount" ? "bg-[#794A05] text-white" : "bg-white"
                        )}>
                            <CardContent className="p-4 md:p-8">
                                <div className="flex justify-between items-start mb-3 md:mb-4">
                                    <div className={cn("w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                                        <stat.icon className={cn("w-4 h-4 md:w-6 md:h-6", stat.color)} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className={cn(
                                        "text-[10px] md:text-xs font-black uppercase tracking-widest",
                                        stat.title === "Total Donation Amount" ? "text-orange-200" : "text-slate-400"
                                    )}>
                                        {stat.title}
                                    </h3>
                                    <p className={cn(
                                        "text-xl md:text-3xl font-serif font-black tracking-tight",
                                        stat.title === "Total Donation Amount" ? "text-white" : "text-slate-800"
                                    )}>
                                        {stat.value}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
            
            {/* Additional content lists for latest donations and events can go here */}
        </div>
    );
}
