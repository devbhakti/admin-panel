"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    HelpCircle
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
                <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New FAQ
                </Button>
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
