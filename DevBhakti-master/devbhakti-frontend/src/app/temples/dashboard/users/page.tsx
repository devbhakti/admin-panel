"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    ShoppingCart,
    Loader2,
    Download,
    X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Popover, 
    PopoverContent, 
    PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { fetchMyTempleDevotees } from "@/api/templeAdminController";
import { useToast } from "@/hooks/use-toast";
import { API_URL, BASE_URL } from "@/config/apiConfig";
import { useDebounce } from "@/hooks/use-debounce";
import { useLanguage } from "@/context/LanguageContext";
import { parseLocalizedValue } from "@/utils/textUtils";
import axios from "axios";

interface Devotee {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    profileImage: string | null;
    lastInteraction: string;
    totalInteractions: number;
    totalSpent: number;
    type: 'POOJA' | 'PRODUCT';
}

interface Stats {
    totalDevotees: number;
    poojaBookersCount: number;
    productCustomersCount: number;
    allDevoteesCount: number;
}

export default function TempleUsersPage() {
    const router = useRouter();
    const { language } = useLanguage();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [poojaBookers, setPoojaBookers] = useState<Devotee[]>([]);
    const [productCustomers, setProductCustomers] = useState<Devotee[]>([]);
    const [allDevotees, setAllDevotees] = useState<Devotee[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalDevotees: 0,
        poojaBookersCount: 0,
        productCustomersCount: 0,
        allDevoteesCount: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [poojaTotalPages, setPoojaTotalPages] = useState(1);
    const [productTotalPages, setProductTotalPages] = useState(1);
    const [allTotalPages, setAllTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState("all");
    const [dobRange, setDobRange] = useState<DateRange | undefined>();
    const [anniversaryRange, setAnniversaryRange] = useState<DateRange | undefined>();
    const [isDobOpen, setIsDobOpen] = useState(false);
    const [isAnniversaryOpen, setIsAnniversaryOpen] = useState(false);
    const debouncedDobRange = useDebounce(dobRange, 800);
    const debouncedAnniversaryRange = useDebounce(anniversaryRange, 800);

    useEffect(() => {
        loadDevotees(currentPage);
    }, [debouncedSearch, currentPage, debouncedDobRange, debouncedAnniversaryRange]);

    const loadDevotees = async (page: number) => {
        setIsLoading(true);
        try {
            const response = await fetchMyTempleDevotees({
                page,
                limit: 10,
                search: debouncedSearch,
                dobStart: debouncedDobRange?.from ? format(debouncedDobRange.from, "yyyy-MM-dd") : undefined,
                dobEnd: debouncedDobRange?.to ? format(debouncedDobRange.to, "yyyy-MM-dd") : debouncedDobRange?.from ? format(debouncedDobRange.from, "yyyy-MM-dd") : undefined,
                anniversaryStart: debouncedAnniversaryRange?.from ? format(debouncedAnniversaryRange.from, "yyyy-MM-dd") : undefined,
                anniversaryEnd: debouncedAnniversaryRange?.to ? format(debouncedAnniversaryRange.to, "yyyy-MM-dd") : debouncedAnniversaryRange?.from ? format(debouncedAnniversaryRange.from, "yyyy-MM-dd") : undefined,
            });
            if (response.success) {
                setPoojaBookers(response.data.poojaBookers);
                setProductCustomers(response.data.productCustomers);
                setAllDevotees(response.data.allDevotees || []);
                setStats(response.data.stats);
                if (response.data.pagination) {
                    setPoojaTotalPages(response.data.pagination.poojaTotalPages || 1);
                    setProductTotalPages(response.data.pagination.productTotalPages || 1);
                    setAllTotalPages(response.data.pagination.allTotalPages || 1);
                }
            }
        } catch (error: any) {
            console.error("Load Devotees Error:", error);
            toast({
                title: "Error",
                description: "Failed to load devotees. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportDevotees = async () => {
        try {
            toast({ title: "Exporting...", description: "Please wait while we prepare the Excel file." });
            const token = localStorage.getItem("token");
            
            const params = new URLSearchParams({
                type: activeTab,
                search: debouncedSearch,
                dobStart: dobRange?.from ? format(dobRange.from, "yyyy-MM-dd") : "",
                dobEnd: dobRange?.to ? format(dobRange.to, "yyyy-MM-dd") : (dobRange?.from ? format(dobRange.from, "yyyy-MM-dd") : ""),
                anniversaryStart: anniversaryRange?.from ? format(anniversaryRange.from, "yyyy-MM-dd") : "",
                anniversaryEnd: anniversaryRange?.to ? format(anniversaryRange.to, "yyyy-MM-dd") : (anniversaryRange?.from ? format(anniversaryRange.from, "yyyy-MM-dd") : ""),
            });

            const response = await axios.get(`${API_URL}/temple-admin/devotees/export/excel?${params.toString()}`, {
                responseType: 'blob',
                validateStatus: () => true,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `temple_devotees_${new Date().toISOString().slice(0, 10)}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
                toast({ title: "Success", description: "Devotees exported successfully!" });
            } else {
                throw new Error("Download failed");
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to download Excel.", variant: "destructive" });
        }
    };

    const DevoteeTable = ({ data, type }: { data: Devotee[], type: 'POOJA' | 'PRODUCT' | 'ALL' }) => {
        const filtered = data;

        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-border bg-muted/30">
                        <tr>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Devotee</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contact</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                {type === 'POOJA' ? 'Rituals' : type === 'PRODUCT' ? 'Purchases' : 'Interactions'}
                            </th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total Value</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Recent Activity</th>
                            <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? (
                            filtered.map((user, index) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="border-b border-border hover:bg-muted/30 transition-colors"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm overflow-hidden">
                                                {user.profileImage ? (
                                                    <img src={user.profileImage.startsWith('http') ? user.profileImage : `${BASE_URL}${user.profileImage}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    (user.name || "U").substring(0, 2).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{parseLocalizedValue(user.name, language) || "Anonymous User"}</p>
                                                <p className="text-xs text-muted-foreground">UID: {user.id.substring(user.id.length - 6)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            {user.email && (
                                                <p className="text-sm text-foreground flex items-center gap-1">
                                                    <Mail className="w-3 h-3 text-muted-foreground" />
                                                    {user.email}
                                                </p>
                                            )}
                                            {user.phone && (
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {user.phone}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm font-medium">
                                            {user.totalInteractions} {type === 'POOJA' ? 'Bookings' : type === 'PRODUCT' ? 'Orders' : (user as any).type === 'BOTH' ? 'Total' : (user as any).type === 'POOJA' ? 'Bookings' : 'Orders'}
                                        </p>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm font-semibold text-primary">₹{user.totalSpent.toLocaleString()}</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                            <CalendarIcon className="w-3 h-3" />
                                            {new Date(user.lastInteraction).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.push(`/temples/dashboard/users/${user.id}`)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                    No {type === 'POOJA' ? 'pooja bookers' : type === 'PRODUCT' ? 'product customers' : 'devotees'} found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading temple devotees...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                        Devotees /Users
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and connect with devotees who have interacted with your temple.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-2xl font-bold">{stats.totalDevotees}</p>
                        <p className="text-sm text-muted-foreground">Total Unique Devotees</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-2xl font-bold text-primary">{stats.poojaBookersCount}</p>
                        <p className="text-sm text-muted-foreground">Pooja Bookers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-2xl font-bold text-orange-600">{stats.productCustomersCount}</p>
                        <p className="text-sm text-muted-foreground">Product Customers</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="relative flex-1 w-full">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 ml-1">Search Devotees</p>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Name, email or phone..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10 h-11"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1 w-full md:w-[280px]">
                    <div className="flex items-center justify-between ml-1">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Birthday</p>
                        <button 
                            onClick={() => {
                                setDobRange({ from: new Date(), to: new Date() });
                                setCurrentPage(1);
                            }}
                            className="text-[10px] font-bold text-primary hover:underline"
                        >
                            Today
                        </button>
                    </div>
                    <div className="relative">
                        <Popover open={isDobOpen} onOpenChange={setIsDobOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-11 px-3 truncate",
                                        !dobRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                    {dobRange?.from ? (
                                        dobRange.to ? (
                                            <>
                                                {format(dobRange.from, "LLL dd")} -{" "}
                                                {format(dobRange.to, "LLL dd")}
                                            </>
                                        ) : (
                                            format(dobRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Select range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dobRange?.from}
                                    selected={dobRange}
                                    onSelect={(range) => {
                                        setDobRange(range);
                                        if (range?.from && range?.to) setCurrentPage(1);
                                    }}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                        {dobRange && (
                            <button 
                                onClick={() => { setDobRange(undefined); setCurrentPage(1); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-1 w-full md:w-[280px]">
                    <div className="flex items-center justify-between ml-1">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Anniversary</p>
                        <button 
                            onClick={() => {
                                setAnniversaryRange({ from: new Date(), to: new Date() });
                                setCurrentPage(1);
                            }}
                            className="text-[10px] font-bold text-primary hover:underline"
                        >
                            Today
                        </button>
                    </div>
                    <div className="relative">
                        <Popover open={isAnniversaryOpen} onOpenChange={setIsAnniversaryOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-11 px-3 truncate",
                                        !anniversaryRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                    {anniversaryRange?.from ? (
                                        anniversaryRange.to ? (
                                            <>
                                                {format(anniversaryRange.from, "LLL dd")} -{" "}
                                                {format(anniversaryRange.to, "LLL dd")}
                                            </>
                                        ) : (
                                            format(anniversaryRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Select range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={anniversaryRange?.from}
                                    selected={anniversaryRange}
                                    onSelect={(range) => {
                                        setAnniversaryRange(range);
                                        if (range?.from && range?.to) setCurrentPage(1);
                                    }}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                        {anniversaryRange && (
                            <button 
                                onClick={() => { setAnniversaryRange(undefined); setCurrentPage(1); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                <Button
                    onClick={handleExportDevotees}
                    variant="sacred"
                >
                    <Download className="w-4 h-4" />
                    Export Excel
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setCurrentPage(1); }} className="w-full">
                        <div className="px-4 pt-4 border-b">
                            <TabsList className="bg-muted/50">
                                <TabsTrigger value="all" className="gap-2">
                                    <Users className="w-4 h-4" />
                                    All Devotees
                                </TabsTrigger>
                                <TabsTrigger value="pooja" className="gap-2">
                                    <CalendarIcon className="w-4 h-4" />
                                    Pooja Bookers
                                </TabsTrigger>
                                <TabsTrigger value="product" className="gap-2">
                                    <ShoppingCart className="w-4 h-4" />
                                    Product Customers
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value="all" className="mt-0">
                            <DevoteeTable data={allDevotees} type="ALL" />
                        </TabsContent>
                        <TabsContent value="pooja" className="mt-0">
                            <DevoteeTable data={poojaBookers} type="POOJA" />
                        </TabsContent>
                        <TabsContent value="product" className="mt-0">
                            <DevoteeTable data={productCustomers} type="PRODUCT" />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {(activeTab === 'pooja' ? poojaTotalPages : activeTab === 'product' ? productTotalPages : allTotalPages) > 1 && (
                <div className="flex justify-center gap-2 mt-4 pb-12">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</Button>
                    <span className="flex items-center text-sm font-bold px-4">
                        Page {currentPage} of {activeTab === 'pooja' ? poojaTotalPages : activeTab === 'product' ? productTotalPages : allTotalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const total = activeTab === 'pooja' ? poojaTotalPages : activeTab === 'product' ? productTotalPages : allTotalPages;
                            setCurrentPage(p => Math.min(total, p + 1));
                        }}
                        disabled={currentPage === (activeTab === 'pooja' ? poojaTotalPages : activeTab === 'product' ? productTotalPages : allTotalPages)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
