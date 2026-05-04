"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
    ArrowLeft, 
    Edit2, 
    Clock, 
    Info, 
    Loader2, 
    Languages, 
    Calendar, 
    Sparkles,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchMyEvents, updateMyEvent } from "@/api/templeAdminController";
import { useToast } from "@/hooks/use-toast";
import { parseLocalizedValue } from '@/utils/textUtils';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ViewLanguage = 'en' | 'hi' | 'mr';

export default function TempleViewEventPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;
    const { toast } = useToast();
    const [event, setEvent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewLanguage, setViewLanguage] = useState<ViewLanguage>('en');

    useEffect(() => {
        loadEvent();
    }, []);

    const loadEvent = async () => {
        setIsLoading(true);
        try {
            const response = await fetchMyEvents();
            const eventsList = response.data || response || [];
            const found = Array.isArray(eventsList) ? eventsList.find((e: any) => e.id === eventId) : null;

            if (found) {
                setEvent(found);
                // Update breadcrumb if needed
                window.dispatchEvent(new CustomEvent('updateBreadcrumb', { 
                    detail: parseLocalizedValue(found.name, 'en') || "Event Details" 
                }));
            } else {
                toast({ title: "Error", description: "Event not found", variant: "destructive" });
                router.push('/temples/dashboard/events');
            }
        } catch (error: any) {
            console.error("Failed to load event:", error);
            toast({ 
                title: "Error", 
                description: "Failed to load event details", 
                variant: "destructive" 
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 border-4 border-[#7b4623] border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground">Loading event details...</p>
            </div>
        );
    }

    if (!event) return null;

    return (
        <div className="relative min-h-screen pb-20">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#7b4623]/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-100/30 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-5">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => router.back()} 
                            className="rounded-full bg-white hover:bg-orange-50 text-[#7b4623] shadow-sm shrink-0 h-11 w-11"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#7b4623] tracking-tight">
                                    {parseLocalizedValue(event.name, viewLanguage)}
                                </h1>
                                <Badge className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                    event.status ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"
                                )}>
                                    {event.status ? "Active" : "Hidden"}
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                Interactive Ritual & Event Analytics View
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button 
                            onClick={() => router.push(`/temples/dashboard/events/edit/${event.id}`)} 
                            className="flex-1 sm:flex-none bg-[#7b4623] hover:bg-[#5d351a] text-white shadow-xl shadow-orange-900/20 rounded-2xl px-8 h-12 font-bold transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Edit2 className="w-5 h-5 mr-3" /> Edit Profile
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Dynamic Stats */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-[#7b4623] via-[#8c522b] to-[#5d351a] text-white overflow-hidden relative shadow-2xl group">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:rotate-12 transition-transform duration-500">
                                <Calendar className="w-32 h-32" />
                            </div>
                            
                            <CardContent className="p-8 space-y-8 relative z-10">
                                <div>
                                    <p className="text-orange-200/60 text-[11px] uppercase tracking-[0.2em] font-black mb-3 text-white/60">Scheduling Data</p>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 shadow-inner">
                                                <Calendar className="w-6 h-6 text-orange-300" />
                                            </div>
                                            <div>
                                                <p className="text-white/50 text-[10px] font-black uppercase">Event Date</p>
                                                <p className="text-xl font-bold tracking-tight">{event.date}</p>
                                            </div>
                                        </div>
                                        
                                        {event.time && (
                                            <div className="flex items-center gap-4">
                                                {/*          */}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-white/50 text-[9px] font-black uppercase">Live Status</p>
                                                <p className="text-sm font-bold">{event.status ? 'Live on Platform' : 'Draft Mode'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Link to Linked Sevas */}
                        <Card className="rounded-[2.5rem] border border-slate-100 shadow-xl bg-white overflow-hidden group">
                            <CardHeader className="p-6 pb-4 bg-orange-50/30 border-b border-orange-100 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <CardTitle className="text-lg font-serif font-bold text-slate-800">Linked Rituals</CardTitle>
                                </div>
                                <Badge variant="secondary" className="bg-amber-600 text-white rounded-lg">
                                    {event.Pooja?.length || 0}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {event.Pooja && event.Pooja.length > 0 ? (
                                    <div className="space-y-3">
                                        {event.Pooja.map((pooja: any) => (
                                            <div key={pooja.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-amber-200 transition-all cursor-pointer hover:bg-white hover:shadow-md">
                                                <div className="space-y-0.5">
                                                    <p className="text-sm font-bold text-slate-800">{parseLocalizedValue(pooja.name)}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Starting From</p>
                                                </div>
                                                <div className="bg-white px-3 py-1.5 rounded-xl text-[#7b4623] font-black text-sm border border-slate-100">
                                                    ₹{pooja.price}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 space-y-2">
                                        <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium italic">No sevas linked yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Localized Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <Tabs value={viewLanguage} onValueChange={(v) => setViewLanguage(v as ViewLanguage)} className="w-full">
                            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 bg-white/60 backdrop-blur-md p-3 rounded-[2rem] border border-white/50 shadow-xl gap-4">
                                <div className="flex items-center gap-3 px-4 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">
                                    <Languages className="w-5 h-5 text-orange-500" /> Regional Content Context
                                </div>
                                <TabsList className="bg-slate-100/50 border border-slate-200 h-12 p-1.5 w-full sm:w-auto rounded-2xl">
                                    <TabsTrigger value="en" className="flex-1 sm:flex-none px-8 rounded-xl font-bold text-sm data-[state=active]:bg-[#7b4623] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">English</TabsTrigger>
                                    <TabsTrigger value="hi" className="flex-1 sm:flex-none px-8 rounded-xl font-bold text-sm data-[state=active]:bg-[#7b4623] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">हिंदी</TabsTrigger>
                                    <TabsTrigger value="mr" className="flex-1 sm:flex-none px-8 rounded-xl font-bold text-sm data-[state=active]:bg-[#7b4623] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">मराठी</TabsTrigger>
                                </TabsList>
                            </div>

                            {(['en', 'hi', 'mr'] as ViewLanguage[]).map((lang) => (
                                <TabsContent key={lang} value={lang} className="space-y-8 mt-0 animate-in slide-in-from-bottom-4 fade-in-50 duration-700">
                                    {/* Localized Name Banner */}
                                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[5rem] -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700" />
                                        <p className="text-[11px] font-black text-orange-500 uppercase tracking-[0.3em] mb-4">Official Translation ({lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Marathi'})</p>
                                        <h2 className="text-4xl font-serif font-black text-slate-900 leading-tight">
                                            {parseLocalizedValue(event.name, lang)}
                                        </h2>
                                    </div>

                                    {/* Description */}
                                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden group">
                                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                                            <CardTitle className="flex items-center gap-3 text-[#7b4623] font-serif text-2xl font-black">
                                                <Info className="w-7 h-7" /> Detailed Overview
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-10">
                                            <div className="prose prose-orange max-w-none">
                                                <div 
                                                    className="text-slate-600 text-lg leading-loose font-medium"
                                                    dangerouslySetInnerHTML={{ __html: parseLocalizedValue(event.description, lang) || `No content structure defined for ${lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Marathi'} yet.` }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Content Hint */}
                                    <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-[2rem] flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-500 shrink-0 shadow-sm font-black text-xs">AI</div>
                                        <p className="text-xs text-indigo-700 font-medium">
                                            Tip: Keep descriptions concise and highlight cultural significance for better devotee engagement. You can update this content anytime through the edit panel.
                                        </p>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
