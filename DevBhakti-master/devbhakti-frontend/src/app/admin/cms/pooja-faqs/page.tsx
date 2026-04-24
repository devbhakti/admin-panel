"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    HelpCircle,
    Eye,
    Download,
    Upload,
    Loader2,
    CheckCircle
} from "lucide-react";
import * as XLSX from 'xlsx';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { fetchAllPoojaFAQsAdmin, createPoojaFAQAdmin, updatePoojaFAQAdmin, deletePoojaFAQAdmin } from "@/api/adminController";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalized, Language } from "@/utils/localization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function PoojaFAQsPage() {
    const [faqs, setFaqs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        question_en: "",
        question_hi: "",
        question_mr: "",
        answer_en: "",
        answer_hi: "",
        answer_mr: "",
        active: "true",
        order: 1,
    });
    const { t, language } = useLanguage();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("en");

    useEffect(() => {
        loadFaqs();
    }, []);

    const loadFaqs = async () => {
        try {
            setLoading(true);
            const data = await fetchAllPoojaFAQsAdmin({ lang: 'raw' });
            setFaqs(data || []);
        } catch (error) {
            console.error("Error loading FAQs:", error);
            toast({
                title: "Error",
                description: "Failed to load FAQs",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (faq: any = null) => {
        if (faq) {
            setEditingFaq(faq);
            setFormData({
                question_en: faq.question?.en || "",
                question_hi: faq.question?.hi || "",
                question_mr: faq.question?.mr || "",
                answer_en: faq.answer?.en || "",
                answer_hi: faq.answer?.hi || "",
                answer_mr: faq.answer?.mr || "",
                active: faq.isActive ? "true" : "false",
                order: faq.order || 1,
            });
        } else {
            setEditingFaq(null);
            setFormData({
                question_en: "",
                question_hi: "",
                question_mr: "",
                answer_en: "",
                answer_hi: "",
                answer_mr: "",
                active: "true",
                order: faqs.length + 1,
            });
            setActiveTab("en");
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                isActive: formData.active === "true"
            };

            if (editingFaq) {
                await updatePoojaFAQAdmin(editingFaq.id, data);
                toast({
                    title: "Success",
                    description: "FAQ updated successfully",
                    variant: "success"
                });
            } else {
                await createPoojaFAQAdmin(data);
                toast({
                    title: "Success",
                    description: "FAQ created successfully",
                    variant: "success"
                });
            }

            setIsDialogOpen(false);
            loadFaqs();
        } catch (error) {
            console.error("Error saving FAQ:", error);
            toast({
                title: "Error",
                description: "Failed to save FAQ",
                variant: "destructive"
            });
        }
    };

    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [viewingFaq, setViewingFaq] = useState<any>(null);

    const handleViewFaq = (faq: any) => {
        setViewingFaq(faq);
        setIsViewDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this FAQ?")) {
            try {
                await deletePoojaFAQAdmin(id);
                loadFaqs();
                toast({
                    title: "Success",
                    description: "FAQ deleted successfully",
                    variant: "success"
                });
            } catch (error) {
                console.error("Error deleting FAQ:", error);
                toast({
                    title: "Error",
                    description: "Failed to delete FAQ",
                    variant: "destructive"
                });
            }
        }
    };

    // --- BULK MANAGEMENT ---
    const downloadTemplate = () => {
        const template = [
            {
                "Question_EN": "How do I book a pooja?",
                "Question_HI": "मैं पूजा कैसे बुक कर सकता हूँ?",
                "Question_MR": "मी पूजा कशी बुक करू शकतो?",
                "Answer_EN": "You can book via the temple page.",
                "Answer_HI": "आप मंदिर के पेज के माध्यम से बुक कर सकते हैं।",
                "Answer_MR": "तुम्ही मंदिर पेजद्वारे बुक करू शकता.",
                "Is_Active": "TRUE",
                "Order": 1
            }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "FAQ Template");
        XLSX.writeFile(wb, "Pooja_FAQs_Import_Template.xlsx");
    };

    const handleExportExcel = () => {
        const exportData = faqs.map(f => ({
            "ID": f.id,
            "Question_EN": f.question?.en || "",
            "Question_HI": f.question?.hi || "",
            "Question_MR": f.question?.mr || "",
            "Answer_EN": f.answer?.en || "",
            "Answer_HI": f.answer?.hi || "",
            "Answer_MR": f.answer?.mr || "",
            "Is_Active": f.isActive ? "TRUE" : "FALSE",
            "Order": f.order || 0,
            "Created_At": f.createdAt
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Pooja FAQs");
        XLSX.writeFile(wb, `Pooja_FAQs_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws) as any[];

                if (data.length === 0) {
                    toast({ title: "Error", description: "Excel file is empty", variant: "destructive" });
                    return;
                }

                toast({ title: "Import Started", description: `Importing ${data.length} FAQs...`, variant: "success" });

                let successCount = 0;
                let failCount = 0;
                const errors: string[] = [];

                for (let i = 0; i < data.length; i++) {
                    const row = data[i];
                    const rowNum = i + 2;
                    try {
                        if (!row.Question_EN) throw new Error("English question is required");
                        if (!row.Answer_EN) throw new Error("English answer is required");

                        const payload = {
                            question_en: String(row.Question_EN || "").trim(),
                            question_hi: String(row.Question_HI || "").trim(),
                            question_mr: String(row.Question_MR || "").trim(),
                            answer_en: String(row.Answer_EN || "").trim(),
                            answer_hi: String(row.Answer_HI || "").trim(),
                            answer_mr: String(row.Answer_MR || "").trim(),
                            isActive: String(row.Is_Active || "TRUE").toUpperCase() === "TRUE",
                            order: parseInt(row.Order) || 1
                        };

                        await createPoojaFAQAdmin(payload);
                        successCount++;
                    } catch (err: any) {
                        const errorMsg = err.response?.data?.message || err.message || "Unknown error";
                        failCount++;
                        errors.push(`Row ${rowNum}: ${errorMsg}`);
                        console.error(`Import Error Row ${rowNum}:`, errorMsg);
                    }
                }

                if (failCount > 0) {
                    toast({
                        title: "Import Partially Failed",
                        description: `Success: ${successCount}, Failed: ${failCount}. Check console or fix these: ${errors.slice(0, 3).join(", ")}${errors.length > 3 ? "..." : ""}`,
                        variant: "destructive"
                    });
                } else {
                    toast({
                        title: "Import Successful",
                        description: `Successfully imported ${successCount} FAQs.`
                    });
                }
                loadFaqs();
            } catch (error) {
                toast({ title: "Import Failed", description: "Failed to process Excel file", variant: "destructive" });
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    const filteredFaqs = faqs.filter(faq => {
        const s = searchTerm.toLowerCase();
        const question = faq.question;
        const answer = faq.answer;
        
        return (
            (question?.en?.toLowerCase() || "").includes(s) ||
            (question?.hi?.toLowerCase() || "").includes(s) ||
            (question?.mr?.toLowerCase() || "").includes(s) ||
            (answer?.en?.toLowerCase() || "").includes(s) ||
            (answer?.hi?.toLowerCase() || "").includes(s) ||
            (answer?.mr?.toLowerCase() || "").includes(s)
        );
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pooja FAQs Management</h1>
                    <p className="text-muted-foreground">
                        Manage global FAQs that appear on every Pooja detail page.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* <Button variant="outline" onClick={downloadTemplate} className="text-xs h-9">
                        <Download className="w-4 h-4 mr-1.5" />
                        Template
                    </Button>

                    <div className="relative">
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleImportExcel}
                        />
                        <Button variant="outline" className="text-xs h-9">
                            <Upload className="w-4 h-4 mr-1.5" />
                            Import
                        </Button>
                    </div>

                    <Button variant="outline" onClick={handleExportExcel} className="text-xs h-9">
                        <Download className="w-4 h-4 mr-1.5" />
                        Export All
                    </Button> */}

                    <Button onClick={() => handleOpenDialog()} className="bg-[#7b4623] hover:bg-[#5d351a] h-9">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New FAQ
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search FAQs..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* FAQs Table */}
            <div className="border rounded-lg bg-card">
                {loading ? (
                    <div className="p-8 text-center">Loading FAQs...</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px]">#</TableHead>
                                <TableHead>Question</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredFaqs.map((faq, index) => (
                                <TableRow key={faq.id}>
                                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{getLocalized(faq, 'question', language as Language)}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[400px]">
                                            {getLocalized(faq, 'answer', language as Language)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={faq.isActive ? "default" : "secondary"}>
                                            {faq.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{faq.order}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleViewFaq(faq)}
                                                title="View FAQ Details"
                                            >
                                                <Eye className="w-4 h-4 text-green-600" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDialog(faq)}
                                            >
                                                <Edit2 className="w-4 h-4 text-blue-600" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(faq.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredFaqs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No FAQs found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* View FAQ Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="w-5 h-5 text-green-600" />
                            FAQ Details
                        </DialogTitle>
                        <DialogDescription>
                            Complete information about this FAQ
                        </DialogDescription>
                    </DialogHeader>
                    
                    {viewingFaq && (
                        <div className="space-y-6 py-4">
                            {/* FAQ Order and Status */}
                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order</Label>
                                        <span className="text-lg font-black text-[#7b4623]">#{viewingFaq.order}</span>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200 mx-2" />
                                    <div className="flex flex-col">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</Label>
                                        <Badge variant={viewingFaq.isActive ? "success" : "secondary"} className="mt-1">
                                            {viewingFaq.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Q&A Paired by Language */}
                            <div className="space-y-6">
                                {['en', 'hi', 'mr'].map((lang) => (
                                    <div key={lang} className="relative overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-[#7b4623]" />
                                        
                                        <div className="p-5 space-y-4">
                                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-[#7b4623]/10 flex items-center justify-center text-[#7b4623] text-xs font-bold uppercase">
                                                        {lang}
                                                    </div>
                                                    <span className="font-bold text-slate-800">
                                                        {lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Marathi'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Question Section */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                                                        <HelpCircle className="w-3 h-3" />
                                                        Question
                                                    </div>
                                                    <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                                                        <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                                                            {viewingFaq.question?.[lang] || 'Not provided'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Answer Section */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Answer
                                                    </div>
                                                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                                                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                                            {viewingFaq.answer?.[lang] || 'Not provided'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsViewDialogOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingFaq ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
                        <DialogDescription>
                            Enter the question and answer for all supported languages.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="mt-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid grid-cols-3 w-full mb-4">
                                <TabsTrigger value="en">English</TabsTrigger>
                                <TabsTrigger value="hi">Hindi</TabsTrigger>
                                <TabsTrigger value="mr">Marathi</TabsTrigger>
                            </TabsList>
                            
                            {["en", "hi", "mr"].map((lang) => (
                                <TabsContent key={lang} value={lang} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`question_${lang}`}>
                                            Question ({lang.toUpperCase()}) {lang === 'en' ? '*' : ''}
                                        </Label>
                                        <Input
                                            id={`question_${lang}`}
                                            placeholder="Question..."
                                            value={(formData as any)[`question_${lang}`]}
                                            onChange={(e) => setFormData({ ...formData, [`question_${lang}`]: e.target.value })}
                                            required={lang === 'en'}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`answer_${lang}`}>
                                            Answer ({lang.toUpperCase()}) {lang === 'en' ? '*' : ''}
                                        </Label>
                                        <Textarea
                                            id={`answer_${lang}`}
                                            placeholder="Answer..."
                                            value={(formData as any)[`answer_${lang}`]}
                                            onChange={(e) => setFormData({ ...formData, [`answer_${lang}`]: e.target.value })}
                                            className="h-32"
                                            required={lang === 'en'}
                                        />
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="active">Status</Label>
                                <select
                                    id="active"
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                    value={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.value })}
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="order">Display Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingFaq ? "Update FAQ" : "Create FAQ"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
