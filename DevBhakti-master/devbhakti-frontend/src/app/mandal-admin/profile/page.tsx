"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { 
    Camera, Save, X, Sparkles, Image as ImageIcon, Video, FileText, 
    Loader2, UploadCloud, MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchMandalProfile, updateMandalProfile } from "@/api/mandalAdminController";
import Image from "next/image";
import { API_URL } from "@/config/apiConfig";
import { parseLocalizedValue } from "@/utils/textUtils";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
export default function MandalProfilePage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    const [formData, setFormData] = useState<any>({
        name_en: "", name_hi: "", name_mr: "",
        description_en: "", description_hi: "", description_mr: "",
        about_en: "", about_hi: "", about_mr: "",
        address: "", city: "", state: "", pinCode: "", mapUrl: "",
        email: "", presidentName: "",
        liveUrl: "", channelId: "", liveStatus: false, isLive: false, isPrimaryLive: false,
    });

    const [mainImagePreview, setMainImagePreview] = useState<string>("");
    const [heroPreviews, setHeroPreviews] = useState<string[]>([]);
    
    const [selectedMainFile, setSelectedMainFile] = useState<File | null>(null);
    const [selectedHeroFiles, setSelectedHeroFiles] = useState<File[]>([]);
    const [existingBannerImages, setExistingBannerImages] = useState<string[]>([]);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setIsLoading(true);
        try {
            const response = await fetchMandalProfile();
            if (response.success && response.data) {
                const data = response.data;
                setProfile(data);

                const getL = (field: any, lang: string, fallback: string = "") => {
                    const result = parseLocalizedValue(field, lang);
                    return result === "N/A" || !result ? fallback : result;
                };

                setFormData({
                    name_en: getL(data.name, 'en'),
                    name_hi: getL(data.name, 'hi'),
                    name_mr: getL(data.name, 'mr'),
                    description_en: getL(data.description, 'en'),
                    description_hi: getL(data.description, 'hi'),
                    description_mr: getL(data.description, 'mr'),
                    about_en: getL(data.about, 'en'),
                    about_hi: getL(data.about, 'hi'),
                    about_mr: getL(data.about, 'mr'),
                    address: data.address || "",
                    city: data.city || "",
                    state: data.state || "",
                    pinCode: data.pinCode || "",
                    mapUrl: data.mapUrl || "",
                    email: data.email || "",
                    presidentName: data.presidentName || "",
                    liveUrl: data.liveUrl || "",
                    channelId: data.channelId || "",
                    liveStatus: !!data.liveStatus,
                    isLive: !!data.isLive,
                    isPrimaryLive: !!data.isPrimaryLive,
                });

                if (data.image) setMainImagePreview(getImageUrl(data.image));
                if (data.bannerImages && Array.isArray(data.bannerImages)) {
                    setExistingBannerImages(data.bannerImages);
                    setHeroPreviews(data.bannerImages.map((img: string) => getImageUrl(img)));
                } else {
                    setExistingBannerImages([]);
                    setHeroPreviews([]);
                }
            }
        } catch (error) {
            console.error("Error loading profile:", error);
            toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const getImageUrl = (path: string) => {
        if (!path) return "";
        if (path.startsWith('http')) return path;
        return `${API_URL.replace('/api', '')}${path}`;
    };

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedMainFile(file);
            const reader = new FileReader();
            reader.onload = () => setMainImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleHeroImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const MAX_SIZE = 5 * 1024 * 1024;
        const remaining = 10 - heroPreviews.length;
        if (remaining <= 0) {
            toast({ title: "Gallery Full", description: "Maximum 10 gallery images allowed.", variant: "destructive" });
            return;
        }
        if (files.length > 0) {
            const validFiles = files.filter(f => f.size <= MAX_SIZE).slice(0, remaining);
            if (validFiles.length > 0) {
                setSelectedHeroFiles(prev => [...prev, ...validFiles]);
                const newPreviews = validFiles.map(file => URL.createObjectURL(file));
                setHeroPreviews(prev => [...prev, ...newPreviews]);
            }
        }
    };

    const removeHeroImage = (index: number) => {
        // If it's an existing image (from backend)
        if (index < existingBannerImages.length) {
            const newExisting = [...existingBannerImages];
            newExisting.splice(index, 1);
            setExistingBannerImages(newExisting);
            
            const newPreviews = [...heroPreviews];
            newPreviews.splice(index, 1);
            setHeroPreviews(newPreviews);
        } else {
            // It's a newly added file
            const fileIndex = index - existingBannerImages.length;
            const newFiles = [...selectedHeroFiles];
            newFiles.splice(fileIndex, 1);
            setSelectedHeroFiles(newFiles);

            const newPreviews = [...heroPreviews];
            newPreviews.splice(index, 1);
            setHeroPreviews(newPreviews);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const fd = new FormData();
            Object.keys(formData).forEach(key => {
                fd.append(key, String(formData[key]));
            });

            // Append existing banner images that weren't deleted
            fd.append('existingBannerImages', JSON.stringify(existingBannerImages));

            if (selectedMainFile) fd.append('image', selectedMainFile);
            selectedHeroFiles.forEach(file => fd.append('heroImages', file));

            const response = await updateMandalProfile(fd);
            if (response.success) {
                toast({ title: "Success", description: "Profile updated successfully" });
                loadProfile();
                setSelectedMainFile(null);
                setSelectedHeroFiles([]);
            } else {
                toast({ title: "Error", description: response.message || "Failed to update profile", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
                <p className="text-amber-600 font-medium">Loading your mandal profile...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1440px] mx-auto space-y-6 pb-20 relative px-4"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif font-black text-slate-800 tracking-tight">
                        Mandal Profile
                    </h1>
                    <p className="text-slate-500 mt-1">Manage your mandal's public information and media.</p>
                </div>
                <Button 
                    onClick={handleSubmit} 
                    disabled={isSaving}
                    className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-12 px-6 shadow-lg shadow-amber-600/20"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100">
                            <CardTitle className="text-xl font-serif text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-amber-600" /> General Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Mandal Name</Label>
                                <Tabs defaultValue="en" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-2 bg-slate-100/80 p-1 rounded-xl">
                                        <TabsTrigger value="en" className="rounded-lg text-xs font-bold">English</TabsTrigger>
                                        <TabsTrigger value="hi" className="rounded-lg text-xs font-bold">हिंदी</TabsTrigger>
                                        <TabsTrigger value="mr" className="rounded-lg text-xs font-bold">मराठी</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="en"><Input value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} className="h-12 rounded-xl" placeholder="Mandal name in English" /></TabsContent>
                                    <TabsContent value="hi"><Input value={formData.name_hi} onChange={e => setFormData({...formData, name_hi: e.target.value})} className="h-12 rounded-xl" placeholder="मंडल का नाम हिंदी में" /></TabsContent>
                                    <TabsContent value="mr"><Input value={formData.name_mr} onChange={e => setFormData({...formData, name_mr: e.target.value})} className="h-12 rounded-xl" placeholder="मंडळाचे नाव मराठीत" /></TabsContent>
                                </Tabs>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Short Description</Label>
                                <Tabs defaultValue="en" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-2 bg-slate-100/80 p-1 rounded-xl">
                                        <TabsTrigger value="en" className="rounded-lg text-xs font-bold">English</TabsTrigger>
                                        <TabsTrigger value="hi" className="rounded-lg text-xs font-bold">हिंदी</TabsTrigger>
                                        <TabsTrigger value="mr" className="rounded-lg text-xs font-bold">मराठी</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="en"><Textarea value={formData.description_en} onChange={e => setFormData({...formData, description_en: e.target.value})} className="min-h-[100px] rounded-xl" placeholder="Short tagline or description" /></TabsContent>
                                    <TabsContent value="hi"><Textarea value={formData.description_hi} onChange={e => setFormData({...formData, description_hi: e.target.value})} className="min-h-[100px] rounded-xl" placeholder="संक्षिप्त विवरण" /></TabsContent>
                                    <TabsContent value="mr"><Textarea value={formData.description_mr} onChange={e => setFormData({...formData, description_mr: e.target.value})} className="min-h-[100px] rounded-xl" placeholder="संक्षिप्त वर्णन" /></TabsContent>
                                </Tabs>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">About Mandal (Detailed)</Label>
                                <Tabs defaultValue="en" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-2 bg-slate-100/80 p-1 rounded-xl">
                                        <TabsTrigger value="en" className="rounded-lg text-xs font-bold">English</TabsTrigger>
                                        <TabsTrigger value="hi" className="rounded-lg text-xs font-bold">हिंदी</TabsTrigger>
                                        <TabsTrigger value="mr" className="rounded-lg text-xs font-bold">मराठी</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="en"><Textarea value={formData.about_en} onChange={e => setFormData({...formData, about_en: e.target.value})} className="min-h-[150px] rounded-xl" placeholder="Detailed history and about information" /></TabsContent>
                                    <TabsContent value="hi"><Textarea value={formData.about_hi} onChange={e => setFormData({...formData, about_hi: e.target.value})} className="min-h-[150px] rounded-xl" placeholder="विस्तृत इतिहास और जानकारी" /></TabsContent>
                                    <TabsContent value="mr"><Textarea value={formData.about_mr} onChange={e => setFormData({...formData, about_mr: e.target.value})} className="min-h-[150px] rounded-xl" placeholder="सविस्तर इतिहास आणि माहिती" /></TabsContent>
                                </Tabs>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">President / Head Name</Label>
                                    <Input value={formData.presidentName} onChange={e => setFormData({...formData, presidentName: e.target.value})} className="h-12 rounded-xl" placeholder="President Name" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Contact Email</Label>
                                    <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-12 rounded-xl" placeholder="Email Address" type="email" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location Info */}
                    <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100">
                            <CardTitle className="text-xl font-serif text-slate-800 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-amber-600" /> Location Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Complete Address</Label>
                                <Textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="min-h-[80px] rounded-xl" placeholder="Full address" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">City</Label>
                                    <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="h-12 rounded-xl" placeholder="City" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">State</Label>
                                    <Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="h-12 rounded-xl" placeholder="State" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Pin Code</Label>
                                    <Input value={formData.pinCode} onChange={e => setFormData({...formData, pinCode: e.target.value})} className="h-12 rounded-xl" placeholder="Pin Code" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Google Maps URL</Label>
                                <Input value={formData.mapUrl} onChange={e => setFormData({...formData, mapUrl: e.target.value})} className="h-12 rounded-xl" placeholder="https://maps.google.com/..." />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Live Darshan */}
                    <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
                        <CardHeader className="bg-rose-50/50 p-6 border-b border-rose-100">
                            <CardTitle className="text-xl font-serif text-rose-700 flex items-center gap-2">
                                <Video className="w-5 h-5" /> Live Darshan & Video
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <h4 className="font-bold text-slate-800">Enable Live Darshan</h4>
                                    <p className="text-xs text-slate-500">Show live video stream on your public page</p>
                                </div>
                                <Switch 
                                    checked={formData.liveStatus} 
                                    onCheckedChange={(c) => setFormData({...formData, liveStatus: c})} 
                                />
                            </div>

                            {formData.liveStatus && (
                                <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">YouTube Video/Live URL</Label>
                                        <div className="relative">
                                            <FaYoutube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                                            <Input 
                                                value={formData.liveUrl} 
                                                onChange={e => setFormData({...formData, liveUrl: e.target.value})} 
                                                className="h-12 pl-12 rounded-xl" 
                                                placeholder="https://youtube.com/watch?v=..." 
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                        <Sparkles className="w-4 h-4 shrink-0" />
                                        <p>Make sure your YouTube live stream is set to "Public" so devotees can view it.</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Main Image */}
                    <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100">
                            <CardTitle className="text-xl font-serif text-slate-800 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-amber-600" /> Primary Image
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200 group">
                                {mainImagePreview ? (
                                    <Image src={mainImagePreview} alt="Main Image" fill className="object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                        <Camera className="w-8 h-8 mb-2" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Upload Image</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <UploadCloud className="w-8 h-8 text-white mb-2" />
                                    <span className="text-white text-xs font-bold">Change Image</span>
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                    onChange={handleMainImageChange}
                                />
                            </div>
                            <p className="text-xs text-center text-slate-500 font-medium">
                                Recommended: Square image (1:1 ratio), Max 5MB
                            </p>
                        </CardContent>
                    </Card>

                    {/* Gallery / Banner Images */}
                    <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100">
                            <CardTitle className="text-xl font-serif text-slate-800 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-amber-600" /> Banner & Gallery
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {heroPreviews.map((preview, index) => (
                                    <div key={index} className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 group border border-slate-200 shadow-sm">
                                        <Image src={preview} alt={`Gallery ${index}`} fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeHeroImage(index)}
                                            className="absolute top-2 right-2 w-6 h-6 bg-white/90 text-red-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                
                                {heroPreviews.length < 10 && (
                                    <div className="relative aspect-[16/9] rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center hover:bg-slate-100 hover:border-amber-300 transition-colors cursor-pointer group">
                                        <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-amber-500 mb-1" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-amber-600">Add Photo</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            multiple 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                            onChange={handleHeroImagesChange}
                                        />
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-center text-slate-500 font-medium">
                                Upload up to 10 wide images for your banner slider.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}
