"use client";

import React, { useState, useEffect } from "react";
import {
    Plus, Search, Edit2, Trash2, Calendar as CalendarIcon, 
    Loader2, Sparkles, X, Save, Eye
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { parseLocalizedValue, stripHtml } from '@/utils/textUtils';
import { fetchMandalEvents, createMandalEvent, updateMandalEvent, deleteMandalEvent, toggleMandalEventStatus } from "@/api/mandalAdminController";

export default function MandalEventsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState("ALL");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name_en: "", name_hi: "", name_mr: "",
        date: "", time: "",
        description_en: "", description_hi: "", description_mr: "",
        status: true,
    });

    const getL = (value: any, lang: 'en' | 'hi' | 'mr') => {
        const result = parseLocalizedValue(value, lang);
        return result === "N/A" ? "" : result;
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await fetchMandalEvents();
            if (response.success) {
                setEvents(response.data || []);
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to load events", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = (event: any = null) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                name_en: getL(event.name, 'en'),
                name_hi: getL(event.name, 'hi'),
                name_mr: getL(event.name, 'mr'),
                date: event.date || "",
                time: event.time || "",
                description_en: getL(event.description, 'en'),
                description_hi: getL(event.description, 'hi'),
                description_mr: getL(event.description, 'mr'),
                status: !!event.status,
            });
        } else {
            setEditingEvent(null);
            setFormData({
                name_en: "", name_hi: "", name_mr: "",
                date: "", time: "",
                description_en: "", description_hi: "", description_mr: "",
                status: true,
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.date) {
            toast({ title: "Select Date", description: "Please select a date for the event", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = { ...formData };
            if (editingEvent) {
                await updateMandalEvent(editingEvent.id, payload);
                toast({ title: "Success", description: "Event updated successfully" });
            } else {
                await createMandalEvent(payload);
                toast({ title: "Success", description: "Event created successfully" });
            }
            setIsDialogOpen(false);
            loadData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to save event", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await deleteMandalEvent(id);
                toast({ title: "Success", description: "Event deleted successfully" });
                loadData();
            } catch (error) {
                toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
            }
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await toggleMandalEventStatus(id);
            setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: !currentStatus } : ev));
            toast({ title: "Status Updated", description: `Event ${!currentStatus ? 'activated' : 'deactivated'}` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update event status", variant: "destructive" });
        }
    };

    const uniqueDates = Array.from(new Set(events.map(e => e.date)))
        .filter(Boolean)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const filteredEvents = events.filter((event) => {
        const name = getL(event.name, 'en').toLowerCase();
        const matchesSearch = name.includes(searchTerm.toLowerCase());
        const matchesDate = selectedDate === "ALL" || event.date === selectedDate;
        return matchesSearch && matchesDate;
    });

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto px-4 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif font-black text-slate-800 tracking-tight">Mandal Events</h1>
                    <p className="text-slate-500 mt-1">Manage festivals and special celebrations.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20 rounded-xl h-12 px-6">
                    <Plus className="w-5 h-5 mr-2" /> New Event
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        placeholder="Search events..."
                        className="pl-12 h-12 rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger className="h-12 w-full md:w-[250px] rounded-xl border-slate-200">
                        <SelectValue placeholder="All Dates" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Dates</SelectItem>
                        {uniqueDates.map((date) => (
                            <SelectItem key={date} value={date}>{date}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="border border-slate-100 rounded-3xl bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/80">
                        <TableRow>
                            <TableHead className="py-4 font-bold text-slate-700">Event Name</TableHead>
                            <TableHead className="py-4 font-bold text-slate-700">Date & Time</TableHead>
                            <TableHead className="py-4 font-bold text-slate-700">Description</TableHead>
                            <TableHead className="py-4 font-bold text-slate-700">Status</TableHead>
                            <TableHead className="py-4 font-bold text-slate-700 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filteredEvents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                    No events found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEvents.map((event) => (
                                <TableRow key={event.id} className="hover:bg-amber-50/30 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                                <CalendarIcon className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <span className="font-bold text-slate-800">{getL(event.name, 'en') || 'Unnamed'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant="outline" className="w-fit bg-slate-50 text-slate-700 border-slate-200">
                                                {event.date || 'TBD'}
                                            </Badge>
                                            {event.time && <span className="text-xs text-slate-400 font-medium">{event.time}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-slate-500 line-clamp-1 max-w-[300px]">
                                            {stripHtml(getL(event.description, 'en')) || "No description"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch checked={event.status} onCheckedChange={() => handleToggleStatus(event.id, event.status)} />
                                            <Badge variant="outline" className={event.status ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500"}>
                                                {event.status ? "Active" : "Hidden"}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(event)} className="hover:bg-blue-50 hover:text-blue-600">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)} className="hover:bg-red-50 hover:text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-[2rem] p-6">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-2xl font-serif font-black text-slate-800">
                            {editingEvent ? "Edit Event" : "Create New Event"}
                        </DialogTitle>
                        <DialogDescription>Event details will be shown on your public mandal page.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Event Name *</Label>
                            <Tabs defaultValue="en" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-2 bg-slate-100 p-1 rounded-xl">
                                    <TabsTrigger value="en" className="rounded-lg text-xs font-bold">English</TabsTrigger>
                                    <TabsTrigger value="hi" className="rounded-lg text-xs font-bold">हिंदी</TabsTrigger>
                                    <TabsTrigger value="mr" className="rounded-lg text-xs font-bold">मराठी</TabsTrigger>
                                </TabsList>
                                <TabsContent value="en"><Input required value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} className="h-12 rounded-xl" placeholder="Event Name" /></TabsContent>
                                <TabsContent value="hi"><Input value={formData.name_hi} onChange={e => setFormData({...formData, name_hi: e.target.value})} className="h-12 rounded-xl" placeholder="इवेंट का नाम" /></TabsContent>
                                <TabsContent value="mr"><Input value={formData.name_mr} onChange={e => setFormData({...formData, name_mr: e.target.value})} className="h-12 rounded-xl" placeholder="इव्हेंटचे नाव" /></TabsContent>
                            </Tabs>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Date *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal h-12 rounded-xl border-slate-200", !formData.date && "text-slate-400")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.date || "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={formData.date ? new Date(formData.date) : undefined} onSelect={(date) => setFormData({ ...formData, date: date ? format(date, "PPP") : "" })} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Time (Optional)</Label>
                                <Input value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="h-12 rounded-xl" placeholder="e.g. 10:00 AM" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</Label>
                            <Tabs defaultValue="en" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-2 bg-slate-100 p-1 rounded-xl">
                                    <TabsTrigger value="en" className="rounded-lg text-xs font-bold">English</TabsTrigger>
                                    <TabsTrigger value="hi" className="rounded-lg text-xs font-bold">हिंदी</TabsTrigger>
                                    <TabsTrigger value="mr" className="rounded-lg text-xs font-bold">मराठी</TabsTrigger>
                                </TabsList>
                                <TabsContent value="en"><Textarea value={formData.description_en} onChange={e => setFormData({...formData, description_en: e.target.value})} className="min-h-[100px] rounded-xl" placeholder="Event details..." /></TabsContent>
                                <TabsContent value="hi"><Textarea value={formData.description_hi} onChange={e => setFormData({...formData, description_hi: e.target.value})} className="min-h-[100px] rounded-xl" placeholder="विवरण..." /></TabsContent>
                                <TabsContent value="mr"><Textarea value={formData.description_mr} onChange={e => setFormData({...formData, description_mr: e.target.value})} className="min-h-[100px] rounded-xl" placeholder="वर्णन..." /></TabsContent>
                            </Tabs>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <p className="font-bold text-slate-800">Event Status</p>
                                <p className="text-xs text-slate-500">Visible to public?</p>
                            </div>
                            <Switch checked={formData.status} onCheckedChange={(c) => setFormData({ ...formData, status: c })} />
                        </div>

                        <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg shadow-lg shadow-amber-600/20">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                            {editingEvent ? "Update Event" : "Create Event"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
