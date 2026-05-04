"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit2, Clock, IndianRupee, Tag, Info, Loader2, Languages, Calendar, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchMyPoojas } from "@/api/templeAdminController";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/config/apiConfig";
import { parseLocalizedValue } from '@/utils/textUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ViewLanguage = 'en' | 'hi' | 'mr';

export default function TempleViewPoojaPage() {
    const router = useRouter();
    const params = useParams();
    const poojaId = params.id as string;
    const { toast } = useToast();
    const [pooja, setPooja] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewLanguage, setViewLanguage] = useState<ViewLanguage>('en');

    useEffect(() => {
        loadPooja();
    }, []);

    const loadPooja = async () => {
        setIsLoading(true);
        try {
            const response = await fetchMyPoojas();
            // The API returns { success: true, data: [...] } or just the array depending on environment/setup
            const poojasList = response.data || response || [];
            const found = Array.isArray(poojasList) ? poojasList.find((p: any) => p.id === poojaId) : null;

            if (found) {
                setPooja(found);
                // Update breadcrumb with pooja name
                window.dispatchEvent(new CustomEvent('updateBreadcrumb', { detail: parseLocalizedValue(found.name, 'en') || "Pooja Details" }));
            } else {
                toast({ title: "Error", description: "Pooja not found", variant: "destructive" });
                router.push('/temples/dashboard/poojas');
            }
        } catch (error: any) {
            console.error("Failed to load pooja:", error);
            toast({ 
                title: "Error", 
                description: "Failed to load pooja details", 
                variant: "destructive" 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getImageUrl = (path: string) => {
        if (!path) return "https://via.placeholder.com/800x400";
        if (path.startsWith('http')) return path;
        return `${API_URL.replace('/api', '')}${path}`;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 border-4 border-[#7b4623] border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground">Loading ritual profile...</p>
            </div>
        );
    }

    if (!pooja) return null;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 sm:px-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100 shrink-0">
                        <ArrowLeft className="w-5 h-5 text-[#7b4623]" />
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#7b4623]">{parseLocalizedValue(pooja.name, viewLanguage)}</h1>
                        <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                             Quick view of ritual details and pricing
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button 
                        onClick={() => router.push(`/temples/dashboard/poojas/edit/${pooja.id}`)} 
                        className="flex-1 sm:flex-none bg-[#7b4623] hover:bg-[#5d351a] text-white shadow-lg shadow-orange-900/20 rounded-xl px-6 h-11"
                    >
                        <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Image & Quick Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="aspect-[4/3] rounded-3xl overflow-hidden border bg-slate-50 shadow-sm">
                        <img
                            src={getImageUrl(pooja.image)}
                            alt={parseLocalizedValue(pooja.name, 'en')}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <Card className="rounded-2xl border-none bg-gradient-to-br from-[#7b4623] to-[#5d351a] text-white overflow-hidden relative shadow-lg">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Tag className="w-24 h-24 rotate-12" />
                        </div>
                        <CardContent className="p-6 space-y-6 relative z-10">
                            <div>
                                <p className="text-orange-200/70 text-[10px] uppercase tracking-widest font-black">Single Person  Price</p>
                                <div className="flex items-center text-4xl font-black mt-1">
                                    <IndianRupee className="w-6 h-6 mr-1 text-orange-400" />
                                    {pooja.price?.toLocaleString()}
                                </div>
                            </div>

                            <div className="space-y-4 pt-5 border-t border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                        <Tag className="w-5 h-5 text-orange-300" />
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider"> Category</p>
                                        <p className="font-bold text-sm">{parseLocalizedValue(pooja.category, 'en')}</p>
                                    </div>
                                </div>
                                {/* <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                        <Calendar className="w-5 h-5 text-orange-300" />
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-[10px] uppercase font-bold tracking-wider">Default Time</p>
                                        <p className="font-bold text-sm">{pooja.time || 'N/A'}</p>
                                    </div>
                                </div> */}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Badge Table */}
                    {/* <Card className="rounded-2xl border border-slate-100 shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-0">
                            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                <Package className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory Status</span>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-600">Availability</p>
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3">Active</Badge>
                            </div>
                        </CardContent>
                    </Card> */}
                </div>

                {/* Right Column - Localized Content & Packages */}
                <div className="lg:col-span-2 space-y-8">
                    <Tabs value={viewLanguage} onValueChange={(v) => setViewLanguage(v as ViewLanguage)} className="w-full">
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm gap-2">
                            <div className="flex items-center gap-2 px-3 text-slate-500 font-bold text-xs uppercase tracking-widest">
                                <Languages className="w-4 h-4 text-orange-500" /> Content Translation
                            </div>
                            <TabsList className="bg-slate-50 border h-10 p-1 w-full sm:w-auto">
                                <TabsTrigger value="en" className="flex-1 sm:flex-none px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">English</TabsTrigger>
                                <TabsTrigger value="hi" className="flex-1 sm:flex-none px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">हिंदी</TabsTrigger>
                                <TabsTrigger value="mr" className="flex-1 sm:flex-none px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">मराठी</TabsTrigger>
                            </TabsList>
                        </div>

                        {(['en', 'hi', 'mr'] as ViewLanguage[]).map((lang) => (
                            <TabsContent key={lang} value={lang} className="space-y-6 mt-0 animate-in fade-in-50 duration-500">
                                {/* Localized Name Banner */}
                                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm border-l-8 border-l-orange-500">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Ritual Title ({lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Marathi'})</p>
                                    <h2 className="text-2xl font-serif font-bold text-slate-900">{parseLocalizedValue(pooja.name, lang)}</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                    {/* Significance */}
                                    <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden group">
                                        <CardHeader className="bg-slate-50/50 border-b border-slate-50 pb-4">
                                            <CardTitle className="flex items-center gap-2 text-[#7b4623] font-serif text-lg">
                                                <Info className="w-5 h-5" /> About the Pooja
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div 
                                                className="text-slate-600 text-sm leading-relaxed prose prose-orange max-w-none"
                                                dangerouslySetInnerHTML={{ __html: parseLocalizedValue(pooja.about, lang) || `No ${lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Marathi'} description available.` }}
                                            />
                                        </CardContent>
                                    </Card>

                                    {/* Benefits */}
                                    {/* <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
                                        <CardHeader className="bg-slate-50/50 border-b border-slate-50 pb-4">
                                            <CardTitle className="text-[#7b4623] font-serif text-lg">Divine Benefits</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            {Array.isArray(pooja.benefits) && pooja.benefits.length > 0 ? (
                                                <ul className="space-y-4">
                                                    {pooja.benefits.map((benefit: any, i: number) => (
                                                        <li key={i} className="flex items-start gap-3 text-slate-600 text-sm group">
                                                            <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-orange-600 transition-colors">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-600 group-hover:bg-white transition-colors" />
                                                            </div>
                                                            <span className="leading-tight">{parseLocalizedValue(benefit, lang)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-slate-400 text-sm italic">No benefits listed for this language.</p>
                                            )}
                                        </CardContent>
                                    </Card> */}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>

                    {/* Localized Packages or Common Packages */}
                    {(() => {
                        const currentPackages = pooja.packages?.[viewLanguage] || pooja.packages?.en || (Array.isArray(pooja.packages) ? pooja.packages : []);
                        if (!currentPackages || currentPackages.length === 0) return null;

                        return (
                            <Card className="rounded-3xl border-none shadow-xl bg-[#7b4623] overflow-hidden">
                                <CardHeader className="pb-4 border-b border-white/10">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl text-white font-serif flex items-center gap-2">
                                            <IndianRupee className="w-5 h-5 text-orange-400" /> 
                                            Packages ({viewLanguage.toUpperCase()})
                                        </CardTitle>
                                        <Badge className="bg-white/10 text-orange-200 border-none">
                                            {pooja.packages?.[viewLanguage] ? "Localized" : "Standard"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {currentPackages.map((pkg: any, i: number) => (
                                        <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center hover:bg-white/10 transition-all cursor-default">
                                            <div className="space-y-1">
                                                <p className="font-bold text-white text-base">{parseLocalizedValue(pkg.name, viewLanguage)}</p>
                                                <p className="text-xs text-orange-200/60 uppercase tracking-widest font-medium">
                                                    {parseLocalizedValue(pkg.description, viewLanguage)}
                                                </p>
                                            </div>
                                            <div className="bg-white text-[#7b4623] px-5 py-2 rounded-xl font-black shadow-inner">
                                                ₹{pkg.price?.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
