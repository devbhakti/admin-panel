"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Phone,
    Calendar as CalendarIcon,
    Eye,
    Loader2,
    CheckSquare,
    Trash2,
    Send,
    Download,
    Building2,
    UserCheck,
    RotateCcw,
    Heart,
    Sparkles,
    ChevronDown,
    MapPin,
    ShieldCheck
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchAllUsersAdmin, downloadUsersExcelAdmin, downloadUsersAiSensyCSVAdmin, toggleUserStatusAdmin, bulkToggleUserStatusAdmin, sendBulkWhatsAppAdmin } from "@/api/adminController";
import { toast } from "sonner"; // Assuming sonner is used for notifications
import { parseLocalizedValue } from "@/utils/textUtils";
import { BASE_URL } from "@/config/apiConfig";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useAdminAuth } from "@/hooks/use-admin-auth";

const formatImpDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    } catch (e) {
        return dateStr;
    }
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [dobFilter, setDobFilter] = useState("");
    const [dobStart, setDobStart] = useState("");
    const [dobEnd, setDobEnd] = useState("");
    const [anniversaryFilter, setAnniversaryFilter] = useState("");
    const [anniversaryStart, setAnniversaryStart] = useState("");
    const [anniversaryEnd, setAnniversaryEnd] = useState("");
    const [dobDateRange, setDobDateRange] = useState<DateRange | undefined>(undefined);
    const [anniversaryDateRange, setAnniversaryDateRange] = useState<DateRange | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDevotees: 0,
        totalInstitutions: 0,
        totalSellers: 0,
        newThisMonth: 0,
        filteredCount: 0,
        filteredBookings: 0,
        filteredOrders: 0
    });
    const [dateRange, setDateRange] = useState<"all" | "week" | "month" | "year" | "pooja_last_year">("all");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [filterType, setFilterType] = useState<string>("");
    const { hasPermission } = useAdminAuth();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            let startDate, endDate;
            let currentFilterType = filterType;

            if (dateRange === "pooja_last_year") {
                currentFilterType = "pooja_last_year";
            } else if (dateRange !== "all") {
                const now = new Date();
                endDate = now.toISOString();
                const start = new Date();
                if (dateRange === "week") {
                    start.setDate(now.getDate() - now.getDay());
                    start.setHours(0, 0, 0, 0);
                } else if (dateRange === "month") {
                    start.setDate(1);
                    start.setHours(0, 0, 0, 0);
                } else if (dateRange === "year") {
                    start.setMonth(0, 1);
                    start.setHours(0, 0, 0, 0);
                }
                startDate = start.toISOString();
            }

            const response = await fetchAllUsersAdmin({
                page,
                limit: 10,
                search: debouncedSearch,
                role: typeFilter,
                startDate,
                endDate,
                dob: dobFilter,
                dobStart,
                dobEnd,
                anniversary: anniversaryFilter,
                anniversaryStart,
                anniversaryEnd,
                filterType: currentFilterType,
                includeUnverified: false
            });
            if (response.success) {
                setUsers(response.data.users);
                setSelectedUserIds([]); // Clear selection on page/filter change
                setTotalPages(response.data.pagination.totalPages);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, typeFilter, dateRange, dobFilter, dobStart, dobEnd, anniversaryFilter, anniversaryStart, anniversaryEnd, filterType]);

    // Sync Date Ranges
    useEffect(() => {
        if (dobDateRange?.from) setDobStart(format(dobDateRange.from, "yyyy-MM-dd"));
        else setDobStart("");
        if (dobDateRange?.to) setDobEnd(format(dobDateRange.to, "yyyy-MM-dd"));
        else setDobEnd("");
        setPage(1);
    }, [dobDateRange]);

    useEffect(() => {
        if (anniversaryDateRange?.from) setAnniversaryStart(format(anniversaryDateRange.from, "yyyy-MM-dd"));
        else setAnniversaryStart("");
        if (anniversaryDateRange?.to) setAnniversaryEnd(format(anniversaryDateRange.to, "yyyy-MM-dd"));
        else setAnniversaryEnd("");
        setPage(1);
    }, [anniversaryDateRange]);

    const handleExportExcel = async () => {
        // ... (existing handleExportExcel logic remains)
        try {
            let startDate, endDate;
            if (dateRange !== "all") {
                const now = new Date();
                endDate = now.toISOString();
                const start = new Date();
                if (dateRange === "week") {
                    start.setDate(now.getDate() - now.getDay());
                    start.setHours(0, 0, 0, 0);
                } else if (dateRange === "month") {
                    start.setDate(1);
                    start.setHours(0, 0, 0, 0);
                } else if (dateRange === "year") {
                    start.setMonth(0, 1);
                    start.setHours(0, 0, 0, 0);
                }
                startDate = start.toISOString();
            }

            const response = await downloadUsersExcelAdmin({
                search: debouncedSearch,
                role: typeFilter,
                startDate,
                endDate,
                dob: dobFilter === 'upcoming' ? 'upcoming' : dobFilter,
                dobStart,
                dobEnd,
                anniversary: anniversaryFilter === 'upcoming' ? 'upcoming' : anniversaryFilter,
                anniversaryStart,
                anniversaryEnd,
                filterType: filterType,
                includeUnverified: false
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed:", error);
        }
    };

    const handleExportAiSensy = async () => {
        try {
            const response = await downloadUsersAiSensyCSVAdmin({
                ids: selectedUserIds.length > 0 ? selectedUserIds.join(',') : undefined,
                search: selectedUserIds.length > 0 ? undefined : debouncedSearch,
                role: selectedUserIds.length > 0 ? undefined : typeFilter,
                dob: dobFilter,
                dobStart,
                dobEnd,
                anniversary: anniversaryFilter,
                anniversaryStart,
                anniversaryEnd,
                filterType: filterType,
                includeUnverified: false
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `aisensy_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("AiSensy CSV exported successfully!");
        } catch (error) {
            console.error("AiSensy Export failed:", error);
            toast.error("Failed to export AiSensy CSV");
        }
    };

    useEffect(() => {
        loadUsers();
    }, [loadUsers, filterType]);

    const formatAvatar = (name: string) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
    };

    const formatRoleLabel = (role: string) => {
        if (role === 'INSTITUTION') return 'Temple ';
        if (role === 'SELLER') return 'Seller';
        if (role === 'DEVOTEE') return 'Devotee';
        if (role === 'ADMIN') return 'Admin';
        return role?.replace('_', ' ') || 'Devotee';
    };

    const getRoleBadgeClass = (role: string) => {
        if (role === 'ADMIN') return 'bg-rose-50 text-rose-600 border-rose-200';
        if (role === 'INSTITUTION') return 'bg-amber-50 text-amber-600 border-amber-200';
        if (role === 'SELLER') return 'bg-blue-50 text-blue-600 border-blue-200';
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    };

    const toggleSelectAll = () => {
        if (selectedUserIds.length === users.length) {
            setSelectedUserIds([]);
        } else {
            setSelectedUserIds(users.map(u => u.id));
        }
    };

    const toggleSelectUser = (id: string) => {
        setSelectedUserIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleExportSelected = async () => {
        handleExportExcel();
    };


    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            const response = await toggleUserStatusAdmin(userId, !currentStatus);
            if (response.success) {
                toast.success(response.message);
                loadUsers();
            }
        } catch (err) {
            console.error('Failed to toggle user status', err);
            toast.error("Failed to update user status");
        }
    };

    const handleBulkToggleStatus = async (status: boolean) => {
        try {
            const response = await bulkToggleUserStatusAdmin(selectedUserIds, status);
            if (response.success) {
                toast.success(response.message);
                setSelectedUserIds([]);
                loadUsers();
            }
        } catch (err) {
            console.error('Failed to bulk toggle status', err);
            toast.error("Failed to update users status");
        }
    };

    const handleSendWhatsAppCampaign = async (campaign: 'birthday_reminder' | 'anniversary_reminder_lugrs') => {
        if (selectedUserIds.length === 0) {
            toast.error("Please select at least one user to send a message.");
            return;
        }

        const promise = sendBulkWhatsAppAdmin({
            userIds: selectedUserIds,
            campaignName: campaign,
            templateParams: ['{{name}}'] // Personalized with name
        });

        toast.promise(promise, {
            loading: `Sending ${campaign.replace('_', ' ')}s...`,
            success: (data) => `Successfully sent ${data.results.filter((r: any) => r.success).length} messages!`,
            error: "Failed to send WhatsApp messages"
        });

        try {
            await promise;
            setSelectedUserIds([]);
        } catch (err) {
            console.error("WhatsApp Campaign Error:", err);
        }
    };



    return (
        <div className="space-y-6 relative">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-foreground break-words">
                        User Management
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1 break-words">
                        Manage all users registered on DevBhakti
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="border-primary text-primary hover:bg-primary/5 h-10 px-4 rounded-xl font-bold text-sm shadow-sm"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                <span>WhatsApp</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-white rounded-xl shadow-xl border-slate-200">
                            <DropdownMenuLabel>Choose Template</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleSendWhatsAppCampaign('birthday_reminder')}>
                                <CalendarIcon className="mr-2 h-4 w-4 text-emerald-500" />
                                <span>Birthday Reminder</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleSendWhatsAppCampaign('anniversary_reminder_lugrs')}>
                                <CalendarIcon className="mr-2 h-4 w-4 text-rose-500" />
                                <span>Anniversary Reminder</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button 
                        variant="outline" 
                        className="border-amber-200 text-amber-600 hover:bg-amber-50 h-10 px-4 rounded-xl font-bold text-sm shadow-sm" 
                        onClick={handleExportAiSensy}
                    >
                        <Send className="w-4 h-4 mr-2" />
                        <span>AiSensy CSV</span>
                    </Button>

                    <Button 
                        variant="sacred" 
                        onClick={handleExportExcel} 
                        className="h-10 px-4 rounded-xl shadow-md"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        <span>Export Users</span>
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card className="bg-white border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Users</p>
                                <h3 className="text-lg sm:text-2xl font-bold text-foreground truncate">{stats.filteredCount?.toLocaleString() || "0"}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Temple Admins</p>
                                <h3 className="text-lg sm:text-2xl font-bold text-foreground truncate">{stats.totalInstitutions.toLocaleString()}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Sellers</p>
                                <h3 className="text-lg sm:text-2xl font-bold text-foreground truncate">{stats.totalSellers.toLocaleString()}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">New This Month</p>
                                <h3 className="text-lg sm:text-2xl font-bold text-foreground truncate">{stats.newThisMonth.toLocaleString()}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col gap-4 bg-white/70 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-primary/10 shadow-sacred relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="flex flex-col xl:flex-row gap-3 justify-between items-start xl:items-center relative z-20">
                    <div className="relative w-full xl:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 rounded-xl bg-slate-50 border-transparent focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-xs"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
                        {/* Registration Period Dropdown */}
                        <Select value={dateRange} onValueChange={(val: any) => setDateRange(val)}>
                            <SelectTrigger className="w-[140px] h-10 rounded-xl bg-slate-50 border-transparent focus:ring-2 focus:ring-primary/20 text-xs font-bold uppercase tracking-wider">
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-primary/5 shadow-xl">
                                <SelectItem value="all" className="text-xs font-bold uppercase tracking-wider">All Time</SelectItem>
                                <SelectItem value="week" className="text-xs font-bold uppercase tracking-wider">This Week</SelectItem>
                                <SelectItem value="month" className="text-xs font-bold uppercase tracking-wider">This Month</SelectItem>
                                <SelectItem value="year" className="text-xs font-bold uppercase tracking-wider">This Year</SelectItem>
                                <SelectItem value="pooja_last_year" className="text-xs font-bold uppercase tracking-wider text-primary">Last Year Pooja</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* User Type Dropdown */}
                        <Select value={typeFilter} onValueChange={(val: any) => setTypeFilter(val)}>
                            <SelectTrigger className="w-[140px] h-10 rounded-xl bg-slate-50 border-transparent focus:ring-2 focus:ring-primary/20 text-xs font-bold uppercase tracking-wider">
                                <SelectValue placeholder="User Type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-primary/5 shadow-xl">
                                <SelectItem value="all" className="text-xs font-bold uppercase tracking-wider text-slate-500">All Users</SelectItem>
                                <SelectItem value="devotee" className="text-xs font-bold uppercase tracking-wider text-emerald-600">Devotees</SelectItem>
                                <SelectItem value="temple_admin" className="text-xs font-bold uppercase tracking-wider text-amber-600">Temples</SelectItem>
                                <SelectItem value="seller" className="text-xs font-bold uppercase tracking-wider text-blue-600">Sellers</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Birthday Picker */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-10 px-3 min-w-[170px] justify-start text-left font-bold rounded-xl bg-slate-50 border-transparent hover:bg-slate-100 transition-all text-[10px] uppercase tracking-wider",
                                        !dobDateRange && "text-emerald-600/60"
                                    )}
                                >
                                    <Heart className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                                    {dobDateRange?.from ? (
                                        dobDateRange.to ? (
                                            <>
                                                {format(dobDateRange.from, "MMM dd")} - {format(dobDateRange.to, "MMM dd")}
                                            </>
                                        ) : (
                                            format(dobDateRange.from, "MMM dd")
                                        )
                                    ) : (
                                        "Filter by Birthday"
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-primary/5" align="start">
                                <div className="p-3 border-b flex items-center justify-between bg-emerald-50/50">
                                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Birthday Filter</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-full border transition-all ${dobFilter === 'upcoming' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105' : 'text-emerald-600 border-emerald-100 hover:bg-emerald-50 bg-white'}`}
                                        onClick={() => {
                                            if (dobFilter === 'upcoming') setDobFilter('');
                                            else { setDobFilter('upcoming'); setDobDateRange(undefined); }
                                            setPage(1);
                                        }}
                                    >
                                        {dobFilter === 'upcoming' ? 'Upcoming Active' : 'Upcoming'}
                                    </Button>
                                </div>
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dobDateRange?.from}
                                    selected={dobDateRange}
                                    onSelect={(range) => {
                                        setDobDateRange(range);
                                        if (range) setDobFilter('');
                                    }}
                                    numberOfMonths={2}
                                />
                                {dobDateRange && (
                                    <div className="p-2 border-t flex justify-end bg-emerald-50/20">
                                        <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold text-rose-500 hover:bg-rose-50 rounded-lg" onClick={() => setDobDateRange(undefined)}>Clear</Button>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>

                        {/* Anniversary Picker */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-10 px-3 min-w-[170px] justify-start text-left font-bold rounded-xl bg-slate-50 border-transparent hover:bg-slate-100 transition-all text-[10px] uppercase tracking-wider",
                                        !anniversaryDateRange && "text-rose-600/60"
                                    )}
                                >
                                    <Sparkles className="mr-2 h-3.5 w-3.5 text-rose-500" />
                                    {anniversaryDateRange?.from ? (
                                        anniversaryDateRange.to ? (
                                            <>
                                                {format(anniversaryDateRange.from, "MMM dd")} - {format(anniversaryDateRange.to, "MMM dd")}
                                            </>
                                        ) : (
                                            format(anniversaryDateRange.from, "MMM dd")
                                        )
                                    ) : (
                                        "Filter by Anniversary"
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-primary/5" align="start">
                                <div className="p-3 border-b flex items-center justify-between bg-rose-50/50">
                                    <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Anniversary Filter</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-full border transition-all ${anniversaryFilter === 'upcoming' ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-105' : 'text-rose-600 border-rose-100 hover:bg-rose-50 bg-white'}`}
                                        onClick={() => {
                                            if (anniversaryFilter === 'upcoming') setAnniversaryFilter('');
                                            else { setAnniversaryFilter('upcoming'); setAnniversaryDateRange(undefined); }
                                            setPage(1);
                                        }}
                                    >
                                        {anniversaryFilter === 'upcoming' ? 'Upcoming Active' : 'Upcoming'}
                                    </Button>
                                </div>
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={anniversaryDateRange?.from}
                                    selected={anniversaryDateRange}
                                    onSelect={(range) => {
                                        setAnniversaryDateRange(range);
                                        if (range) setAnniversaryFilter('');
                                    }}
                                    numberOfMonths={2}
                                />
                                {anniversaryDateRange && (
                                    <div className="p-2 border-t flex justify-end bg-rose-50/20">
                                        <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold text-rose-500 hover:bg-rose-50 rounded-lg" onClick={() => setAnniversaryDateRange(undefined)}>Clear</Button>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>

                        <div className="flex items-center gap-2.5 ml-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/10 hover:bg-rose-50 hover:text-rose-600 transition-all gap-2"
                                onClick={() => {
                                    setSearchQuery("");
                                    setDebouncedSearch("");
                                    setTypeFilter("all");
                                    setDobFilter("");
                                    setAnniversaryFilter("");
                                    setDobStart("");
                                    setDobEnd("");
                                    setAnniversaryStart("");
                                    setAnniversaryEnd("");
                                    setDobDateRange(undefined);
                                    setAnniversaryDateRange(undefined);
                                    setDateRange("all");
                                    setFilterType("");
                                    setPage(1);
                                }}
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <Card className="border-none shadow-sacred overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    <div className="block sm:hidden">
                        {/* Mobile Card View */}
                        <div className="space-y-3 p-4">
                            {loading ? (
                                <div className="flex flex-col items-center gap-2 py-12">
                                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                                    <p className="text-muted-foreground font-medium italic">Loading sacred records...</p>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground italic">No users found in this realm</div>
                            ) : (
                                users.map((user, index) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="border-2 border-primary/5 rounded-2xl p-4 space-y-4 bg-white/80 backdrop-blur-md shadow-sm hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <Checkbox
                                                    checked={selectedUserIds.includes(user.id)}
                                                    onCheckedChange={() => toggleSelectUser(user.id)}
                                                    className="border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex-shrink-0"
                                                />
                                                <div className="relative flex-shrink-0">
                                                    {user.profileImage ? (
                                                        <img
                                                            src={user.profileImage.startsWith('http') ? user.profileImage : `${BASE_URL}${user.profileImage}`}
                                                            alt={parseLocalizedValue(user.name)}
                                                            className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-primary/10"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                                                            {formatAvatar(parseLocalizedValue(user.name))}
                                                        </div>
                                                    )}
                                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${user.isActive ? (user.isVerified ? 'bg-emerald-500' : 'bg-red-500') : 'bg-slate-300'}`} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{parseLocalizedValue(user.name)}</p>
                                                    <p className="text-[10px] text-primary/60 font-mono font-bold mt-0.5 uppercase">ID: {user.displayId || `#${user.id.substring(user.id.length - 6)}`}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" onClick={() => window.location.href = `/admin/users/${user.id}`}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => window.location.href = `/admin/users/${user.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" /> View Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.isActive)} className={user.isActive ? "text-red-600" : "text-emerald-600"}>
                                                            <CheckSquare className="mr-2 h-4 w-4" /> {user.isActive ? 'Deactivate' : 'Activate'}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">User Type</p>
                                                    <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-widest border-2 py-0.5 ${getRoleBadgeClass(user.role)}`}>
                                                        {formatRoleLabel(user.role)}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">IMP Dates</p>
                                                    <div className="space-y-1">
                                                        {user.dob && <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px]"><CalendarIcon className="w-3 h-3" /> Bdy: {formatImpDate(user.dob)}</div>}
                                                        {user.anniversary && <div className="flex items-center gap-1.5 text-rose-600 font-bold text-[10px]"><CalendarIcon className="w-3 h-3" /> Ann: {formatImpDate(user.anniversary)}</div>}
                                                        {!user.dob && !user.anniversary && <span className="text-muted-foreground text-[10px] italic">No dates set</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">Contact</p>
                                                    <div className="space-y-1.5 min-w-0">
                                                        <div className="flex items-center gap-2 text-[11px] font-medium text-foreground"><Mail className="w-3 h-3 text-primary/60 flex-shrink-0" /><span className="truncate">{user.email || "N/A"}</span></div>
                                                        <div className="flex items-center gap-2 text-[11px] font-medium text-foreground"><Phone className="w-3 h-3 text-primary/60 flex-shrink-0" /><span className="truncate">{user.phone || "N/A"}</span></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">Joined</p>
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground italic"><CalendarIcon className="w-3 h-3 text-primary/60" /> {new Date(user.joinedDate).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                    
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto overflow-y-hidden">
                        <table className="w-full min-w-[1000px]">
                            <thead className="border-b border-primary/10 bg-primary/5">
                                <tr>
                                    <th className="p-4 w-12">
                                        <Checkbox
                                            checked={selectedUserIds.length === users.length && users.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                            className="border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                    </th>
                                    <th className="text-left p-4 text-xs sm:text-sm font-bold text-primary/80 uppercase tracking-wider whitespace-nowrap">User</th>
                                    <th className="text-left p-4 text-xs sm:text-sm font-bold text-primary/80 uppercase tracking-wider whitespace-nowrap">Type</th>
                                    <th className="text-left p-4 text-xs sm:text-sm font-bold text-primary/80 uppercase tracking-wider whitespace-nowrap">Contact</th>
                                    <th className="text-left p-4 text-xs sm:text-sm font-bold text-primary/80 uppercase tracking-wider whitespace-nowrap">IMP Dates</th>
                                    <th className="text-left p-4 text-xs sm:text-sm font-bold text-primary/80 uppercase tracking-wider whitespace-nowrap">Joined</th>
                                    <th className="text-right p-4 text-xs sm:text-sm font-bold text-primary/80 uppercase tracking-wider whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="p-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                <p className="text-muted-foreground font-medium italic">Searching sacred records...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-12 text-center">
                                            <p className="text-muted-foreground font-medium italic">No users found in this realm</p>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className="border-b border-primary/5 hover:bg-primary/5 transition-colors group"
                                        >
                                            <td className="p-4">
                                                <Checkbox
                                                    checked={selectedUserIds.includes(user.id)}
                                                    onCheckedChange={() => toggleSelectUser(user.id)}
                                                    className="border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        {user.profileImage ? (
                                                            <img
                                                                src={user.profileImage.startsWith('http') ? user.profileImage : `${BASE_URL}${user.profileImage}`}
                                                                alt={parseLocalizedValue(user.name)}
                                                                className="w-10 h-10 rounded-xl object-cover shadow-sm border border-primary/10"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                                                                {formatAvatar(parseLocalizedValue(user.name))}
                                                            </div>
                                                        )}
                                                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${user.isActive ? (user.isVerified ? 'bg-emerald-500' : 'bg-red-500') : 'bg-slate-300'}`} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-foreground group-hover:text-primary transition-colors text-sm truncate">{parseLocalizedValue(user.name)}</p>
                                                        <p className="text-[10px] text-primary/60 font-mono font-bold uppercase tracking-tighter">ID: {user.displayId || `#${user.id.substring(user.id.length - 6)}`}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="outline" className={`w-fit font-black text-[9px] uppercase tracking-widest border-2 py-0.5 ${getRoleBadgeClass(user.role)}`}>
                                                        {formatRoleLabel(user.role)}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="space-y-1">
                                                    <p className="text-[11px] font-medium text-foreground flex items-center gap-2">
                                                        <Mail className="w-3 h-3 text-primary/60 flex-shrink-0" />
                                                        <span className="truncate max-w-[150px]">{user.email || "N/A"}</span>
                                                    </p>
                                                    <p className="text-[11px] font-medium text-foreground flex items-center gap-2">
                                                        <Phone className="w-3 h-3 text-primary/60 flex-shrink-0" />
                                                        <span>{user.phone || "N/A"}</span>
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="space-y-1">
                                                    {user.dob && (
                                                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px]">
                                                            <CalendarIcon className="w-3 h-3" />
                                                            <span>Bdy: {formatImpDate(user.dob)}</span>
                                                        </div>
                                                    )}
                                                    {user.anniversary && (
                                                        <div className="flex items-center gap-1.5 text-rose-600 font-bold text-[10px]">
                                                            <CalendarIcon className="w-3 h-3" />
                                                            <span>Ann: {formatImpDate(user.anniversary)}</span>
                                                        </div>
                                                    )}
                                                    {!user.dob && !user.anniversary && (
                                                        <span className="text-muted-foreground text-[10px] italic">Not set</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <p className="text-[11px] font-bold text-foreground italic flex items-center gap-1.5">
                                                        <CalendarIcon className="w-3 h-3 text-primary/60" />
                                                        {new Date(user.joinedDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-8 h-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-all flex-shrink-0"
                                                        onClick={() => window.location.href = `/admin/users/${user.id}`}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="w-8 h-8 rounded-xl hover:bg-muted transition-all"
                                                            >
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-200">
                                                            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => window.location.href = `/admin/users/${user.id}`}
                                                                className="cursor-pointer"
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Profile
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                                className={`cursor-pointer ${user.isActive ? "text-red-600" : "text-emerald-600"}`}
                                                            >
                                                                <CheckSquare className="mr-2 h-4 w-4" />
                                                                {user.isActive ? 'Deactivate' : 'Activate'}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination UI */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 gap-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-primary/5 shadow-sm mt-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
                        Page <span className="text-primary">{page}</span> of <span className="text-primary">{totalPages}</span>
                    </p>
                    <Pagination className="justify-end w-auto mx-0">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer rounded-xl bg-white shadow-sm border-primary/10 hover:bg-primary/5"}
                                />
                            </PaginationItem>

                            {totalPages <= 7 ? (
                                Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); setPage(pageNum); }}
                                            isActive={page === pageNum}
                                            className={`cursor-pointer rounded-xl w-9 h-9 font-bold text-xs ${page === pageNum ? 'bg-primary text-white shadow-md' : 'bg-white border-primary/10 hover:bg-primary/5'}`}
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))
                            ) : (
                                <>
                                    {[1, 2].map((pageNum) => (
                                        <PaginationItem key={pageNum}>
                                            <PaginationLink
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); setPage(pageNum); }}
                                                isActive={page === pageNum}
                                                className={`cursor-pointer rounded-xl w-9 h-9 font-bold text-xs ${page === pageNum ? 'bg-primary text-white shadow-md' : 'bg-white border-primary/10 hover:bg-primary/5'}`}
                                            >
                                                {pageNum}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    {page > 3 && <PaginationItem><span className="text-muted-foreground px-2">...</span></PaginationItem>}
                                    {page > 2 && page < totalPages - 1 && (
                                        <PaginationItem>
                                            <PaginationLink
                                                href="#"
                                                isActive={true}
                                                className="cursor-pointer rounded-xl w-9 h-9 font-bold text-xs bg-primary text-white shadow-md"
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )}
                                    {page < totalPages - 2 && <PaginationItem><span className="text-muted-foreground px-2">...</span></PaginationItem>}
                                    {[totalPages - 1, totalPages].map((pageNum) => (
                                        <PaginationItem key={pageNum}>
                                            <PaginationLink
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); setPage(pageNum); }}
                                                isActive={page === pageNum}
                                                className={`cursor-pointer rounded-xl w-9 h-9 font-bold text-xs ${page === pageNum ? 'bg-primary text-white shadow-md' : 'bg-white border-primary/10 hover:bg-primary/5'}`}
                                            >
                                                {pageNum}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                </>
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}
                                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer rounded-xl bg-white shadow-sm border-primary/10 hover:bg-primary/5"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
