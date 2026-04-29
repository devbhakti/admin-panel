"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Users,
    Calendar,
    ShoppingBag,
    Package,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Video,
    Heart,
    IndianRupee,
    Info,
    Shield
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchMyTempleBookings, fetchTempleOrders, fetchMyTempleProfile, fetchMyProducts, fetchMyEvents } from "@/api/templeAdminController";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadDonationsExcel, downloadDonationsPdf } from "@/api/templeAdminController";
import { toast } from "@/hooks/use-toast";
import { FileText, FileSpreadsheet } from "lucide-react";
import { parseLocalizedValue } from "@/utils/textUtils";



const recentOrders = [
    {
        id: "ORD-7821",
        user: "Amit Kumar",
        product: "Panchamrit Set",
        amount: "₹550",
        status: "Delivered",
    },
    {
        id: "ORD-7822",
        user: "Priya Singh",
        product: "Brass Diya",
        amount: "₹1,200",
        status: "Processing",
    },
    {
        id: "ORD-7823",
        user: "Rahul Sharma",
        product: "Incense Sticks",
        amount: "₹250",
        status: "Shipped",
    },
];

const upcomingBookings = [
    {
        id: "BK-1024",
        user: "Suresh Raina",
        pooja: "Rudrabhishek",
        date: "Oct 25, 2024",
        time: "08:00 AM",
    },
    {
        id: "BK-1025",
        user: "Meena Devi",
        pooja: "Satyanarayan Katha",
        date: "Oct 26, 2024",
        time: "10:30 AM",
    },
];

