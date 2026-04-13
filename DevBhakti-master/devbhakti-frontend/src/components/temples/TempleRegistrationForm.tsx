"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import {
    X,
    Upload,
    Plus,
    Trash2,
    Calendar,
    Image as ImageIcon,
    Layout,
    Building2,
    MapPin,
    Check,
    CheckCircle,
    ZoomIn,
    ZoomOut,
    Crop as CropIcon,
    Sparkles,
    ArrowRight,
    User,
    Mail,
    Phone,
    Globe,
    // History,
    FileText,
    Key,
} from "lucide-react";
import { ImageCropper } from "@/components/admin/ImageCropper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { registerTemple, fetchAllPoojasPublic } from "@/api/templeAdminController";
import { checkInstitutionPhone } from "@/api/authController";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { parseLocalizedValue, getDeduplicatedPoojas } from '@/utils/textUtils';

export default function TempleRegistrationForm({ onClose }: { onClose?: () => void }) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [allPoojas, setAllPoojas] = useState<any[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [phoneError, setPhoneError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        // Auth / Owner Info
        name: "",
        email: "",
        phone: "",
        password: "",
        // Temple Basic
        templeName: "",
        location: "", // City, State
        fullAddress: "",
        category: "",
        openTime: "",
        // Details
        description: "",
        // history: "",
        viewers: "",
        // Contact & Social
        templePhone: "",
        website: "",
        mapUrl: "",
        operatingHours: [
            { label: "Morning", start: "07:00 AM", end: "01:00 PM", active: true },
            { label: "Evening", start: "05:00 PM", end: "10:00 PM", active: true }
        ],
        // Fixed stats for reg
        rating: "0",
        reviewsCount: "0"
    });

    useEffect(() => {
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length === 10) {
            validatePhone(phoneDigits);
        } else {
            setPhoneError(null);
        }
    }, [formData.phone]);

    const validatePhone = async (phone: string) => {
        try {
            const response = await checkInstitutionPhone(phone);
            if (response.isInstitutionRegistered) {
                setPhoneError(t('registration_form.validation.phone_registered'));
            } else {
                setPhoneError(null);
            }
        } catch (error) {
            console.error("Error validating phone:", error);
        }
    };

    // Crop State
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [cropType, setCropType] = useState<"main" | "hero">("main");
    const [cropTitle, setCropTitle] = useState(t('registration_form.buttons.edit_image'));
    const [initialAspect, setInitialAspect] = useState(3 / 2);

    // Relationships State
    const [selectedPoojaIds, setSelectedPoojaIds] = useState<string[]>([]);
    const [inlineEvents, setInlineEvents] = useState<any[]>([]);

    // Images State
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>("");
    const [heroImages, setHeroImages] = useState<File[]>([]);
    const [heroPreviews, setHeroPreviews] = useState<string[]>([]);

    useEffect(() => {
        loadPoojas();
    }, []);

    const loadPoojas = async () => {
        try {
            const data = await fetchAllPoojasPublic();
            const poojas = Array.isArray(data) ? data : data.data || [];
            
            // Deduplicate poojas by name, preferring Master poojas
            const deduplicated = getDeduplicatedPoojas(poojas);
            setAllPoojas(deduplicated);
        } catch (error) {
            console.error("Failed to load poojas");
        }
    };

    // Handlers
    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB for initial upload

        if (file) {
            if (file.size > MAX_SIZE) {
                toast({
                    title: t('registration_form.validation.file_large'),
                    description: t('registration_form.validation.main_image_limit'),
                    variant: "destructive"
                });
                e.target.value = ''; // Reset input
                return;
            }

            // Open crop modal
            const reader = new FileReader();
            reader.onload = () => {
                setTempImage(reader.result as string);
                setCropType("main");
                setCropTitle(t('registration_form.buttons.adjust_profile'));
                setInitialAspect(16 / 9);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
            e.target.value = ''; // Reset input
        }
    };

    const handleCropComplete = (croppedFile: File) => {
        if (cropType === "main") {
            setMainImage(croppedFile);
            setMainImagePreview(URL.createObjectURL(croppedFile));
        } else {
            setHeroImages(prev => [...prev, croppedFile]);
            setHeroPreviews(prev => [...prev, URL.createObjectURL(croppedFile)]);
        }
        setShowCropper(false);
        setTempImage(null);
    };

    const handleHeroImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB matching client requirement

        if (files.length > 0) {
            const currentCount = heroImages.length;
            const remaining = 5 - currentCount;

            if (remaining <= 0) {
                toast({
                    title: t('registration_form.validation.limit_reached'),
                    description: t('registration_form.validation.limit_banners'),
                    variant: "destructive"
                });
                e.target.value = '';
                return;
            }

            const largeFiles = files.filter(f => f.size > MAX_SIZE);
            if (largeFiles.length > 0) {
                toast({
                    title: t('registration_form.validation.files_too_large'),
                    description: t('registration_form.validation.banner_image_limit'),
                    variant: "destructive"
                });
            }

            const validFiles = files.filter(f => f.size <= MAX_SIZE).slice(0, remaining);
            if (validFiles.length > 0) {
                // Process first valid file for cropping
                const reader = new FileReader();
                reader.onload = () => {
                    setTempImage(reader.result as string);
                    setCropType("hero");
                    setCropTitle(t('registration_form.buttons.adjust_banner'));
                    setInitialAspect(1920 / 800);
                    setShowCropper(true);
                };
                reader.readAsDataURL(validFiles[0]);
            }

            if (files.filter(f => f.size <= MAX_SIZE).length > remaining) {
                toast({
                    title: t('registration_form.validation.limit_reached'),
                    description: t('registration_form.validation.limit_banners'),
                    variant: "destructive"
                });
            }
            e.target.value = ''; // Reset input
        }
    };

    const removeHeroImage = (index: number) => {
        setHeroImages(prev => prev.filter((_, i) => i !== index));
        setHeroPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const addEvent = () => {
        setInlineEvents(prev => [...prev, { name: "", date: "", description: "" }]);
    };

    const removeEvent = (index: number) => {
        setInlineEvents(prev => prev.filter((_, i) => i !== index));
    };

    const updateEvent = (index: number, field: string, value: string) => {
        setInlineEvents(prev => {
            const newEvents = [...prev];
            newEvents[index] = { ...newEvents[index], [field]: value };
            return newEvents;
        });
    };

    const togglePooja = (id: string) => {
        setSelectedPoojaIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Phone Number Validation
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            toast({
                title: t('registration_form.validation.phone_invalid'),
                description: t('registration_form.validation.phone_invalid'),
                variant: "destructive"
            });
            return;
        }

        if (phoneError) {
            toast({
                title: t('registration_form.validation.registration_blocked'),
                description: phoneError,
                variant: "destructive"
            });
            return;
        }

        // 2. Hero Images Count Validation
        if (heroImages.length > 5) {
            toast({
                title: t('registration_form.validation.too_many_banners'),
                description: t('registration_form.validation.limit_banners'),
                variant: "destructive"
            });
            return;
        }

        // 3. Image Size Validation (Main: 2MB, Hero: 5MB)
        const MAIN_MAX_SIZE = 2 * 1024 * 1024;
        const HERO_MAX_SIZE = 5 * 1024 * 1024;

        if (mainImage && mainImage.size > MAIN_MAX_SIZE) {
            toast({
                title: t('registration_form.validation.file_large'),
                description: t('registration_form.validation.main_image_limit'),
                variant: "destructive"
            });
            return;
        }

        for (const file of heroImages) {
            if (file.size > HERO_MAX_SIZE) {
                toast({
                    title: t('registration_form.validation.file_large'),
                    description: t('registration_form.validation.banner_image_limit'),
                    variant: "destructive"
                });
                return;
            }
        }

        setIsLoading(true);

        try {
            const fd = new FormData();

            // Append basic fields
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'operatingHours') {
                    fd.append(key, JSON.stringify(value));
                } else if (value !== undefined && value !== null) {
                    fd.append(key, value as string);
                }
            });

            // Append relationships
            fd.append("poojaIds", JSON.stringify(selectedPoojaIds));
            fd.append("inlineEvents", JSON.stringify(inlineEvents));

            // Append images
            if (mainImage) fd.append("image", mainImage);
            heroImages.forEach(file => {
                fd.append("heroImages", file);
            });

            await registerTemple(fd);
            setShowSuccess(true);
            toast({ 
                title: t('registration_form.validation.success_title'), 
                description: t('registration_form.validation.success_message'),
                variant: "success"
            });
        } catch (error: any) {
            toast({
                title: t('registration_form.validation.error_title'),
                description: error.response?.data?.message || t('registration_form.validation.submit_error'),
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="p-12 text-center space-y-6">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
                    <Check className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-slate-900">{t('registration_form.success_screen.title')}</h2>
                <p className="text-slate-600 max-w-sm mx-auto leading-relaxed">
                    {t('registration_form.success_screen.message')}
                </p>
                <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-full shadow-lg">
                    {t('registration_form.success_screen.back_to_home')}
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-[2rem] overflow-hidden shadow-2xl relative border border-slate-100 font-sans flex flex-col max-h-[90vh]">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-[#88542b] to-[#88542b] p-8 md:p-10 text-white relative shrink-0">
                <div className="absolute inset-0 pattern-sacred opacity-10 pointer-events-none" />
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">{t('registration_form.header.title')}</h2>
                        <p className="text-orange-50 font-medium">{t('registration_form.header.description')}</p>
                    </div>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-full h-10 w-10 shrink-0"
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    )}
                </div>
            </div>

            <form
                id="temple-reg-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 custom-scrollbar"
            >
                {/* 1. Account Identity */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <User className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{t('registration_form.sections.admin')}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t('registration_form.labels.admin_name')}</label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder={t('registration_form.placeholders.admin_name')}
                                className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t('registration_form.labels.phone')}</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold border-r pr-2 border-slate-300">
                                    +91
                                </div>
                                <Input
                                    value={formData.phone}
                                    type="tel"
                                    maxLength={10}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setFormData({ ...formData, phone: val });
                                    }}
                                    placeholder={t('registration_form.placeholders.phone')}
                                    className="h-12 pl-14 border-slate-200 focus:border-orange-500 rounded-xl"
                                    required
                                />
                            </div>
                            {phoneError && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 animate-pulse">
                                    {phoneError}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t('registration_form.labels.email')}</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder={t('registration_form.placeholders.email')}
                                className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                            />
                        </div>
                        {/* <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">Choose Password *</label>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Minimum 6 characters"
                                className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                                required
                            />
                        </div> */}
                    </div>
                </section>

                {/* 2. Temple Profile */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{t('registration_form.sections.profile')}</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t('registration_form.labels.temple_name')}</label>
                            <Input
                                value={formData.templeName}
                                onChange={e => setFormData({ ...formData, templeName: e.target.value })}
                                placeholder={t('registration_form.placeholders.temple_name')}
                                className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">{t('registration_form.labels.location')}</label>
                                <Input
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    placeholder={t('registration_form.placeholders.location')}
                                    className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">{t('registration_form.labels.category')}</label>
                                <Input
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    placeholder={t('registration_form.placeholders.category')}
                                    className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                                    required
                                />
                            </div>
                            {/* <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">Opening Hours</label>
                                <Input
                                    value={formData.openTime}
                                    onChange={e => setFormData({ ...formData, openTime: e.target.value })}
                                    placeholder="4 AM - 10 PM"
                                    className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                                />
                            </div> */}

                            <div className="col-span-full space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-slate-600 ml-1">{t('registration_form.labels.operating_hours')}</label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {formData.operatingHours.map((slot, index) => {
                                        const updateTime = (type: 'start' | 'end', val: string) => {
                                            const newHours = [...formData.operatingHours];
                                            newHours[index][type] = val;
                                            setFormData({ ...formData, operatingHours: newHours });
                                        };

                                        return (
                                            <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-[#88542b]">
                                                        {t('registration_form.labels.shift').replace('$VAL$', t(`registration_form.labels.${slot.label.toLowerCase()}`))}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={slot.active}
                                                            onChange={(e) => {
                                                                const newHours = [...formData.operatingHours];
                                                                newHours[index].active = e.target.checked;
                                                                setFormData({ ...formData, operatingHours: newHours });
                                                            }}
                                                            className="w-4 h-4 rounded border-slate-300 text-[#88542b] focus:ring-[#88542b]"
                                                        />
                                                        <span className="text-xs font-medium text-slate-500">{t('registration_form.labels.active')}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 space-y-1">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase ml-1">{t('registration_form.labels.opening')}</p>
                                                        <Input
                                                            value={slot.start}
                                                            onChange={(e) => updateTime('start', e.target.value)}
                                                            placeholder={t('registration_form.placeholders.time')}
                                                            className="h-9 border-slate-200 focus:border-[#88542b] rounded-xl text-xs"
                                                            disabled={!slot.active}
                                                        />
                                                    </div>
                                                    <div className="pt-5 text-slate-300">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase ml-1">{t('registration_form.labels.closing')}</p>
                                                        <Input
                                                            value={slot.end}
                                                            onChange={(e) => updateTime('end', e.target.value)}
                                                            placeholder={t('registration_form.placeholders.time')}
                                                            className="h-9 border-slate-200 focus:border-[#88542b] rounded-xl text-xs"
                                                            disabled={!slot.active}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-[10px] text-slate-400 italic bg-orange-50/50 p-2 rounded-lg border border-orange-100/50">
                                    {t('registration_form.tips.operating_hours')}
                                </p>
                            </div>








                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">{t('registration_form.labels.visitor_count')}</label>
                                <Input
                                    value={formData.viewers}
                                    onChange={e => setFormData({ ...formData, viewers: e.target.value })}
                                    placeholder={t('registration_form.placeholders.visitor_count')}
                                    className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t('registration_form.labels.address')}</label>
                            <Input
                                value={formData.fullAddress}
                                onChange={e => setFormData({ ...formData, fullAddress: e.target.value })}
                                placeholder={t('registration_form.placeholders.address')}
                                className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                                required
                            />
                        </div>
                        {/* <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">Sacred History</label>
                            <Textarea
                                value={formData.history}
                                onChange={e => setFormData({ ...formData, history: e.target.value })}
                                placeholder="Describe the ancient origin and legends..."
                                className="min-h-[100px] border-slate-200 focus:border-orange-500 rounded-xl resize-none"
                            />
                        </div> */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t('registration_form.labels.description')}</label>
                            <Textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder={t('registration_form.placeholders.description')}
                                className="min-h-[100px] border-slate-200 focus:border-orange-500 rounded-xl resize-none"
                            />
                        </div>
                    </div>
                </section>

                {/* 3. Media Assets */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{t('registration_form.sections.media')}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t('registration_form.labels.main_image')}</label>
                            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-1 hover:border-[#88542b]/50 hover:bg-orange-50/30 transition-all group relative cursor-pointer overflow-hidden aspect-[16/9] flex items-center justify-center bg-slate-50/50">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                    onChange={handleMainImageChange}
                                />
                                {mainImagePreview ? (
                                    <div className="w-full h-full relative group">
                                        <img src={mainImagePreview} className="w-full h-full object-cover rounded-[1.25rem]" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-[1.25rem] backdrop-blur-[2px]">
                                            <div className="bg-white/20 p-4 rounded-full border border-white/30">
                                                <Upload className="text-white w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-3 p-6 flex flex-col items-center justify-center w-full h-full">
                                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                                            <Upload className="w-8 h-8 text-[#88542b]/60 group-hover:text-[#88542b]" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-[#88542b] font-bold uppercase tracking-[0.2em]">{t('registration_form.buttons.select_photo')}</p>
                                            <p className="text-lg font-serif font-bold text-slate-800">{t('registration_form.labels.main_image')}</p>
                                            <div className="flex flex-col items-center gap-1">
                                                <p className="text-[11px] text-slate-500 font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                                                    {t('registration_form.labels.aspect_ratio').replace('{{ratio}}', '16:9').replace('{{px}}', '1200x675 px')}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">JPG, PNG, WebP • Max 2MB</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t('registration_form.labels.banners')}</label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {heroPreviews.slice(0, 5).map((url, i) => (
                                    <div key={url} className="aspect-[2.4/1] rounded-2xl overflow-hidden relative border border-slate-100 group shadow-sm bg-slate-50">
                                        <img src={url} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => removeHeroImage(i)}
                                                className="bg-red-500 text-white p-2.5 rounded-full hover:scale-110 transition-transform shadow-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {heroPreviews.length < 5 && (
                                    <div className="aspect-[2.4/1] border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center hover:border-[#88542b]/50 hover:bg-orange-50/30 transition-all cursor-pointer relative group bg-slate-50/50 p-4">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={handleHeroImagesChange}
                                        />
                                        <div className="text-center space-y-2">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                                <Plus className="w-5 h-5 text-[#88542b]" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                    {t('registration_form.labels.aspect_ratio').replace('{{ratio}}', '2.4:1').replace('{{px}}', '1920x800 px')}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-medium">JPG, PNG, WebP • Max 5MB each</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Poojas */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{t('registration_form.sections.poojas')}</h3>
                            {t('registration_form.tips.poojas_desc')}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allPoojas.map(pooja => (
                            <div
                                key={pooja.id}
                                className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${selectedPoojaIds.includes(pooja.id)
                                    ? "border-[#88542b] bg-orange-50 shadow-sm"
                                    : "border-slate-200 bg-white hover:border-[#88542b]/30"
                                    }`}
                                onClick={() => togglePooja(pooja.id)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedPoojaIds.includes(pooja.id)
                                        ? "border-[#88542b] bg-[#88542b]"
                                        : "border-slate-300 bg-white"
                                        }`}>
                                        {selectedPoojaIds.includes(pooja.id) && (
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-slate-800 text-sm">{parseLocalizedValue(pooja.name)}</h4>
                                        {pooja.category && (
                                            <p className="text-xs text-slate-500 mt-1">{pooja.category}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {selectedPoojaIds.length > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">
                                {selectedPoojaIds.length} {t('registration_form.sections.poojas').toLowerCase()} {t('registration_form.labels.active').toLowerCase()}
                            </span>
                        </div>
                    )}
                </section>

                {/* 5. Online Presence */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <Globe className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{t('registration_form.sections.online')}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t('registration_form.labels.website')}</label>
                            <Input
                                value={formData.website}
                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                placeholder={t('registration_form.placeholders.website')}
                                className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t('registration_form.labels.maps_link')}</label>
                            <Input
                                value={formData.mapUrl}
                                onChange={e => setFormData({ ...formData, mapUrl: e.target.value })}
                                placeholder={t('registration_form.placeholders.maps_link')}
                                className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                            />
                        </div>
                    </div>
                </section>

                {/* 6. Inline Events */}
                {/* <section className="space-y-6 pb-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Major Festivals / Events</h3>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addEvent} className="rounded-lg border-slate-200 hover:border-orange-400 hover:bg-orange-50">
                            <Plus className="w-4 h-4 mr-2" /> Add Festival
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {inlineEvents.map((ev, i) => (
                            <div key={i} className="p-5 border border-slate-100 rounded-2xl bg-white shadow-sm relative group animate-in slide-in-from-top-2">
                                <button
                                    type="button"
                                    onClick={() => removeEvent(i)}
                                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Event Name</label>
                                        <Input
                                            value={ev.name}
                                            onChange={e => updateEvent(i, 'name', e.target.value)}
                                            placeholder="e.g. Maha Shivratri"
                                            className="h-11 bg-slate-50 border-transparent focus:bg-white rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Probable Date/Month</label>
                                        <Input
                                            value={ev.date}
                                            onChange={e => updateEvent(i, 'date', e.target.value)}
                                            placeholder="e.g. February/March"
                                            className="h-11 bg-slate-50 border-transparent focus:bg-white rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Event Significance</label>
                                        <Input
                                            value={ev.description}
                                            onChange={e => updateEvent(i, 'description', e.target.value)}
                                            placeholder="Divine rituals and celebrations"
                                            className="h-11 bg-slate-50 border-transparent focus:bg-white rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {inlineEvents.length === 0 && (
                            <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                                <p className="text-slate-400 text-sm font-medium italic">No events listed. Share your major festivals.</p>
                            </div>
                        )}
                    </div>
                </section> */}
            </form>

            {/* Footer Actions */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4 shrink-0">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="h-14 px-8 text-slate-500 font-bold hover:bg-slate-200"
                >
                    {t('common.discard') || 'Discard'}
                </Button>
                <Button
                    type="submit"
                    form="temple-reg-form"
                    disabled={isLoading}
                    className="h-14 px-12 bg-gradient-to-r from-[#88542b] to-[#794a05] hover:from-[#794a05] hover:to-[#88542b] text-white rounded-2xl text-lg font-bold shadow-xl shadow-amber-900/20 active:scale-95 transition-all"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {t('registration_form.buttons.submitting')}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            {t('registration_form.buttons.submit')}
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    )}
                </Button>
            </div>

            {/* Crop Modal */}
            {showCropper && tempImage && (
                <ImageCropper
                    image={tempImage}
                    title={cropTitle}
                    initialAspect={initialAspect}
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setShowCropper(false);
                        setTempImage(null);
                    }}
                    lockAspect={true}
                />
            )}
        </div>
    );
}
