"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Download, Link2 } from "lucide-react";

interface TempleQrDialogProps {
  temple: {
    id: string;
    slug?: string;
    subdomain?: string;
    urlType?: string;
    name?: string;
  };
  buttonLabel?: string;
}

export default function TempleQrDialog({ temple, buttonLabel = "QR" }: TempleQrDialogProps) {
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Use the current origin so that local testing works across devices on the same network
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://devbhakti.com";
  const qrUrl = `${baseUrl}/qr/${temple.id}`;

  useEffect(() => {
    if (!open || !qrUrl) return;

    QRCode.toDataURL(qrUrl, { margin: 1, width: 280 })
      .then((url) => setQrDataUrl(url))
      .catch((error) => {
        console.error("QR generation failed:", error);
        setQrDataUrl("");
      });
  }, [open, qrUrl]);

  const handleCopy = async () => {
    if (!qrUrl) return;
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${temple.slug || temple.id}-qr.png`;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Temple QR Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold">Stable QR Link</p>
            <p className="mt-2 break-all">{qrUrl || "Generating..."}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* <Button variant="secondary" className="gap-2" onClick={handleCopy} disabled={!qrUrl}>
              <Copy className="w-4 h-4" />
              {copied ? "Copied" : "Copy Link"}
            </Button> */}
            <Button variant="outline" className="gap-2" onClick={handleDownload} disabled={!qrDataUrl}>
              <Download className="w-4 h-4" />
              Download PNG
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-4">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Temple QR code" className="h-56 w-56 object-contain" />
            ) : (
              <div className="flex h-56 w-56 items-center justify-center text-slate-400">Generating QR...</div>
            )}
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="font-medium">Stable QR Note</p>
            <p className="mt-2">This QR is built on the temple&apos;s stable id route and will continue working even if the temple switches between slug and subdomain URLs.</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <a href={qrUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
              <Link2 className="w-4 h-4" /> Open QR Link
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
