"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Upload,
    X,
    Crop
} from "lucide-react";
import { ImageCropper } from "@/components/admin/ImageCropper";
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
import { fetchAllFeaturesAdmin, createFeatureAdmin, updateFeatureAdmin, deleteFeatureAdmin } from "@/api/adminController";
import { API_URL, BASE_URL } from "@/config/apiConfig";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalized, Language } from "@/utils/localization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";



export default function FeaturesPage() {
    const [features, setFeatures] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title_en: "",
        title_hi: "",
        title_mr: "",
        description_en: "",
        description_hi: "",
        description_mr: "",
        active: "true",
        order: 1,
    });
    const { t, language } = useLanguage();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("en");

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    const [iconFile, setIconFile] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string>("");

    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [cropType, setCropType] = useState<"icon" | "bg">("bg");

    useEffect(() => {
        loadFeatures();
    }, []);

    const loadFeatures = async () => {
        try {
            setLoading(true);
            const data = await fetchAllFeaturesAdmin({ lang: 'raw' });
            setFeatures(data);
        } catch (error) {
            console.error("Error loading features:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (feature: any = null) => {
        if (feature) {
            setEditingFeature(feature);
            setFormData({
                title_en: feature.title?.en || "",
                title_hi: feature.title?.hi || "",
                title_mr: feature.title?.mr || "",
                description_en: feature.description?.en || "",
                description_hi: feature.description?.hi || "",
                description_mr: feature.description?.mr || "",
                active: feature.active ? "true" : "false",
                order: feature.order,
            });
            setImagePreview(feature.image.startsWith('http') ? feature.image : `${BASE_URL}${feature.image}`);
            setIconPreview(feature.icon.startsWith('http') ? feature.icon : `${BASE_URL}${feature.icon}`);

            setImageFile(null);
            setIconFile(null);
        } else {
            setEditingFeature(null);
            setFormData({
                title_en: "",
                title_hi: "",
                title_mr: "",
                description_en: "",
                description_hi: "",
                description_mr: "",
                active: "true",
                order: features.length + 1,
            });
            setActiveTab("en");
            setImagePreview("");
            setIconPreview("");
            setImageFile(null);
            setIconFile(null);
        }
        setIsDialogOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
                setCropType("bg");
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
            e.target.value = ''; // Reset input
        }
    };

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
                setCropType("icon");
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
            e.target.value = ''; // Reset input
        }
    };

    const handleCropComplete = (croppedFile: File) => {
        const previewUrl = URL.createObjectURL(croppedFile);
        if (cropType === "bg") {
            setImageFile(croppedFile);
            setImagePreview(previewUrl);
        } else {
            setIconFile(croppedFile);
            setIconPreview(previewUrl);
        }
        setShowCropper(false);
        setTempImage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('title_en', formData.title_en);
            data.append('title_hi', formData.title_hi);
            data.append('title_mr', formData.title_mr);
            data.append('description_en', formData.description_en);
            data.append('description_hi', formData.description_hi);
            data.append('description_mr', formData.description_mr);
            data.append('active', formData.active);
            data.append('order', formData.order.toString());

            if (imageFile) data.append('image', imageFile);
            if (iconFile) data.append('icon', iconFile);

            if (editingFeature) {
                await updateFeatureAdmin(editingFeature.id, data);
                toast({
                    title: t('common.success') || "Success",
                    description: t('admin.cms.features.success_update') || "Feature updated successfully"
                });
            } else {
                if (!imageFile || !iconFile) {
                    toast({
                        title: t('common.alert') || "Missing Images",
                        description: t('admin.cms.features.alert_images') || "Please select both image and icon",
                        variant: "destructive"
                    });
                    return;
                }
                await createFeatureAdmin(data);
                toast({
                    title: t('common.success') || "Success",
                    description: t('admin.cms.features.success_create') || "Feature created successfully"
                });
            }

            setIsDialogOpen(false);
            loadFeatures();
        } catch (error) {
            console.error("Error saving feature:", error);
            toast({
                title: t('common.error') || "Error",
                description: t('admin.cms.features.error_save') || "Error saving feature",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t('admin.cms.features.confirm_delete') || "Are you sure you want to delete this feature?")) {
            try {
                await deleteFeatureAdmin(id);
                loadFeatures();
                toast({
                    title: t('common.success') || "Success",
                    description: t('admin.cms.features.success_delete') || "Feature deleted successfully"
                });
            } catch (error) {
                console.error("Error deleting feature:", error);
                toast({
                    title: t('common.error') || "Error",
                    description: t('admin.cms.features.error_delete') || "Error deleting feature",
                    variant: "destructive"
                });
            }
        }
    };

    const filteredFeatures = features.filter(feature => {
        const s = searchTerm.toLowerCase();
        
        // Helper to check if any language version of a field matches
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

        return matchesField(feature.title) || matchesField(feature.description) || 
               (feature.title_en || '').toLowerCase().includes(s); // Backward compatibility
    });

    return (
        <div className="space-y-6">
            {showCropper && tempImage && (
                <ImageCropper
                    image={tempImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setShowCropper(false);
                        setTempImage(null);
                    }}
                    initialAspect={cropType === "bg" ? 4 / 3 : 1}
                    lockAspect={true}
                    title={cropType === "bg" ? (t('admin.cms.features.bg_label') || "Adjust Background Image") : (t('admin.cms.features.icon_label') || "Adjust Feature Icon")}
                />
            )}
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('admin.cms.features.title') || "Features Management"}</h1>
                    <p className="text-muted-foreground">
                        {t('admin.cms.features.desc') || "Manage your homepage features and highlights."}
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('admin.cms.features.add_new') || "Add New Feature"}
                </Button>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder={t('admin.cms.features.search_placeholder') || "Search features..."}
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Features Table */}
            <div className="border rounded-lg bg-card">
                {loading ? (
                    <div className="p-8 text-center">{t('common.loading') || "Loading features..."}</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">{t('admin.cms.features.table_icon') || "Icon"}</TableHead>
                                <TableHead className="w-[120px]">{t('admin.cms.features.table_bg') || "Background"}</TableHead>
                                <TableHead>{t('admin.cms.features.table_title') || "Title"}</TableHead>
                                <TableHead>{t('admin.cms.features.table_status') || "Status"}</TableHead>
                                <TableHead>{t('admin.cms.features.table_order') || "Order"}</TableHead>
                                <TableHead className="text-right">{t('admin.cms.features.table_actions') || "Actions"}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredFeatures.map((feature) => (
                                <TableRow key={feature.id}>
                                    <TableCell>
                                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center p-1">
                                            <img
                                                src={feature.icon.startsWith('http') ? feature.icon : `${BASE_URL}${feature.icon}`}
                                                alt="Icon"
                                                className="w-full h-full object-contain"
                                            />

                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-20 h-12 rounded overflow-hidden bg-muted">
                                            <img
                                                src={feature.image.startsWith('http') ? feature.image : `${BASE_URL}${feature.image}`}
                                                alt="BG"
                                                className="w-full h-full object-cover"
                                            />

                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{getLocalized(feature, 'title', language as Language)}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                            {getLocalized(feature, 'description', language as Language)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={feature.active ? "default" : "secondary"}>
                                            {feature.active ? (t('admin.cms.features.active') || "Active") : (t('admin.cms.features.inactive') || "Inactive")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{feature.order}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDialog(feature)}
                                            >
                                                <Edit2 className="w-4 h-4 text-blue-600" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(feature.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredFeatures.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        {t('common.not_found') || "No features found"}
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
                        <DialogTitle>{editingFeature ? t('admin.cms.features.edit_feature') : t('admin.cms.features.add_new')}</DialogTitle>
                        <DialogDescription>
                            {t('admin.cms.features.fill_details') || "Enter the details for the feature card."}
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
                                    <div className="space-y-2">
                                        <Label htmlFor={`title_${lang}`}>
                                            {lang === 'hi' ? 'शीर्षक' : lang === 'mr' ? 'शीर्षक' : 'Title'} ({t(`common.${lang}_short`)}) {lang === 'en' ? '*' : ''}
                                        </Label>
                                        <Input
                                            id={`title_${lang}`}
                                            placeholder={lang === 'en' ? "e.g. Easy Pooja Booking" : "..."}
                                            value={(formData as any)[`title_${lang}`]}
                                            onChange={(e) => setFormData({ ...formData, [`title_${lang}`]: e.target.value })}
                                            required={lang === 'en'}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`description_${lang}`}>
                                            {lang === 'hi' ? 'विवरण' : lang === 'mr' ? 'वर्णन' : 'Description'} ({t(`common.${lang}_short`)})
                                        </Label>
                                        <Textarea
                                            id={`description_${lang}`}
                                            placeholder="..."
                                            value={(formData as any)[`description_${lang}`]}
                                            onChange={(e) => setFormData({ ...formData, [`description_${lang}`]: e.target.value })}
                                            className="h-24"
                                        />
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">{t('admin.cms.features.status_label')}</Label>
                                <select
                                    id="status"
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                    value={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.value })}
                                >
                                    <option value="true">{t('admin.cms.features.active') || "Active"}</option>
                                    <option value="false">{t('admin.cms.features.inactive') || "Inactive"}</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="order">{t('admin.cms.features.order_label')}</Label>
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
                                <Label>{t('admin.cms.features.icon_label')}</Label>
                                <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-1 hover:bg-muted/50 transition-colors cursor-pointer relative">
                                    <Upload className="w-6 h-6 text-muted-foreground" />
                                    <div className="text-xs font-medium text-center italic">{t('admin.cms.features.aspect_icon')}</div>
                                    <Input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleIconChange}
                                    />
                                </div>
                                {iconPreview && (
                                    <div className="mt-2 relative w-16 h-16 rounded overflow-hidden border mx-auto">
                                        <img src={iconPreview} className="w-full h-full object-contain" alt="Icon Preview" />
                                        <button
                                            type="button"
                                            onClick={() => { setIconPreview(""); setIconFile(null); }}
                                            className="absolute -top-1 -right-1 p-0.5 bg-black/50 rounded-full text-white hover:bg-black/70"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>{t('admin.cms.features.bg_label')}</Label>
                                <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-1 hover:bg-muted/50 transition-colors cursor-pointer relative">
                                    <Upload className="w-6 h-6 text-muted-foreground" />
                                    <div className="text-xs font-medium text-center italic">{t('admin.cms.features.aspect_bg')}</div>
                                    <Input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleImageChange}
                                    />
                                </div>
                                {imagePreview && (
                                    <div className="mt-2 relative w-full h-16 rounded overflow-hidden border">
                                        <img src={imagePreview} className="w-full h-full object-cover" alt="BG Preview" />
                                        <button
                                            type="button"
                                            onClick={() => { setImagePreview(""); setImageFile(null); }}
                                            className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white hover:bg-black/70"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                {t('common.cancel') || "Cancel"}
                            </Button>
                            <Button type="submit">
                                {editingFeature ? t('admin.cms.features.update_btn') : t('admin.cms.features.create_btn')}
                            </Button>
                        </DialogFooter>

                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
