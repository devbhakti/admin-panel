"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck, Receipt, FileText, BellRing, CheckCircle2 } from "lucide-react";
import templeIcon from "@/assets/icons/temple-icon.png";
import donateIcon from "@/assets/icons/donate.png";
import diyaIcon from "@/assets/icons/diya.png";
import { useLanguage } from "@/context/LanguageContext";

const TrustSection: React.FC = () => {
    const { t } = useLanguage();

    const trustPoints = [
        {
            icon: templeIcon,
            isImage: true,
            title: t('landing.trust.points.0.title'),
            description: t('landing.trust.points.0.description'),
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            icon: donateIcon,
            isImage: true,
            title: t('landing.trust.points.1.title'),
            description: t('landing.trust.points.1.description'),
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            icon: diyaIcon,
            isImage: true,
            title: t('landing.trust.points.2.title'),
            description: t('landing.trust.points.2.description'),
            color: "text-orange-600",
            bg: "bg-orange-50",
        },
        {
            icon: BellRing,
            title: t('landing.trust.points.3.title'),
            description: t('landing.trust.points.3.description'),
            color: "text-black",
            bg: "bg-purple-50",
        },
    ];

    return (
        <section id="trust" className="py-6 relative overflow-hidden bg-white">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#b45309 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Left Side: Content */}
                    <div className="lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-6">
                                <CheckCircle2 size={14} />
                                {t('landing.trust.tagline')}
                            </span>
                            <h2 
                                className="text-4xl md:text-5xl font-serif font-bold text-zinc-900 mb-6"
                                style={{ lineHeight: 1.2}}
                            >
                                {t('landing.trust.title1')}
                                <span className="text-gradient-sacred">{t('landing.trust.title2')}</span>
                            </h2>
                            <p className="text-black text-lg mb-8 leading-relaxed max-w-xl">
                                {t('landing.trust.description')}
                            </p>

                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="text-sm">
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side: Trust Grid */}
                    <div className="lg:w-1/2 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {trustPoints.map((point, index) => (
                                <motion.div
                                    key={point.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="p-6 rounded-3xl bg-zinc-50/80 border border-zinc-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 group"
                                >
                                    <div className={`w-12 h-12 rounded-2xl ${point.bg} ${point.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm overflow-hidden`}>
                                        {(point as any).isImage ? (
                                            <Image src={point.icon as any} alt={point.title} width={24} height={24} className="w-6 h-6 object-contain" />
                                        ) : (
                                            (() => {
                                                const IconComponent = point.icon as any;
                                                return <IconComponent size={24} />;
                                            })()
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-orange-700 transition-colors">
                                        {point.title}
                                    </h3>
                                    <p className="text-black text-[15px] leading-relaxed">
                                        {point.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustSection;