export default function TempleDashboardPage() {
    const router = useRouter();
    const { hasPermission } = useAdminAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [templeProfile, setTempleProfile] = useState<any>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            const [profileRes, bookingsRes, productsRes, eventsRes] = await Promise.all([
                fetchMyTempleProfile(),
                fetchMyTempleBookings(),
                fetchMyProducts(),
                fetchMyEvents()
            ]);

            if (profileRes.success) {
                setTempleProfile(profileRes.data);
            }

            if (bookingsRes.success) {
                setBookings(bookingsRes.data || []);
            }

            if (eventsRes.success) {
                setEvents(eventsRes.data || []);
            }

            if (productsRes.success) {
                const productsData = productsRes.data?.products || productsRes.data || [];

                if (productsRes.data?.pagination?.total !== undefined) {
                    setTotalProducts(productsRes.data.pagination.total);
                } else {
                    setTotalProducts(Array.isArray(productsData) ? productsData.length : 0);
                }
            }

            if (profileRes.success && profileRes.data.id) {
                const ordersRes = await fetchTempleOrders(profileRes.data.id);
                if (ordersRes.success) {
                    setOrders(ordersRes.data || []); // Ensure array
                }
            }
        } catch (error) {
            console.error("Dashboard data load error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (type: 'excel' | 'pdf') => {
        if (!templeProfile?.id) {
            toast({
                title: "Error",
                description: "Temple profile not loaded. Please refresh.",
                variant: "destructive",
            });
            return;
        }

        try {
            toast({
                title: "Processing",
                description: `Preparing your ${type.toUpperCase()} report...`,
            });
            
            const data = type === 'excel' 
                ? await downloadDonationsExcel(templeProfile.id)
                : await downloadDonationsPdf(templeProfile.id);
            
            const blob = new Blob([data], { 
                type: type === 'excel' 
                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                    : 'application/pdf' 
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `donations_report_${new Date().toISOString().slice(0, 10)}.${type === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            toast({
                title: "Success",
                description: "Report downloaded successfully.",
            });
        } catch (error) {
            console.error("Download Error:", error);
            toast({
                title: "Download Failed",
                description: "There was an error generating your report.",
                variant: "destructive",
            });
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

    const filteredBookings = getFilteredData(bookings, selectedPeriod);
    const filteredOrders = getFilteredData(orders, selectedPeriod);

    const poojaRevenue = filteredBookings.reduce((acc, b) => acc + (b.packagePrice || 0), 0);
    const productRevenue = filteredOrders.reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0);
    const totalBookings = filteredBookings.length;
    const completedBookings = filteredBookings.filter(b => b.status === 'COMPLETED').length;

    const uniqueDevotees = new Set([
        ...filteredBookings.map(b => b.devoteePhone || b.devoteeEmail || b.devoteeName).filter(Boolean),
        ...filteredOrders.map(o => o.order?.user?.phone || o.order?.user?.email || o.order?.user?.name).filter(Boolean)
    ]).size;

    const stats = [
        { 
            title: "Total Revenue", 
            value: `₹${(poojaRevenue + productRevenue).toLocaleString()}`, 
            icon: TrendingUp, 
            color: "text-white", 
            bg: "bg-white/20",
            tooltip: `Total revenue generated from all sources in the selected ${selectedPeriod}.`
        },
        { 
            title: "Service Sales", 
            value: `₹${poojaRevenue.toLocaleString()}`, 
            icon: Calendar, 
            color: "text-orange-600", 
            bg: "bg-orange-100/50",
            tooltip: `Revenue from Pooja and Seva bookings in the selected ${selectedPeriod}.`
        },
        { 
            title: "Total Bookings", 
            value: totalBookings.toString(), 
            icon: Package, 
            color: "text-blue-600", 
            bg: "bg-blue-100/50",
            tooltip: `Total number of bookings received in the selected ${selectedPeriod}.`
        },
        { 
            title: "Completed", 
            value: completedBookings.toString(), 
            icon: Shield, 
            color: "text-emerald-600", 
            bg: "bg-emerald-100/50",
            tooltip: `Number of successfully completed services in the selected ${selectedPeriod}.`
        },
        { 
            title: "Total Devotees", 
            value: uniqueDevotees.toString(), 
            icon: Users, 
            color: "text-indigo-600", 
            bg: "bg-indigo-100/50",
            tooltip: `Unique devotees who interacted with your temple in the selected ${selectedPeriod}.`
        },
    ];

    const recentOrdersData = [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    const upcomingBookingsData = [...bookings]
        .filter(b => b.status === 'BOOKED')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(0, 5);

    const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const upcomingEventsData = [...events]
        .filter(e => {
            if (!e.date) return false;
            try {
                const date = new Date(e.date);
                if (isNaN(date.getTime())) return false; // Invalid date
                const eventDateStr = date.toISOString().slice(0, 10);
                return eventDateStr >= todayStr;
            } catch (err) {
                return false;
            }
        })
        .sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (isNaN(dateA)) return 1;
            if (isNaN(dateB)) return -1;
            return dateA - dateB;
        })
        .slice(0, 5);

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
        <div className="space-y-8 bg-orange-50/20 p-4 md:p-8 rounded-[2rem] min-h-screen">
            {/* Page header - Premium Style */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-10 rounded-[2.5rem] shadow-sm border border-orange-100/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                <div className="relative z-10 space-y-2">
                    <h1 className="text-4xl md:text-5xl font-serif font-black text-amber-600 tracking-tight uppercase">
                        Temple Dashboard
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-2 bg-amber-600 rounded-full" />
                        <p className="text-2xl md:text-3xl font-black text-slate-800 font-serif">
                            {parseLocalizedValue(templeProfile?.name) || "Sacred Temple"}
                        </p>
                    </div>
                    <p className="text-slate-400 text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 pl-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Administrator Control Center
                    </p>
                </div>
            </div>

            {/* Performance Overview Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-orange-100/20">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-serif font-black text-slate-800">Performance Overview</h2>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-black uppercase text-[10px] tracking-widest px-3 py-1">
                        {selectedPeriod === 'today' ? 'Daily' : selectedPeriod === 'week' ? 'Weekly' : selectedPeriod === 'month' ? 'Monthly' : selectedPeriod === 'year' ? 'Yearly' : 'Lifetime'}
                    </Badge>
                </div>
                
                <div className="flex bg-slate-100/80 p-1.5 rounded-2xl gap-1">
                    {['today', 'week', 'month', 'year', 'lifetime'].map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period as any)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                        <Card className={cn(
                            "hover:shadow-xl transition-all border-none rounded-[2rem] overflow-hidden group h-full",
                            stat.title === "Total Revenue" ? "bg-[#794A05] text-white" : "bg-white"
                        )}>
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                                        <stat.icon className={cn("w-6 h-6", stat.color)} />
                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                                                stat.title === "Total Revenue" ? "hover:bg-white/10" : "hover:bg-slate-100"
                                            )}>
                                                <Info className={cn(
                                                    "w-3.5 h-3.5 transition-colors",
                                                    stat.title === "Total Revenue" ? "text-white/40 hover:text-white" : "text-slate-300 hover:text-amber-500"
                                                )} />
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64 bg-slate-900 text-white border-none p-4 rounded-2xl shadow-2xl z-[100]">
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                                    <Info className="w-4 h-4 text-amber-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-widest text-amber-500 mb-1">{stat.title}</p>
                                                    <p className="text-xs font-medium leading-relaxed opacity-90">{stat.tooltip}</p>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-1">
                                    <p className={cn(
                                        "text-2xl font-black tracking-tight",
                                        stat.title === "Total Revenue" ? "text-white" : "text-slate-900"
                                    )}>{stat.value}</p>
                                    <p className={cn(
                                        "text-xs font-black uppercase tracking-widest",
                                        stat.title === "Total Revenue" ? "text-white/60" : "text-slate-400"
                                    )}>{stat.title}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main content grid - 3 columns */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Todays Product Orders */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    <Card className="border-none shadow-sm h-full rounded-[2rem] bg-white overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                            <CardTitle className="text-xl font-black text-slate-800 font-serif">Todays Product Orders</CardTitle>
                            <button
                                onClick={() => router.push('/temples/dashboard/orders')}
                                className="text-xs font-black text-amber-600 hover:text-amber-700 flex items-center gap-1 uppercase tracking-widest"
                            >
                                View all
                                <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {recentOrdersData.length > 0 ? recentOrdersData.map((subOrder, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-amber-200 hover:shadow-md transition-all cursor-pointer group"
                                        onClick={() => router.push('/temples/dashboard/orders')}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                                <ShoppingBag className="w-6 h-6 text-emerald-600 group-hover:text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">Order #{subOrder.id?.slice(-4).toUpperCase()}</p>
                                                <p className="text-xs font-bold text-slate-400">By {subOrder.order?.user?.name || 'Customer'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-900">₹{subOrder.totalAmount?.toLocaleString()}</p>
                                            <Badge variant="outline" className="mt-1 font-black text-[9px] uppercase tracking-tighter">
                                                {subOrder.status}
                                            </Badge>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center text-slate-400 text-sm italic font-medium">No recent orders found.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>



                 {/* Upcoming Bookings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                >
                    <Card className="border-none shadow-sm h-full rounded-[2rem] bg-white overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                            <CardTitle className="text-xl font-black text-slate-800 font-serif">Upcoming Poojas</CardTitle>
                            <button
                                onClick={() => router.push('/temples/dashboard/bookings')}
                                className="text-xs font-black text-amber-600 hover:text-amber-700 flex items-center gap-1 uppercase tracking-widest"
                            >
                                View all
                                <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {upcomingBookingsData.length > 0 ? upcomingBookingsData.map((booking, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-orange-50/50 border border-orange-100/50 hover:bg-white hover:border-amber-200 hover:shadow-md transition-all cursor-pointer group"
                                        onClick={() => router.push('/temples/dashboard/bookings')}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                                                <Calendar className="w-6 h-6 text-orange-600 group-hover:text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{parseLocalizedValue(booking.pooja?.name) || 'Sacred Pooja'}</p>
                                                <p className="text-xs font-bold text-slate-400">For {booking.devoteeName || 'Devotee'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-900">
                                                {booking.createdAt ? format(new Date(booking.createdAt), "MMM d, yyyy") : 'TBD'}
                                            </p>
                                            <p className="text-[10px] font-black text-orange-600 mt-1 uppercase tracking-widest">Scheduled</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center text-slate-400 text-sm italic font-medium">No upcoming bookings found.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Upcoming Events */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.45 }}
                >
                    <Card className="border-none shadow-sm h-full rounded-[2rem] bg-white overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                            <CardTitle className="text-xl font-black text-slate-800 font-serif">Upcoming Events</CardTitle>
                            <button
                                onClick={() => router.push('/temples/dashboard/events')}
                                className="text-xs font-black text-amber-600 hover:text-amber-700 flex items-center gap-1 uppercase tracking-widest"
                            >
                                View all
                                <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {upcomingEventsData.length > 0 ? upcomingEventsData.map((event, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/50 border border-rose-100/50 hover:bg-white hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
                                        onClick={() => router.push('/temples/dashboard/events')}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center group-hover:bg-rose-500 transition-colors">
                                                <Video className="w-6 h-6 text-rose-600 group-hover:text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{parseLocalizedValue(event.name) || 'Event'}</p>
                                                <p className="text-xs font-bold text-slate-400">
                                                    {event.date ? format(new Date(event.date), "MMM d, yyyy") : 'Date TBD'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Upcoming</span>
                                            {event.location && <p className="text-[10px] text-slate-400 font-bold mt-0.5">{event.location}</p>}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center text-slate-400 text-sm italic font-medium">No upcoming events.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

               
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
            >
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xl font-black text-slate-800 font-serif">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: "Add Product", icon: Package, color: "bg-emerald-500", href: "/temples/dashboard/products" },
                                { label: "Offer Pooja", icon: Calendar, color: "bg-orange-500", href: "/temples/dashboard/poojas/create" },
                                { label: "New Event", icon: Calendar, color: "bg-rose-500", href: "/temples/dashboard/events" },
                                { 
                                    label: "Download Excel Report", 
                                    subtext: "Donation",
                                    icon: TrendingUp, 
                                    color: "bg-sky-500", 
                                    isExcel: true,
                                    href: "#" 
                                },
                            ].map((action) => (
                                <button
                                    key={action.label}
                                    onClick={() => {
                                        if (action.isExcel) {
                                            handleDownload('excel');
                                        } else {
                                            router.push(action.href);
                                        }
                                    }}
                                    className="relative flex flex-col items-center gap-4 p-6 rounded-[2rem] border border-slate-100 hover:border-amber-200 hover:bg-orange-50/30 transition-all group overflow-hidden"
                                >
                                    <div
                                        className={cn(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg",
                                            action.color
                                        )}
                                    >
                                        <action.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-center">
                                        <span className="text-sm font-black text-slate-800 block leading-tight">{action.label}</span>
                                        {action.subtext && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{action.subtext}</span>}
                                    </div>
                                    {action.isExcel && (
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center hover:bg-emerald-100 transition-colors cursor-pointer"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <ArrowUpRight className="w-3 h-3 text-slate-400" />
                                                    </div>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-none shadow-2xl bg-white/95 backdrop-blur-md">
                                                    <DropdownMenuLabel className="text-xs font-black text-slate-400 uppercase tracking-widest px-3 py-2">Select Format</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-slate-100 mb-1" />
                                                    <DropdownMenuItem 
                                                        onClick={() => handleDownload('excel')}
                                                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50 group/item transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700">Excel Report</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => handleDownload('pdf')}
                                                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-rose-50 focus:bg-rose-50 group/item transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                                            <FileText className="w-4 h-4 text-rose-600" />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700">PDF Report</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
