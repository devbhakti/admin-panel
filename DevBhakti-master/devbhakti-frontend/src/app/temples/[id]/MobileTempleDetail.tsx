"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    Share2,
    MapPin,
    Star,
    Video,
    Calendar,
    Heart,
    Camera,
    ShoppingBag,
    Ticket,
    Play,
    Clock,
    Phone,
    Info,
    CheckCircle,
    Download,
    X,
    FileText,
    ArrowRight,
    IndianRupee,
    ShoppingCart,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { getLiveDarshanUrl } from "@/lib/utils/templeUtils";
import { getLocalized } from "@/utils/localization";
import { BASE_URL } from "@/config/apiConfig";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { TempleDetailProps } from "./TempleDetail";

export default function MobileTempleDetail({
    temple,
    isFavorite,
    activeImageIndex,
    setActiveImageIndex,
    isFullViewOpen,
    setIsFullViewOpen,
    selectedPurposes,
    setSelectedPurposes,
    showRatings,
    selectedEvent,
    setSelectedEvent,
    videoPlayUrl,
    setVideoPlayUrl,
    showAllEvents,
    setShowAllEvents,
    purposes,
    recommendedPoojas,
    galleryMedia,
    products,
    goToNext,
    goToPrev,
    goToMedia,
    toggleFavorite,
    handleDonation,
    handleBookPooja,
    getYouTubeId,
    getFullImageUrl,
    language,
    t,
    router,
    params,
}: TempleDetailProps) {
    // Photography Dialog state
    const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
    const [photoStep, setPhotoStep] = useState(1);
    const [selectedPhotoType, setSelectedPhotoType] = useState("Personal Photography");
    const [photoPrice, setPhotoPrice] = useState(251);
    const [selectedPhotoDate, setSelectedPhotoDate] = useState("");
    const [selectedPhotoSlot, setSelectedPhotoSlot] = useState("08:00 AM - 10:00 AM");
    const [agreedToRules, setAgreedToRules] = useState(false);

    // Donation amount
    const [donationAmount, setDonationAmount] = useState<number>(251);

    const { addToCart: addToCartGlobal } = useCart();
    const { toast } = useToast();

    const resetPhotoFlow = () => {
        setIsPhotoDialogOpen(false);
        setPhotoStep(1);
        setAgreedToRules(false);
    };

    const handlePhotoSubmit = () => {
        if (photoStep < 6) setPhotoStep(photoStep + 1);
    };

    const handleAddToCart = (product: any) => {
        const variant = product.variants?.[0];
        if (!variant) return;
        addToCartGlobal({
            productId: product.id,
            variantId: variant.id,
            name: getLocalized(product, "name", language),
            variantName: getLocalized(variant, "name", language),
            price: variant.price,
            image: product.image || "",
            quantity: 1,
            templeId: product.templeId,
        });
        toast({
            title: "Added to Cart",
            description: `${getLocalized(product, "name", language)} added to cart!`,
            variant: "success",
        });
    };

    const getProductImageUrl = (path: string) => {
        if (!path) return "/placeholder.jpg";
        if (path.startsWith("http")) return path;
        return `${BASE_URL}${path}`;
    };

    // Dynamic darshan timings
    const activeOperatingHours = temple.operatingHours && Array.isArray(temple.operatingHours)
        ? temple.operatingHours.filter((s: any) => s.active)
        : [];

    // Dynamic events (upcoming)
    const upcomingEvents = temple.events || [];
    const displayedEvents = showAllEvents ? upcomingEvents : upcomingEvents.slice(0, 3);

    return (
        <div className="min-h-screen bg-[#faf8f6] pb-28 text-[#3c2a21] font-sans antialiased">

            {/* ───── Hero Image ───── */}
            <div className="relative h-[42vh] overflow-hidden rounded-b-[2.5rem] shadow-lg">
                <img
                    src={getFullImageUrl(temple.image)}
                    alt={getLocalized(temple, "name", language)}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Top nav */}
                <div className="absolute top-5 left-4 right-4 flex justify-between z-10">
                    <button
                        onClick={() => router.back()}
                        className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm text-[#7c4624] shadow-md active:scale-95 transition-transform"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm text-[#7c4624] shadow-md active:scale-95 transition-transform"
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({ title: getLocalized(temple, "name", language), url: window.location.href });
                            }
                        }}
                    >
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>

                {/* Live badge on hero */}
                {temple.liveStatus && (
                    <div className="absolute bottom-16 left-6 z-10 flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                        Live Darshan
                    </div>
                )}
            </div>

            {/* ───── Floating Info Card ───── */}
            <div className="relative px-4 -mt-10 z-20">
                <div className="bg-white rounded-3xl p-5 shadow-xl border border-orange-50">
                    <h1 className="text-2xl font-serif font-black text-[#5c3a21] leading-tight">
                        {getLocalized(temple, "name", language)}
                    </h1>
                    <div className="flex items-center gap-1.5 text-muted-foreground mt-1.5 text-xs">
                        <MapPin className="h-3.5 w-3.5 text-[#7c4624] shrink-0" />
                        <span className="truncate">{getLocalized(temple, "fullAddress", language)}</span>
                    </div>

                    {showRatings && temple.rating && (
                        <div className="flex items-center gap-1 mt-2">
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-bold text-foreground">{temple.rating}</span>
                            <span className="text-xs text-muted-foreground">({(temple.reviewsCount || 0).toLocaleString()} reviews)</span>
                        </div>
                    )}

                    {/* Live status strip */}
                    {temple.liveStatus && (
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-orange-50">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                                <span className="text-xs font-bold text-green-700">Live Darshan Available</span>
                            </div>
                            <span className="text-[11px] text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-md font-semibold">Watching Now</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ───── Quick Actions Grid ───── */}
            <div className="mt-5 px-4">
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50/50">
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-3 gap-y-5 gap-x-2">

                        {/* Book Pooja */}
                        <button onClick={handleBookPooja} className="flex flex-col items-center p-1.5 rounded-2xl hover:bg-orange-50/50 active:scale-95 transition-all text-center">
                            <div className="h-12 w-12 bg-orange-100/70 rounded-2xl flex items-center justify-center mb-2 text-[#7c4624] shadow-sm">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <span className="text-[11px] font-bold leading-tight">Book Pooja</span>
                        </button>

                        {/* Donate */}
                        <button onClick={handleDonation} className="flex flex-col items-center p-1.5 rounded-2xl hover:bg-orange-50/50 active:scale-95 transition-all text-center">
                            <div className="h-12 w-12 bg-red-50 rounded-2xl flex items-center justify-center mb-2 text-red-500 shadow-sm">
                                <Heart className="h-6 w-6" />
                            </div>
                            <span className="text-[11px] font-bold leading-tight">Donate</span>
                        </button>

                        {/* Live Darshan – only when live */}
                        {temple.liveStatus ? (
                            <Link href={getLiveDarshanUrl(temple)} className="flex flex-col items-center p-1.5 rounded-2xl hover:bg-orange-50/50 active:scale-95 transition-all text-center">
                                <div className="h-12 w-12 bg-red-100/60 rounded-2xl flex items-center justify-center mb-2 text-red-600 shadow-sm relative">
                                    <Video className="h-6 w-6" />
                                    <span className="absolute top-1 right-1 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                </div>
                                <span className="text-[11px] font-bold leading-tight">Live Darshan</span>
                            </Link>
                        ) : (
                            <div className="flex flex-col items-center p-1.5 rounded-2xl opacity-40 cursor-not-allowed text-center">
                                <div className="h-12 w-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-2 text-gray-400 shadow-sm">
                                    <Video className="h-6 w-6" />
                                </div>
                                <span className="text-[11px] font-bold leading-tight">Live Darshan</span>
                            </div>
                        )}

                        {/* Photography */}
                        <button onClick={() => { setPhotoStep(1); setIsPhotoDialogOpen(true); }} className="flex flex-col items-center p-1.5 rounded-2xl hover:bg-orange-50/50 active:scale-95 transition-all text-center">
                            <div className="h-12 w-12 bg-amber-100/60 rounded-2xl flex items-center justify-center mb-2 text-amber-700 shadow-sm">
                                <Camera className="h-6 w-6" />
                            </div>
                            <span className="text-[11px] font-bold leading-tight">Photography</span>
                        </button>

                        {/* Temple Shop */}
                        <button onClick={() => document.getElementById("mobile-shop-section")?.scrollIntoView({ behavior: "smooth" })} className="flex flex-col items-center p-1.5 rounded-2xl hover:bg-orange-50/50 active:scale-95 transition-all text-center">
                            <div className="h-12 w-12 bg-[#3c2a21]/10 rounded-2xl flex items-center justify-center mb-2 text-[#3c2a21] shadow-sm">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                            <span className="text-[11px] font-bold leading-tight">Temple Shop</span>
                        </button>

                        {/* Darshan Tickets */}
                        <button onClick={handleBookPooja} className="flex flex-col items-center p-1.5 rounded-2xl hover:bg-orange-50/50 active:scale-95 transition-all text-center">
                            <div className="h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-2 text-amber-600 shadow-sm">
                                <Ticket className="h-6 w-6" />
                            </div>
                            <span className="text-[11px] font-bold leading-tight">Darshan Tickets</span>
                        </button>

                    </div>
                </div>
            </div>

            {/* ───── Live Darshan Video Card ───── */}
            {temple.liveStatus && (
                <div className="mt-5 px-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-serif font-bold text-lg text-[#5c3a21] flex items-center gap-1.5">
                            <Video className="w-5 h-5 text-red-500" /> Live Darshan
                        </h3>
                        <Link href={getLiveDarshanUrl(temple)} className="text-xs font-bold text-[#7c4624] hover:underline">View All</Link>
                    </div>
                    <Link href={getLiveDarshanUrl(temple)} className="block">
                        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-md group">
                            <img src={getFullImageUrl(temple.image)} alt="Live Darshan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-16 h-16 bg-red-600/90 text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                    <Play className="h-8 w-8 fill-white ml-1.5" />
                                </div>
                            </div>
                            <div className="absolute top-4 left-4 bg-red-600 text-white font-black text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Live
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <h4 className="font-bold text-sm drop-shadow-md">{getLocalized(temple, "name", language)}</h4>
                                <p className="text-[10px] opacity-80 mt-0.5">Tap to watch live</p>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* ───── Popular Poojas & Sevas ───── */}
            <div className="mt-5 px-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-serif font-bold text-lg text-[#5c3a21] flex items-center gap-1.5">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-400/20" /> Popular Poojas & Sevas
                    </h3>
                    <button onClick={handleBookPooja} className="text-xs font-bold text-[#7c4624] hover:underline">View All</button>
                </div>

                {temple.poojas && temple.poojas.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory">
                        {temple.poojas.map((pooja: any, idx: number) => (
                            <div
                                key={pooja.id || idx}
                                className="w-[170px] bg-white rounded-3xl p-3 border border-orange-50/50 shadow-sm flex flex-col justify-between shrink-0 snap-start active:scale-[0.98] transition-transform cursor-pointer"
                                onClick={() => router.push(`/poojas/${pooja.slug || pooja.id}`)}
                            >
                                <div>
                                    <div className="h-28 rounded-2xl bg-orange-50 overflow-hidden mb-3">
                                        {pooja.image ? (
                                            <img src={getFullImageUrl(pooja.image)} alt={getLocalized(pooja, "name", language)} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={getFullImageUrl(temple.image)} alt={getLocalized(pooja, "name", language)} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <h4 className="font-bold text-xs text-[#3c2a21] leading-snug line-clamp-2 min-h-[2rem]">
                                        {getLocalized(pooja, "name", language)}
                                    </h4>
                                </div>
                                <div className="mt-3 pt-2 border-t border-orange-50 flex items-center justify-between">
                                    <span className="font-serif font-black text-sm text-[#7c4624] flex items-center gap-0.5">
                                        <IndianRupee className="h-3 w-3" />{pooja.price}
                                    </span>
                                    <Button
                                        size="sm"
                                        className="h-7 px-3 text-[10px] font-bold rounded-full bg-[#7c4624] hover:bg-[#5c3a21] text-white"
                                        onClick={(e) => { e.stopPropagation(); router.push(`/poojas/${pooja.slug || pooja.id}`); }}
                                    >
                                        Book
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-8 text-center text-xs text-muted-foreground border border-orange-50/50 italic">
                        No Poojas scheduled at the moment.
                    </div>
                )}
            </div>

            {/* ───── Donation Fast Action ───── */}
            <div className="mt-5 px-4">
                <div className="bg-[#fcede4] rounded-3xl p-5 shadow-sm border border-orange-100">
                    <h3 className="font-serif font-bold text-lg text-[#5c3a21] mb-1">Donations</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
                        Support annadaan, gau seva and upkeep of this sacred temple.
                    </p>
                    <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none pb-1">
                        {[101, 251, 501, 1101].map((amt) => (
                            <button
                                key={amt}
                                onClick={() => setDonationAmount(amt)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                                    donationAmount === amt ? "bg-[#7c4624] text-white shadow-sm" : "bg-white text-[#7c4624] border border-orange-100"
                                }`}
                            >
                                ₹{amt}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                const custom = prompt("Enter donation amount:", "2000");
                                if (custom && !isNaN(Number(custom)) && Number(custom) > 0) setDonationAmount(Number(custom));
                            }}
                            className="px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 bg-white text-[#7c4624] border border-orange-100"
                        >
                            Other
                        </button>
                    </div>
                    <Button onClick={handleDonation} className="w-full h-12 rounded-2xl bg-[#7c4624] hover:bg-[#5c3a21] text-white text-xs font-bold gap-2 shadow-sm">
                        <Heart className="h-4 w-4 fill-white" />
                        Donate ₹{donationAmount} Now
                    </Button>
                    {/* <p className="text-center text-[10px] text-[#7c4624]/75 mt-3 font-semibold">Instant Receipt • 80G Tax Exemption</p> */}
                </div>
            </div>

            {/* ───── Temple Information ───── */}
            <div className="mt-5 px-4">
                <h3 className="font-serif font-bold text-lg text-[#5c3a21] mb-3">Temple Information</h3>
                <div className="space-y-3">

                    {/* Darshan Timings — DYNAMIC */}
                    <div className="bg-white rounded-3xl p-4 border border-orange-50/50 shadow-sm flex items-start gap-3.5">
                        <div className="h-10 w-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Darshan Timings</h4>
                            {activeOperatingHours.length > 0 ? (
                                <div className="space-y-1 mt-1.5">
                                    {activeOperatingHours.map((slot: any, idx: number) => (
                                        <p key={idx} className="text-xs text-foreground">
                                            <span className="font-bold">{slot.label}: </span>
                                            <span className="font-medium text-[#7c4624]">{slot.start} – {slot.end}</span>
                                        </p>
                                    ))}
                                </div>
                            ) : temple.openTime ? (
                                <p className="text-xs font-bold text-[#7c4624] mt-1.5 uppercase">{temple.openTime}</p>
                            ) : (
                                <p className="text-xs text-muted-foreground mt-1.5 italic">Timings not available</p>
                            )}
                        </div>
                    </div>

                    {/* Directions */}
                    {temple.mapUrl && (
                        <a href={temple.mapUrl} target="_blank" rel="noopener noreferrer" className="bg-white rounded-3xl p-4 border border-orange-50/50 shadow-sm flex items-start gap-3.5 active:bg-orange-50/20">
                            <div className="h-10 w-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Directions</h4>
                                <p className="text-xs font-bold text-foreground mt-1 truncate">{getLocalized(temple, "fullAddress", language)}</p>
                                <span className="text-[10px] text-[#7c4624] font-bold mt-1 flex items-center gap-0.5">Open in Google Maps <ArrowRight className="h-3 w-3" /></span>
                            </div>
                        </a>
                    )}

                    {/* Contact */}
                    {temple.phone && (
                        <a href={`tel:${temple.phone}`} className="bg-white rounded-3xl p-4 border border-orange-50/50 shadow-sm flex items-start gap-3.5 active:bg-green-50/10">
                            <div className="h-10 w-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 shrink-0">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Contact</h4>
                                <p className="text-xs font-bold text-foreground mt-1">{temple.phone}</p>
                            </div>
                        </a>
                    )}

                    {/* About Temple */}
                    {getLocalized(temple, "description", language) && (
                        <div className="bg-white rounded-3xl p-4 border border-orange-50/50 shadow-sm flex items-start gap-3.5">
                            <div className="h-10 w-10 bg-[#7c4624]/10 rounded-2xl flex items-center justify-center text-[#7c4624] shrink-0">
                                <Info className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">About Temple</h4>
                                <div
                                    className="text-xs text-muted-foreground leading-relaxed line-clamp-4 prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: getLocalized(temple, "description", language) || "" }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ───── Gallery ───── */}
            {galleryMedia.length > 0 && (
                <div className="mt-5 px-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-serif font-bold text-lg text-[#5c3a21]">Gallery</h3>
                        <button onClick={() => { setActiveImageIndex(0); setIsFullViewOpen(true); }} className="text-xs font-bold text-[#7c4624] hover:underline">View All</button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {galleryMedia.slice(0, 4).map((item, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    if (item.type === "video") { setVideoPlayUrl(item.url); }
                                    else { setActiveImageIndex(index); setIsFullViewOpen(true); }
                                }}
                                className="aspect-square rounded-2xl overflow-hidden relative shadow-sm border border-orange-50 bg-white cursor-pointer"
                            >
                                {item.type === "image" ? (
                                    <img src={getFullImageUrl(item.url)} alt="Gallery" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-black flex items-center justify-center relative">
                                        <img src={`https://img.youtube.com/vi/${getYouTubeId(item.url)}/default.jpg`} alt="Video" className="w-full h-full object-cover opacity-60" />
                                        <Play className="absolute h-5 w-5 text-white fill-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ───── Temple Shop — DYNAMIC (products from this temple) ───── */}
            <div id="mobile-shop-section" className="mt-5 px-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-serif font-bold text-lg text-[#5c3a21] flex items-center gap-1.5">
                        <ShoppingBag className="w-5 h-5 text-[#7c4624]" /> Temple Shop
                    </h3>
                    <button onClick={() => router.push(`/marketplace?templeId=${temple.id}`)} className="text-xs font-bold text-[#7c4624] hover:underline">View All</button>
                </div>

                {products.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory">
                        {products.map((product: any) => {
                            const price = product.variants?.[0]?.price;
                            const outOfStock = product.variants?.every((v: any) => v.stock === 0);
                            return (
                                <div
                                    key={product.id}
                                    className="w-[148px] bg-white rounded-3xl p-3 border border-orange-50/50 shadow-sm snap-start shrink-0 cursor-pointer"
                                    onClick={() => router.push(`/marketplace/product/${product.id}`)}
                                >
                                    <div className="h-24 rounded-2xl bg-orange-50 overflow-hidden mb-2 relative">
                                        {product.image ? (
                                            <img src={getProductImageUrl(product.image)} alt={getLocalized(product, "name", language)} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                                <ShoppingBag className="h-8 w-8" />
                                            </div>
                                        )}
                                        {outOfStock && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                                                <span className="text-white text-[9px] font-black uppercase tracking-wider">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-xs text-[#3c2a21] leading-tight line-clamp-2 min-h-[2rem]">
                                        {getLocalized(product, "name", language)}
                                    </h4>
                                    <div className="mt-2 flex items-center justify-between">
                                        {price !== undefined ? (
                                            <span className="font-bold text-xs text-[#7c4624] flex items-center gap-0.5">
                                                <IndianRupee className="h-3 w-3" />{price}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                        <button
                                            disabled={outOfStock}
                                            onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                                            className="h-7 w-7 rounded-full bg-[#7c4624]/10 hover:bg-[#7c4624]/20 flex items-center justify-center text-[#7c4624] disabled:opacity-30 transition-colors"
                                        >
                                            <ShoppingCart className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-8 text-center text-xs text-muted-foreground border border-orange-50/50 italic">
                        No products available from this temple yet.
                    </div>
                )}
            </div>

            {/* ───── Upcoming Events — DYNAMIC (replaces static Latest Updates) ───── */}
            <div className="mt-5 px-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-serif font-bold text-lg text-[#5c3a21]">Upcoming Events</h3>
                    {upcomingEvents.length > 3 && (
                        <button onClick={() => setShowAllEvents(!showAllEvents)} className="text-xs font-bold text-[#7c4624] hover:underline">
                            {showAllEvents ? "Show Less" : "View All"}
                        </button>
                    )}
                </div>

                {upcomingEvents.length > 0 ? (
                    <div className="bg-white rounded-3xl p-4 shadow-sm border border-orange-50/50 space-y-3">
                        {displayedEvents.map((event: any, idx: number) => (
                            <div
                                key={event.id || idx}
                                className="flex justify-between items-start py-2 border-b border-orange-50 last:border-none last:pb-0 cursor-pointer hover:bg-orange-50/20 rounded-xl px-1 transition-colors"
                                onClick={() => setSelectedEvent(event)}
                            >
                                <div className="flex-1 min-w-0 pr-3">
                                    <h4 className="font-bold text-xs text-[#3c2a21] leading-snug">
                                        {getLocalized(event, "name", language)}
                                        {!event.templeId && (
                                            <span className="ml-1.5 text-[8px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full uppercase tracking-tight">Global</span>
                                        )}
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                        <Clock className="h-3 w-3 shrink-0" />
                                        {event.date || "Coming Soon"}
                                    </p>
                                </div>
                                <Badge className="bg-[#7c4624]/10 text-[#7c4624] border-none text-[9px] font-black px-2.5 py-0.5 rounded-full hover:bg-[#7c4624]/10 shrink-0 uppercase tracking-wider">
                                    {event.date ? new Date(event.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "TBD"}
                                </Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-8 text-center text-xs text-muted-foreground border border-orange-50/50 italic">
                        No upcoming events at this temple.
                    </div>
                )}
            </div>

            {/* ───── Temple Trust Card ───── */}
            {/* <div className="mt-5 px-4">
                <div className="bg-white rounded-3xl p-5 border border-orange-50/50 shadow-sm text-center">
                    <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#5c3a21]">Temple Trust</h4>
                    {temple.trustName && <p className="text-[10px] text-muted-foreground mt-0.5">{temple.trustName}</p>}
                    {temple.trustRegNo && <p className="text-[10px] text-muted-foreground">Reg. No. {temple.trustRegNo}</p>}

                    <div className="space-y-2 mt-4 text-left max-w-xs mx-auto">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                            <span>80G Tax Exemption Available</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                            <span>FCRA Registered</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                            <span>Transparent & Verified</span>
                        </div>
                    </div>
                </div>
            </div> */}

            {/* ───── DevBhakti App Banner ───── */}
            <div className="mt-5 px-4 mb-8">
                <div className="bg-gradient-to-r from-[#3c2a21] to-[#5c3a21] text-white rounded-3xl p-5 flex items-center gap-4 shadow-md overflow-hidden">
                    <div className="flex-1">
                        <h4 className="font-bold text-sm leading-snug">Get in touch with {getLocalized(temple, 'name')}</h4>
                        <p className="text-[10px] text-white/70 mt-1 leading-normal">Pooja booking, reminders, live darshan, receipts & more.</p>
                        <div className="flex items-center gap-1 mt-2">
                            <span className="text-xs font-bold text-amber-400">4.8</span>
                            <span className="text-amber-400 text-[10px]">★★★★★</span>
                            <span className="text-[9px] text-white/50">(25K+)</span>
                        </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-center">
                        <a 
                            href="https://play.google.com/store/search?q=devbhakti&c=apps&hl=en_IN" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white text-[#3c2a21] px-3 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-orange-50 transition-colors whitespace-nowrap"
                        >
                            Download App
                        </a>
                    </div>
                </div>
            </div>

            {/* ───── Sticky Bottom Action Bar ───── */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-orange-50 py-2.5 px-6 flex justify-around items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <button onClick={handleBookPooja} className="flex flex-col items-center gap-0.5 text-xs font-bold text-[#7c4624] active:scale-95 transition-transform">
                    <Calendar className="h-5 w-5" />
                    <span>Book Pooja</span>
                </button>
                <button onClick={handleDonation} className="flex flex-col items-center gap-0.5 text-xs font-bold text-red-500 active:scale-95 transition-transform">
                    <Heart className="h-5 w-5" />
                    <span>Donate</span>
                </button>
                {temple.liveStatus && (
                    <Link href={getLiveDarshanUrl(temple)} className="flex flex-col items-center gap-0.5 text-xs font-bold text-red-600 active:scale-95 transition-transform">
                        <Video className="h-5 w-5" />
                        <span>Live Darshan</span>
                    </Link>
                )}
            </div>

            {/* ═══════════════════════════════════════
                Photography Permission Booking Dialog
            ═══════════════════════════════════════ */}
            <Dialog open={isPhotoDialogOpen} onOpenChange={(open) => !open && resetPhotoFlow()}>
                <DialogContent className="max-w-md w-[92vw] p-0 border-none bg-white overflow-hidden rounded-3xl shadow-2xl">
                    <DialogTitle className="sr-only">Photography Permission</DialogTitle>

                    {/* Header */}
                    <div className="bg-gradient-to-br from-[#7c4624] to-[#5c3a21] text-white p-5 flex items-center justify-between">
                        <div>
                            <h3 className="font-serif font-bold text-base">Photography Permission</h3>
                            <p className="text-[10px] text-white/70 mt-0.5">{getLocalized(temple, "name", language)}</p>
                        </div>
                        <button onClick={resetPhotoFlow} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Step progress */}
                    <div className="px-5 py-3 bg-orange-50/50 border-b border-orange-50 flex items-center gap-1 overflow-x-auto scrollbar-none">
                        {[1, 2, 3, 4, 5, 6].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 transition-colors ${photoStep >= step ? "bg-[#7c4624] text-white" : "bg-gray-200 text-gray-400"}`}>
                                    {step}
                                </div>
                                {step < 6 && <div className={`w-4 h-0.5 shrink-0 mx-0.5 ${photoStep > step ? "bg-[#7c4624]" : "bg-gray-200"}`} />}
                            </div>
                        ))}
                        <span className="text-[10px] font-bold text-[#7c4624] uppercase ml-auto">Step {photoStep}/6</span>
                    </div>

                    {/* Step content */}
                    <div className="p-5 max-h-[55vh] overflow-y-auto">
                        {photoStep === 1 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Select Type</h4>
                                {[
                                    { label: "Personal Photography", desc: "For mobile & basic cameras. Non-commercial.", price: 251 },
                                    { label: "Professional Photography", desc: "DSLRs & high-end gear. Restricted zones apply.", price: 501 },
                                    { label: "Pre-wedding Shoot", desc: "Full crew (max 5). Restricted timings.", price: 1501 },
                                    { label: "Commercial Shoot", desc: "Movies, brands etc. Special trust permissions.", price: 2501 },
                                ].map((opt) => (
                                    <div
                                        key={opt.label}
                                        onClick={() => { setSelectedPhotoType(opt.label); setPhotoPrice(opt.price); }}
                                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${selectedPhotoType === opt.label ? "bg-orange-50/50 border-[#7c4624] shadow-sm" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                                    >
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-[#3c2a21]">{opt.label}</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{opt.desc}</p>
                                        </div>
                                        <span className="font-serif font-black text-xs text-[#7c4624] shrink-0">₹{opt.price}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {photoStep === 2 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Select Date</h4>
                                <input
                                    type="date"
                                    value={selectedPhotoDate}
                                    onChange={(e) => setSelectedPhotoDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="w-full p-3.5 rounded-2xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#7c4624]"
                                />
                                <p className="text-[10px] text-muted-foreground leading-normal">Dates subject to local scheduling & festival restrictions.</p>
                            </div>
                        )}

                        {photoStep === 3 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Select Time Slot</h4>
                                {["08:00 AM – 10:00 AM", "10:00 AM – 12:30 PM", "04:00 PM – 06:00 PM", "06:00 PM – 08:00 PM"].map((slot) => (
                                    <div
                                        key={slot}
                                        onClick={() => setSelectedPhotoSlot(slot)}
                                        className={`p-3.5 rounded-2xl border text-center cursor-pointer font-bold text-xs transition-all ${selectedPhotoSlot === slot ? "bg-[#7c4624] text-white border-transparent" : "bg-white border-gray-200 hover:bg-gray-50 text-[#3c2a21]"}`}
                                    >
                                        {slot}
                                    </div>
                                ))}
                            </div>
                        )}

                        {photoStep === 4 && (
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Rules & Info</h4>
                                <div className="bg-orange-50/50 p-4 rounded-2xl space-y-3 text-xs text-[#5c3a21]/90 leading-relaxed border border-orange-100">
                                    <div className="flex gap-2"><Camera className="h-4 w-4 text-[#7c4624] shrink-0 mt-0.5" /><span>Photography only in allowed areas. Sanctum strictly restricted.</span></div>
                                    <div className="flex gap-2"><Info className="h-4 w-4 text-[#7c4624] shrink-0 mt-0.5" /><span>No tripod or flash inside the sanctum. Respect prayer hours.</span></div>
                                    <div className="flex gap-2"><FileText className="h-4 w-4 text-[#7c4624] shrink-0 mt-0.5" /><span>Permission is non-transferable & valid only for the selected slot.</span></div>
                                </div>
                                <label className="flex items-center gap-2.5 cursor-pointer p-1 mt-2">
                                    <input type="checkbox" checked={agreedToRules} onChange={(e) => setAgreedToRules(e.target.checked)} className="h-4 w-4 rounded accent-[#7c4624]" />
                                    <span className="text-xs font-bold text-[#3c2a21]">I agree to the above rules</span>
                                </label>
                            </div>
                        )}

                        {photoStep === 5 && (
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Secure Payment</h4>
                                <div className="bg-orange-50/30 p-5 rounded-3xl border border-orange-100/50 text-center">
                                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Amount Payable</span>
                                    <h2 className="font-serif font-black text-3xl text-[#7c4624] mt-1">₹{photoPrice}</h2>
                                    <p className="text-[10px] text-muted-foreground mt-1">{selectedPhotoType}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Pay via UPI / QR</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {["GPay", "PhonePe", "Paytm"].map((p) => (
                                            <div key={p} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs font-bold text-muted-foreground hover:bg-gray-100 cursor-pointer">{p}</div>
                                        ))}
                                    </div>
                                    <p className="text-center text-[10px] text-muted-foreground mt-2">Cards / Net Banking / RuPay supported</p>
                                </div>
                            </div>
                        )}

                        {photoStep === 6 && (
                            <div className="text-center py-4 space-y-4">
                                <div className="h-16 w-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                    <CheckCircle className="h-10 w-10" />
                                </div>
                                <div>
                                    <h3 className="font-serif font-bold text-lg text-[#5c3a21]">Permission Granted!</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Your photography permission has been booked successfully.</p>
                                </div>
                                <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-50 text-left max-w-xs mx-auto text-xs space-y-1">
                                    <p><span className="font-bold">Type:</span> <span className="text-muted-foreground">{selectedPhotoType}</span></p>
                                    <p><span className="font-bold">Date:</span> <span className="text-muted-foreground">{selectedPhotoDate || "Not selected"}</span></p>
                                    <p><span className="font-bold">Slot:</span> <span className="text-muted-foreground">{selectedPhotoSlot}</span></p>
                                    <p><span className="font-bold">Amount:</span> <span className="text-[#7c4624] font-black">₹{photoPrice}</span></p>
                                </div>
                                <div className="pt-2 space-y-2 max-w-xs mx-auto">
                                    <Button className="w-full h-11 bg-[#7c4624] hover:bg-[#5c3a21] text-white text-xs font-bold gap-1.5 rounded-xl">
                                        <Download className="h-4 w-4" /> Download Receipt
                                    </Button>
                                    <Button variant="outline" onClick={resetPhotoFlow} className="w-full h-11 border-gray-200 text-[#7c4624] text-xs font-bold rounded-xl">
                                        Close
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {photoStep < 6 && (
                        <div className="p-5 border-t border-orange-50/60 bg-gray-50/50 flex justify-end">
                            <Button
                                onClick={handlePhotoSubmit}
                                disabled={photoStep === 4 && !agreedToRules}
                                className="h-11 px-8 bg-[#7c4624] hover:bg-[#5c3a21] disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                            >
                                {photoStep === 5 ? "Pay Now" : "Continue"}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ═══ Event Detail Dialog ═══ */}
            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent className="max-w-md w-[92vw] p-0 border-none bg-white overflow-hidden rounded-3xl shadow-2xl">
                    <DialogTitle className="sr-only">Event Details</DialogTitle>
                    {selectedEvent && (
                        <div>
                            <div className="h-28 bg-gradient-to-br from-[#7c4624] via-[#a05a2c] to-[#5c3a21] p-5 flex flex-col justify-end">
                                <h2 className="text-xl font-black text-white leading-tight">{getLocalized(selectedEvent, "name", language)}</h2>
                                <div className="flex items-center gap-2 text-white/80 text-xs mt-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{selectedEvent.date || "Date TBD"}</span>
                                    {!selectedEvent.templeId && <Badge className="bg-white/20 text-white text-[9px] border-white/30 ml-1">Global</Badge>}
                                </div>
                            </div>
                            <div className="p-5 space-y-4">
                                {selectedEvent.description && (
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">About the Event</h3>
                                        <div className="text-xs text-muted-foreground leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedEvent.description }} />
                                    </div>
                                )}
                                {recommendedPoojas.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground">Recommended Poojas</h3>
                                        {recommendedPoojas.map((pooja: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-orange-50/30 border border-orange-50">
                                                <div>
                                                    <p className="text-xs font-bold text-foreground">{getLocalized(pooja, "name", language)}</p>
                                                    <p className="text-[10px] text-[#7c4624] font-bold flex items-center gap-0.5 mt-0.5"><IndianRupee className="h-3 w-3" />{pooja.price}</p>
                                                </div>
                                                <Button size="sm" className="rounded-full bg-[#7c4624] text-[10px] font-black px-4 h-7" onClick={() => { setSelectedEvent(null); router.push(`/poojas/${pooja.slug || pooja.id}?temple=${temple.id}`); }}>
                                                    Book Now
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ═══ Video Play Dialog ═══ */}
            <Dialog open={!!videoPlayUrl} onOpenChange={(open) => !open && setVideoPlayUrl(null)}>
                <DialogContent className="max-w-md w-[95vw] p-0 border-none bg-black overflow-hidden rounded-2xl">
                    <DialogTitle className="sr-only">Temple Video</DialogTitle>
                    {videoPlayUrl && (
                        <div className="aspect-video w-full">
                            <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYouTubeId(videoPlayUrl)}?autoplay=1`} title="Temple Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ═══ Full Gallery Lightbox ═══ */}
            <Dialog open={isFullViewOpen} onOpenChange={setIsFullViewOpen}>
                <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 border-none bg-black/95 flex items-center justify-center overflow-hidden">
                    <DialogTitle className="sr-only">Gallery</DialogTitle>
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        {galleryMedia[activeImageIndex]?.type === "image" ? (
                            <img src={getFullImageUrl(galleryMedia[activeImageIndex].url)} alt="Temple view" className="max-w-full max-h-full object-contain rounded-lg" />
                        ) : (
                            <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-white/10">
                                <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYouTubeId(galleryMedia[activeImageIndex].url)}?autoplay=1`} title="YouTube video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                            </div>
                        )}
                        {galleryMedia.length > 1 && (
                            <>
                                <button className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 text-white rounded-full backdrop-blur-md" onClick={(e) => { e.stopPropagation(); goToPrev(); }}>
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 text-white rounded-full backdrop-blur-md" onClick={(e) => { e.stopPropagation(); goToNext(); }}>
                                    <ChevronLeft className="h-5 w-5 rotate-180" />
                                </button>
                            </>
                        )}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-white/80 text-[10px] font-bold tracking-widest">
                            {activeImageIndex + 1} / {galleryMedia.length}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
