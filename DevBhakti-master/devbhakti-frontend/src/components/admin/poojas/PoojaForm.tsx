"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Upload, Layout, Languages, FileText, HelpCircle, Package, ArrowRight, Save, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage, Language  } from "@/context/LanguageContext";
import { ImageCropper } from "@/components/admin/ImageCropper";
import { API_URL } from "@/config/apiConfig";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, ChevronsUpDown } from "lucide-react";

interface PoojaFormProps {
    mode: "create" | "edit";
    initialData?: any;
    temples: any[];
    availableCategories: any[];
    onSubmit: (formData: FormData) => Promise<void>;
    isLoading?: boolean;
}

const STATIC_PACKAGE_TYPES = [
    { name: "Single", description: "For 1 person", maxPersons: 1 },
    { name: "Couple", description: "For 2 people", maxPersons: 2 },
    { name: "Family", description: "Upto 5 people", maxPersons: 5 },
    { name: "Group", description: "Upto 8 people", maxPersons: 8 },
    { name: "Big Group", description: "Upto 25 people", maxPersons: 25 },
    { name: "Small Business", description: "Upto 50 people", maxPersons: 50 },
    { name: "Large Business", description: "Upto 100 people", maxPersons: 100 },
    { name: "Corporates", description: "Upto 500 people", maxPersons: 500 }
];

