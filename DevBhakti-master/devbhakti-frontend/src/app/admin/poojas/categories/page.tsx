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
import { useLanguage, Language } from "@/context/LanguageContext";

type LangKey = "en" | "hi" | "mr";

const LANGUAGES: { key: LangKey; label: string; flag: string; shortLabel: string }[] = [
    { key: "en", label: "English", flag: "🇬🇧", shortLabel: "EN" },
    { key: "hi", label: "हिंदी", flag: "🇮🇳", shortLabel: "HI" },
    { key: "mr", label: "मराठी", flag: "🟠", shortLabel: "MR" },
];

const emptyNames = (): Record<LangKey, string> => ({ en: "", hi: "", mr: "" });

// ── TABS INPUT (shared between Add & Edit dialogs) ──
const LangTabsInput = ({
    values,
    onChange,
    savingLabel,
    onSave,
    onCancel,
    saving,
}: {
    values: Record<LangKey, string>;
    onChange: (v: Record<LangKey, string>) => void;
    savingLabel: string;
    onSave: () => void;
    onCancel: () => void;
    saving: boolean;
}) => {
    const { language, setLanguage } = useLanguage();
    return (
        <>
            <Tabs value={language} onValueChange={(v) => setLanguage(v as Language)} className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-3 h-9">
                    {LANGUAGES.map(l => (
                        <TabsTrigger key={l.key} value={l.key} className="text-xs sm:text-sm gap-0.5 sm:gap-1">
                            <span>{l.flag}</span>
                            <span className="hidden xs:inline">{l.label}</span>
                            <span className="xs:hidden">{l.shortLabel}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
                {LANGUAGES.map(l => (
                    <TabsContent key={l.key} value={l.key} className="mt-0">
                        <div className="space-y-1.5 py-1">
                            <Label className="text-xs sm:text-sm">
                                {l.label}
                                {l.key === "en" && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Input
                                placeholder={
                                    l.key === "en"
                                        ? "e.g. Vehicle Puja"
                                        : l.key === "hi"
                                        ? "e.g. वाहन पूजा"
                                        : "e.g. वाहन पूजा"
                                }
                                className="text-sm h-9 sm:h-10"
                                value={values[l.key]}
                                onChange={e => onChange({ ...values, [l.key]: e.target.value })}
                            />
                            {l.key !== "en" && (
                                <p className="text-[11px] text-muted-foreground leading-tight">
                                    Optional – English name used as fallback if blank.
                                </p>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0 pt-2">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    className="w-full sm:w-auto h-9 sm:h-10 text-sm"
                >
                    Cancel
                </Button>
                <Button
                    onClick={onSave}
                    disabled={saving}
                    className="w-full sm:w-auto bg-[#7b4623] hover:bg-[#5d351a] h-9 sm:h-10 text-sm"
                >
                    {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                    {savingLabel}
                </Button>
            </DialogFooter>
        </>
    );
};

export default function AdminPoojaCategoriesPage() {
    const { language, setLanguage } = useLanguage();
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

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
    const [deleteSaving, setDeleteSaving] = useState(false);

    useEffect(() => {
        loadCategories();
    }, [filterStatus]);

    const getL = (field: any, lang: string, fallback: string = "") => {
        if (!field) return fallback;
        if (typeof field === "object") return field[lang] || "";
        if (typeof field === "string") {
            try {
                const parsed = JSON.parse(field);
                if (typeof parsed === "object" && parsed !== null) {
                    return parsed[lang] || "";
                }
            } catch (e) { /* ignore */ }
        }
        if (lang === "en") return field;
        return "";
    };

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
                toast({ title: "Success", description: "Category added successfully", variant: "success" });
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
            en: getL(cat.name_en || cat.name, "en"),
            hi: getL(cat.name_hi || cat.name, "hi"),
            mr: getL(cat.name_mr || cat.name, "mr")
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
                toast({ title: "Updated", description: "Category updated successfully", variant: "success" });
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
                toast({ title: "Success", description: `Category ${status.toLowerCase()} successfully`, variant: "success" });
                loadCategories();
            }
        } catch {
            toast({ title: "Error", description: "Operation failed", variant: "destructive" });
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteSaving(true);
        try {
            const res = await deletePoojaCategoryAdmin(deleteTarget.id);
            if (res.success) {
                toast({ title: "Deleted", description: "Category removed successfully", variant: "success" });
                loadCategories();
            }
        } catch {
            toast({ title: "Error", description: "Deletion failed", variant: "destructive" });
        } finally {
            setDeleteSaving(false);
            setDeleteTarget(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            APPROVED: "bg-green-50 text-green-700 border-green-200",
            PENDING: "bg-amber-50 text-amber-700 border-amber-200",
            REJECTED: "bg-red-50 text-red-700 border-red-200",
        };
        return (
            <Badge variant="outline" className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2.5 py-0 sm:py-0.5 whitespace-nowrap ${styles[status] || ""}`}>
                {status}
            </Badge>
        );
    };

    // ── MOBILE CARD VIEW ──
    const MobileCard = ({ cat }: { cat: any }) => (
        <div className="bg-card border rounded-xl p-3 sm:p-4 space-y-3">
            {/* Top row: Name + Status */}
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm leading-snug truncate">
                        {getL(cat.name_en || cat.name, "en") || "—"}
                    </p>
                    {(getL(cat.name_hi || cat.name, "hi") || getL(cat.name_mr || cat.name, "mr")) && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {getL(cat.name_hi || cat.name, "hi")}
                            {getL(cat.name_hi || cat.name, "hi") && getL(cat.name_mr || cat.name, "mr") && " · "}
                            {getL(cat.name_mr || cat.name, "mr")}
                        </p>
                    )}
                </div>
                {getStatusBadge(cat.status)}
            </div>

            {/* Date */}
            <p className="text-[11px] text-muted-foreground">
                Created {new Date(cat.createdAt).toLocaleDateString()}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-1 pt-1 border-t">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs gap-1.5 flex-1"
                    onClick={() => openEdit(cat)}
                >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                </Button>
                {cat.status !== "APPROVED" && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-xs gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 flex-1"
                        onClick={() => handleUpdateStatus(cat.id, "APPROVED")}
                    >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                    </Button>
                )}
                {cat.status !== "REJECTED" && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-xs gap-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 flex-1"
                        onClick={() => handleUpdateStatus(cat.id, "REJECTED")}
                    >
                        <X className="h-3.5 w-3.5" />
                        Reject
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 flex-1"
                    onClick={() => setDeleteTarget(cat)}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                </Button>
            </div>
        </div>
    );



    return (
        <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
            {/* ── HEADER ── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl font-bold tracking-tight break-words">
                        Pooja Purposes
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        Manage master list of pooja categories.
                    </p>
                </div>

                {/* Add Button */}
                <Dialog open={isAdding} onOpenChange={(o) => { setIsAdding(o); if (!o) setNewNames(emptyNames()); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#7b4623] hover:bg-[#5d351a] w-full sm:w-auto h-9 sm:h-10 text-sm">
                            <Plus className="w-4 h-4 mr-1.5" />
                            Add Purpose
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] p-4 sm:p-6 gap-4">
                        <DialogHeader className="space-y-1.5">
                            <DialogTitle className="text-base sm:text-lg">Add New Pooja Purpose</DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm">
                                Enter the category name. English is required.
                            </DialogDescription>
                        </DialogHeader>
                        <LangTabsInput
                            values={newNames}
                            onChange={setNewNames}
                            savingLabel="Add Purpose"
                            onSave={handleAddCategory}
                            onCancel={() => setIsAdding(false)}
                            saving={addSaving}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* ── PENDING ALERT ── */}
            {categories.some(c => c.status === "PENDING") && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2.5 text-xs sm:text-sm text-amber-800">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
                    <p>
                        You have pending category suggestions from temples. Approve them to make them available in the master list.
                    </p>
                </div>
            )}

            {/* ── SEARCH & FILTER ── */}
            <div className="flex flex-col xs:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search purposes..."
                        className="pl-8 h-9 sm:h-10 text-sm w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && loadCategories()}
                    />
                </div>
                <select
                    className="h-9 sm:h-10 rounded-md border border-input bg-background px-2.5 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-25 sm:w-40 xs:min-w-[140px]"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {/* ── COUNT ── */}
            {!isLoading && categories.length > 0 && (
                <p className="text-xs text-muted-foreground">
                    Showing {categories.length} {categories.length === 1 ? "purpose" : "purposes"}
                    {searchTerm && ` for "${searchTerm}"`}
                    {filterStatus && ` with status "${filterStatus}"`}
                </p>
            )}

            {/* ── LOADING STATE ── */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-muted-foreground gap-3">
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" />
                    <p className="text-sm">Loading purposes...</p>
                </div>
            )}

            {/* ── EMPTY STATE ── */}
            {!isLoading && categories.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-muted-foreground gap-3 px-4 text-center">
                    <Search className="w-8 h-8 sm:w-10 sm:h-10 opacity-30" />
                    <p className="text-sm font-medium">No categories found</p>
                    <p className="text-xs max-w-xs">
                        {searchTerm || filterStatus
                            ? "Try adjusting your search or filter criteria."
                            : "Get started by adding your first pooja purpose."}
                    </p>
                </div>
            )}

            {/* ── MOBILE CARDS (visible < md) ── */}
            {!isLoading && categories.length > 0 && (
                <div className="md:hidden space-y-2.5">
                    {categories.map((cat) => (
                        <MobileCard key={cat.id} cat={cat} />
                    ))}
                </div>
            )}

            {/* ── DESKTOP TABLE (visible >= md) ── */}
            {!isLoading && categories.length > 0 && (
                <div className="hidden md:block bg-card rounded-xl border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="text-left px-4 lg:px-6 py-3.5 font-semibold text-slate-900 whitespace-nowrap">English Name</th>
                                    <th className="text-left px-4 lg:px-6 py-3.5 font-semibold text-slate-900 whitespace-nowrap">हिंदी</th>
                                    <th className="text-left px-4 lg:px-6 py-3.5 font-semibold text-slate-900 whitespace-nowrap">मराठी</th>
                                    <th className="text-left px-4 lg:px-6 py-3.5 font-semibold text-slate-900 whitespace-nowrap">Status</th>
                                    <th className="text-left px-4 lg:px-6 py-3.5 font-semibold text-slate-900 whitespace-nowrap">Created</th>
                                    <th className="text-right px-4 lg:px-6 py-3.5 font-semibold text-slate-900 whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-4 lg:px-6 py-3.5 font-medium max-w-[200px] lg:max-w-none truncate">
                                            {getL(cat.name_en || cat.name, "en") || "—"}
                                        </td>
                                        <td className="px-4 lg:px-6 py-3.5 text-slate-600 max-w-[160px] lg:max-w-none truncate">
                                            {getL(cat.name_hi || cat.name, "hi") || (
                                                <span className="text-slate-300 italic text-xs">not set</span>
                                            )}
                                        </td>
                                        <td className="px-4 lg:px-6 py-3.5 text-slate-600 max-w-[160px] lg:max-w-none truncate">
                                            {getL(cat.name_mr || cat.name, "mr") || (
                                                <span className="text-slate-300 italic text-xs">not set</span>
                                            )}
                                        </td>
                                        <td className="px-4 lg:px-6 py-3.5">
                                            {getStatusBadge(cat.status)}
                                        </td>
                                        <td className="px-4 lg:px-6 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                                            {new Date(cat.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 lg:px-6 py-3.5 text-right whitespace-nowrap">
                                            <div className="inline-flex items-center gap-0.5">
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
                                                        <DropdownMenuItem
                                                            onClick={() => setDeleteTarget(cat)}
                                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── EDIT DIALOG ── */}
            <Dialog open={!!editCat} onOpenChange={(o) => { if (!o) setEditCat(null); }}>
                <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] p-4 sm:p-6 gap-4">
                    <DialogHeader className="space-y-1.5">
                        <DialogTitle className="text-base sm:text-lg">Edit Pooja Purpose</DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            Update the category name in all three languages.
                        </DialogDescription>
                    </DialogHeader>
                    <LangTabsInput
                        values={editNames}
                        onChange={setEditNames}
                        savingLabel="Save Changes"
                        onSave={handleEditCategory}
                        onCancel={() => setEditCat(null)}
                        saving={editSaving}
                    />
                </DialogContent>
            </Dialog>

            {/* ── DELETE CONFIRMATION DIALOG ── */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
                <DialogContent className="sm:max-w-sm max-w-[calc(100vw-2rem)] p-4 sm:p-6 gap-4">
                    <DialogHeader className="space-y-1.5">
                        <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            Delete Purpose
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-foreground">
                                &quot;{deleteTarget ? getL(deleteTarget.name_en || deleteTarget.name, "en") : ""}&quot;
                            </span>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0 pt-1">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                            className="w-full sm:w-auto h-9 sm:h-10 text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteSaving}
                            className="w-full sm:w-auto h-9 sm:h-10 text-sm"
                        >
                            {deleteSaving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}