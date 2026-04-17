"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    Clock,
    IndianRupee,
    ArrowRight,
    CheckCircle2,
    Info,
    MapPin,
    Star,
    HelpCircle,
    PlayCircle,
    Loader2,
    MessageSquare,
    Sparkle,
    ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchPublicPoojaById, fetchRatingsSettings } from "@/api/publicController";
import { API_URL } from "@/config/apiConfig";
import { toast } from "@/hooks/use-toast";
import { getTempleUrl } from "@/lib/utils/templeUtils";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalized, getLocalizedArray } from "@/utils/localization";

interface PoojaDetailClientProps {
    id: string;
}

// Removed hardcoded STANDARD_FAQS as they are now fetched from the backend


const PoojaDetailClient = ({ id }: PoojaDetailClientProps) => {
    const [pooja, setPooja] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("about");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [showRatings, setShowRatings] = useState(false);
    const router = useRouter();
    const { language, t } = useLanguage();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        setIsLoggedIn(!!token);
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    const getFullImageUrl = (path: string) => {
        if (!path) return "/placeholder.jpg";
        if (path.startsWith('http')) return path;
        return `${API_URL.replace('/api', '')}${path}`;
    };

    const getLowestPrice = (pooja: any) => {
        let prices: number[] = [pooja.price];

        if (pooja.packages) {
            try {
                const pkgs = typeof pooja.packages === 'string' ? JSON.parse(pooja.packages) : pooja.packages;
                if (Array.isArray(pkgs)) {
                    pkgs.forEach((p: any) => p.price && prices.push(p.price));
                }
            } catch (e) { }
        }

        if (pooja.templeCopies && Array.isArray(pooja.templeCopies)) {
            pooja.templeCopies.forEach((copy: any) => {
                if (copy.price) prices.push(copy.price);
                if (copy.packages) {
                    try {
                        const pkgs = typeof copy.packages === 'string' ? JSON.parse(copy.packages) : copy.packages;
                        if (Array.isArray(pkgs)) {
                            pkgs.forEach((p: any) => p.price && prices.push(p.price));
                        }
                    } catch (e) { }
                }
            });
        }

        const validPrices = prices.filter(p => p > 0);
        return validPrices.length > 0 ? Math.min(...validPrices) : pooja.price;
    };

    useEffect(() => {
        const loadPoojaAndSettings = async () => {
            try {
                const [poojaData, settingsData] = await Promise.all([
                    fetchPublicPoojaById(id, language),
                    fetchRatingsSettings()
                ]);
                setPooja(poojaData);
                if (settingsData && settingsData.settings) {
                    setShowRatings(settingsData.settings.pooja.details);
                }
            } catch (error) {
                console.error("Failed to fetch pooja or settings:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadPoojaAndSettings();
    }, [id, language]);



    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="mt-4 text-primary font-serif italic text-lg tracking-wide">{t('pooja_detail.loading')}</p>
            </div>
        );
    }

    if (!pooja) {
        return (
            <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center">
                <h1 className="text-3xl font-serif font-bold text-primary mb-6">{t('pooja_detail.not_found')}</h1>
                <Button asChild variant="default" className="rounded-full px-8">
                    <Link href="/">{t('pooja_detail.return_home')}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF8F0] selection:bg-primary/20">
            <Navbar />

            <main className="pt-28 pb-20">
                <div className="container mx-auto px-4 max-w-[1440px]">
                    {/* Hero Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
                        {/* Left: Image Card */}
                        <div className="lg:col-span-5 relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative aspect-square md:aspect-[4/5] lg:aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white shadow-primary/10"
                            >
                                <img
                                    src={getFullImageUrl(pooja.image)}
                                    alt={getLocalized(pooja, 'name', language)}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-6 left-6">
                                    <Badge className="bg-primary/90 text-white backdrop-blur-md px-5 py-2 text-sm font-bold rounded-xl border border-white/20">
                                        {getLocalized(pooja, 'category', language) || t('pooja_detail.ritual')}
                                    </Badge>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right: Info Section */}
                        <div className="lg:col-span-7 flex flex-col h-full justify-between py-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#1a1a1a] mb-6 leading-tight">
                                    {getLocalized(pooja, 'name', language)}
                                </h1>
                                <p className="text-lg text-[#555] leading-relaxed mb-8 max-w-2xl">
                                    {pooja.about?.split('.')[0]}. {pooja.about?.split('.')[1] || ""}
                                </p>


                                {/* Booking Bar */}
                                <div className="bg-[#FFEAD1] p-5 rounded-[2rem] border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-primary/5">
                                    <div className="px-4">
                                        <div className="text-primary/70 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{t('pooja_detail.starting_from')}</div>
                                        <div className="flex items-center gap-1 text-3xl font-bold text-primary">
                                            <IndianRupee className="w-6 h-6 stroke-[2.5]" />
                                            <span>{getLowestPrice(pooja)}</span>
                                        </div>
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={() => {
                                            const token = localStorage.getItem("token");
                                            const savedUser = localStorage.getItem("user");
                                            const parsedUser = savedUser ? JSON.parse(savedUser) : null;

                                            const bookingUrl = pooja.temple?.id
                                                ? `/booking?pooja=${id}&temple=${pooja.temple.id}`
                                                : `/booking?pooja=${id}`;

                                            if (!token || !parsedUser || parsedUser.role !== "DEVOTEE") {
                                                toast({ title: t('common.login_required'), variant: "destructive" });
                                                router.push(`/auth?redirect=${encodeURIComponent(bookingUrl)}`);
                                                return;
                                            }

                                            // If temple is available OR it's a master pooja, navigate directly to booking
                                            if (pooja.temple?.id || pooja.isMaster) {
                                                router.push(bookingUrl);
                                            } else {
                                                // Otherwise scroll to temple tab to select temple first (for temple-specific poojas without direct temple relation shown)
                                                setActiveTab("temple");
                                                document.getElementById('content-tabs')?.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }}
                                        className="bg-primary text-white hover:bg-primary/90 transition-all duration-500 rounded-full px-10 py-7 text-lg font-bold shadow-md hover:shadow-xl hover:-translate-y-1 group"
                                    >
                                        {t('common.book_now')} <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div id="content-tabs" className="mt-20">
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="w-full"
                        >
                            <div className="flex justify-center mb-12">
                                <TabsList className="h-auto bg-white/70 backdrop-blur-md p-1.5 rounded-full border border-primary/10 shadow-lg flex flex-wrap justify-center sm:flex-nowrap">
                                    {[
                                        { id: "about", label: t('pooja_detail.tab_about'), icon: Info },
                                        { id: "temple", label: t('pooja_detail.tab_temple'), icon: MapPin },
                                        ...(showRatings ? [{ id: "reviews", label: t('pooja_detail.tab_reviews'), icon: Star }] : []),
                                        { id: "faqs", label: t('pooja_detail.tab_faqs'), icon: HelpCircle },
                                    ].map((tab) => (
                                        <TabsTrigger
                                            key={tab.id}
                                            value={tab.id}
                                            className="rounded-full px-7 py-3 text-sm font-semibold transition-all duration-500 data-[state=active]:bg-primary data-[state=active]:text-white shadow-none data-[state=active]:shadow-lg flex items-center gap-2 group"
                                        >
                                            <tab.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            {tab.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white rounded-[3rem] shadow-xl border border-primary/5 p-10 md:p-16"
                                >
                                    {/* About Tab Content */}
                                    <TabsContent value="about" className="mt-0 outline-none">
                                        <div className="max-w-6xl mx-auto">
                                            <h2 className="text-4xl font-serif font-bold mb-8 text-primary">{t('pooja_detail.about_ritual')}</h2>
                                            <div className="space-y-6">
                                                <p className="text-xl text-[#555] leading-relaxed font-light italic">
                                                    {pooja.about || t('pooja_detail.info_soon')}
                                                </p>
                                                {pooja.description && Array.isArray(pooja.description) && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                                                        {pooja.description.map((desc: string, i: number) => (
                                                            <div key={i} className="flex items-start gap-4">
                                                                <div className="w-1.5 h-1.5 bg-primary mt-2.5 rounded-full shrink-0" />
                                                                <p className="text-[#666] leading-relaxed">{desc}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Temple Tab Content */}
                                    <TabsContent value="temple" className="mt-0 outline-none">
                                        <div className="max-w-6xl mx-auto">
                                            <div className="text-center">
                                                <h2 className="text-4xl font-serif font-bold mb-2 text-primary">{t('pooja_detail.participating_temples')}</h2>
                                                <p className="text-[#888] mt-4 mb-16 italic font-serif">{t('pooja_detail.sacred_locations_performed')}</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                {/* Any Location (Global) Booking Card */}
                                                {!pooja.temple && (
                                                    <div className="bg-[#FFF8F0] p-10 rounded-[2.5rem] border-2 border-primary/20 shadow-xl w-full group overflow-hidden relative text-center">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/20 transition-colors" />
                                                        <div className="relative w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center group-hover:scale-105 transition-transform">
                                                            <Sparkle className="w-16 h-16 text-primary stroke-[1.5]" />
                                                        </div>
                                                        <h3 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-2">{t('pooja_detail.any_location') || "Any Location"}</h3>
                                                        <p className="flex items-center justify-center gap-2 text-[#777] text-sm mb-10">
                                                            <MapPin className="w-4 h-4 text-primary" />
                                                            {t('pooja_detail.global_booking') || "Global Service"}
                                                        </p>
                                                        <div className="space-y-4">
                                                            <Button
                                                                className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 font-bold flex items-center justify-center gap-2 transition-all group/btn shadow-md"
                                                                onClick={() => {
                                                                    const bookingUrl = `/booking?pooja=${id}`;
                                                                    const token = localStorage.getItem("token");
                                                                    const savedUser = localStorage.getItem("user");
                                                                    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
                                                                    if (!token || !parsedUser || parsedUser.role !== "DEVOTEE") {
                                                                        toast({ title: t('common.login_required'), variant: "destructive" });
                                                                        router.push(`/auth?redirect=${encodeURIComponent(bookingUrl)}`);
                                                                        return;
                                                                    }
                                                                    router.push(bookingUrl);
                                                                }}
                                                            >
                                                                {t('common.book_now')} <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Master Temple (if any) */}
                                                {pooja.temple && (
                                                    <div className="bg-white p-10 rounded-[2.5rem] border border-primary/10 shadow-xl w-full group overflow-hidden relative text-center">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />
                                                        <div className="relative w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform">
                                                            <img
                                                                src={getFullImageUrl(pooja.temple.image)}
                                                                alt={getLocalized(pooja.temple, 'name', language)}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <h3 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-2">{getLocalized(pooja.temple, 'name', language)}</h3>
                                                        <p className="flex items-center justify-center gap-2 text-[#777] text-sm mb-10">
                                                            <MapPin className="w-4 h-4 text-primary" />
                                                            {getLocalized(pooja.temple, 'location', language)}
                                                        </p>
                                                        <div className="space-y-4">
                                                            <Button
                                                                className="w-full bg-[#5d4037] hover:bg-black text-white rounded-full py-6 font-bold flex items-center justify-center gap-2 transition-all group/btn"
                                                                onClick={() => {
                                                                    const bookingUrl = `/booking?pooja=${id}&temple=${pooja.temple.id}`;
                                                                    const token = localStorage.getItem("token");
                                                                    const savedUser = localStorage.getItem("user");
                                                                    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
                                                                    if (!token || !parsedUser || parsedUser.role !== "DEVOTEE") {
                                                                        toast({ title: t('common.login_required'), variant: "destructive" });
                                                                        router.push(`/auth?redirect=${encodeURIComponent(bookingUrl)}`);
                                                                        return;
                                                                    }
                                                                    router.push(bookingUrl);
                                                                }}
                                                            >
                                                                    {t('common.book_pooja')} <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                            </Button>
                                                            <Button variant="outline" className="w-full border-primary/5 text-[#5d4037] bg-[#FFF8F0]/30 hover:bg-[#FFF8F0]/50 rounded-full py-6 font-bold transition-all" asChild>
                                                                <Link href={getTempleUrl(pooja.temple)}>{t('pooja_detail.explore_temple')}</Link>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Associated Temples (Copies) */}
                                                {pooja.templeCopies && pooja.templeCopies.length > 0 ? (
                                                    pooja.templeCopies.map((copy: any) => (
                                                        <div key={copy.temple.id} className="bg-white p-10 rounded-[2.5rem] border border-primary/10 shadow-xl w-full group overflow-hidden relative text-center">
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />
                                                            <div className="relative w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform">
                                                                <img
                                                                    src={getFullImageUrl(copy.temple.image)}
                                                                    alt={getLocalized(copy.temple, 'name', language)}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <h3 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-2">{getLocalized(copy.temple, 'name', language)}</h3>
                                                            <p className="flex items-center justify-center gap-2 text-[#777] text-sm mb-10">
                                                                <MapPin className="w-4 h-4 text-primary" />
                                                                {getLocalized(copy.temple, 'location', language)}
                                                            </p>
                                                            <div className="space-y-4">
                                                                <Button
                                                                    className="w-full bg-[#5d4037] hover:bg-black text-white rounded-full py-6 font-bold flex items-center justify-center gap-2 transition-all group/btn"
                                                                    onClick={() => {
                                                                        const bookingUrl = `/booking?pooja=${id}&temple=${copy.temple.id}`;
                                                                        const token = localStorage.getItem("token");
                                                                        const savedUser = localStorage.getItem("user");
                                                                        const parsedUser = savedUser ? JSON.parse(savedUser) : null;
                                                                        if (!token || !parsedUser || parsedUser.role !== "DEVOTEE") {
                                                                            toast({ title: t('common.login_required'), variant: "destructive" });
                                                                            router.push(`/auth?redirect=${encodeURIComponent(bookingUrl)}`);
                                                                            return;
                                                                        }
                                                                        router.push(bookingUrl);
                                                                    }}
                                                                >
                                                                    {t('common.book_pooja')} <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                                </Button>
                                                                <Button variant="outline" className="w-full border-primary/5 text-[#5d4037] bg-[#FFF8F0]/30 hover:bg-[#FFF8F0]/50 rounded-full py-6 font-bold transition-all" asChild>
                                                                    <Link href={getTempleUrl(copy.temple)}>{t('pooja_detail.explore_temple')}</Link>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (!pooja.temple && (!pooja.templeCopies || pooja.templeCopies.length === 0) && (
                                                    <div className="col-span-full p-16 border-2 border-dashed border-primary/10 rounded-[3rem] w-full text-center italic text-[#999]">
                                                        {t('pooja_detail.temple_data_soon')}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>



                                    {/* Reviews tab */}
                                    <TabsContent value="reviews" className="mt-0 outline-none">
                                        <div className="max-w-6xl mx-auto">
                                            <h2 className="text-4xl font-serif font-bold mb-12 text-center text-primary">{t('pooja_detail.devotee_experiences')}</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {(pooja.reviews || [
                                                    { name: "Anand Sharma", location: "Delhi", message: "A very peaceful experience. The ritual was performed with great authenticity.", rating: 5 },
                                                    { name: "Priya Nair", location: "Bangalore", message: "Felt a deep sense of calm. Highly recommend for anyone looking for spiritual peace.", rating: 5 }
                                                ]).map((review: any, idx: number) => (
                                                    <div key={idx} className="p-10 rounded-[2.5rem] bg-[#FAFAFA] border border-primary/5 relative group group-hover:bg-white transition-colors">
                                                        <MessageSquare className="absolute top-8 right-8 w-12 h-12 text-primary/5" />
                                                        <div className="flex items-center gap-1 text-[#f59e0b] mb-6">
                                                            {[...Array(review.rating || 5)].map((_, i) => (
                                                                <Star key={i} className="w-4 h-4 fill-[#f59e0b]" />
                                                            ))}
                                                        </div>
                                                        <p className="italic text-[#444] text-lg leading-relaxed mb-10 font-serif">"{review.message}"</p>
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center font-bold text-white text-xl shadow-lg font-serif">
                                                                {review.name[0]}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-[#1a1a1a] font-serif">{review.name}</div>
                                                                <div className="text-sm text-[#888] font-medium">{review.location}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* FAQs tab - Standard FAQs + pooja-specific FAQs */}
                                    <TabsContent value="faqs" className="mt-0 outline-none">
                                        <div className="max-w-6xl mx-auto">
                                            <h2 className="text-4xl font-serif font-bold mb-12 text-center text-primary text-gradient-sacred pb-2">{t('pooja_detail.questions_answers_title')}</h2>
                                            <div className="space-y-6">
                                                {[...(pooja.standardFaqs || []), ...(pooja.faqs && Array.isArray(pooja.faqs) ? pooja.faqs : [])].map((faq: any, idx: number) => (
                                                    <div key={idx} className="p-8 rounded-[2rem] border border-primary/5 bg-[#FFF8F0]/30 hover:bg-white transition-all duration-500 hover:shadow-lg">
                                                        <h4 className="text-xl font-serif font-bold text-[#1a1a1a] mb-4 flex items-start gap-4">
                                                            <HelpCircle className="w-6 h-6 text-primary mt-0.5 shrink-0 opacity-50" />
                                                            {faq.question || faq.q}
                                                        </h4>
                                                        <p className="text-[#666] leading-relaxed pl-10 italic">
                                                            {faq.answer || faq.a}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </motion.div>
                            </AnimatePresence>
                        </Tabs>
                    </div>
                </div>
            </main>

            <Footer />


        </div>
    );
};

export default PoojaDetailClient;