export const PoojaForm: React.FC<PoojaFormProps> = ({
    mode,
    initialData,
    temples,
    availableCategories,
    onSubmit,
    isLoading = false
}) => {
    const { t, language, setLanguage } = useLanguage();
    const [activeTab, setActiveTab] = useState<Language>("en");
    const [isMaster, setIsMaster] = useState(false);

    // Core State
    const [formData, setFormData] = useState({
        price: 0,
        time: "",
        templeId: "",
        category_en: "",
        category_hi: "",
        category_mr: "",
        // Localized Strings
        name: { en: "", hi: "", mr: "" },
        about: { en: "", hi: "", mr: "" },
        duration: { en: "", hi: "", mr: "" },
        // Localized Arrays
        benefits: { en: [] as string[], hi: [] as string[], mr: [] as string[] },
        description: { en: [] as string[], hi: [] as string[], mr: [] as string[] },
        bullets: { en: [] as string[], hi: [] as string[], mr: [] as string[] }
    });

    const [packages, setPackages] = useState<any>({ en: [], hi: [], mr: [] });
    const [faqs, setFaqs] = useState<any>({ en: [], hi: [], mr: [] });
    const [processSteps, setProcessSteps] = useState<any>({ en: [], hi: [], mr: [] });

    // Image State
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);

    useEffect(() => {
        if (mode === "edit" && initialData) {
            setIsMaster(initialData.isMaster || false);
            const parseArray = (val: any) => {
                if (!val) return [];
                if (Array.isArray(val)) return val;
                try {
                    return JSON.parse(val);
                } catch (e) {
                    return [];
                }
            };

            setFormData({
                price: initialData.price || 0,
                time: initialData.time || "",
                templeId: initialData.templeId || "",
                category_en: initialData.category_en || initialData.category || "",
                category_hi: initialData.category_hi || "",
                category_mr: initialData.category_mr || "",
                name: {
                    en: initialData.name_en || initialData.name || "",
                    hi: initialData.name_hi || "",
                    mr: initialData.name_mr || ""
                },
                about: {
                    en: initialData.about_en || initialData.about || "",
                    hi: initialData.about_hi || "",
                    mr: initialData.about_mr || ""
                },
                duration: {
                    en: initialData.duration_en || initialData.duration || "",
                    hi: initialData.duration_hi || "",
                    mr: initialData.duration_mr || ""
                },
                benefits: {
                    en: parseArray(initialData.benefits_en || initialData.benefits),
                    hi: parseArray(initialData.benefits_hi),
                    mr: parseArray(initialData.benefits_mr)
                },
                description: {
                    en: parseArray(initialData.description_en || initialData.description),
                    hi: parseArray(initialData.description_hi),
                    mr: parseArray(initialData.description_mr)
                },
                bullets: {
                    en: parseArray(initialData.bullets_en || initialData.bullets),
                    hi: parseArray(initialData.bullets_hi),
                    mr: parseArray(initialData.bullets_mr)
                }
            });

            const parseLocalizedJson = (val: any) => {
                if (!val) return { en: [], hi: [], mr: [] };
                if (Array.isArray(val)) return { en: val, hi: [], mr: [] };
                if (typeof val === 'string') {
                    try {
                        const parsed = JSON.parse(val);
                        if (Array.isArray(parsed)) return { en: parsed, hi: [], mr: [] };
                        return { en: parsed.en || [], hi: parsed.hi || [], mr: parsed.mr || [] };
                    } catch { return { en: [], hi: [], mr: [] }; }
                }
                return { en: val.en || [], hi: val.hi || [], mr: val.mr || [] };
            };

            setPackages(parseLocalizedJson(initialData.packages));
            setFaqs(parseLocalizedJson(initialData.faqs));
            setProcessSteps(parseLocalizedJson(initialData.processSteps));

            if (initialData.image) {
                const imageUrl = initialData.image.startsWith('http')
                    ? initialData.image
                    : `${API_URL.replace('/api', '')}${initialData.image}`;
                setImagePreview(imageUrl);
            }
        } else if (mode === "create") {
            if (temples.length > 0) {
                setFormData(prev => ({ ...prev, templeId: temples[0].id }));
            }
        }
    }, [mode, initialData, temples]);

    // Handlers
    const handleInputChange = (field: string, value: any, lang?: Language) => {
        if (lang) {
            setFormData(prev => ({
                ...prev,
                [field]: { ...(prev[field as keyof typeof formData] as any), [lang]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleArrayChange = (field: 'benefits' | 'description' | 'bullets', lang: Language, index: number, value: string) => {
        setFormData(prev => {
            const currentLangArray = [...(prev[field][lang] || [])];
            currentLangArray[index] = value;
            return {
                ...prev,
                [field]: { ...prev[field], [lang]: currentLangArray }
            };
        });
    };

    const addArrayItem = (field: 'benefits' | 'description' | 'bullets', lang: Language) => {
        setFormData(prev => {
            const currentLangArray = [...(prev[field][lang] || [])];
            return {
                ...prev,
                [field]: { ...prev[field], [lang]: [...currentLangArray, ""] }
            };
        });
    };

    const removeArrayItem = (field: 'benefits' | 'description' | 'bullets', lang: Language, index: number) => {
        setFormData(prev => {
            const currentLangArray = (prev[field][lang] || []).filter((_: any, i: number) => i !== index);
            return {
                ...prev,
                [field]: { ...prev[field], [lang]: currentLangArray }
            };
        });
    };

    // Packages
    const togglePackage = (ptype: any, lang: Language) => {
        const langPackages = packages[lang] || [];
        const isSelected = langPackages.some((p: any) => p.name === ptype.name);
        if (isSelected) {
            setPackages({ ...packages, [lang]: langPackages.filter((p: any) => p.name !== ptype.name) });
        } else {
            setPackages({ ...packages, [lang]: [...langPackages, { ...ptype, price: (ptype.name === "Single" && lang === 'en') ? formData.price : 0 }] });
        }
    };

    const updatePackage = (index: number, field: string, value: any, lang: Language) => {
        const langPackages = [...(packages[lang] || [])];
        langPackages[index] = { ...langPackages[index], [field]: value };
        setPackages({ ...packages, [lang]: langPackages });

        if (langPackages[index].name === "Single" && field === 'price' && lang === 'en') {
            setFormData(prev => ({ ...prev, price: value }));
        }
    };

    const addProcessStep = (lang: Language) => {
        setProcessSteps({ ...processSteps, [lang]: [...(processSteps[lang] || []), { title: "", description: "" }] });
    };

    const removeProcessStep = (index: number, lang: Language) => {
        const langSteps = (processSteps[lang] || []).filter((_: any, i: number) => i !== index);
        setProcessSteps({ ...processSteps, [lang]: langSteps });
    };

    const updateProcessStep = (index: number, field: 'title' | 'description', value: string, lang: Language) => {
        const langSteps = [...(processSteps[lang] || [])];
        langSteps[index] = { ...langSteps[index], [field]: value };
        setProcessSteps({ ...processSteps, [lang]: langSteps });
    };

    const addFaq = (lang: Language) => {
        setFaqs({ ...faqs, [lang]: [...(faqs[lang] || []), { q: "", a: "" }] });
    };

    const removeFaq = (index: number, lang: Language) => {
        const langFaqs = (faqs[lang] || []).filter((_: any, i: number) => i !== index);
        setFaqs({ ...faqs, [lang]: langFaqs });
    };

    const updateFaq = (index: number, field: 'q' | 'a', value: string, lang: Language) => {
        const langFaqs = [...(faqs[lang] || [])];
        langFaqs[index] = { ...langFaqs[index], [field]: value };
        setFaqs({ ...faqs, [lang]: langFaqs });
    };

    // Image Handlers
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedFile: File) => {
        setImageFile(croppedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
            setShowCropper(false);
            setTempImage(null);
        };
        reader.readAsDataURL(croppedFile);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();

        // Basic fields
        fd.append("price", formData.price.toString());
        fd.append("time", formData.time);
        fd.append("isMaster", isMaster.toString());
        fd.append("templeId", isMaster ? "null" : formData.templeId);

        // Localized Fields
        Object.entries(formData.name).forEach(([lang, val]) => fd.append(`name_${lang}`, val));
        Object.entries(formData.about).forEach(([lang, val]) => fd.append(`about_${lang}`, val));
        Object.entries(formData.duration).forEach(([lang, val]) => fd.append(`duration_${lang}`, val));

        // Categories
        fd.append("category_en", formData.category_en);
        fd.append("category_hi", formData.category_hi);
        fd.append("category_mr", formData.category_mr);

        // Arrays
        fd.append("benefits_en", JSON.stringify(formData.benefits.en));
        fd.append("benefits_hi", JSON.stringify(formData.benefits.hi));
        fd.append("benefits_mr", JSON.stringify(formData.benefits.mr));

        fd.append("description_en", JSON.stringify(formData.description.en));
        fd.append("description_hi", JSON.stringify(formData.description.hi));
        fd.append("description_mr", JSON.stringify(formData.description.mr));

        fd.append("bullets_en", JSON.stringify(formData.bullets.en));
        fd.append("bullets_hi", JSON.stringify(formData.bullets.hi));
        fd.append("bullets_mr", JSON.stringify(formData.bullets.mr));

        // JSON Fields
        fd.append("packages", JSON.stringify(packages));
        fd.append("faqs", JSON.stringify(faqs));
        fd.append("processSteps", JSON.stringify(processSteps));

        if (imageFile) fd.append("image", imageFile);

        await onSubmit(fd);
    };


    return (
        <Tabs value={language} onValueChange={(v) => setLanguage(v as Language)} className="w-full">
            <TabsList className="mb-8 grid w-full max-w-md grid-cols-3 bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="en" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
                    English (EN)
                </TabsTrigger>
                <TabsTrigger value="hi" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
                    हिंदी (HI)
                </TabsTrigger>
                <TabsTrigger value="mr" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">
                    मराठी (MR)
                </TabsTrigger>
            </TabsList>

            <form onSubmit={handleFormSubmit} className="space-y-10">
                {/* Multilingual Contents */}
                {["en", "hi", "mr"].map((lang) => (
                    <TabsContent key={lang} value={lang} className="space-y-10 mt-0 outline-none">
                        
                        {/* 1. Master Pooja Template Toggle */}
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center gap-4 transition-all">
                            <Switch
                                id={`master-${lang}`}
                                checked={isMaster}
                                onCheckedChange={setIsMaster}
                                className="data-[state=checked]:bg-primary"
                            />
                            <div className="space-y-0.5">
                                <Label htmlFor={`master-${lang}`} className="text-sm font-bold text-blue-900 cursor-pointer">
                                    {t('admin_pooja_form.labels.is_master')}
                                </Label>
                                <p className="text-[11px] text-blue-600/80 font-medium">{t('admin_pooja_form.help.is_master')}</p>
                            </div>
                        </div>

                        {/* 2. Identity & Core Settings Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Row 1: Name & Temple */}
                            <div className="space-y-2.5">
                                <Label className="text-sm font-bold text-slate-700">{t('admin_pooja_form.labels.name')} <span className="text-destructive">*</span></Label>
                                <Input
                                    placeholder={t('admin_pooja_form.placeholders.name')}
                                    value={(formData.name as any)[lang]}
                                    onChange={e => handleInputChange("name", e.target.value, lang as Language)}
                                    className="h-12 rounded-xl focus:ring-primary/20 border-slate-200 bg-white"
                                    required={lang === 'en'}
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-sm font-bold text-slate-700">{t('admin_pooja_form.labels.assigned_temple')} <span className="text-destructive">*</span></Label>
                                <select
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50 transition-all font-medium"
                                    value={formData.templeId}
                                    onChange={e => handleInputChange("templeId", e.target.value)}
                                    disabled={isMaster}
                                    required={!isMaster}
                                >
                                    <option value="">{isMaster ? t('admin_pooja_form.placeholders.not_applicable') : t('admin_pooja_form.placeholders.select_temple')}</option>
                                    {temples.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t[`name_${lang}`] || t.name_en || t.name || 'Unnamed'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Row 2: Category & Price */}
                            <div className="space-y-2.5">
                                <Label className="text-sm font-bold text-slate-700">{t('admin_pooja_form.labels.category')} <span className="text-destructive">*</span></Label>
                                <Popover>
                                    <PopoverTrigger asChild>     
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                "w-full justify-between h-12 px-4 rounded-xl border border-slate-200 bg-white hover:bg-white",
                                                !formData[`category_${lang}` as keyof typeof formData] && "text-muted-foreground"
                                            )}
                                        >
                                            <div className="flex flex-wrap gap-1">
                                                {formData[`category_${lang}` as keyof typeof formData] ? (
                                                    (formData[`category_${lang}` as keyof typeof formData] as string).split(', ').map((cat) => (
                                                        <Badge key={cat} variant="secondary" className="mr-1">
                                                            {cat}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    t('admin_pooja_form.placeholders.category')
                                                )}
                                            </div>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                            <CommandInput placeholder={t('admin_pooja_form.placeholders.search_category')} />
                                            <CommandList>
                                                <CommandEmpty>No category found.</CommandEmpty>
                                                <CommandGroup>
                                                    {availableCategories.map((category) => {
                                                        const catName = category[`name_${lang}`] || category.name_en || category.name;
                                                        const selectedArr = formData[`category_${lang}` as keyof typeof formData]
                                                            ? (formData[`category_${lang}` as keyof typeof formData] as string).split(', ')
                                                            : [];
                                                        const isSelected = selectedArr.includes(catName);
                                                        return (
                                                            <CommandItem
                                                                key={category.id}
                                                                value={catName}
                                                                onSelect={() => {
                                                                    let newArr = [...selectedArr];
                                                                    if (isSelected) {
                                                                        newArr = newArr.filter(c => c !== catName);
                                                                    } else {
                                                                        newArr.push(catName);
                                                                    }
                                                                    handleInputChange(`category_${lang}`, newArr.join(', '));
                                                                }}
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                                                                {catName}
                                                            </CommandItem>
                                                        );
                                                    })}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-sm font-bold text-slate-700">{t('admin_pooja_form.labels.price')} <span className="text-destructive">*</span></Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <Input
                                        type="number"
                                        value={formData.price}
                                        onChange={e => {
                                            const p = parseInt(e.target.value) || 0;
                                            handleInputChange("price", p);
                                            const newPkgs = [...packages];
                                            const singleIdx = newPkgs.findIndex(pkg => pkg.name === "Single");
                                            if (singleIdx > -1) newPkgs[singleIdx].price = p;
                                            else newPkgs.push({ name: "Single", description: "For 1 person", price: p });
                                            setPackages(newPkgs);
                                        }}
                                        className="pl-8 h-12 rounded-xl focus:ring-primary/20 border-slate-200 bg-white font-bold"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. About Section */}
                        <div className="space-y-2.5">
                            <Label className="text-sm font-bold text-slate-700">{t('admin_pooja_form.labels.about')}</Label>
                            <Textarea
                                placeholder={t('admin_pooja_form.placeholders.about')}
                                value={(formData.about as any)[lang]}
                                onChange={e => handleInputChange("about", e.target.value, lang as Language)}
                                className="min-h-[120px] rounded-2xl focus:ring-primary/20 border-slate-200 bg-white resize-none p-4"
                            />
                        </div>

                        {/* 5. Benefits Section */}
                        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-bold text-slate-800">{t('admin_pooja_form.labels.benefits')}</Label>
                                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('benefits', lang as Language)} className="h-9 px-4 rounded-lg bg-orange-50/50 border-orange-100 text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-bold text-xs ring-offset-white transition-colors">
                                    <Plus className="w-3.5 h-3.5 mr-2" /> {t('common.add')} Benefit
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(formData.benefits as any)[lang].map((item: string, idx: number) => (
                                    <div key={idx} className="flex gap-2 group relative">
                                        <Input
                                            value={item}
                                            onChange={e => handleArrayChange('benefits', lang as Language, idx, e.target.value)}
                                            placeholder={`${t('admin_pooja_form.labels.benefit')} ${idx + 1}...`}
                                            className="h-11 rounded-xl bg-slate-50/50 border-slate-200 pr-10"
                                        />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem('benefits', lang as Language, idx)} className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                    </div>

                    {/* Packages Section */}
                    <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
                        <Label className="text-sm font-bold text-slate-800">Pooja Packages</Label>
                        
                        <div className="space-y-4">
                            <Label className="text-xs font-bold text-slate-500 uppercase">{t('admin_pooja_form.labels.select_tier')}</Label>
                            <div className="flex flex-wrap gap-2">
                                {STATIC_PACKAGE_TYPES.map((ptype) => {
                                    const langPackages = packages[lang as Language] || [];
                                    const isSelected = langPackages.some((p: any) => p.name === ptype.name);
                                    return (
                                        <Button
                                            key={ptype.name}
                                            type="button"
                                            variant={isSelected ? "default" : "outline"}
                                            onClick={() => togglePackage(ptype, lang as Language)}
                                            className={`rounded-full px-6 h-[34px] text-xs font-bold transition-all ${isSelected ? 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100' : 'bg-orange-50/50 text-slate-600 border-orange-100 hover:bg-orange-50 hover:text-orange-700'}`}
                                        >
                                            <Plus className={`w-3.5 h-3.5 mr-1.5 ${isSelected ? 'rotate-45' : ''} transition-transform`} /> {ptype.name}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="min-h-[100px] border border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50/50">
                            {(!packages[lang as Language] || packages[lang as Language].length === 0) ? (
                                <p className="text-xs text-slate-400 font-medium">Select at least one package above to set its price</p>
                            ) : (
                                <div className="w-full p-4 grid grid-cols-1 gap-4">
                                    {(packages[lang as Language] || []).map((pkg: any, idx: number) => (
                                        <div key={pkg.name} className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-slate-100 rounded-xl relative group shadow-sm">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => togglePackage(pkg, lang as Language)}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-red-50 hover:bg-red-100"
                                            >
                                                <X className="w-3.5 h-3.5 text-red-500" />
                                            </Button>
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                                                <div className="md:col-span-3 space-y-1.5">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('admin_pooja_form.labels.tier_type')}</Label>
                                                    <div className="h-10 flex items-center px-3 bg-slate-50/50 rounded-lg border border-slate-100 text-xs font-bold text-slate-700">
                                                        {pkg.name}
                                                    </div>
                                                </div>
                                                <div className="md:col-span-3 space-y-1.5">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('admin_pooja_form.labels.tier_price')}</Label>
                                                    <Input
                                                        type="number"
                                                        value={pkg.price}
                                                        onChange={e => updatePackage(idx, 'price', parseInt(e.target.value) || 0, lang as Language)}
                                                        className="h-10 bg-white rounded-lg border-slate-200 font-bold text-sm"
                                                    />
                                                </div>
                                                <div className="md:col-span-6 space-y-1.5">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('admin_pooja_form.labels.tier_note')}</Label>
                                                    <Input
                                                        value={pkg.description}
                                                        onChange={e => updatePackage(idx, 'description', e.target.value, lang as Language)}
                                                        placeholder={t('admin_pooja_form.placeholders.tier_note')}
                                                        className="h-10 bg-white rounded-lg border-slate-200 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ritual Process Steps */}
                    <div className="bg-card border rounded-xl p-8 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <ArrowRight className="w-5 h-5" />
                                <h2 className="text-xl">{t('admin_pooja_form.sections.ritual')}</h2>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => addProcessStep(lang as Language)} className="rounded-xl px-6">
                                <Plus className="w-4 h-4 mr-2" /> {t('common.add_step')}
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {(processSteps[lang as Language] || []).map((step: any, idx: number) => (
                                <div key={idx} className="flex flex-col md:flex-row gap-4 p-6 bg-slate-50/50 border rounded-2xl relative group">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                        {idx + 1}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeProcessStep(idx, lang as Language)}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4 text-destructive" />
                                    </Button>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-1 space-y-2">
                                            <Label className="text-xs font-bold text-slate-500 uppercase">{t('admin_pooja_form.labels.step_title')}</Label>
                                            <Input
                                                value={step.title}
                                                onChange={e => updateProcessStep(idx, 'title', e.target.value, lang as Language)}
                                                placeholder={t('admin_pooja_form.placeholders.step_title')}
                                                className="bg-white rounded-xl h-11"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label className="text-xs font-bold text-slate-500 uppercase">{t('admin_pooja_form.labels.step_desc')}</Label>
                                            <Input
                                                value={step.description}
                                                onChange={e => updateProcessStep(idx, 'description', e.target.value, lang as Language)}
                                                placeholder={t('admin_pooja_form.placeholders.step_desc')}
                                                className="bg-white rounded-xl h-11"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQs */}
                    <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold text-slate-800">Frequently Asked Questions</Label>
                            <Button type="button" variant="outline" size="sm" onClick={() => addFaq(lang as Language)} className="h-9 px-4 rounded-lg bg-orange-50/50 border-orange-100 text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-bold text-xs ring-offset-white transition-colors">
                                <Plus className="w-3.5 h-3.5 mr-2" /> Add FAQ
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {(faqs[lang as Language] || []).map((faq: any, idx: number) => (
                                <div key={idx} className="p-4 bg-slate-50/50 border rounded-xl relative group space-y-4 shadow-sm">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeFaq(idx, lang as Language)}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-red-50 hover:bg-red-100"
                                    >
                                        <X className="w-3.5 h-3.5 text-red-500" />
                                    </Button>
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('admin_pooja_form.labels.faq_q')}</Label>
                                            <Input
                                                value={faq.q}
                                                onChange={e => updateFaq(idx, 'q', e.target.value, lang as Language)}
                                                placeholder={t('admin_pooja_form.placeholders.faq_q')}
                                                className="h-10 bg-white rounded-lg border-slate-200 font-medium text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('admin_pooja_form.labels.faq_a')}</Label>
                                            <Textarea
                                                value={faq.a}
                                                onChange={e => updateFaq(idx, 'a', e.target.value, lang as Language)}
                                                placeholder={t('admin_pooja_form.placeholders.faq_a')}
                                                className="min-h-[80px] bg-white rounded-lg border-slate-200 resize-none pr-10 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            ))}

            {/* Service Image Section (Global) */}
            <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
                <Label className="text-sm font-bold text-slate-800 uppercase tracking-wider">Pooja Media Asset</Label>
                <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed">
                    <div className="w-full md:w-48 aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-center overflow-hidden relative group cursor-pointer shadow-sm">
                        {imagePreview ? (
                            <>
                                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Upload className="w-6 h-6 text-white" />
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-slate-300">
                                <Upload className="w-8 h-8" />
                            </div>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <h3 className="font-bold text-slate-800 text-sm">Upload a high-quality image</h3>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                            JPG, PNG or WEBP. Max 5MB. Aspect Ratio: 16:9 (1280x720 px)
                        </p>
                    </div>
                </div>
            </div>

                {/* Final Actions */}
                <div className="flex justify-end pt-8 pb-12 gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => window.history.back()}
                        className="px-8 rounded-full font-bold h-12 text-slate-500 hover:text-slate-700"
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="px-12 rounded-full font-bold h-12 shadow-lg shadow-primary/20 hover:scale-105 transition-all text-lg"
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin mr-2">◌</span>
                                {t('common.processing')}
                            </>
                        ) : (
                            mode === "create" ? t('admin_pooja_form.actions.create') : t('admin_pooja_form.actions.update')
                        )}
                    </Button>
                </div>

                {showCropper && tempImage && (
                    <ImageCropper
                        image={tempImage}
                        onCropComplete={handleCropComplete}
                        onCancel={() => setShowCropper(false)}
                        initialAspect={16 / 9}
                        lockAspect={true}
                        title={t('admin_pooja_form.crop_modal.title')}
                    />
                )}
            </form>
        </Tabs>
    );
};
