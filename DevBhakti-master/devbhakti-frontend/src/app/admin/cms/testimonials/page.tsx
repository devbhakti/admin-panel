"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Upload,
    X,
    Video,
    Image as ImageIcon
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
import { fetchAllTestimonialsAdmin, createTestimonialAdmin, updateTestimonialAdmin, deleteTestimonialAdmin } from "@/api/adminController";
import { API_URL, BASE_URL } from "@/config/apiConfig";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalized, Language } from "@/utils/localization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title_en: "",
        title_hi: "",
        title_mr: "",
        subtitle_en: "",
        subtitle_hi: "",
        subtitle_mr: "",
        category_en: "",
        category_hi: "",
        category_mr: "",
        active: "true",
        order: 1,
    });
    const { t, language } = useLanguage();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("en");

    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string>("");

    useEffect(() => {
        loadTestimonials();
    }, []);

    const loadTestimonials = async () => {
        try {
            setLoading(true);
            const data = await fetchAllTestimonialsAdmin();
            setTestimonials(data);
        } catch (error) {
            console.error("Error loading testimonials:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (testimonial: any = null) => {
        if (testimonial) {
            setEditingTestimonial(testimonial);
            setFormData({
                title_en: testimonial.title_en || testimonial.title || "",
                title_hi: testimonial.title_hi || "",
                title_mr: testimonial.title_mr || "",
                subtitle_en: testimonial.subtitle_en || testimonial.subtitle || "",
                subtitle_hi: testimonial.subtitle_hi || "",
                subtitle_mr: testimonial.subtitle_mr || "",
                category_en: testimonial.category_en || testimonial.category || "",
                category_hi: testimonial.category_hi || "",
                category_mr: testimonial.category_mr || "",
                active: testimonial.active ? "true" : "false",
                order: testimonial.order,
            });
            setThumbnailPreview(testimonial.thumbnail.startsWith('http') ? testimonial.thumbnail : `${BASE_URL}${testimonial.thumbnail}`);
            setVideoPreview(testimonial.videoSrc.startsWith('http') ? testimonial.videoSrc : `${BASE_URL}${testimonial.videoSrc}`);
            setThumbnailFile(null);
            setVideoFile(null);
        } else {
            setEditingTestimonial(null);
            setFormData({
                title_en: "",
                title_hi: "",
                title_mr: "",
                subtitle_en: "",
                subtitle_hi: "",
                subtitle_mr: "",
                category_en: "",
                category_hi: "",
                category_mr: "",
                active: "true",
                order: testimonials.length + 1,
            });
            setActiveTab("en");
            setThumbnailPreview("");
            setVideoPreview("");
            setThumbnailFile(null);
            setVideoFile(null);
        }
        setIsDialogOpen(true);
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('title_en', formData.title_en);
            data.append('title_hi', formData.title_hi);
            data.append('title_mr', formData.title_mr);
            data.append('subtitle_en', formData.subtitle_en);
            data.append('subtitle_hi', formData.subtitle_hi);
            data.append('subtitle_mr', formData.subtitle_mr);
            data.append('category_en', formData.category_en);
            data.append('category_hi', formData.category_hi);
            data.append('category_mr', formData.category_mr);
            data.append('active', formData.active);
            data.append('order', formData.order.toString());

            if (thumbnailFile) data.append('thumbnail', thumbnailFile);
            if (videoFile) data.append('videoSrc', videoFile);

            if (editingTestimonial) {
                await updateTestimonialAdmin(editingTestimonial.id, data);
            } else {
                if (!thumbnailFile || !videoFile) {
                    toast({
                        title: "Missing Files",
                        description: "Please select both thumbnail and video",
                        variant: "destructive"
                    });
                    return;
                }
                await createTestimonialAdmin(data);
            }

            setIsDialogOpen(false);
            loadTestimonials();
            toast({
                title: "Success",
                description: editingTestimonial ? "Testimonial updated" : "Testimonial created"
            });
        } catch (error) {
            console.error("Error saving testimonial:", error);
            toast({
                title: "Error",
                description: "Error saving testimonial",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this testimonial?")) {
            try {
                await deleteTestimonialAdmin(id);
                loadTestimonials();
            } catch (error) {
                console.error("Error deleting testimonial:", error);
                alert("Error deleting testimonial");
            }
        }
    };

    const filteredTestimonials = testimonials.filter(t =>
        (t.title_en || t.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.title_hi || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.title_mr || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.subtitle_en || t.subtitle || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Video Testimonials</h1>
                    <p className="text-muted-foreground">
                        Manage video stories and testimonials for the landing page.
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Testimonial
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search testimonials..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-lg bg-card">
                {loading ? (
                    <div className="p-8 text-center">Loading testimonials...</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Thumbnail</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTestimonials.map((testimonial) => (
                                <TableRow key={testimonial.id}>
                                    <TableCell>
                                        <div className="w-16 h-24 rounded overflow-hidden bg-muted">
                                            <img
                                                src={testimonial.thumbnail.startsWith('http') ? testimonial.thumbnail : `${BASE_URL}${testimonial.thumbnail}`}
                                                alt="Thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-sm">
                                            {getLocalized(testimonial, 'title', language as Language)}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            {getLocalized(testimonial, 'subtitle', language as Language)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px]">
                                            {getLocalized(testimonial, 'category', language as Language)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={testimonial.active ? "default" : "secondary"}>
                                            {testimonial.active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{testimonial.order}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDialog(testimonial)}
                                            >
                                                <Edit2 className="w-4 h-4 text-blue-600" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(testimonial.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredTestimonials.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No testimonials found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
                        <DialogDescription>
                            Fill in the details for the video story.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid grid-cols-3 w-full mb-4">
                                <TabsTrigger value="en">{t('common.english') || "English"}</TabsTrigger>
                                <TabsTrigger value="hi">{t('common.hindi') || "Hindi"}</TabsTrigger>
                                <TabsTrigger value="mr">{t('common.marathi') || "Marathi"}</TabsTrigger>
                            </TabsList>
                            
                            {["en", "hi", "mr"].map((lang) => (
                                <TabsContent key={lang} value={lang} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`title_${lang}`}>
                                                {lang === 'hi' ? 'नाम/शीर्षक' : lang === 'mr' ? 'नाव/शीर्षक' : 'Name/Title'} ({t(`common.${lang}_short`)}) {lang === 'en' ? '*' : ''}
                                            </Label>
                                            <Input
                                                id={`title_${lang}`}
                                                placeholder="..."
                                                value={(formData as any)[`title_${lang}`]}
                                                onChange={(e) => setFormData({ ...formData, [`title_${lang}`]: e.target.value })}
                                                required={lang === 'en'}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`subtitle_${lang}`}>
                                                {lang === 'hi' ? 'उपशीर्षक' : lang === 'mr' ? 'उपशीर्षक' : 'Subtitle/Role'} ({t(`common.${lang}_short`)})
                                            </Label>
                                            <Input
                                                id={`subtitle_${lang}`}
                                                placeholder="..."
                                                value={(formData as any)[`subtitle_${lang}`]}
                                                onChange={(e) => setFormData({ ...formData, [`subtitle_${lang}`]: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`category_${lang}`}>
                                            {lang === 'hi' ? 'श्रेणी' : lang === 'mr' ? 'श्रेणी' : 'Category'} ({t(`common.${lang}_short`)})
                                        </Label>
                                        <Input
                                            id={`category_${lang}`}
                                            placeholder="..."
                                            value={(formData as any)[`category_${lang}`]}
                                            onChange={(e) => setFormData({ ...formData, [`category_${lang}`]: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                    value={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.value })}
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="order">Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Thumbnail Image</Label>
                                <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer relative h-40">
                                    {thumbnailPreview ? (
                                        <img src={thumbnailPreview} className="w-full h-full object-cover rounded" />
                                    ) : (
                                        <>
                                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                            <div className="text-xs text-center">Upload Thumbnail (400x600 Recommended)</div>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={handleThumbnailChange}
                                    />

                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Video File</Label>
                                <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer relative h-40">
                                    {videoPreview ? (
                                        <div className="flex flex-col items-center justify-center bg-zinc-100 w-full h-full rounded">
                                            <Video className="w-8 h-8 text-orange-600" />
                                            <span className="text-[10px] mt-1 text-zinc-500 truncate w-full px-2 text-center">
                                                {videoFile ? videoFile.name : 'Current Video'}
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            <Video className="w-8 h-8 text-muted-foreground" />
                                            <div className="text-xs text-center">Click to upload MP4 video</div>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="video/mp4"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={handleVideoChange}
                                    />

                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingTestimonial ? "Update Testimonial" : "Create Testimonial"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
