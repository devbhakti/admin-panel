"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit2, MapPin, Clock, IndianRupee, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchAllPoojasAdmin } from "@/api/adminController";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/config/apiConfig";
import { useLanguage, Language } from "@/context/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseLocalizedValue } from "@/utils/textUtils";
import { Languages } from "lucide-react";

export default function ViewPoojaPage() {
    const router = useRouter();
    const params = useParams();
    const poojaId = params.id as string;
    const { toast } = useToast();
    const { language, setLanguage } = useLanguage();
    const [pooja, setPooja] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPooja();
    }, []);

    const loadPooja = async () => {
        setIsLoading(true);
        try {
            const poojasData = await fetchAllPoojasAdmin({ lang: 'raw' });
            const foundPooja = poojasData.find((p: any) => p.id === poojaId);

            if (foundPooja) {
                setPooja(foundPooja);
                // Update breadcrumb with pooja name
                const displayName = parseLocalizedValue(foundPooja.name, 'en') || "Pooja Details";
                window.dispatchEvent(new CustomEvent('updateBreadcrumb', { detail: displayName }));
            } else {
                toast({
                    title: "Error",
                    description: "Pooja not found",
                    variant: "destructive"
                });
                router.push('/admin/poojas');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load pooja",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getImageUrl = (path: string) => {
        if (!path) return "https://via.placeholder.com/400";
        if (path.startsWith('http')) return path;
        return `${API_URL.replace('/api', '')}${path}`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!pooja) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{parseLocalizedValue(pooja.name, language)}</h1>
                        <p className="text-muted-foreground">Pooja Details</p>
                    </div>
                </div>
                <Button onClick={() => router.push(`/admin/poojas/edit/${poojaId}`)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Pooja
                </Button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Image & Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Image */}
                    <div className="aspect-square rounded-xl overflow-hidden border bg-muted shadow-sm">
                        <img
                            src={getImageUrl(pooja.image)}
                            alt={parseLocalizedValue(pooja.name, language)}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Quick Info Card */}
                    <div className="bg-card border rounded-lg p-6 space-y-4">
                        <h3 className="font-semibold text-lg">Quick Info</h3>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <IndianRupee className="w-4 h-4 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Base Price</p>
                                    <p className="font-semibold">₹{pooja.price}</p>
                                </div>
                            </div>

                            {/* <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Duration</p>
                                    <p className="font-semibold">{pooja.duration}</p>
                                </div>
                            </div> */}

                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Time</p>
                                    <p className="font-semibold">{pooja.time}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Temple</p>
                                    <p className="font-semibold">{parseLocalizedValue(pooja.temple?.name, language) || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t">
                            <p className="text-xs text-muted-foreground mb-2">Category</p>
                            <Badge variant="outline" className="bg-slate-50">
                                {parseLocalizedValue(pooja.category, language)}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Right Column - Detailed Info with Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs value={language} onValueChange={(v) => setLanguage(v as Language)} className="w-full">
                        <div className="flex items-center justify-between mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 px-2 text-slate-500 font-bold text-sm">
                                <Languages className="w-4 h-4" /> Localized Content View
                            </div>
                            <TabsList className="bg-white border">
                                <TabsTrigger value="en">English</TabsTrigger>
                                <TabsTrigger value="hi">हिंदी</TabsTrigger>
                                <TabsTrigger value="mr">मराठी</TabsTrigger>
                            </TabsList>
                        </div>

                        {(['en', 'hi', 'mr'] as Language[]).map((l) => (
                            <TabsContent key={l} value={l} className="space-y-6 mt-0">
                                {/* Pooja Name Override in Content Area */}
                                <div className="bg-card border rounded-lg p-6 bg-gradient-to-r from-blue-50/30 to-transparent">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Display Name ({l.toUpperCase()})</h3>
                                    <h2 className="text-2xl font-bold text-slate-800">{parseLocalizedValue(pooja.name, l)}</h2>
                                </div>

                                {/* About */}
                                {parseLocalizedValue(pooja.about, l) !== "N/A" && (
                                    <div className="bg-card border rounded-lg p-6 shadow-sm">
                                        <h3 className="font-semibold text-lg mb-3">About</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {parseLocalizedValue(pooja.about, l)}
                                        </p>
                                    </div>
                                )}

                                {/* FAQs in this language */}
                                <div className="bg-card border rounded-lg p-6 shadow-sm">
                                    <h3 className="font-semibold text-lg mb-4">Frequently Asked Questions</h3>
                                    {pooja.faqs && pooja.faqs[l] && pooja.faqs[l].length > 0 ? (
                                        <div className="space-y-4">
                                            {pooja.faqs[l].map((faq: any, index: number) => (
                                                <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                                                    <h4 className="font-semibold text-sm mb-2">{parseLocalizedValue(faq.q)}</h4>
                                                    <p className="text-sm text-muted-foreground">{parseLocalizedValue(faq.a)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">No FAQs provided for this language.</p>
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>

                    {/* Common Content (Not translated) */}
                    <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <h3 className="font-semibold text-lg mb-4">Packages (Common)</h3>
                        {pooja.packages && pooja.packages.en && pooja.packages.en.length > 0 ? (
                            <div className="grid gap-4">
                                {pooja.packages.en.map((pkg: any, index: number) => (
                                    <div key={index} className="border rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{parseLocalizedValue(pkg.name)}</h4>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {parseLocalizedValue(pkg.description)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary text-lg">₹{pkg.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">No packages defined.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
