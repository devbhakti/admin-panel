"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Plus,
    Trash2,
    Package,
    Save,
    X,
    Upload,
    Image as ImageIcon,
    Layers,
    Info,
    CheckCircle2,
    Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage, Language } from "@/context/LanguageContext";
import { fetchCategories, createSellerProduct } from "@/api/sellerController";
import { ImageCropper } from "@/components/ImageCropper";


interface Variant {
    id: string;
    name_en: string;
    name_hi: string;
    name_mr: string;
    price: number;
    stock: number;
    image?: string | null;
    imageFile?: File | null;
    imagePreview?: string;
}



export default function CreateSellerProductPage() {
    const { t } = useLanguage();
    // Local language tab — independent of global app language
    const [activeFormLang, setActiveFormLang] = useState<Language>("en");
    const router = useRouter();
    const { toast } = useToast();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [productImage, setProductImage] = useState<File | null>(null);
    const [productImagePreview, setProductImagePreview] = useState<string>("");

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setIsLoadingCategories(true);
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (error) {
            console.error("Load Categories Error:", error);
            setCategories([]);
        } finally {
            setIsLoadingCategories(false);
        }
    };

    const [formData, setFormData] = useState({
        name_en: "",
        name_hi: "",
        name_mr: "",
        description_en: "",
        description_hi: "",
        description_mr: "",
        category: "",
        highlights_en: "",
        highlights_hi: "",
        highlights_mr: "",
        longDescription_en: "",
        longDescription_hi: "",
        longDescription_mr: "",
        shippingInfo_en: "Ships in 24-48 Hours",
        shippingInfo_hi: "24-48 घंटों में शिप होगा",
        shippingInfo_mr: "24-48 तासात शिप होईल",
        origin_en: "India",
        origin_hi: "भारत",
        origin_mr: "भारत",
        rating: "4.5",
        weight: "",
        length: "",
        width: "",
        height: "",
    });

    const [variants, setVariants] = useState<Variant[]>([
        { id: "1", name_en: "", name_hi: "", name_mr: "", price: 0, stock: 0, imageFile: null, imagePreview: "" }
    ]);

    // Cropper State
    const [croppingImage, setCroppingImage] = useState<string | null>(null);
    const [cropType, setCropType] = useState<{ type: 'product' | 'variant', id?: string } | null>(null);


    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast({ title: "Invalid File", description: "Please select an image file", variant: "destructive" });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setCroppingImage(reader.result as string);
                setCropType({ type: 'product' });
            };
            reader.readAsDataURL(file);
        }
    };


    const removeProductImage = () => {
        setProductImage(null);
        setProductImagePreview("");
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name_en.trim()) newErrors.name = "English product name is required";
        if (!formData.description_en.trim()) newErrors.description = "English description is required";
        if (!formData.category) newErrors.category = "Category is required";

        const validVariants = variants.filter(v => v.name_en.trim() && v.price > 0);
        if (validVariants.length === 0) newErrors.variants = "At least one valid variant is required";

        validVariants.forEach((variant, index) => {
            if (!variant.name_en.trim()) newErrors[`variant_name_${index}`] = "English variant name is required";
            if (variant.price <= 0) newErrors[`variant_price_${index}`] = "Price must be greater than 0";
            if (variant.stock < 0) newErrors[`variant_stock_${index}`] = "Stock cannot be negative";
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast({ title: "Validation Error", description: "Please fill all required fields correctly", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const fd = new FormData();
            
            // Basic localized fields
            fd.append("name_en", formData.name_en);
            fd.append("name_hi", formData.name_hi);
            fd.append("name_mr", formData.name_mr);
            
            fd.append("description_en", formData.description_en);
            fd.append("description_hi", formData.description_hi);
            fd.append("description_mr", formData.description_mr);
            
            fd.append("origin_en", formData.origin_en);
            fd.append("origin_hi", formData.origin_hi);
            fd.append("origin_mr", formData.origin_mr);
            
            fd.append("shippingInfo_en", formData.shippingInfo_en);
            fd.append("shippingInfo_hi", formData.shippingInfo_hi);
            fd.append("shippingInfo_mr", formData.shippingInfo_mr);
            
            fd.append("highlights_en", formData.highlights_en);
            fd.append("highlights_hi", formData.highlights_hi);
            fd.append("highlights_mr", formData.highlights_mr);
            
            fd.append("longDescription_en", formData.longDescription_en);
            fd.append("longDescription_hi", formData.longDescription_hi);
            fd.append("longDescription_mr", formData.longDescription_mr);

            fd.append("category", formData.category);
            fd.append("rating", formData.rating);
            fd.append("weight", formData.weight);
            fd.append("length", formData.length);
            fd.append("width", formData.width);
            fd.append("height", formData.height);

            const variantsData = variants.filter(v => v.name_en.trim() && v.price > 0).map((v, index) => {
                if (v.imageFile) {
                    fd.append(`variant_image_${index}`, v.imageFile);
                }
                return {
                    name_en: v.name_en,
                    name_hi: v.name_hi,
                    name_mr: v.name_mr,
                    price: v.price,
                    stock: v.stock,
                    image: v.imageFile ? null : (v.imagePreview || null)
                };
            });
            fd.append("variants", JSON.stringify(variantsData));

            if (productImage) {
                fd.append("image", productImage);
            }

            const response = await createSellerProduct(fd);
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Product created successfully and sent for approval.",
                });
                router.push("/seller/dashboard/products");
            }
        } catch (error: any) {
            console.error("Create Product Error:", error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create product",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const addVariant = () => {
        setVariants([...variants, { id: Date.now().toString(), name_en: "", name_hi: "", name_mr: "", price: 0, stock: 0, imageFile: null, imagePreview: "" }]);
    };

    const removeVariant = (id: string) => {
        if (variants.length > 1) setVariants(variants.filter(v => v.id !== id));
    };

    const updateVariant = (id: string, field: keyof Variant, value: string | number) => {
        setVariants(variants.map(variant =>
            variant.id === id ? { ...variant, [field]: field === 'price' || field === 'stock' ? Number(value) : value } : variant
        ));
    };

    const handleVariantImageChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast({ title: "Invalid File", description: "Please select an image file", variant: "destructive" });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setCroppingImage(reader.result as string);
                setCropType({ type: 'variant', id });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedFile: File) => {
        if (!cropType) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            if (cropType.type === 'product') {
                setProductImage(croppedFile);
                setProductImagePreview(reader.result as string);
            } else if (cropType.type === 'variant' && cropType.id) {
                setVariants(variants.map(v =>
                    v.id === cropType.id ? { ...v, imageFile: croppedFile, imagePreview: reader.result as string } : v
                ));
            }
            setCroppingImage(null);
            setCropType(null);
        };
        reader.readAsDataURL(croppedFile);
    };

    const removeVariantImage = (id: string) => {
        setVariants(variants.map(variant =>
            variant.id === id ? { ...variant, imageFile: null, imagePreview: "" } : variant
        ));
    };


    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Add New Product</h1>
                    <p className="text-muted-foreground">Add a new product to your seller store</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs value={activeFormLang} onValueChange={(v) => setActiveFormLang(v as Language)} className="w-full">
                    <TabsList className="mb-6 grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="en">English (EN)</TabsTrigger>
                        <TabsTrigger value="hi">हिंदी (HI)</TabsTrigger>
                        <TabsTrigger value="mr">मराठी (MR)</TabsTrigger>
                    </TabsList>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {["en", "hi", "mr"].map((lang) => (
                                <TabsContent key={lang} value={lang} className="space-y-6 mt-0">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Package className="w-5 h-5" />
                                                Basic Information ({lang.toUpperCase()})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`name_${lang}`}>Product Name ({lang.toUpperCase()}) *</Label>
                                                    <Input 
                                                        id={`name_${lang}`} 
                                                        value={(formData as any)[`name_${lang}`]} 
                                                        onChange={(e) => setFormData({ ...formData, [`name_${lang}`]: e.target.value })} 
                                                        placeholder="Enter product name" 
                                                        className={errors.name && lang === 'en' ? "border-red-500" : ""} 
                                                        required={lang === 'en'}
                                                    />
                                                    {errors.name && lang === 'en' && <p className="text-sm text-red-500">{errors.name}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="category">Category *</Label>
                                                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                                        <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map((category) => (
                                                                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`description_${lang}`}>Brief Description ({lang.toUpperCase()}) *</Label>
                                                <Textarea 
                                                    id={`description_${lang}`} 
                                                    value={(formData as any)[`description_${lang}`]} 
                                                    onChange={(e) => setFormData({ ...formData, [`description_${lang}`]: e.target.value })} 
                                                    placeholder="Enter product description" 
                                                    rows={4} 
                                                    className={errors.description && lang === 'en' ? "border-red-500" : ""} 
                                                    required={lang === 'en'}
                                                />
                                                {errors.description && lang === 'en' && <p className="text-sm text-red-500">{errors.description}</p>}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`origin_${lang}`}>Origin ({lang.toUpperCase()})</Label>
                                                    <Input id={`origin_${lang}`} value={(formData as any)[`origin_${lang}`]} onChange={(e) => setFormData({ ...formData, [`origin_${lang}`]: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`shippingInfo_${lang}`}>Shipping Label ({lang.toUpperCase()})</Label>
                                                    <Input id={`shippingInfo_${lang}`} value={(formData as any)[`shippingInfo_${lang}`]} onChange={(e) => setFormData({ ...formData, [`shippingInfo_${lang}`]: e.target.value })} />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`highlights_${lang}`}>Highlights ({lang.toUpperCase()})</Label>
                                                <Textarea id={`highlights_${lang}`} value={(formData as any)[`highlights_${lang}`]} onChange={(e) => setFormData({ ...formData, [`highlights_${lang}`]: e.target.value })} rows={2} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            ))}

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5" />
                                        Media & Dimensions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Product Image</Label>
                                        <div className="flex items-center gap-4">
                                            {productImagePreview ? (
                                                <div className="relative">
                                                    <img src={productImagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border" />
                                                    <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={removeProductImage}>
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24 border-2 border-dashed border-input rounded-lg flex items-center justify-center">
                                                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <Input type="file" accept="image/*" onChange={handleProductImageChange} className="cursor-pointer" />
                                                <p className="text-[10px] font-semibold text-primary mt-1">Recommended: 800x800 px (Square)</p>
                                                <p className="text-[10px] text-muted-foreground">JPG, PNG, GIF up to 5MB</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="rating">Base Rating (1-5)</Label>
                                        <Input
                                            id="rating"
                                            type="number"
                                            step="0.1"
                                            min="1"
                                            max="5"
                                            value={formData.rating}
                                            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                            className="max-w-[150px]"
                                        />
                                    </div>

                                    <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900 space-y-4">
                                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                            <Truck className="w-5 h-5" />
                                            <h3 className="font-bold text-sm uppercase tracking-wider">Shiprocket Dimensions (Required)</h3>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="weight">Weight (kg) *</Label>
                                                <Input id="weight" type="number" step="0.01" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="0.5" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="length">Length (cm) *</Label>
                                                <Input id="length" type="number" value={formData.length} onChange={(e) => setFormData({ ...formData, length: e.target.value })} placeholder="10" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="width">Width (cm) *</Label>
                                                <Input id="width" type="number" value={formData.width} onChange={(e) => setFormData({ ...formData, width: e.target.value })} placeholder="10" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="height">Height (cm) *</Label>
                                                <Input id="height" type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} placeholder="10" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-blue-600/70 font-medium">Note: Exact dimensions help in accurate shipping charges.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Variants</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    {variants.map((variant, index) => (
                                        <div key={variant.id} className="p-4 border rounded-lg bg-card/50 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <Label className="font-semibold">Variant {index + 1}</Label>
                                                {variants.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(variant.id)} className="h-6 w-6 text-red-500"><Trash2 className="w-3 h-3" /></Button>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Variant Name ({activeFormLang.toUpperCase()}) *</Label>
                                                <Input 
                                                    placeholder="e.g. Small, Red, 100ml" 
                                                    value={(variant as any)[`name_${activeFormLang}`]} 
                                                    onChange={(e) => {
                                                        const newVariants = [...variants];
                                                        (newVariants[index] as any)[`name_${activeFormLang}`] = e.target.value;
                                                        setVariants(newVariants);
                                                    }} 
                                                />
                                                {errors[`variant_name_${index}`] && activeFormLang === 'en' && <p className="text-xs text-red-500">{errors[`variant_name_${index}`]}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Variant Image</Label>
                                                <div className="flex items-center gap-3">
                                                    {variant.imagePreview ? (
                                                        <div className="relative">
                                                            <img src={variant.imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-md border" />
                                                            <Button type="button" variant="destructive" size="icon" className="absolute -top-1 -right-1 h-5 w-5" onClick={() => removeVariantImage(variant.id)}>
                                                                <X className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="w-16 h-16 border-2 border-dashed border-input rounded-md flex items-center justify-center">
                                                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <Input type="file" accept="image/*" onChange={(e) => handleVariantImageChange(variant.id, e)} className="cursor-pointer text-xs" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-2">
                                                    <Label>Selling Price (₹) *</Label>
                                                    <Input type="number" step="0.01" placeholder="0.00" value={variant.price || ''} onChange={(e) => updateVariant(variant.id, 'price', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Stock Quantity *</Label>
                                                    <Input type="number" placeholder="0" value={variant.stock || ''} onChange={(e) => updateVariant(variant.id, 'stock', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={addVariant} className="w-full"><Plus className="w-4 h-4 mr-2" /> Add Variant</Button>
                                </CardContent>
                            </Card>
                            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary h-12 text-lg">{isSubmitting ? "Creating..." : "Create Product"}</Button>
                        </div>
                    </div>
                </Tabs>
            </form>
            {croppingImage && (
                <ImageCropper
                    image={croppingImage}
                    onCrop={handleCropComplete}
                    onClose={() => {
                        setCroppingImage(null);
                        setCropType(null);
                    }}
                />
            )}
        </div>
    );
}


