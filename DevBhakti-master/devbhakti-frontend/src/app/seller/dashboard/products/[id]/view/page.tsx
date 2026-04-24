"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Edit2,
    Package,
    IndianRupee,
    Store,
    Languages,
    ImageIcon,
    CheckCircle,
    Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchSellerProductById } from "@/api/sellerController";
import { useToast } from "@/hooks/use-toast";
import { BASE_URL } from "@/config/apiConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseLocalizedValue } from "@/utils/textUtils";
import { useLanguage, Language } from "@/context/LanguageContext";


export default function SellerViewProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    const { toast } = useToast();
    const { t } = useLanguage();
    // Local language tab — independent of global app language
    const [activeViewLang, setActiveViewLang] = useState<Language>("en");
    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        setIsLoading(true);
        try {
            const response = await fetchSellerProductById(productId, "raw");
            // Backend returns { success: true, data: product }
            const data = response?.data ?? response;
            if (data && data.id) {
                setProduct(data);
            } else {
                toast({
                    title: "Error",
                    description: "Product not found",
                    variant: "destructive",
                });
                router.push("/seller/dashboard/products");
            }
        } catch (error) {
            console.error("Failed to load product", error);
            toast({
                title: "Error",
                description: "Failed to load product",
                variant: "destructive",
            });
            router.push("/seller/dashboard/products");
        } finally {
            setIsLoading(false);
        }
    };

    const getImageUrl = (path: string) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return `${BASE_URL}${path}`;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <CheckCircle className="w-3 h-3 mr-1" /> Approved
                    </Badge>
                );
            case "pending":
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Pending Approval
                    </Badge>
                );
            default:
                return <Badge variant="destructive">Rejected</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/seller/dashboard/products")}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {parseLocalizedValue(product.name, activeViewLang)}
                        </h1>
                        <p className="text-muted-foreground text-sm">Product Details</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() =>
                            router.push(`/seller/dashboard/products/edit/${productId}`)
                        }
                    >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Product
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column – Image & Meta */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Product Image */}
                    <div className="aspect-square rounded-2xl overflow-hidden border bg-white shadow-sm flex items-center justify-center">
                        {product.image ? (
                            <img
                                src={getImageUrl(product.image)}
                                alt={parseLocalizedValue(product.name, activeViewLang)}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <Package className="w-20 h-20 text-slate-200" />
                        )}
                    </div>

                    {/* Basic Info Card */}
                    <div className="bg-white border rounded-2xl p-6 space-y-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 border-b pb-3">Basic Information</h3>

                        <div className="grid gap-5">
                            {/* Product ID */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <Package className="w-4 h-4 text-slate-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                                        Product ID
                                    </p>
                                    <p className="font-mono text-xs text-slate-600 break-all bg-slate-50 p-1.5 rounded border border-slate-100">
                                        {product.id}
                                    </p>
                                </div>
                            </div>

                            {/* Category */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <ImageIcon className="w-4 h-4 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                                        Category
                                    </p>
                                    <Badge variant="outline" className="font-medium">
                                        {parseLocalizedValue(product.categoryObj?.name, activeViewLang) ||
                                            parseLocalizedValue(product.category, activeViewLang) ||
                                            "General"}
                                    </Badge>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <CheckCircle className="w-4 h-4 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                                        Status
                                    </p>
                                    <div className="mt-1">{getStatusBadge(product.status)}</div>
                                </div>
                            </div>

                            {/* Origin */}
                            {product.origin && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg">
                                        <Store className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                                            Stock Origin
                                        </p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {parseLocalizedValue(product.origin, activeViewLang)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Shipping */}
                            {product.shippingInfo && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg">
                                        <IndianRupee className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                                            Shipping Info
                                        </p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {parseLocalizedValue(product.shippingInfo, activeViewLang)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column – Language Tabs & Variants */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs
                        value={activeViewLang}
                        onValueChange={(v) => setActiveViewLang(v as Language)}
                        className="w-full"
                    >
                        {/* Tab Header */}
                        <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-2xl border shadow-sm">
                            <div className="flex items-center gap-2 px-3 text-slate-500 font-bold text-xs uppercase tracking-widest">
                                <Languages className="w-4 h-4" /> Multi-Language View
                            </div>
                            <TabsList className="bg-slate-50 border">
                                <TabsTrigger
                                    value="en"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    English
                                </TabsTrigger>
                                <TabsTrigger
                                    value="hi"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    हिंदी
                                </TabsTrigger>
                                <TabsTrigger
                                    value="mr"
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    मराठी
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {(["en", "hi", "mr"] as Language[]).map((l) => (
                            <TabsContent
                                key={l}
                                value={l}
                                className="space-y-6 mt-0 animate-in fade-in-50 duration-300"
                            >
                                {/* Product Name */}
                                <div className="bg-white border rounded-2xl p-6 shadow-sm border-l-4 border-l-primary/30">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                        Product Display Name ({l.toUpperCase()})
                                    </h3>
                                    <h2 className="text-3xl font-bold text-slate-900">
                                        {parseLocalizedValue(product.name, l)}
                                    </h2>
                                </div>

                                {/* Description */}
                                <div className="bg-white border rounded-2xl p-8 shadow-sm">
                                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 border-b pb-4">
                                        Description ({l.toUpperCase()})
                                    </h3>
                                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                                        {parseLocalizedValue(product.description, l) || (
                                            <p className="italic text-slate-400">
                                                No description provided in{" "}
                                                {l === "en"
                                                    ? "English"
                                                    : l === "hi"
                                                    ? "Hindi"
                                                    : "Marathi"}
                                                .
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Highlights */}
                                {product.highlights && (
                                    <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-6 shadow-sm">
                                        <h3 className="font-bold text-amber-900 mb-2 border-b border-amber-200 pb-3">
                                            Features &amp; Highlights
                                        </h3>
                                        <p className="text-amber-800/80 text-sm leading-relaxed">
                                            {parseLocalizedValue(product.highlights, l)}
                                        </p>
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>

                    {/* Variants & Inventory */}
                    <div className="bg-white border rounded-2xl p-6 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-6 border-b pb-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-primary" />
                                Variants &amp; Inventory
                            </h3>
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                                {product.variants?.length ?? 0} Available Variants
                            </Badge>
                        </div>

                        <div className="grid gap-4">
                            {product.variants?.map((variant: any, idx: number) => (
                                <div
                                    key={variant.id || idx}
                                    className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border bg-slate-50/50 hover:bg-white transition-all hover:shadow-md border-slate-100"
                                >
                                    {/* Variant Image */}
                                    <div className="w-16 h-16 rounded-lg border bg-white flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {variant.image ? (
                                            <img
                                                src={getImageUrl(variant.image)}
                                                alt={parseLocalizedValue(variant.name, activeViewLang)}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-slate-300" />
                                        )}
                                    </div>

                                    {/* Variant Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900 truncate">
                                                    {parseLocalizedValue(variant.name, activeViewLang)}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        Stock:{" "}
                                                        <span
                                                            className={
                                                                variant.stock > 10
                                                                    ? "text-emerald-600 font-bold"
                                                                    : "text-amber-600 font-bold"
                                                            }
                                                        >
                                                            {variant.stock}
                                                        </span>
                                                    </span>
                                                    {variant.sku && (
                                                        <span className="border-l pl-3">
                                                            SKU:{" "}
                                                            <span className="text-slate-700">{variant.sku}</span>
                                                        </span>
                                                    )}
                                                    {variant.costPrice && (
                                                        <span className="border-l pl-3">
                                                            Cost:{" "}
                                                            <span className="text-slate-700">
                                                                ₹{variant.costPrice}
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Price & Profit */}
                                            <div className="flex items-center gap-6 md:text-right">
                                                {variant.costPrice && variant.price && (
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                            Profit
                                                        </span>
                                                        <span className="text-sm font-bold text-emerald-600">
                                                            ₹
                                                            {(
                                                                variant.price - variant.costPrice
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        Price
                                                    </span>
                                                    <span className="text-xl font-black text-primary">
                                                        ₹{variant.price}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
