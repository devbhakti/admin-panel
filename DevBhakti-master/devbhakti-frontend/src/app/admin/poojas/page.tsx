"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    Edit2,
    Eye,
    Clock,
    IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchAllPoojasAdmin, deletePoojaAdmin, promotePoojaToMasterAdmin, updatePoojaAdmin, togglePoojaStatusAdmin } from "@/api/adminController";
import { Pause, Play, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/config/apiConfig";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { parseLocalizedValue } from "@/utils/textUtils";

function PoojasContent() {
    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");
    const qParam = searchParams.get("q");

    const router = useRouter();
    const [poojas, setPoojas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'all' | 'master' | 'temple'>('all');
    const { toast } = useToast();
    const { hasPermission } = useAdminAuth();


    useEffect(() => {
        if (qParam) setSearchTerm(qParam);
        else if (idParam) setSearchTerm(idParam);
    }, [idParam, qParam]);

    useEffect(() => {
        loadPoojas();
    }, [activeTab, searchTerm]);

    const loadPoojas = async () => {
        setIsLoading(true);
        try {
            const params: any = {
                search: searchTerm,
                poojaId: idParam || undefined,
                lang: 'raw'
            };
            if (activeTab === 'master') params.isMaster = true;
            if (activeTab === 'temple') params.isMaster = false;

            const data = await fetchAllPoojasAdmin(params);
            setPoojas(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load poojas",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePromoteToMaster = async (id: string) => {
        if (!window.confirm("Are you sure you want to promote this pooja to a Master Template?")) return;

        try {
            await promotePoojaToMasterAdmin(id);
            toast({
                title: "Success",
                description: "Pooja promoted to Master Template",
                variant: "success",
            });
            loadPoojas();
        } catch (error: any) {
            toast({
                title: "Promotion Failed",
                description: error.response?.data?.error || error.response?.data?.message || "Failed to promote pooja to master",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this pooja?")) {
            try {
                await deletePoojaAdmin(id);
                toast({ title: "Success", description: "Pooja deleted successfully", variant: "success" });
                loadPoojas();
            } catch (error: any) {
                toast({
                    title: "Action Failed",
                    description: error.response?.data?.error || error.response?.data?.message || "Failed to delete pooja",
                    variant: "destructive"
                });
            }
        }
    };

    const handleToggleStatus = async (pooja: any) => {
        try {
            await togglePoojaStatusAdmin(pooja.id);
            toast({
                title: !pooja.status ? "Pooja Resumed" : "Pooja Paused",
                description: `Pooja is now ${!pooja.status ? 'visible to' : 'hidden from'} devotees.`,
                variant: "success",
            });
            loadPoojas();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update pooja status",
                variant: "destructive"
            });
        }
    };

    const filteredPoojas = poojas.filter(pooja => {
        const s = searchTerm.toLowerCase();
        
        const matchesField = (field: any) => {
            if (!field) return false;
            if (typeof field === 'string') return field.toLowerCase().includes(s);
            if (typeof field === 'object') {
                return (field.en?.toLowerCase().includes(s) || 
                        field.hi?.toLowerCase().includes(s) || 
                        field.mr?.toLowerCase().includes(s));
            }
            return false;
        };

        return matchesField(pooja.name) || matchesField(pooja.category);
    });

    const getImageUrl = (path: string) => {
        if (!path) return "https://via.placeholder.com/150";
        if (path.startsWith('http')) return path;
        return `${API_URL.replace('/api', '')}${path}`;
    };

    const getRawLangValue = (val: any, lang: 'en'|'hi'|'mr') => {
        if (!val) return "";
        if (typeof val === 'object') return val[lang] || "";
        try {
            const p = JSON.parse(val);
            if (typeof p === 'object' && p !== null) return p[lang] || "";
        } catch { }
        return lang === 'en' ? val : "";
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight">Poojas & Sevas Management</h1>
                    <p className="text-xs md:text-[14px] text-muted-foreground mt-1">
                        Manage all poojas, rituals, and spiritual services.
                    </p>
                </div>
                {hasPermission("poojas.create") && (
                    <Button
                        onClick={() => router.push('/admin/poojas/create')}
                        className="bg-primary hover:bg-primary/90 px-4 py-2 text-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Pooja
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex flex-col sm:flex-row border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors border-b-2 ${activeTab === 'all'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <span className="hidden sm:inline">Poojas & Sevas Management</span>
                    <span className="sm:hidden">All Poojas</span>
                </button>
                <button
                    onClick={() => setActiveTab('master')}
                    className={`px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors border-b-2 ${activeTab === 'master'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <span className="hidden sm:inline">Non Temple Specific</span>
                    <span className="sm:hidden">Master</span>
                </button>
                <button
                    onClick={() => setActiveTab('temple')}
                    className={`px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors border-b-2 ${activeTab === 'temple'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <span className="hidden sm:inline">Temple Specific</span>
                    <span className="sm:hidden">Temple</span>
                </button>
            </div>

            {/* Search */}
            <div className="flex flex-col gap-3">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or category..."
                        className="pl-10 h-10 md:h-11 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Poojas Table */}
            <div className="border rounded-lg bg-card overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>English Name</TableHead>
                                <TableHead>हिंदी</TableHead>
                                <TableHead>मराठी</TableHead>
                                <TableHead>Temple</TableHead>
                                <TableHead>Category/Purpose</TableHead>
                                <TableHead> Single Person Price</TableHead>
                                <TableHead>Status</TableHead>
                                {/* <TableHead>Duration</TableHead> */}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10">Loading poojas...</TableCell>
                                </TableRow>
                            ) : filteredPoojas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10">No poojas found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredPoojas.map((pooja) => (
                                    <TableRow key={pooja.id}>
                                        <TableCell>
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border">
                                                <img
                                                    src={getImageUrl(pooja.image)}
                                                    alt={parseLocalizedValue(pooja.name)}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-slate-900 flex items-center gap-2">
                                                {getRawLangValue(pooja.name, 'en') || parseLocalizedValue(pooja.name)}
                                                {pooja.isMaster && (
                                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] scale-90">
                                                        MASTER
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-[14px] text-slate-600">
                                                {getRawLangValue(pooja.name, 'hi') || <span className="text-slate-300 italic text-xs">not set</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-[14px] text-slate-600">
                                                {getRawLangValue(pooja.name, 'mr') || <span className="text-slate-300 italic text-xs">not set</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-[14px] font-medium text-slate-600">{parseLocalizedValue(pooja.temple?.name)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-slate-50">
                                                {parseLocalizedValue(pooja.category)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center font-semibold text-primary text-[14px]">
                                                <IndianRupee className="w-3 h-3 mr-0.5" />
                                                {pooja.price}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={pooja.status ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}>
                                                {pooja.status ? "Active" : "Paused"}
                                            </Badge>
                                        </TableCell>
                                        {/* <TableCell>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Clock className="w-3.5 h-3.5 mr-1.5" />
                                                {pooja.duration}
                                            </div>
                                        </TableCell> */}
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.push(`/admin/poojas/${pooja.id}`)}
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4 text-slate-600" />
                                                </Button>
                                                {hasPermission("poojas.promote") && !pooja.isMaster && !pooja.masterPoojaId && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handlePromoteToMaster(pooja.id)}
                                                        title="Promote to Master Template"
                                                    >
                                                        <Plus className="w-4 h-4 text-green-600" />
                                                    </Button>
                                                )}
                                                {hasPermission("poojas.edit") && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.push(`/admin/poojas/edit/${pooja.id}`)}
                                                        title="Edit Pooja"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-blue-600" />
                                                    </Button>
                                                )}
                                                {hasPermission("poojas.edit") && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleToggleStatus(pooja)}
                                                        title={pooja.status ? "Pause Pooja" : "Resume Pooja"}
                                                    >
                                                        {pooja.status ? (
                                                            <Pause className="w-4 h-4 text-orange-600" />
                                                        ) : (
                                                            <Play className="w-4 h-4 text-green-600" />
                                                        )}
                                                    </Button>
                                                )}
                                                {hasPermission("poojas.delete") && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(pooja.id)}
                                                        title="Delete Pooja"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-3 space-y-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                                <p className="text-muted-foreground">Loading poojas...</p>
                            </div>
                        </div>
                    ) : filteredPoojas.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">No poojas found.</div>
                    ) : (
                        filteredPoojas.map((pooja) => (
                            <div key={pooja.id} className="bg-white border border-slate-200 rounded-lg p-3 space-y-3 hover:border-primary/30 transition-all">
                                {/* Header with Image and Name */}
                                <div className="flex items-start gap-3">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted border flex-shrink-0">
                                        <img
                                            src={getImageUrl(pooja.image)}
                                            alt={parseLocalizedValue(pooja.name)}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-slate-900 truncate text-sm">
                                                {getRawLangValue(pooja.name, 'en') || parseLocalizedValue(pooja.name)}
                                            </h3>
                                            {pooja.isMaster && (
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] scale-90">
                                                    MASTER
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-600 space-y-1">
                                            <div className="truncate">{getRawLangValue(pooja.name, 'hi') || <span className="text-slate-300 italic">not set</span>}</div>
                                            <div className="truncate">{getRawLangValue(pooja.name, 'mr') || <span className="text-slate-300 italic">not set</span>}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <p className="text-slate-400 font-medium mb-1">Temple</p>
                                        <p className="text-slate-700 truncate">{parseLocalizedValue(pooja.temple?.name) || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-medium mb-1">Category</p>
                                        <Badge variant="outline" className="bg-slate-50 text-xs px-2 py-0.5">
                                            {parseLocalizedValue(pooja.category)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-medium mb-1">Price</p>
                                        <div className="flex items-center font-semibold text-primary">
                                            <IndianRupee className="w-3 h-3 mr-0.5" />
                                            {pooja.price}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-medium mb-1">Status</p>
                                        <Badge variant="outline" className={`text-xs px-2 py-0.5 ${pooja.status ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                                            {pooja.status ? "Active" : "Paused"}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push(`/admin/poojas/${pooja.id}`)}
                                            className="h-8 px-2 text-xs"
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            View
                                        </Button>
                                        {hasPermission("poojas.edit") && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`/admin/poojas/edit/${pooja.id}`)}
                                                className="h-8 px-2 text-xs"
                                            >
                                                <Edit2 className="w-3 h-3 mr-1" />
                                                Edit
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {hasPermission("poojas.promote") && !pooja.isMaster && !pooja.masterPoojaId && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handlePromoteToMaster(pooja.id)}
                                                className="h-8 px-2 text-xs text-green-600"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        )}
                                        {hasPermission("poojas.edit") && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleStatus(pooja)}
                                                className={`h-8 px-2 text-xs ${pooja.status ? "text-orange-600" : "text-green-600"}`}
                                            >
                                                {pooja.status ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                            </Button>
                                        )}
                                        {hasPermission("poojas.delete") && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(pooja.id)}
                                                className="h-8 px-2 text-xs text-destructive"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminPoojasListPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading Poojas...</div>}>
            <PoojasContent />
        </Suspense>
    );
}
