"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Check, X, Trash2, MoreVertical, Loader2, AlertCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
    fetchPoojaCategoriesAdmin,
    createPoojaCategoryAdmin,
    updatePoojaCategoryAdmin,
    updatePoojaCategoryStatusAdmin,
    deletePoojaCategoryAdmin
} from "@/api/adminController";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LangKey = "en" | "hi" | "mr";

const LANGUAGES: { key: LangKey; label: string; flag: string }[] = [
    { key: "en", label: "English", flag: "🇬🇧" },
    { key: "hi", label: "हिंदी", flag: "🇮🇳" },
    { key: "mr", label: "मराठी", flag: "🟠" },
];

const emptyNames = (): Record<LangKey, string> => ({ en: "", hi: "", mr: "" });

export default function AdminPoojaCategoriesPage() {
    const { toast } = useToast();
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    // Add dialog
    const [isAdding, setIsAdding] = useState(false);
    const [newNames, setNewNames] = useState<Record<LangKey, string>>(emptyNames());
    const [addSaving, setAddSaving] = useState(false);

    // Edit dialog
    const [editCat, setEditCat] = useState<any | null>(null);
    const [editNames, setEditNames] = useState<Record<LangKey, string>>(emptyNames());
    const [editSaving, setEditSaving] = useState(false);

    useEffect(() => {
        loadCategories();
    }, [filterStatus]);

    const loadCategories = async () => {
        setIsLoading(true);
        try {
            const res = await fetchPoojaCategoriesAdmin({
                status: filterStatus || undefined,
                search: searchTerm || undefined
            });
            if (res.success) setCategories(res.data);
        } catch {
            toast({ title: "Error", description: "Failed to load categories", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newNames.en.trim()) {
            toast({ title: "Required", description: "English name is required", variant: "destructive" });
            return;
        }
        setAddSaving(true);
        try {
            const res = await createPoojaCategoryAdmin({
                name_en: newNames.en.trim(),
                name_hi: newNames.hi.trim() || undefined,
                name_mr: newNames.mr.trim() || undefined,
                status: "APPROVED"
            });
            if (res.success) {
                toast({ title: "Success", description: "Category added successfully" });
                setNewNames(emptyNames());
                setIsAdding(false);
                loadCategories();
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to add category",
                variant: "destructive"
            });
        } finally {
            setAddSaving(false);
        }
    };

    const openEdit = (cat: any) => {
        setEditCat(cat);
        setEditNames({
            en: cat.name_en || "",
            hi: cat.name_hi || "",
            mr: cat.name_mr || ""
        });
    };

    const handleEditCategory = async () => {
        if (!editCat || !editNames.en.trim()) {
            toast({ title: "Required", description: "English name is required", variant: "destructive" });
            return;
        }
        setEditSaving(true);
        try {
            const res = await updatePoojaCategoryAdmin(editCat.id, {
                name_en: editNames.en.trim(),
                name_hi: editNames.hi.trim() || undefined,
                name_mr: editNames.mr.trim() || undefined,
            });
            if (res.success) {
                toast({ title: "Updated", description: "Category updated successfully" });
                setEditCat(null);
                loadCategories();
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update category",
                variant: "destructive"
            });
        } finally {
            setEditSaving(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const res = await updatePoojaCategoryStatusAdmin(id, status);
            if (res.success) {
                toast({ title: "Success", description: `Category ${status.toLowerCase()} successfully` });
                loadCategories();
            }
        } catch {
            toast({ title: "Error", description: "Operation failed", variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            const res = await deletePoojaCategoryAdmin(id);
            if (res.success) {
                toast({ title: "Deleted", description: "Category removed successfully" });
                loadCategories();
            }
        } catch {
            toast({ title: "Error", description: "Deletion failed", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pooja Purposes / Categories</h1>
                    <p className="text-muted-foreground">Manage the master list of pooja categories available to temples.</p>
                </div>

                {/* ── ADD DIALOG ── */}
                <Dialog open={isAdding} onOpenChange={(o) => { setIsAdding(o); if (!o) setNewNames(emptyNames()); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#7b4623] hover:bg-[#5d351a]">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Purpose
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Pooja Purpose</DialogTitle>
                            <DialogDescription>
                                Enter the category name in all three languages. English is required.
                            </DialogDescription>
                        </DialogHeader>
                        <Tabs defaultValue="en" className="w-full">
                            <TabsList className="w-full grid grid-cols-3 mb-4">
                                {LANGUAGES.map(l => (
                                    <TabsTrigger key={l.key} value={l.key}>
                                        {l.flag} {l.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {LANGUAGES.map(l => (
                                <TabsContent key={l.key} value={l.key}>
                                    <div className="space-y-2 py-1">
                                        <Label>
                                            Purpose Name ({l.label})
                                            {l.key === "en" && <span className="text-red-500 ml-1">*</span>}
                                        </Label>
                                        <Input
                                            placeholder={`e.g. ${l.key === "en" ? "Vehicle Puja" : l.key === "hi" ? "वाहन पूजा" : "वाहन पूजा"}`}
                                            value={newNames[l.key]}
                                            onChange={e => setNewNames(prev => ({ ...prev, [l.key]: e.target.value }))}
                                        />
                                        {l.key !== "en" && (
                                            <p className="text-xs text-muted-foreground">Optional – if left blank, English name will be used as fallback.</p>
                                        )}
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button onClick={handleAddCategory} disabled={addSaving} className="bg-[#7b4623] hover:bg-[#5d351a]">
                                {addSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Add Purpose
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* ── SEARCH & FILTER ── */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search purposes..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadCategories()}
                    />
                </div>
                <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING">Pending Approval</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {/* ── TABLE ── */}
            <div className="bg-card rounded-xl border overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="text-left px-6 py-4 font-semibold text-slate-900">English Name</th>
                            <th className="text-left px-6 py-4 font-semibold text-slate-900">हिंदी</th>
                            <th className="text-left px-6 py-4 font-semibold text-slate-900">मराठी</th>
                            <th className="text-left px-6 py-4 font-semibold text-slate-900">Status</th>
                            <th className="text-left px-6 py-4 font-semibold text-slate-900">Created</th>
                            <th className="text-right px-6 py-4 font-semibold text-slate-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Loading purposes...
                                </td>
                            </tr>
                        ) : categories.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                                    No categories found.
                                </td>
                            </tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{cat.name_en || cat.name || "—"}</td>
                                    <td className="px-6 py-4 text-slate-600">{cat.name_hi || <span className="text-slate-300 italic text-xs">not set</span>}</td>
                                    <td className="px-6 py-4 text-slate-600">{cat.name_mr || <span className="text-slate-300 italic text-xs">not set</span>}</td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={cat.status === "APPROVED" ? "default" : cat.status === "REJECTED" ? "destructive" : "outline"}
                                            className={cat.status === "PENDING" ? "bg-orange-50 text-orange-600 border-orange-200" : ""}
                                        >
                                            {cat.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(cat.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => openEdit(cat)}
                                            title="Edit names"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {cat.status !== "APPROVED" && (
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(cat.id, "APPROVED")}>
                                                        <Check className="mr-2 h-4 w-4 text-green-600" />
                                                        Approve
                                                    </DropdownMenuItem>
                                                )}
                                                {cat.status !== "REJECTED" && (
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(cat.id, "REJECTED")}>
                                                        <X className="mr-2 h-4 w-4 text-orange-600" />
                                                        Reject
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => handleDelete(cat.id)} className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── EDIT DIALOG ── */}
            <Dialog open={!!editCat} onOpenChange={(o) => { if (!o) setEditCat(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Pooja Purpose</DialogTitle>
                        <DialogDescription>
                            Update the category name in all three languages.
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="en" className="w-full">
                        <TabsList className="w-full grid grid-cols-3 mb-4">
                            {LANGUAGES.map(l => (
                                <TabsTrigger key={l.key} value={l.key}>
                                    {l.flag} {l.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {LANGUAGES.map(l => (
                            <TabsContent key={l.key} value={l.key}>
                                <div className="space-y-2 py-1">
                                    <Label>
                                        Purpose Name ({l.label})
                                        {l.key === "en" && <span className="text-red-500 ml-1">*</span>}
                                    </Label>
                                    <Input
                                        placeholder={`Enter name in ${l.label}`}
                                        value={editNames[l.key]}
                                        onChange={e => setEditNames(prev => ({ ...prev, [l.key]: e.target.value }))}
                                    />
                                    {l.key !== "en" && (
                                        <p className="text-xs text-muted-foreground">Optional – if left blank, English name will be shown as fallback.</p>
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditCat(null)}>Cancel</Button>
                        <Button onClick={handleEditCategory} disabled={editSaving} className="bg-[#7b4623] hover:bg-[#5d351a]">
                            {editSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {categories.some(c => c.status === "PENDING") && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3 text-sm text-orange-800">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>
                        You have pending category suggestions from temples. Approve them to make them available in the master list.
                    </p>
                </div>
            )}
        </div>
    );
}
