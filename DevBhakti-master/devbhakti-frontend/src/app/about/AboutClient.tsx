"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Image from "next/image";
import { Building2, Calendar, ClipboardCheck, HeartHandshake, ShieldCheck, Sprout } from "lucide-react";
import aboutImage from "@/assets/temple-kashi.jpg";
import tirupatiImage from "@/assets/temple-tirupati.jpg";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutClient() {
    const { t } = useLanguage();

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <main className="min-h-screen bg-background pattern-sacred">
            <Navbar />
            {/* Hero Section - About Page */}
            <section className="relative min-h-[480px] flex items-center justify-center overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0">
                    <Image
                        src={aboutImage}
                        alt="About DevBhakti"
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
                </div>

                <div className="container mx-auto px-4 pt-28 pb-12 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">
                            {t('about.title')}
                        </h1>
                        
                        <p className="text-lg text-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
                            {t('about.subtitle')}
                        </p>
                    </motion.div>
                </div>
            </section>
            {/* Content Section 1: Who We Are */}
            <section className="py-20 bg-card/30 backdrop-blur-sm border-y border-border/50">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div {...fadeIn}>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">{t('about.who_we_are.title')}</h2>
                            <div className="space-y-4 text-lg text-foreground/80 leading-relaxed">
                                <p>
                                    {t('about.who_we_are.p1')}
                                </p>
                                <p>
                                    {t('about.who_we_are.p2')}
                                </p>
                                <p>
                                    {t('about.who_we_are.p3')}
                                </p>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative aspect-video rounded-3xl overflow-hidden shadow-elevated border-8 border-white/50"
                        >
                            <div className="absolute inset-0 bg-gradient-sacred opacity-10" />

                            <Image
                                src={aboutImage}
                                alt="Sacred Tradition"
                                fill
                                className="object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Content Section 2: What We Do */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <motion.div {...fadeIn} className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">{t('about.what_we_do.title')}</h2>
                        <p className="text-lg text-muted-foreground">
                            {t('about.what_we_do.subtitle')}
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Building2, title: t('about.what_we_do.features.list_poojas.title'), text: t('about.what_we_do.features.list_poojas.text') },
                            { icon: Calendar, title: t('about.what_we_do.features.manage_schedules.title'), text: t('about.what_we_do.features.manage_schedules.text') },
                            { icon: ClipboardCheck, title: t('about.what_we_do.features.accept_bookings.title'), text: t('about.what_we_do.features.accept_bookings.text') },
                            { icon: HeartHandshake, title: t('about.what_we_do.features.receive_offerings.title'), text: t('about.what_we_do.features.receive_offerings.text') }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-soft hover:shadow-warm transition-all hover:-translate-y-2 group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                                    <item.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div {...fadeIn} className="mt-16 text-center max-w-4xl mx-auto bg-primary/5 p-8 rounded-3xl border border-primary/10">
                        <p className="text-xl italic text-primary">
                            {t('about.what_we_do.quote')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content Section 3: Our Role */}
            <section className="py-20 bg-gradient-to-br from-primary via-primary/95 to-accent text-white shadow-elevated">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8"
                        >
                            <ShieldCheck className="w-10 h-10" />
                        </motion.div>
                        <motion.h2 {...fadeIn} className="text-3xl md:text-5xl font-serif font-bold mb-8">{t('about.our_role.title')}</motion.h2>
                        <motion.div {...fadeIn} className="space-y-6 text-xl opacity-90 leading-relaxed font-light">
                            <p>
                                {t('about.our_role.p1')}
                            </p>
                            <p>
                                {t('about.our_role.p2')}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Content Section 4: Our Purpose */}
            <section className="py-24 relative">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex-1"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
                                <Sprout className="w-4 h-4" />
                                <span>{t('about.our_purpose.tagline')}</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8 text-primary leading-tight">{t('about.our_purpose.title')}</h2>
                            <p className="text-xl text-foreground/80 leading-relaxed mb-8">
                                {t('about.our_purpose.p1')}
                            </p>
                            <div className="flex gap-4">
                                <div className="h-1 w-20 bg-gradient-sacred rounded-full" />
                                <div className="h-1 w-8 bg-primary/20 rounded-full" />
                                <div className="h-1 w-4 bg-primary/10 rounded-full" />
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex-1 relative"
                        >
                            <div className="absolute -inset-4 bg-gradient-sacred opacity-20 blur-3xl rounded-full" />
                            <Image
                                src={tirupatiImage}
                                alt="Devotion and Faith"
                                width={600}
                                height={400}
                                className="relative rounded-3xl shadow-warm border- border-white"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
