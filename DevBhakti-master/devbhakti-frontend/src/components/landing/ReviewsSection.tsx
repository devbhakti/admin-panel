"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Play, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

// Asset imports
import user1 from "@/assets/temple-kashi.jpg";
import user2 from "@/assets/temple-tirupati.jpg";
import user3 from "@/assets/temple-siddhivinayak.jpg";
import user4 from "@/assets/temple-meenakshi.jpg";
import user5 from "@/assets/temple-somnath.jpg";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const ReviewsSection: React.FC = () => {
    const { t } = useLanguage();

    const reviews = [
        {
            id: 1,
            type: "text",
            content: t('landing.reviews.items.0.content'),
            name: t('landing.reviews.items.0.name'),
            location: t('landing.reviews.items.0.location'),
            rating: 5,
            avatar: user1,
        },
        {
            id: 2,
            type: "text",
            content: t('landing.reviews.items.1.content'),
            name: t('landing.reviews.items.1.name'),
            location: t('landing.reviews.items.1.location'),
            rating: 5,
            avatar: user2,
        },
        {
            id: 3,
            type: "text",
            content: t('landing.reviews.items.2.content'),
            name: t('landing.reviews.items.2.name'),
            location: t('landing.reviews.items.2.location'),
            rating: 5,
            avatar: user3,
        },
        {
            id: 4,
            type: "text",
            content: t('landing.reviews.items.3.content'),
            name: t('landing.reviews.items.3.name'),
            location: t('landing.reviews.items.3.location'),
            rating: 5,
            avatar: user4,
        },
        {
            id: 5,
            type: "text",
            content: t('landing.reviews.items.4.content'),
            name: t('landing.reviews.items.4.name'),
            location: t('landing.reviews.items.4.location'),
            rating: 5,
            avatar: user5,
        },
    ];

    return (
        <section className="py-8 md:py-12 bg-[#FFF9F5] dark:bg-zinc-900/50 overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-2"
                    >
                        {t('landing.reviews.title')}
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-500 mx-auto mb-4 rounded-full"
                    />

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-lg max-w-2xl mx-auto"
                    >
                        {t('landing.reviews.subtitle')}
                    </motion.p>
                </div>

                {/* Carousel Container */}
                <div className="relative max-w-6xl mx-auto px-4 sm:px-0">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full relative"
                    >
                        <CarouselContent className="-ml-4">
                            {reviews.map((review, index) => (
                                <CarouselItem key={review.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                                    <div className="h-full pt-1">
                                        <div className="h-[310px] flex flex-col bg-white dark:bg-zinc-950 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#FDEEE7] dark:border-zinc-800 transition-all duration-300">

                                            {/* Content Area */}
                                            <div className="flex-1 overflow-hidden relative">
                                                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-orange-100 dark:text-zinc-800 -z-10" />
                                                <div className="relative mb-4 pt-1">
                                                    <p className="text-zinc-700 dark:text-zinc-300 italic text-base leading-relaxed line-clamp-6">
                                                        "{review.content}"
                                                    </p>
                                                </div>
                                            </div>

                                            {/* User Info */}
                                            <div className="flex items-center gap-4 mt-auto pt-4 border-t border-orange-50 dark:border-zinc-800">
                                                <div className="w-12 h-12 rounded-full overflow-hidden relative border-2 border-[#FFE8D9] p-0.5">
                                                    <div className="w-full h-full rounded-full overflow-hidden relative">
                                                        <Image
                                                            src={review.avatar}
                                                            alt={review.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-foreground text-base tracking-tight truncate">{review.name}</h4>
                                                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-widest truncate">{review.location}</p>
                                                </div>
                                                <div className="flex gap-0.5 shrink-0">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        <CarouselPrevious className="hidden md:flex -left-6 lg:-left-12 h-12 w-12 rounded-full bg-white border border-[#FFE8D9] shadow-sm text-zinc-600 hover:text-orange-600 hover:bg-white transition-all scale-110">
                            <ChevronLeft className="h-5 w-5" />
                        </CarouselPrevious>
                        <CarouselNext className="hidden md:flex -right-6 lg:-right-12 h-12 w-12 rounded-full bg-white border border-[#FFE8D9] shadow-sm text-zinc-600 hover:text-orange-600 hover:bg-white transition-all scale-110">
                            <ChevronRight className="h-5 w-5" />
                        </CarouselNext>
                    </Carousel>
                </div>
            </div>
        </section>
    );
};

export default ReviewsSection;
