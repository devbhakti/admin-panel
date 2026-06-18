"use client";

import React, { useEffect, useState } from "react";
import { Eye, Loader2, Radio, Video, Power, PowerOff, Star, Info, Pencil, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { fetchAllTemplesAdmin, toggleTempleStatusAdmin, updateTempleLiveConfigAdmin, setPrimaryLiveAdmin } from "@/api/adminController";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalized } from "@/utils/localization";
import { getVideoRenderInfo, convertLiveboxToHls, extractYouTubeId } from "@/lib/utils/videoUtils";
import { UniversalVideoPlayer } from "@/components/video/UniversalVideoPlayer";

const getEmbedUrl = (value: string) => {
  if (!value) return "";
  const url = value.trim();

  if (url.startsWith("UC") && !url.includes("/") && !url.includes(".")) {
    return `https://www.youtube.com/embed/live_stream?channel=${url}`;
  }
  if (url.includes("youtu.be/")) {
    return url.replace("youtu.be/", "www.youtube.com/embed/");
  }
  if (url.includes("watch?v=")) {
    return url.replace("watch?v=", "embed/");
  }
  if (url.includes("youtube.com")) {
    return url;
  }
  return url;
};

export default function AdminLiveDarshanPage() {
  const { toast } = useToast();
  const { language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [temples, setTemples] = useState<any[]>([]);
  const [allTemples, setAllTemples] = useState<any[]>([]);
  const [recentTemples, setRecentTemples] = useState<any[]>([]);

  const [selectedTemple, setSelectedTemple] = useState<any | null>(null);
  const [editLiveUrl, setEditLiveUrl] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [templeSearchQuery, setTempleSearchQuery] = useState("");
  const [mainSearchQuery, setMainSearchQuery] = useState("");
  const [isSearchingTemples, setIsSearchingTemples] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [templeToDelete, setTempleToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const resetLiveModal = () => {
    setSelectedTemple(null);
    setEditLiveUrl("");
    setIsAddMode(false);
    setIsEditMode(false);
    setIsViewOnly(false);
    setTempleSearchQuery("");
    setIsPopoverOpen(false);
  };

  const previewInfo = getVideoRenderInfo(editLiveUrl);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchAllTemplesAdmin({ limit: 10 }); // Load initial 10 for quick selection
        const data = Array.isArray(res) ? res : (res.data || []);
        
        const actualTemples = data
          .filter((user: any) => user.temple)
          .map((user: any) => ({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userPhone: user.phone,
            isVerified: user.isVerified,
            temple: user.temple,
          }));

        setAllTemples(actualTemples);
        setRecentTemples(actualTemples);

        const liveCandidates = actualTemples.filter((t: any) => {
          const temple = t.temple;
          if (!temple) return false;
          const hasSelfLive = temple.isLive;
          const hasUrlOrChannel = temple.liveUrl || temple.channelId;
          return hasSelfLive && hasUrlOrChannel;
        });

        setTemples(liveCandidates);
      } catch (error) {
        console.error("Failed to load live temples", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [toast, language]);

  // API Based Search for Temples
  useEffect(() => {
    if (!isAddMode) return;
    
    const delayDebounceFn = setTimeout(async () => {
      if (!templeSearchQuery.trim()) {
        setAllTemples(recentTemples);
        setIsSearchingTemples(false);
        return;
      }
      
      setIsSearchingTemples(true);
      try {
        const res = await fetchAllTemplesAdmin({ search: templeSearchQuery, limit: 10 });
        const data = Array.isArray(res) ? res : (res.data || []);
        
        const searchResults = data
          .filter((user: any) => user.temple)
          .map((user: any) => ({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userPhone: user.phone,
            isVerified: user.isVerified,
            temple: user.temple,
          }));
        
        setAllTemples(searchResults);
      } catch (error) {
        console.error("Temple search error:", error);
      } finally {
        setIsSearchingTemples(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [templeSearchQuery, isAddMode]);

  const handleToggleAdminLive = async (entry: any) => {
    try {
      await toggleTempleStatusAdmin(entry.userId, entry.isVerified, entry.temple?.isActive ?? true, {
        liveStatus: !entry.temple?.liveStatus,
      });
      toast({
        title: "Updated",
        description: `Temple live visibility ${!entry.temple?.liveStatus ? "enabled" : "disabled"} on website.`,
      });

      const data = await fetchAllTemplesAdmin();
      const actualTemples = data
        .filter((user: any) => user.temple)
        .map((user: any) => ({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone,
          isVerified: user.isVerified,
          temple: user.temple,
        }));
      const liveCandidates = actualTemples.filter((t: any) => {
        const temple = t.temple;
        if (!temple) return false;
        const hasSelfLive = temple.isLive;
        const hasUrlOrChannel = temple.liveUrl || temple.channelId;
        return hasSelfLive && hasUrlOrChannel;
      });
      setTemples(liveCandidates);
    } catch (error: any) {
      console.error("Toggle admin live error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update live visibility",
        variant: "destructive",
      });
    }
  };

  const handleSetPrimary = async (entry: any) => {
    try {
      await setPrimaryLiveAdmin(entry.userId);
      toast({
        title: "Primary Updated",
        description: `${entry.temple?.name} is now the primary live darshan on the homepage.`,
      });

      const data = await fetchAllTemplesAdmin();
      const actualTemples = data
        .filter((user: any) => user.temple)
        .map((user: any) => ({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone,
          isVerified: user.isVerified,
          temple: user.temple,
        }));
      const liveCandidates = actualTemples.filter((t: any) => {
        const temple = t.temple;
        if (!temple) return false;
        const hasSelfLive = temple.isLive;
        const hasUrlOrChannel = temple.liveUrl || temple.channelId;
        return hasSelfLive && hasUrlOrChannel;
      });
      setTemples(liveCandidates);
    } catch (error: any) {
      console.error("Set primary error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to set primary temple",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (entry: any) => {
    resetLiveModal();
    setIsEditMode(true);
    setSelectedTemple(entry);
    setEditLiveUrl(entry.temple?.liveUrl || "");
  };

  const openViewModal = (entry: any) => {
    resetLiveModal();
    setIsViewOnly(true);
    setSelectedTemple(entry);
    setEditLiveUrl(entry.temple?.liveUrl || "");
  };

  const openAddModal = () => {
    if (allTemples.length === 0) {
      toast({
        title: "No temples found",
        description: "First create/approve temples, then you can configure live settings for them.",
        variant: "destructive",
      });
      return;
    }
    resetLiveModal();
    const entry = allTemples[0];
    setIsAddMode(true);
    setIsEditMode(true);
    setSelectedTemple(entry);
    setEditLiveUrl(entry.temple?.liveUrl || "");
    setAllTemples(recentTemples);
  };

  const handleSaveConfig = async () => {
    if (!selectedTemple) return;
    setSavingConfig(true);
    try {
      const trimmedUrl = editLiveUrl.trim();
      // If admin pasted a Livebox player URL, prefer saving direct HLS stream URL
      const derivedHls = convertLiveboxToHls(trimmedUrl);
      const urlToSave = derivedHls || trimmedUrl;

      // Admin add mode: mark temple live + visible by default
      if (isAddMode) {
        await updateTempleLiveConfigAdmin(selectedTemple.userId, {
          liveUrl: urlToSave,
          isLive: true,
        });
        await toggleTempleStatusAdmin(
          selectedTemple.userId,
          selectedTemple.isVerified,
          selectedTemple.temple?.isActive ?? true,
          { liveStatus: true }
        );
      } else {
        await updateTempleLiveConfigAdmin(selectedTemple.userId, {
          liveUrl: urlToSave,
        });
      }
      toast({
        title: "Saved",
        description: "Live configuration updated successfully.",
      });

      const data = await fetchAllTemplesAdmin();
      const actualTemples = data
        .filter((user: any) => user.temple)
        .map((user: any) => ({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone,
          isVerified: user.isVerified,
          temple: user.temple,
        }));
      setAllTemples(actualTemples);
      const liveCandidates = actualTemples.filter((t: any) => {
        const temple = t.temple;
        if (!temple) return false;
        const hasSelfLive = temple.isLive;
        const hasUrlOrChannel = temple.liveUrl || temple.channelId;
        return hasSelfLive && hasUrlOrChannel;
      });
      setTemples(liveCandidates);
      resetLiveModal();
    } catch (error: any) {
      console.error("Save live config error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save live config",
        variant: "destructive",
      });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleDeleteLive = async () => {
    if (!templeToDelete) return;
    setDeleting(true);
    try {
      // 1. Reset live config
      await updateTempleLiveConfigAdmin(templeToDelete.userId, {
        isLive: false,
        liveUrl: "",
        channelId: "",
      });

      // 2. Hide from website visibility as well
      await toggleTempleStatusAdmin(
        templeToDelete.userId,
        templeToDelete.isVerified,
        templeToDelete.temple?.isActive ?? true,
        { liveStatus: false }
      );

      toast({
        title: "Deleted",
        description: "Live Darshan configuration removed successfully.",
      });

      // Refresh list
      const res = await fetchAllTemplesAdmin();
      const data = Array.isArray(res) ? res : (res.data || []);
      const actualTemples = data
        .filter((user: any) => user.temple)
        .map((user: any) => ({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone,
          isVerified: user.isVerified,
          temple: user.temple,
        }));
      
      const liveCandidates = actualTemples.filter((t: any) => {
        const temple = t.temple;
        if (!temple) return false;
        const hasSelfLive = temple.isLive;
        const hasUrlOrChannel = temple.liveUrl || temple.channelId;
        return hasSelfLive && hasUrlOrChannel;
      });
      setTemples(liveCandidates);
    } catch (error: any) {
      console.error("Delete live error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete live configuration",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setTempleToDelete(null);
    }
  };

  const previewEmbed = getEmbedUrl(editLiveUrl);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Video className="w-6 h-6 text-primary" />
              Live Darshan Control
            </h1>
            <p className="text-slate-600 text-sm">
              Control the visibility of temples on the website that have enabled Live Darshan and provided a URL from their panel.
            </p>
          </div>
          <div className="flex-1 max-w-sm relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <Input 
                placeholder="Search live temples..." 
                className="pl-10 h-9"
                value={mainSearchQuery}
                onChange={(e) => setMainSearchQuery(e.target.value)}
             />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={openAddModal}>
              Add Live Darshan
            </Button>
          </div>
        </div>

        <Card className="border rounded-xl bg-card overflow-hidden shadow-sm">
          <CardHeader className="border-b bg-slate-50/80">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Radio className="w-4 h-4 text-destructive" />
              Live Temples ({temples.length})
            </CardTitle>
            <CardDescription className="text-xs">
              The list only contains temples that have enabled Live toggle from their profile and provided a live watch URL.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading live temples...</span>
              </div>
            ) : temples.filter(t => {
                const query = mainSearchQuery.toLowerCase();
                const name = getLocalized(t.temple, 'name', language).toLowerCase();
                const location = getLocalized(t.temple, 'location', language).toLowerCase();
                return name.includes(query) || location.includes(query);
              }).length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                {mainSearchQuery ? "No live temples match your search." : "Currently, no temple has enabled Live from their panel or provided a URL."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Temple</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Live Source</TableHead>
                    <TableHead>Website Visibility</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {temples
                    .filter(t => {
                      const query = mainSearchQuery.toLowerCase();
                      const name = getLocalized(t.temple, 'name', language).toLowerCase();
                      const location = getLocalized(t.temple, 'location', language).toLowerCase();
                      return name.includes(query) || location.includes(query);
                    })
                    .map((entry) => (
                    <TableRow key={entry.userId}>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-slate-900">{getLocalized(entry.temple, 'name', language) || "N/A"}</span>
                          <span className="text-xs text-slate-600">{getLocalized(entry.temple, 'location', language) || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 text-xs text-slate-700">
                          <span>{getLocalized(entry, 'userName', language)}</span>
                          <span className="text-slate-500">{entry.userEmail || entry.userPhone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs max-w-xs">
                           <span className="text-slate-600 truncate">
                             URL: {entry.temple?.liveUrl || "—"}
                           </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium ${entry.temple?.liveStatus
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-50 text-slate-500 border border-slate-200"
                              }`}
                          >
                            {entry.temple?.liveStatus ? (
                              <>
                                <Power className="w-3 h-3" /> On Website
                              </>
                            ) : (
                              <>
                                <PowerOff className="w-3 h-3" /> Hidden
                              </>
                            )}
                          </div>
                          <Switch
                            checked={entry.temple?.liveStatus || false}
                            onCheckedChange={() => handleToggleAdminLive(entry)}
                            disabled={!entry.isVerified}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${entry.temple?.isPrimaryLive ? "text-amber-500 fill-amber-500" : "text-slate-400"}`}
                                onClick={() => handleSetPrimary(entry)}
                              >
                                <Star className={`w-4 h-4 ${entry.temple?.isPrimaryLive ? "fill-amber-500" : ""}`} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-xs">
                                {entry.temple?.isPrimaryLive
                                  ? "Main video on homepage"
                                  : "Click to feature this temple as the main video on the homepage"}
                              </p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400"
                              >
                                <Info className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-[11px] leading-relaxed">
                                Setting a temple as <strong>Primary</strong> will make its live stream the main featured video on the landing page's Live Darshan section. Only one temple can be primary at a time.
                              </p>
                            </TooltipContent>
                          </Tooltip>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-700"
                            onClick={() => openViewModal(entry)}
                            title="View Live Stream"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => openEditModal(entry)}
                            title="Edit Live Config"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => setTempleToDelete(entry)}
                            title="Delete Live Config"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedTemple} onOpenChange={(open) => !open && resetLiveModal()}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex flex-col gap-1">
                {isViewOnly ? "View Live Stream" : isAddMode ? "Add Live Darshan" : "Edit Live Config"} – {getLocalized(selectedTemple?.temple, 'name', language)}
                <span className="text-xs font-normal text-slate-500">
                  {getLocalized(selectedTemple?.temple, 'location', language)}
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-6 pt-2">
              {!isViewOnly && (
                <div className="space-y-4">
                  {isAddMode && (
                    <div className="space-y-2">
                      <Label className="text-slate-700 text-xs">Temple</Label>
                      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full h-9 justify-between text-sm"
                          >
                            {selectedTemple
                              ? getLocalized(selectedTemple.temple, 'name', language) || "Untitled Temple"
                              : "Select temple..."}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Search temples..."
                              value={templeSearchQuery}
                              onValueChange={setTempleSearchQuery}
                              className="h-9"
                            />
                            <CommandList>
                              {isSearchingTemples ? (
                                <div className="flex items-center justify-center py-6 gap-2 text-xs text-muted-foreground">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Searching API...</span>
                                </div>
                              ) : (
                                <CommandEmpty>No temple found.</CommandEmpty>
                              )}
                              <CommandGroup>
                                {allTemples
                                  .map((entry) => (
                                    <CommandItem
                                      key={entry.userId}
                                      value={entry.userId}
                                      onSelect={() => {
                                        setSelectedTemple(entry);
                                        setEditLiveUrl(entry.temple?.liveUrl || "");
                                        setTempleSearchQuery("");
                                        setIsPopoverOpen(false);
                                      }}
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium">
                                          {getLocalized(entry.temple, 'name', language) || "Untitled Temple"}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {getLocalized(entry.temple, 'location', language) || ""}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-slate-700 text-xs">Watch URL / Video URL / Iframe URL</Label>
                    <Input
                      value={editLiveUrl}
                      onChange={(e) => setEditLiveUrl(e.target.value)}
                      placeholder="Paste any video URL or iframe embed code"
                      className="w-full h-11 text-sm"
                    />
                     {(() => {
                       const derived = convertLiveboxToHls(editLiveUrl);
                       return derived ? (
                         <div className="mt-2 flex items-center gap-2">
                           <Button size="sm" variant="outline" onClick={() => setEditLiveUrl(derived)}>
                             Use direct HLS stream
                           </Button>
                           <a href={derived} target="_blank" rel="noreferrer" className="text-xs text-slate-500 underline">Open HLS</a>
                         </div>
                       ) : null;
                     })()}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    The temple can also change these values from their panel. You can correct them here in case of emergency.
                  </p>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetLiveModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveConfig}
                      disabled={savingConfig}
                    >
                      {savingConfig && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                      Save
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-w-2xl mx-auto">
                <Label className="text-slate-700 text-xs">Preview</Label>
                {previewInfo.kind !== "unknown" ? (
                  previewInfo.platform === "youtube" ? (
                    // YouTube thumbnail preview — works on localhost, IP, and .com (no embed needed)
                    (() => {
                      const ytId = extractYouTubeId(editLiveUrl);
                      const thumbUrl = ytId
                        ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
                        : null;
                      const watchUrl = ytId
                        ? `https://www.youtube.com/watch?v=${ytId}`
                        : editLiveUrl;
                      return (
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black relative group">
                          {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt="YouTube video thumbnail"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to hqdefault if maxresdefault missing
                                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                              <span className="text-slate-400 text-xs">No thumbnail available</span>
                            </div>
                          )}
                          {/* Play button overlay */}
                          <a
                            href={watchUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                              <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                            <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">Watch on YouTube</span>
                          </a>
                          {/* Always-visible small watch link */}
                          <a
                            href={watchUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="absolute bottom-2 right-2 text-[10px] text-white bg-black/60 px-2 py-0.5 rounded hover:bg-black/80 transition"
                          >
                            ▶ Watch on YouTube
                          </a>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                      <UniversalVideoPlayer
                        url={editLiveUrl}
                        className="w-full h-full object-cover"
                        controls
                        muted
                        playsInline
                      />
                    </div>
                  )
                ) : (
                  <div className="aspect-video w-full rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400 text-center px-4">
                    Enter a supported video URL or iframe embed code for preview.
                  </div>
                )}
                <p className="text-[11px] text-slate-500">
                  This is just an admin preview. The final experience for the public will be visible in the landing Live section and on the <code>/live-darshan</code> page.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!templeToDelete} onOpenChange={(open) => !open && setTempleToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the Live Darshan configuration for <strong>{getLocalized(templeToDelete?.temple, 'name', language)}</strong>. 
                The live stream will no longer be visible on the website. You can add it back later if needed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteLive();
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Live Darshan"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}