"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Calendar as CalendarIcon,
    MapPin,
    Clock,
    Sparkles,
    Check,
    ChevronsUpDown,
    X,
    Power,
    PowerOff,
    Eye
} from "lucide-react";
import { format } from "date-fns";
import { hi } from "date-fns/locale";

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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";
import { fetchAllEventsAdmin, fetchAllTemplesAdmin, createEventAdmin, updateEventAdmin, deleteEventAdmin, fetchAllPoojasAdmin, toggleEventStatusAdmin, fetchEventByIdAdmin } from "@/api/adminController";
import { useToast } from "@/hooks/use-toast";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalized, Language } from "@/utils/localization";
import { parseLocalizedValue } from '@/utils/textUtils';


export default function AdminEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [temples, setTemples] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const { t, language } = useLanguage();
    const { toast } = useToast();
    const { hasPermission } = useAdminAuth();


    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(10);

    // Pooja selection state
    const [templePoojas, setTemplePoojas] = useState<any[]>([]);
    const [selectedPoojaIds, setSelectedPoojaIds] = useState<string[]>([]);
    const [loadingPoojas, setLoadingPoojas] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        name_en: "",
        name_hi: "",
        name_mr: "",
        date: "",
        time: "",
        description: "",
        description_en: "",
        description_hi: "",
        description_mr: "",
        templeId: "",
        status: true,
    });
    const [activeTab, setActiveTab] = useState("en");

    const [timeData, setTimeData] = useState({
        hours: "10",
        minutes: "00",
        period: "AM"
    });

    // Helper to format time for storage
    const getFormattedTime = (h: string, m: string, p: string) => `${h}:${m} ${p}`;

    // Helper to parse stored time
    const parseStoredTime = (timeStr: string) => {
        if (!timeStr) return { hours: "10", minutes: "00", period: "AM" };
        const [time, period] = timeStr.split(" ");
        if (!time || !period) return { hours: "10", minutes: "00", period: "AM" };
        const [hours, minutes] = time.split(":");
        return { hours: hours || "10", minutes: minutes || "00", period: period || "AM" };
    };

    const calendarLocale = language === "hi" ? hi : undefined; // Marathi not supported by date-fns, defaulting to English


    useEffect(() => {
        loadEvents(1);
    }, [debouncedSearch]);

    useEffect(() => {
        loadEvents(currentPage);
    }, [currentPage]);

    useEffect(() => {
        loadTemples();
    }, []);

    const loadTemples = async () => {
        try {
            const templesData = await fetchAllTemplesAdmin();
            const actualTemples = templesData
                .filter((user: any) => user.temple)
                .map((user: any) => user.temple);
            setTemples(actualTemples);
        } catch (error) {
            console.error("Failed to load temples", error);
        }
    };

    const loadTemplePoojas = async (templeId: string) => {
        if (!templeId) {
            setTemplePoojas([]);
            return;
        }

        setLoadingPoojas(true);
        try {
            const response = await fetchAllPoojasAdmin({ templeId });
            console.log('Temple poojas response:', response);
            // Backend returns array directly, not wrapped in { data: [...] }
            setTemplePoojas(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Failed to load temple poojas:", error);
            setTemplePoojas([]);
        } finally {
            setLoadingPoojas(false);
        }
    };

    // Watch for temple selection change
    useEffect(() => {
        if (formData.templeId) {
            loadTemplePoojas(formData.templeId);
            // Clear selected poojas when temple changes
            setSelectedPoojaIds([]);
        } else {
            setTemplePoojas([]);
            setSelectedPoojaIds([]);
        }
    }, [formData.templeId]);

    const loadEvents = async (page: number) => {
        setIsLoading(true);
        try {
            const res = await fetchAllEventsAdmin({
                page,
                limit: itemsPerPage,
                search: debouncedSearch,
            });

            if (res.success) {
                setEvents(res.data);
                if (res.pagination) {
                    setTotalPages(res.pagination.totalPages);
                    setTotalItems(res.pagination.total);
                    setCurrentPage(res.pagination.page);
                }
            }
        } catch (error) {
            toast({
                title: t('common.error') || "Error",
                description: t('admin.events.error_load') || "Failed to load events",
                variant: "destructive",
            });

        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = async (event: any = null) => {
        if (event) {
            try {
                // Fetch full raw data for editing to get all language fields
                const response = await fetchEventByIdAdmin(event.id);
                if (response.success && response.data) {
                    const fullEvent = response.data;
                    
                    setEditingEvent(fullEvent);
                    
                    // Safely extract translations from JSON objects
                    const name = fullEvent.name || {};
                    const desc = fullEvent.description || {};
                    
                    setFormData({
                        name: name.en || "",
                        name_en: name.en || "",
                        name_hi: name.hi || "",
                        name_mr: name.mr || "",
                        date: fullEvent.date,
                        time: fullEvent.time || "",
                        description: desc.en || "",
                        description_en: desc.en || "",
                        description_hi: desc.hi || "",
                        description_mr: desc.mr || "",
                        templeId: fullEvent.templeId || "",
                        status: fullEvent.status ?? true,
                    });
                    
                    setTimeData(parseStoredTime(fullEvent.time));
                    
                    // Pre-populate selected poojas
                    if (fullEvent.Pooja && Array.isArray(fullEvent.Pooja)) {
                        setSelectedPoojaIds(fullEvent.Pooja.map((p: any) => p.id));
                    } else {
                        setSelectedPoojaIds([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching event details:", error);
                toast({
                    title: t('common.error') || "Error",
                    description: "Failed to fetch event details for editing",
                    variant: "destructive",
                });
            }
        } else {
            setEditingEvent(null);
            setFormData({
                name: "",
                name_en: "",
                name_hi: "",
                name_mr: "",
                date: "",
                time: "",
                description: "",
                description_en: "",
                description_hi: "",
                description_mr: "",
                templeId: "",
                status: true,
            });
            setTimeData({ hours: "10", minutes: "00", period: "AM" });
            setSelectedPoojaIds([]);
            setActiveTab("en");
        }
        setIsDialogOpen(true);
    };

    const handlePoojaToggle = (poojaId: string, checked: boolean | string) => {
        if (checked) {
            setSelectedPoojaIds(prev => [...prev, poojaId]);
        } else {
            setSelectedPoojaIds(prev => prev.filter(id => id !== poojaId));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                ...formData,
                time: getFormattedTime(timeData.hours, timeData.minutes, timeData.period),
                recommendedPoojaIds: selectedPoojaIds,
            };

            if (editingEvent) {
                await updateEventAdmin(editingEvent.id, payload);
                toast({ title: t('common.success') || "Success", description: t('admin.events.success_update') || "Event updated successfully" });
            } else {
                await createEventAdmin(payload);
                toast({ title: t('common.success') || "Success", description: t('admin.events.success_create') || "Event created successfully" });
            }

            setIsDialogOpen(false);
            setSelectedPoojaIds([]);
            loadEvents(currentPage);
        } catch (error) {
            toast({
                title: t('common.error') || "Error",
                description: t('admin.events.error_save') || "Failed to save event",
                variant: "destructive",
            });

        }
    };

    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [viewingEvent, setViewingEvent] = useState<any>(null);

    const handleViewEvent = (event: any) => {
        setViewingEvent(event);
        setIsViewDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t('admin.events.confirm_delete') || "Are you sure you want to delete this event?")) {
            try {
                await deleteEventAdmin(id);
                toast({ title: t('common.success') || "Success", description: t('admin.events.success_delete') || "Event deleted successfully" });
                loadEvents(currentPage);
            } catch (error) {
                toast({
                    title: t('common.error') || "Error",
                    description: t('admin.events.error_delete') || "Failed to delete event",
                    variant: "destructive",
                });
            }
        }

    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const nextStatus = !currentStatus;
            await toggleEventStatusAdmin(id, nextStatus);
            setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: nextStatus } : ev));
            toast({
                title: t('admin.events.table_status') || "Status Updated",
                description: nextStatus ? t('admin.events.status_activated') : t('admin.events.status_deactivated'),
            });
        } catch (error) {
            toast({
                title: t('common.error') || "Error",
                description: t('common.action_failed') || "Failed to update status",
                variant: "destructive",
            });
        }

    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('admin.events.title') || "Events Management"}</h1>
                    <p className="text-muted-foreground">
                        {t('admin.events.desc') || "Manage upcoming events and festivals for temples"}
                    </p>
                </div>
                {hasPermission("events.create") && (
                    <Button
                        onClick={() => handleOpenDialog()}
                        className="bg-primary hover:bg-primary/90"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('admin.events.add_new') || "Add New Event"}
                    </Button>
                )}

            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder={t('admin.events.search_placeholder') || "Search by event name or temple..."}
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                </div>
            </div>

            {/* Events Table */}
            <div className="border rounded-lg bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50 text-xs">
                            <TableHead className="font-bold py-3 text-slate-700">{t('admin.events.table_event') || "Event"}</TableHead>
                            <TableHead className="font-bold py-3 text-slate-700">{t('admin.events.table_temple') || "Temple"}</TableHead>
                            <TableHead className="font-bold py-3 text-slate-700">{t('admin.events.table_datetime') || "Date & Time"}</TableHead>
                            <TableHead className="font-bold py-3 text-slate-700">{t('admin.events.table_description') || "Description"}</TableHead>
                            <TableHead className="font-bold py-3 text-slate-700">{t('admin.events.table_rituals') || "Associated Rituals"}</TableHead>
                            <TableHead className="font-bold py-3 text-slate-700">{t('admin.events.table_status') || "Status"}</TableHead>
                            <TableHead className="text-right font-bold py-3 text-slate-700 pr-6">{t('admin.events.table_actions') || "Actions"}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                        {t('common.loading') || "Loading events..."}
                                    </div>
                                </TableCell>

                            </TableRow>
                        ) : events.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                    {t('common.not_found') || "No events found."}
                                </TableCell>

                            </TableRow>
                        ) : (
                            events.map((event) => (
                                <TableRow key={event.id}>
                                     <TableCell>
                                        <div className="flex items-center gap-2">
                                             <CalendarIcon className="w-4 h-4 text-primary" />
                                             <span className="font-medium">{getLocalized(event, 'name', language as Language)}</span>
                                         </div>
                                     </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {event.temple ? (
                                                <>
                                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <span className="text-sm">{getLocalized(event.temple, 'name', language as Language)}</span>
                                                </>
                                            ) : (
                                                <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-slate-200">
                                                    {t('admin.events.global_temple') || "General Event"}
                                                </Badge>

                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant="outline" className="w-fit">{event.date}</Badge>
                                            {event.time && (
                                                <div className="flex items-center text-[10px] font-bold text-muted-foreground ml-1">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {event.time}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                     <TableCell>
                                         <div className="text-sm text-muted-foreground line-clamp-1 max-w-[300px]">
                                             {getLocalized(event, 'description', language as Language) || t('common.no_description') || "No description"}
                                         </div>

                                     </TableCell>
                                    <TableCell>
                                        {event.Pooja && event.Pooja.length > 0 ? (
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {event.Pooja.slice(0, 2).map((pooja: any) => (
                                                    <Badge key={pooja.id} variant="secondary" className="text-xs bg-amber-50 text-amber-800 border-amber-200">
                                                        <Sparkles className="w-3 h-3 mr-1" />
                                                        {getLocalized(pooja, 'name', language as Language)}
                                                    </Badge>
                                                ))}
                                                {event.Pooja.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{event.Pooja.length - 2} {t('admin.products.list.more') || "more"}
                                                    </Badge>
                                                )}

                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">None</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={event.status}
                                                onCheckedChange={() => handleToggleStatus(event.id, event.status)}
                                            />
                                             <Badge variant={event.status ? "default" : "secondary"}>
                                                {event.status ? (t('admin.poojas.status_active') || "Active") : (t('admin.poojas.status_paused') || "Inactive")}
                                             </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleViewEvent(event)}
                                                title="View Event Details"
                                            >
                                                <Eye className="w-4 h-4 text-green-600" />
                                            </Button>
                                            {hasPermission("events.edit") && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDialog(event)}
                                                    title="Edit Event"
                                                >
                                                    <Edit2 className="w-4 h-4 text-blue-600" />
                                                </Button>
                                            )}
                                            {hasPermission("events.delete") && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(event.id)}
                                                    title="Delete Event"
                                                >
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-muted-foreground">
                        {t('marketplace.showing') || "Showing"} <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> {t('common.to') || "to"}{" "}
                        <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, totalItems)}
                        </span>{" "}
                        {t('common.of') || "of"} <span className="font-medium">{totalItems}</span> {t('marketplace.products') || "results"}
                    </p>

                    <Pagination className="justify-end w-auto mx-0">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(currentPage - 1);
                                    }}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {/* Simple pagination logic */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                                .map((page, idx, array) => (
                                    <React.Fragment key={page}>
                                        {idx > 0 && array[idx - 1] !== page - 1 && (
                                            <PaginationItem>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        )}
                                        <PaginationItem>
                                            <PaginationLink
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handlePageChange(page);
                                                }}
                                                isActive={currentPage === page}
                                                className="cursor-pointer"
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    </React.Fragment>
                                ))}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(currentPage + 1);
                                    }}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* View Event Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="w-5 h-5 text-green-600" />
                            {t('admin.events.view_event') || "Event Details"}
                        </DialogTitle>
                        <DialogDescription>
                            {t('admin.events.view_event_desc') || "Complete information about this event"}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {viewingEvent && (
                        <div className="space-y-6 py-4">
                            {/* Event Name */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4" />
                                    {t('admin.events.table_event') || "Event Name"}
                                </Label>
                                <p className="text-base font-medium">{getLocalized(viewingEvent, 'name', language as Language)}</p>
                            </div>

                            {/* Temple Information */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {t('admin.events.table_temple') || "Temple"}
                                </Label>
                                <p className="text-base">
                                    {viewingEvent.temple ? (
                                        getLocalized(viewingEvent.temple, 'name', language as Language)
                                    ) : (
                                        <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-slate-200">
                                            {t('admin.events.global_temple') || "General Event"}
                                        </Badge>
                                    )}
                                </p>
                            </div>

                            {/* Date and Time */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {t('admin.events.table_datetime') || "Date & Time"}
                                </Label>
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline" className="text-sm">
                                        {viewingEvent.date}
                                    </Badge>
                                    {viewingEvent.time && (
                                        <Badge variant="outline" className="text-sm">
                                            {viewingEvent.time}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* About the Event */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-primary" />
                                    {t('admin.events.about_event') || "About the Event"}
                                </Label>
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                                    <p className="text-sm text-gray-800 leading-relaxed">
                                        {getLocalized(viewingEvent, 'description', language as Language) || 
                                         (t('admin.events.no_description') || "No description available")}
                                    </p>
                                </div>
                            </div>

                            {/* Recommended Poojas */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-600" />
                                    {t('admin.events.recommended_poojas') || "Recommended Poojas"}
                                </Label>
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                                    {viewingEvent.Pooja && viewingEvent.Pooja.length > 0 ? (
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                {viewingEvent.Pooja.map((pooja: any) => (
                                                    <Badge key={pooja.id} variant="secondary" className="bg-white text-amber-800 border-amber-300 px-3 py-1">
                                                        <Sparkles className="w-3 h-3 mr-1" />
                                                        {getLocalized(pooja, 'name', language as Language)}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <p className="text-xs text-amber-700 mt-2">
                                                {t('admin.events.poojas_count', { count: viewingEvent.Pooja.length }) || 
                                                 `${viewingEvent.Pooja.length} poojas recommended for this event`}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-3">
                                            <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                                            <p className="text-sm text-amber-700">
                                                {t('admin.events.no_poojas_recommended') || "No poojas recommended yet"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-muted-foreground">
                                    {t('admin.events.table_status') || "Status"}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Badge variant={viewingEvent.status ? "default" : "secondary"}>
                                        {viewingEvent.status ? (t('admin.poojas.status_active') || "Active") : (t('admin.poojas.status_paused') || "Inactive")}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}

                
                </DialogContent>
            </Dialog>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingEvent ? t('admin.events.edit_event') : t('admin.events.add_new')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('admin.events.fill_details') || "Fill in the details for the upcoming event or festival."}
                        </DialogDescription>

                    </DialogHeader>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="mb-4 grid grid-cols-3">
                            <TabsTrigger value="en">{t('common.english') || "English"}</TabsTrigger>
                            <TabsTrigger value="hi">{t('common.hindi') || "Hindi"}</TabsTrigger>
                            <TabsTrigger value="mr">{t('common.marathi') || "Marathi"}</TabsTrigger>
                        </TabsList>


                        {["en", "hi", "mr"].map((lang) => (
                            <TabsContent key={lang} value={lang} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`name_${lang}`}>{t('admin.events.name_label')} ({t(`common.${lang}_short`)}) {lang === 'en' ? '*' : ''}</Label>

                                    <Input
                                        id={`name_${lang}`}
                                        placeholder={lang === 'en' ? "e.g. Maha Shivaratri" : lang === 'hi' ? "उदाहरण: महा शिवरात्रि" : "उदाहरणार्थ: महा शिवरात्री"}
                                        value={(formData as any)[`name_${lang}`]}
                                        onChange={(e) =>
                                            setFormData({ ...formData, [`name_${lang}`]: e.target.value })
                                        }
                                        required={lang === 'en'}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`description_${lang}`}>{t('admin.events.description_label')} ({t(`common.${lang}_short`)})</Label>

                                    <Textarea
                                        id={`description_${lang}`}
                                        placeholder={t('admin.events.description_label') + "..."}
                                        value={(formData as any)[`description_${lang}`]}
                                        onChange={(e) =>
                                            setFormData({ ...formData, [`description_${lang}`]: e.target.value })
                                        }
                                        className="h-24"
                                    />
                                </div>

                            </TabsContent>
                        ))}
                    </Tabs>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="templeId">{t('admin.events.temple_label')}</Label>
                            <select
                                id="templeId"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={formData.templeId}
                                onChange={(e) =>
                                    setFormData({ ...formData, templeId: e.target.value })
                                }
                            >
                                <option value="">{t('admin.events.global_temple') || "Global / No Temple Select"}</option>
                                {temples.map((temple) => (
                                    <option key={temple.id} value={temple.id}>
                                        {getLocalized(temple, 'name', language as Language)}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">{t('admin.events.date_label')} *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal h-10 border-input rounded-xl",
                                                !formData.date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.date ? (
                                                formData.date
                                            ) : (
                                                <span>{t('admin.events.pick_date') || "Pick a date"}</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formData.date ? new Date(formData.date) : undefined}
                                            onSelect={(date) =>
                                                setFormData({
                                                    ...formData,
                                                    date: date ? format(date, "PPP", { locale: calendarLocale }) : "",
                                                })
                                            }
                                            initialFocus
                                            locale={calendarLocale}
                                        />

                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium">{t('admin.events.time_label')} *</Label>

                                <div className="flex gap-1">
                                    <select
                                        className="flex-1 h-10 rounded-xl border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={timeData.hours}
                                        onChange={(e) => setTimeData({ ...timeData, hours: e.target.value })}
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="flex-1 h-10 rounded-xl border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={timeData.minutes}
                                        onChange={(e) => setTimeData({ ...timeData, minutes: e.target.value })}
                                    >
                                        {["00", "15", "30", "45"].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="w-16 h-10 rounded-xl border border-input bg-background px-2 text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={timeData.period}
                                        onChange={(e) => setTimeData({ ...timeData, period: e.target.value })}
                                    >
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                    </select>
                                </div>
                            </div>
                        </div>



                        <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50">
                            <div className="space-y-0.5">
                                <Label className="text-base font-semibold">{t('admin.events.status_label')}</Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('admin.events.status_desc') || "Show or hide this event on the platform"}
                                </p>
                            </div>
                            <Switch
                                checked={formData.status}
                                onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
                            />
                        </div>


                        {/* Recommended Temple Poojas Section */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-600" />
                                {t('admin.events.recommended_poojas')}
                            </Label>
                            {!formData.templeId ? (
                                <div className="border rounded-lg p-6 bg-amber-50/50 text-center">
                                    <p className="text-sm text-amber-800 font-medium">
                                        {t('admin.events.select_temple_first')}
                                    </p>
                                </div>
                            ) : (

                                <>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className="w-full justify-between h-auto min-h-[2.5rem] py-2"
                                                disabled={loadingPoojas || templePoojas.length === 0}
                                            >
                                                {loadingPoojas ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                        {t('admin.events.loading_poojas')}
                                                    </span>
                                                ) : templePoojas.length === 0 ? (
                                                    <span className="text-muted-foreground">{t('admin.events.no_poojas')}</span>
                                                ) : selectedPoojaIds.length === 0 ? (
                                                    <span className="text-muted-foreground">{t('admin.events.select_poojas')}</span>
                                                ) : (

                                                    <div className="flex flex-wrap gap-1">
                                                        {templePoojas
                                                            .filter(p => selectedPoojaIds.includes(p.id))
                                                            .map(pooja => (
                                                                <Badge key={pooja.id} variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200">
                                                                    {parseLocalizedValue(pooja.name)}
                                                                    <X
                                                                        className="w-3 h-3 ml-1 cursor-pointer hover:text-amber-900"
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
                                        <PopoverContent className="w-[520px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder={t('admin.events.search_poojas')} />
                                                <CommandEmpty>{t('admin.events.no_pooja_found')}</CommandEmpty>

                                                <CommandGroup className="max-h-64 overflow-auto">
                                                    {templePoojas.map((pooja) => (
                                                        <CommandItem
                                                            key={pooja.id}
                                                            value={parseLocalizedValue(pooja.name)}
                                                            onSelect={() => {
                                                                handlePoojaToggle(pooja.id, !selectedPoojaIds.includes(pooja.id));
                                                            }}
                                                            className="flex items-start gap-2 py-2"
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mt-1 h-4 w-4",
                                                                    selectedPoojaIds.includes(pooja.id) ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex-1">
                                                                <div className="font-medium">{getLocalized(pooja, 'name', language as Language)}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    ₹{pooja.price}
                                                                </div>
                                                            </div>

                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {selectedPoojaIds.length > 0 && (
                                        <p className="text-xs text-amber-700 font-medium">
                                            ✓ {selectedPoojaIds.length} {t('poojas.title') || "pooja(s)"} {t('marketplace.cart.added') || "selected"}
                                        </p>
                                    )}
                                </>
                            )}

                            <p className="text-xs text-muted-foreground">
                                {t('admin.events.rituals_label') || "Select poojas from the selected temple to recommend for this event"}
                            </p>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                {t('common.cancel') || "Cancel"}
                            </Button>
                            <Button type="submit">
                                {editingEvent ? (t('admin.events.edit_event') || "Update Event") : (t('admin.events.add_new') || "Create Event")}
                            </Button>
                        </DialogFooter>

                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
