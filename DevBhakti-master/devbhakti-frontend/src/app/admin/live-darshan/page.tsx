"use client";

import React, { useEffect, useState } from "react";
import { Eye, Loader2, Radio, Video, Power, PowerOff, Star, Info, Pencil } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchAllTemplesAdmin, toggleTempleStatusAdmin, updateTempleLiveConfigAdmin, setPrimaryLiveAdmin } from "@/api/adminController";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalized } from "@/utils/localization";

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

  const [selectedTemple, setSelectedTemple] = useState<any | null>(null);
  const [editLiveUrl, setEditLiveUrl] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
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
      } catch (error) {
        console.error("Failed to load live temples", error);
        toast({
          title: "Error",
          description: "Failed to load live darshan temples",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [toast, language]);

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
    setIsAddMode(false);
    setIsEditMode(true);
    setIsViewOnly(false);
    setSelectedTemple(entry);
    setEditLiveUrl(entry.temple?.liveUrl || "");
  };

  const openViewModal = (entry: any) => {
    setIsAddMode(false);
    setIsEditMode(false);
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
    const entry = allTemples[0];
    setIsAddMode(true);
    setIsEditMode(true);
    setIsViewOnly(false);
    setSelectedTemple(entry);
    setEditLiveUrl(entry.temple?.liveUrl || "");
  };

  const handleSaveConfig = async () => {
    if (!selectedTemple) return;
    setSavingConfig(true);
    try {
      const trimmedUrl = editLiveUrl.trim();

      // Admin add mode: mark temple live + visible by default
      if (isAddMode) {
        await updateTempleLiveConfigAdmin(selectedTemple.userId, {
          liveUrl: trimmedUrl,
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
          liveUrl: trimmedUrl,
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
      setSelectedTemple(null);
      setIsAddMode(false);
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
            ) : temples.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                Currently, no temple has enabled Live from their panel or provided a URL.
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
                  {temples.map((entry) => (
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedTemple} onOpenChange={(open) => !open && setSelectedTemple(null)}>
          <DialogContent className={isViewOnly ? "max-w-2xl" : "max-w-4xl"}>
            <DialogHeader>
              <DialogTitle className="flex flex-col gap-1">
                {isViewOnly ? "View Live Stream" : isAddMode ? "Add Live Darshan" : "Edit Live Config"} – {getLocalized(selectedTemple?.temple, 'name', language)}
                <span className="text-xs font-normal text-slate-500">
                  {getLocalized(selectedTemple?.temple, 'location', language)}
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className={`grid grid-cols-1 ${isViewOnly ? "" : "md:grid-cols-2"} gap-6 pt-2`}>
              {!isViewOnly && (
                <div className="space-y-4">
                  {isAddMode && (
                    <div className="space-y-2">
                      <Label className="text-slate-700 text-xs">Temple</Label>
                      <select
                        value={selectedTemple?.userId || ""}
                        onChange={(e) => {
                          const entry = allTemples.find((t) => t.userId === e.target.value);
                          if (!entry) return;
                          setSelectedTemple(entry);
                          setEditLiveUrl(entry.temple?.liveUrl || "");
                        }}
                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
                      >
                        {allTemples.map((entry) => (
                          <option key={entry.userId} value={entry.userId}>
                            {getLocalized(entry.temple, 'name', language) || "Untitled Temple"}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-slate-700 text-xs">Watch URL</Label>
                    <Input
                      value={editLiveUrl}
                      onChange={(e) => setEditLiveUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="h-9 text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    The temple can also change these values from their panel. You can correct them here in case of emergency.
                  </p>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTemple(null)}
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

              <div className="space-y-3">
                <Label className="text-slate-700 text-xs">Preview</Label>
                {previewEmbed ? (
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={`${previewEmbed}?autoplay=1&mute=1&rel=0`}
                      title="Live Preview"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400 text-center px-4">
                    Enter Watch URL for preview.
                  </div>
                )}
                <p className="text-[11px] text-slate-500">
                  This is just an admin preview. The final experience for the public will be visible in the landing Live section and on the `/live-darshan` page.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}