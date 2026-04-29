"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
    ArrowLeft, 
    Save, 
    Calendar as CalendarIcon, 
    Clock, 
    Loader2, 
    X,
    Sparkles,
    Check,
    ChevronsUpDown,
    CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    fetchMyEvents,
    updateMyEvent,
    fetchMyPoojas,
} from "@/api/templeAdminController";
import { useToast } from "@/hooks/use-toast";
import { parseLocalizedValue } from '@/utils/textUtils';
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AlertCircle } from "lucide-react";

export default function TempleEditEventPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;
    const { toast } = useToast();
    const { hasPermission } = useAdminAuth();
    
    const canEdit = hasPermission('events.edit');
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [event, setEvent] = useState<any>(null);

    // Form state
    const [formData, setFormData] = useState({
        name_en: "",
        name_hi: "",
        name_mr: "",
        date: "",
        time: "",
        description_en: "",
        description_hi: "",
        description_mr: "",
        status: true,
    });

    const [timeData, setTimeData] = useState({
        hours: "10",
        minutes: "00",
        period: "AM"
    });

    // Pooja selection state
    const [templePoojas, setTemplePoojas] = useState<any[]>([]);
    const [selectedPoojaIds, setSelectedPoojaIds] = useState<string[]>([]);
    const [loadingPoojas, setLoadingPoojas] = useState(false);

    useEffect(() => {
        loadData();
        loadTemplePoojas();
    }, []);

    const getL = (value: any, lang: 'en' | 'hi' | 'mr') => {
        const result = parseLocalizedValue(value, lang);
        return result === "N/A" ? "" : result;
    };

    const parseStoredTime = (timeStr: string) => {
        if (!timeStr) return { hours: "10", minutes: "00", period: "AM" };
        const [time, period] = timeStr.split(" ");
        if (!time || !period) return { hours: "10", minutes: "00", period: "AM" };
        const [hours, minutes] = time.split(":");
        return { hours: hours || "10", minutes: minutes || "00", period: period || "AM" };
    };

    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await fetchMyEvents();
            const eventsList = response.data || response || [];
            const found = Array.isArray(eventsList) ? eventsList.find((e: any) => e.id === eventId) : null;

            if (found) {
                setEvent(found);
                setFormData({
                    name_en: getL(found.name, 'en'),
                    name_hi: getL(found.name, 'hi'),
                    name_mr: getL(found.name, 'mr'),
                    date: found.date,
                    time: found.time || "",
                    description_en: getL(found.description, 'en'),
                    description_hi: getL(found.description, 'hi'),
                    description_mr: getL(found.description, 'mr'),
                    status: found.status,
                });
                setTimeData(parseStoredTime(found.time));
                if (found.Pooja && Array.isArray(found.Pooja)) {
                    setSelectedPoojaIds(found.Pooja.map((p: any) => p.id));
                }
            } else {
                toast({ title: "Error", description: "Event not found", variant: "destructive" });
                router.push('/temples/dashboard/events');
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to load event", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const loadTemplePoojas = async () => {
        setLoadingPoojas(true);
        try {
            const response = await fetchMyPoojas();
            setTemplePoojas(response.data || []);
        } catch (error) {
            console.error("Failed to load poojas:", error);
        } finally {
            setLoadingPoojas(false);
        }
    };

    const handlePoojaToggle = (poojaId: string, checked: boolean) => {
        if (checked) {
            setSelectedPoojaIds(prev => [...prev, poojaId]);
        } else {
            setSelectedPoojaIds(prev => prev.filter(id => id !== poojaId));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.date) {
            toast({ title: "Select Date", description: "Please select a date", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                // time: `${timeData.hours}:${timeData.minutes} ${timeData.period}`,
                recommendedPoojaIds: selectedPoojaIds,
            };

            await updateMyEvent(eventId, payload);
            toast({ title: "Success", description: "Event updated successfully" });
            router.push(`/temples/dashboard/events/${eventId}`);
        } catch (error) {
            toast({ title: "Error", description: "Failed to update event", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 border-4 border-[#7b4623] border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground">Loading event form...</p>
            </div>
        );
    }

    if (!canEdit) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-800">Access Restricted</h2>
                    <p className="text-slate-500 max-w-md">
                        You do not have permission to edit events. Please contact your temple administrator for access.
                    </p>
                </div>
                <Button 
                    onClick={() => router.push('/temples/dashboard/events')}
                    className="bg-[#7b4623] hover:bg-[#5d351a] text-white rounded-xl px-8"
                >
                    Back to Events
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100">
                    <ArrowLeft className="w-5 h-5 text-[#7b4623]" />
                </Button>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-[#7b4623]">Edit Event</h1>
                    <p className="text-slate-500">Update festival or celebratory event details.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-card p-8 rounded-2xl border shadow-sm">
                <Tabs defaultValue="en" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100 p-1 rounded-xl">
                        <TabsTrigger value="en" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">English</TabsTrigger>
                        <TabsTrigger value="hi" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">हिन्दी</TabsTrigger>
                        <TabsTrigger value="mr" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">मराठी</TabsTrigger>
                    </TabsList>

                    {['en', 'hi', 'mr'].map((lang) => (
                        <TabsContent key={lang} value={lang} className="space-y-6 mt-0 outline-none animate-in fade-in-50 duration-300">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`name_${lang}`}>Event Name * ({lang.toUpperCase()})</Label>
                                    <Input
                                        id={`name_${lang}`}
                                        value={(formData as any)[`name_${lang}`]}
                                        onChange={(e) => setFormData({ ...formData, [`name_${lang}`]: e.target.value })}
                                        className="h-11 rounded-xl border-slate-200 focus:border-[#7b4623] focus:ring-[#7b4623]/10"
                                        required={lang === 'en'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`description_${lang}`}>Description ({lang.toUpperCase()})</Label>
                                    <Textarea
                                        id={`description_${lang}`}
                                        value={(formData as any)[`description_${lang}`]}
                                        onChange={(e) => setFormData({ ...formData, [`description_${lang}`]: e.target.value })}
                                        className="h-32 rounded-xl resize-none border-slate-200 focus:border-[#7b4623] focus:ring-[#7b4623]/10"
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-medium font-bold text-[#7b4623]">Date *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-11 rounded-xl border-slate-200 focus:border-[#7b4623] focus:ring-[#7b4623]/10",
                                        !formData.date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.date ? formData.date : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.date ? new Date(formData.date) : undefined}
                                    onSelect={(date) =>
                                        setFormData({
                                            ...formData,
                                            date: date ? format(date, "PPP") : "",
                                        })
                                    }
                                    disabled={(date) =>
                                        date < new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* <div className="space-y-2">
                        <Label className="text-slate-700 font-medium font-bold text-[#7b4623]">Time *</Label>
                        <div className="flex gap-1">
                            <select
                                className="flex-1 h-11 rounded-xl border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b4623]/10"
                                value={timeData.hours}
                                onChange={(e) => setTimeData({ ...timeData, hours: e.target.value })}
                            >
                                {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                            <select
                                className="flex-1 h-11 rounded-xl border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b4623]/10"
                                value={timeData.minutes}
                                onChange={(e) => setTimeData({ ...timeData, minutes: e.target.value })}
                            >
                                {["00", "15", "30", "45"].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                            <select
                                className="w-16 h-11 rounded-xl border border-slate-200 bg-white px-2 text-sm font-bold text-[#7b4623] focus:outline-none focus:ring-2 focus:ring-[#7b4623]/10"
                                value={timeData.period}
                                onChange={(e) => setTimeData({ ...timeData, period: e.target.value })}
                            >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>
                    </div> */}
                </div>

                <div className="flex items-center justify-between p-6 border rounded-2xl bg-slate-50 transition-all hover:bg-slate-100/50">
                    <div className="space-y-1">
                        <Label className="text-base font-bold text-[#7b4623]">Event Status</Label>
                        <p className="text-sm text-muted-foreground">
                            Show or hide this event from devotees on the platform.
                        </p>
                    </div>
                    <Switch
                        checked={formData.status}
                        onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
                        className="data-[state=checked]:bg-emerald-500"
                    />
                </div>

                {/* Recommended Poojas Section */}
                <div className="space-y-4">
                    <Label className="text-base font-bold text-[#7b4623] flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-600" />
                        Link Sevas to this Event
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between h-auto min-h-[3rem] py-3 rounded-2xl border-slate-200 hover:border-[#7b4623]/30 transition-all"
                                disabled={loadingPoojas || templePoojas.length === 0}
                            >
                                {loadingPoojas ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-[#7b4623]" />
                                        Loading sevas...
                                    </span>
                                ) : templePoojas.length === 0 ? (
                                    <span className="text-muted-foreground">No sevas available</span>
                                ) : selectedPoojaIds.length === 0 ? (
                                    <span className="text-muted-foreground">Select sevas to recommend...</span>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {templePoojas
                                            .filter(p => selectedPoojaIds.includes(p.id))
                                            .map(pooja => (
                                                <Badge key={pooja.id} className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 rounded-lg text-xs py-1">
                                                    {parseLocalizedValue(pooja.name)}
                                                    <X
                                                        className="w-3 h-3 ml-2 cursor-pointer hover:text-amber-900"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePoojaToggle(pooja.id, false);
                                                        }}
                                                    />
                                                </Badge>
                                            ))
                                        }
                                    </div>
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[450px] p-0 rounded-2xl border-none shadow-2xl" align="start">
                            <Command className="rounded-2xl">
                                <CommandInput placeholder="Search your temple's sevas..." className="h-12" />
                                <CommandEmpty>No seva found.</CommandEmpty>
                                <CommandGroup className="max-h-64 overflow-auto p-2">
                                    {templePoojas.map((pooja) => (
                                        <CommandItem
                                            key={pooja.id}
                                            value={parseLocalizedValue(pooja.name)}
                                            onSelect={() => {
                                                handlePoojaToggle(pooja.id, !selectedPoojaIds.includes(pooja.id));
                                            }}
                                            className="flex items-start gap-3 py-3 px-4 rounded-xl cursor-pointer hover:bg-slate-50"
                                        >
                                            <div className={cn(
                                                "mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                selectedPoojaIds.includes(pooja.id) 
                                                    ? "bg-[#7b4623] border-[#7b4623]" 
                                                    : "border-slate-300"
                                            )}>
                                                {selectedPoojaIds.includes(pooja.id) && <Check className="h-3 w-3 text-white" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-slate-800">{parseLocalizedValue(pooja.name)}</div>
                                                <div className="text-xs text-muted-foreground font-medium">
                                                    Booking Price: ₹{pooja.price}
                                                </div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground px-2">
                        These sevas will be highlighted to devotees visiting the event page.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-8 border-t">
                    <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl h-12 px-8 font-medium">
                        Discard Changes
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="rounded-xl h-12 px-10 bg-[#7b4623] hover:bg-[#5d351a] text-white shadow-xl shadow-orange-900/10 font-bold transition-all hover:scale-[1.02] active:scale-95"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Saving...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                <span>Update Event</span>
                            </div>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
