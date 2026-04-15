"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Shield, Lock, Eye, Users, RefreshCw, FileText, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPolicyPage() {
    const { t, tRaw } = useLanguage();
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const policies = [
        {
            icon: Eye,
            title: "1. Information Collected",
            content: "We may collect:",
            points: [
                "Name",
                "Email address",
                "Phone number",
                "Booking details",
                "Transaction details",
                "Communication records",
                "Device and usage data",
                "IP address"
            ]
        },
        {
            icon: FileText,
            title: "2. Use of Information",
            content: "Information is used to:",
            points: [
                "Process bookings",
                "Coordinate with temples/vendors",
                "Provide customer support",
                "Send confirmations and updates",
                "Improve platform services",
                "Comply with legal obligations"
            ],
            extra: "The Company does not sell personal data."
        },
        {
            icon: Lock,
            title: "3. Payment Processing",
            content: "Payments are processed by third-party gateways. Divinity Labs Private Limited does not store complete card details."
        },
        {
            icon: Users,
            title: "4. Data Sharing",
            content: "Information may be shared with:",
            points: [
                "Relevant temples/vendors",
                "Payment gateways",
                "Logistics partners",
                "Authorities when legally required"
            ]
        },
        {
            icon: Shield,
            title: "5. Data Security",
            content: "Reasonable security measures are implemented. However, no system is completely secure."
        },
        {
            icon: RefreshCw,
            title: "6. Data Retention",
            content: "Data is retained as long as necessary to:",
            points: [
                "Provide services",
                "Meet legal and regulatory requirements",
                "Resolve disputes"
            ]
        },
        {
            icon: Users,
            title: "7. User Rights",
            content: "Users may request correction or deletion of personal information (subject to legal retention requirements).",
            extra: "Requests may be sent to: support@devbhakti.in"
        }
    ];

    const localizedSections = tRaw('privacy.sections') || [];
    const policiesMap = policies.map((p, idx) => ({
        ...p,
        ...localizedSections[idx]
    }));

    return (
        <main className="min-h-screen bg-background" style={{ wordBreak: 'keep-all' }}>
            <Navbar />

         {/* Hero Header */}

<section className="relative pt-32 sm:pt-40 pb-20 sm:pb-24">
    <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
    <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-4 sm:mb-6"
        >
            <div className="p-3 sm:p-4 bg-primary/10 backdrop-blur-md rounded-xl sm:rounded-2xl">
                <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
            </div>
        </motion.div>
        <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            /* CHANGE 3: yahan 'py-2', 'leading-[1.15]' aur 'break-words' add kiye hain */
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-bold mb-4 sm:mb-6 text-gradient-sacred pb-2 break-words leading-[1.15] py-2"
        >
            {t('privacy.title')}
        </motion.h1>
        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm font-bold text-primary mb-4 sm:mb-6 uppercase tracking-widest break-words"
        >
            {t('privacy.effective_date')}
        </motion.p>
        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed break-words"
        >
            {t('privacy.intro')}
        </motion.p>
    </div>
</section>
            {/* Policy Sections */}
            <section className="py-16 sm:py-20 container mx-auto px-4 sm:px-6">
                <div className="max-w-5xl mx-auto grid gap-4 sm:gap-6 lg:gap-8">
                    {policiesMap.map((policy, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8 bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border shadow-soft hover:shadow-warm transition-all overflow-hidden"
                        >
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <policy.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                                </div>
                            </div>
                            <div className="flex-grow min-w-0">
                                <h3 className="text-lg sm:text-xl lg:text-2xl font-serif font-bold mb-3 sm:mb-4 text-foreground break-words leading-tight hyphens-none">{policy.title}</h3>
                                <p className="text-base sm:text-lg text-foreground/80 leading-relaxed mb-3 sm:mb-4 break-words hyphens-none">{policy.content}</p>
                                {policy.points && (
                                    <ul className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                                        {policy.points.map((point, pIdx) => (
                                            <li key={pIdx} className="flex items-start gap-2 sm:gap-3 text-foreground/80">
                                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/60 mt-1.5 sm:mt-2 flex-shrink-0" />
                                                <span className="text-sm sm:text-base break-words leading-tight">{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {policy.extra && (
                                    <p className="text-base sm:text-lg font-medium text-primary italic break-words leading-tight hyphens-none">{policy.extra}</p>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {/* Section 8: Grievance Officer */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8 bg-primary/5 p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-primary/20 shadow-warm overflow-hidden"
                    >
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary/20 flex items-center justify-center">
                                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                            </div>
                        </div>
                        <div className="flex-grow min-w-0">
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-serif font-bold mb-3 sm:mb-4 text-primary break-words leading-tight hyphens-none">{t('privacy.grievance.title')}</h3>
                            <p className="text-base sm:text-lg text-foreground/80 leading-relaxed mb-3 sm:mb-4 break-words hyphens-none">{t('privacy.grievance.p1')}</p>
                            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-primary/20 space-y-1 sm:space-y-2">
                                <p className="text-lg sm:text-xl font-bold text-foreground break-words leading-tight hyphens-none">{t('privacy.grievance.officer_name') || "Siddharth Pednekar"}</p>
                                <p className="text-sm sm:text-base text-foreground/70 break-words leading-tight hyphens-none">{t('privacy.grievance.designation') || "Grievance Officer"}</p>
                                <p className="text-sm sm:text-base text-foreground/70 break-words leading-tight hyphens-none">{t('privacy.grievance.company')}</p>
                                <p className="text-sm sm:text-base text-primary font-bold break-words leading-tight hyphens-none">{t('privacy.grievance.email')}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Section 9: Governing Law */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col md:flex-row gap-8 bg-white p-8 md:p-10 rounded-3xl border border-border shadow-soft hover:shadow-warm transition-all"
                    >
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <MapPin className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-2xl font-serif font-bold mb-4 text-foreground">{t('privacy.governing_law.title')}</h3>
                            <p className="text-lg text-foreground/80 leading-relaxed">{t('privacy.governing_law.p1')}</p>
                            <p className="text-base sm:text-lg text-foreground/80 leading-relaxed mt-2 break-words hyphens-none"><span className="font-semibold">{t('privacy.governing_law.jurisdiction')}</span></p>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
