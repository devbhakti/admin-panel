// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import Navbar from "@/components/landing/Navbar";
// import Footer from "@/components/landing/Footer";
// import { UserCheck, Shield, FileText, Mail, Gavel, Scale, MapPin, Clock, AlertCircle } from "lucide-react";
// import { useLanguage } from "@/context/LanguageContext";

// export default function GrievanceOfficerPage() {
//     const { t, tRaw } = useLanguage();
//     const fadeIn = {
//         initial: { opacity: 0, y: 20 },
//         whileInView: { opacity: 1, y: 0 },
//         viewport: { once: true },
//         transition: { duration: 0.6 }
//     };

//     const complaintCategoriesRaw = tRaw('grievance.mechanism.categories');
//     const complaintCategories = Array.isArray(complaintCategoriesRaw)
//         ? complaintCategoriesRaw
//         : [
//             "Platform services",
//             "Booking issues",
//             "Privacy concerns",
//             "Refund matters",
//             "Any other platform-related grievances"
//         ];

//     return (
//         <main className="min-h-screen bg-background" style={{ wordBreak: 'keep-all' }}>
//             <Navbar />

//             {/* Hero Header */}
//             <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 overflow-hidden">
//                 <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
//                 <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
//                     <motion.div
//                         initial={{ opacity: 0, y: -20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className="flex justify-center mb-4 sm:mb-6"
//                     >
//                         <div className="p-3 sm:p-4 bg-primary/10 backdrop-blur-md rounded-xl sm:rounded-2xl">
//                             <Scale className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
//                         </div>
//                     </motion.div>
//                     <motion.h1
//                         initial={{ opacity: 0, scale: 0.95 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ duration: 0.8 }}
//                         className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-bold mb-4 sm:mb-6 text-gradient-sacred pb-2 break-normal"
//                     >
//                         {t('grievance.title')}
//                     </motion.h1>
//                     <motion.p
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ delay: 0.2 }}
//                         className="text-xs sm:text-sm font-bold text-primary mb-4 sm:mb-6 uppercase tracking-widest break-words"
//                     >
//                         {t('grievance.effective_date')}
//                     </motion.p>
//                     <motion.p
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ delay: 0.3 }}
//                         className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed break-words"
//                     >
//                         {t('grievance.intro')}
//                     </motion.p>
//                 </div>
//             </section>

//             {/* Main Content */}
//             <section className="py-16 sm:py-24 container mx-auto px-4 sm:px-6">
//                 <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">

//                     {/* Designated Officer Card */}
//                     <motion.div {...fadeIn} className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[3rem] border border-border shadow-warm text-center overflow-hidden">
//                         <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 sm:mb-8">
//                             <UserCheck className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
//                         </div>
//                         <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-6 sm:mb-8 text-foreground break-words">{t('grievance.officer.title')}</h2>

//                         <div className="grid gap-3 sm:gap-4 text-left max-w-lg mx-auto">
//                             <div className="bg-secondary/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border flex justify-between items-center text-left">
//                                 <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider break-words">Name</span>
//                                 <span className="text-lg sm:text-xl font-bold text-foreground break-words">{t('grievance.officer.name')}</span>
//                             </div>
//                             <div className="bg-secondary/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border flex justify-between items-center text-left">
//                                 <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider break-words">Designation</span>
//                                 <span className="text-base sm:text-lg font-bold text-foreground break-words">{t('grievance.officer.designation')}</span>
//                             </div>
//                             <div className="bg-secondary/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border flex justify-between items-center text-left">
//                                 <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider break-words">Company</span>
//                                 <span className="text-base sm:text-lg font-bold text-foreground break-words">{t('grievance.officer.company')}</span>
//                             </div>
//                             <div className="bg-secondary/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border flex justify-between items-center text-left">
//                                 <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider break-words">Platform</span>
//                                 <span className="text-base sm:text-lg font-bold text-foreground break-words">{t('grievance.officer.platform')}</span>
//                             </div>
//                             <div className="bg-primary/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-primary/20 flex justify-between items-center text-left">
//                                 <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-1 sm:gap-2">
//                                     <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
//                                     <span className="break-words">Email</span>
//                                 </span>
//                                 <a href={`mailto:${t('grievance.officer.email')}`} className="text-base sm:text-lg font-bold text-primary hover:underline break-words">
//                                     {t('grievance.officer.email')}
//                                 </a>
//                             </div>
//                         </div>
//                     </motion.div>

//                     {/* Grievance Redressal Mechanism */}
//                     <motion.div {...fadeIn} className="bg-card p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[3rem] border border-border/50 overflow-hidden">
//                         <h3 className="text-lg sm:text-xl lg:text-2xl font-serif font-bold mb-4 sm:mb-6 text-primary flex items-center gap-2 sm:gap-3 break-words leading-tight hyphens-none">
//                             <Gavel className="w-5 h-5 sm:w-7 sm:h-7" />
//                             <span className="break-words">{t('grievance.mechanism.title')}</span>
//                         </h3>

//                         <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
//                             <p className="font-medium text-foreground break-words hyphens-none">
//                                 {t('grievance.mechanism.subtitle')}
//                             </p>

//                             <ul className="space-y-2 sm:space-y-3">
//                                 {Array.isArray(complaintCategories) && complaintCategories.map((category: string, index: number) => (
//                                     <motion.li
//                                         key={index}
//                                         initial={{ opacity: 0, x: -10 }}
//                                         whileInView={{ opacity: 1, x: 0 }}
//                                         viewport={{ once: true }}
//                                         transition={{ delay: index * 0.1 }}
//                                         className="flex items-center gap-2 sm:gap-3 bg-white p-3 sm:p-4 rounded-xl border border-border"
//                                     >
//                                         <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary" />
//                                         <span className="text-sm sm:text-base text-foreground break-words leading-tight">{category}</span>
//                                     </motion.li>
//                                 ))}
//                             </ul>

//                             <div className="grid md:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4">
//                                 <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border flex items-center gap-3 sm:gap-4">
//                                     <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
//                                         <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
//                                     </div>
//                                     <div>
//                                         <p className="text-xs sm:text-sm text-muted-foreground break-words">{t('grievance.mechanism.stats.ack')}</p>
//                                         <p className="text-base sm:text-lg font-bold text-foreground break-words">{t('grievance.mechanism.stats.ack_time')}</p>
//                                     </div>
//                                 </div>
//                                 <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border flex items-center gap-3 sm:gap-4">
//                                     <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
//                                         <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
//                                     </div>
//                                     <div>
//                                         <p className="text-xs sm:text-sm text-muted-foreground break-words">{t('grievance.mechanism.stats.res')}</p>
//                                         <p className="text-base sm:text-lg font-bold text-foreground break-words">{t('grievance.mechanism.stats.res_time')}</p>
//                                     </div>
//                                 </div>
//                             </div>

//                             <p className="text-xs sm:text-sm text-muted-foreground pt-2 break-words hyphens-none">
//                                 {t('grievance.mechanism.footer')}
//                             </p>
//                         </div>
//                     </motion.div>

//                     {/* Jurisdiction Section */}
//                     <motion.div {...fadeIn} className="bg-gradient-sacred text-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[3rem] shadow-glow overflow-hidden">
//                         <h3 className="text-lg sm:text-xl lg:text-2xl font-serif font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 break-words leading-tight hyphens-none">
//                             <MapPin className="w-5 h-5 sm:w-7 sm:h-7" />
//                             <span className="break-words">{t('grievance.jurisdiction.title')}</span>
//                         </h3>
//                         <div className="space-y-3 sm:space-y-4 text-base sm:text-lg leading-relaxed">
//                             <p className="opacity-90 break-words hyphens-none">
//                                 {t('grievance.jurisdiction.p1')}
//                             </p>
//                         </div>
//                     </motion.div>

//                     {/* Bottom Cards */}
//                     <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
//                         <motion.div {...fadeIn} className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-[2.5rem] border border-border shadow-soft flex gap-4 sm:gap-6 items-start overflow-hidden">
//                             <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
//                                 <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
//                             </div>
//                             <div>
//                                 <h4 className="font-bold text-foreground mb-2 break-words">{t('grievance.cards.compliance.title')}</h4>
//                                 <p className="text-sm sm:text-base text-muted-foreground break-words hyphens-none">{t('grievance.cards.compliance.text')}</p>
//                             </div>
//                         </motion.div>
//                         <motion.div {...fadeIn} className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-[2.5rem] border border-border shadow-soft flex gap-4 sm:gap-6 items-start text-left overflow-hidden">
//                             <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
//                                 <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
//                             </div>
//                             <div>
//                                 <h4 className="font-bold text-foreground mb-2 break-words">{t('grievance.cards.documentation.title')}</h4>
//                                 <p className="text-sm sm:text-base text-muted-foreground break-words hyphens-none">{t('grievance.cards.documentation.text')}</p>
//                             </div>
//                         </motion.div>
//                     </div>
//                 </div>
//             </section>

//             <Footer />
//         </main>
//     );
// }
"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { UserCheck, Shield, FileText, Mail, Gavel, Scale, MapPin, Clock, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function GrievanceOfficerPage() {
    const { t, tRaw } = useLanguage();
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const complaintCategoriesRaw = tRaw('grievance.mechanism.categories');
    const complaintCategories = Array.isArray(complaintCategoriesRaw)
        ? complaintCategoriesRaw
        : [
            "Platform services",
            "Booking issues",
            "Privacy concerns",
            "Refund matters",
            "Any other platform-related grievances"
        ];

    return (
        // FIX 1: Changed 'wordBreak: keep-all' to 'break-word'.
        // 'keep-all' often cuts off long Hindi/Marathi words on mobile screens.
        <main className="min-h-screen bg-background" style={{ wordBreak: 'break-word' }}>
            <Navbar />

            {/* Hero Header */}
            {/* FIX 2: Removed 'overflow-hidden' to prevent clipping during animations.
                Increased 'pt' and 'pb' to give more vertical space for tall letters. */}
            <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-24">
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
                <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center mb-4 sm:mb-6"
                    >
                        <div className="p-3 sm:p-4 bg-primary/10 backdrop-blur-md rounded-xl sm:rounded-2xl">
                            <Scale className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
                        </div>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        // FIX 3: Added 'leading-[1.15]' and 'py-2'.
                        // 'leading-[1.15]' tightens vertical space slightly for better look but keeps it safe.
                        // 'py-2' adds padding specifically to the text element so the Matra (top line) doesn't touch the container edge.
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-bold mb-4 sm:mb-6 text-gradient-sacred pb-2 break-normal leading-[1.15] py-2"
                    >
                        {t('grievance.title')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs sm:text-sm font-bold text-primary mb-4 sm:mb-6 uppercase tracking-widest break-words leading-relaxed"
                    >
                        {t('grievance.effective_date')}
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed break-words"
                    >
                        {t('grievance.intro')}
                    </motion.p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 sm:py-24 container mx-auto px-4 sm:px-6">
                <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">

                    {/* Designated Officer Card */}
                    <motion.div {...fadeIn} className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[3rem] border border-border shadow-warm text-center overflow-hidden">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 sm:mb-8">
                            <UserCheck className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-6 sm:mb-8 text-foreground break-words leading-tight py-1">{t('grievance.officer.title')}</h2>

                        <div className="grid gap-3 sm:gap-4 text-left max-w-lg mx-auto">
                            <div className="bg-secondary/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border flex justify-between items-center text-left">
                                <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider break-words">Name</span>
                                <span className="text-lg sm:text-xl font-bold text-foreground break-words">{t('grievance.officer.name')}</span>
                            </div>
                            <div className="bg-secondary/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border flex justify-between items-center text-left">
                                <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider break-words">Designation</span>
                                <span className="text-base sm:text-lg font-bold text-foreground break-words">{t('grievance.officer.designation')}</span>
                            </div>
                            <div className="bg-secondary/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border flex justify-between items-center text-left">
                                <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider break-words">Company</span>
                                <span className="text-base sm:text-lg font-bold text-foreground break-words">{t('grievance.officer.company')}</span>
                            </div>
                            <div className="bg-secondary/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border flex justify-between items-center text-left">
                                <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider break-words">Platform</span>
                                <span className="text-base sm:text-lg font-bold text-foreground break-words">{t('grievance.officer.platform')}</span>
                            </div>
                            <div className="bg-primary/5 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-primary/20 flex justify-between items-center text-left">
                                <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-1 sm:gap-2">
                                    <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="break-words">Email</span>
                                </span>
                                <a href={`mailto:${t('grievance.officer.email')}`} className="text-base sm:text-lg font-bold text-primary hover:underline break-words">
                                    {t('grievance.officer.email')}
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    {/* Grievance Redressal Mechanism */}
                    <motion.div {...fadeIn} className="bg-card p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[3rem] border border-border/50 overflow-hidden">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-serif font-bold mb-4 sm:mb-6 text-primary flex items-center gap-2 sm:gap-3 break-words leading-tight">
                            <Gavel className="w-5 h-5 sm:w-7 sm:h-7" />
                            <span className="break-words">{t('grievance.mechanism.title')}</span>
                        </h3>

                        <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
                            <p className="font-medium text-foreground break-words">
                                {t('grievance.mechanism.subtitle')}
                            </p>

                            <ul className="space-y-2 sm:space-y-3">
                                {Array.isArray(complaintCategories) && complaintCategories.map((category: string, index: number) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-2 sm:gap-3 bg-white p-3 sm:p-4 rounded-xl border border-border"
                                    >
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary" />
                                        <span className="text-sm sm:text-base text-foreground break-words leading-tight">{category}</span>
                                    </motion.li>
                                ))}
                            </ul>

                            <div className="grid md:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4">
                                <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border flex items-center gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-muted-foreground break-words">{t('grievance.mechanism.stats.ack')}</p>
                                        <p className="text-base sm:text-lg font-bold text-foreground break-words">{t('grievance.mechanism.stats.ack_time')}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border flex items-center gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-muted-foreground break-words">{t('grievance.mechanism.stats.res')}</p>
                                        <p className="text-base sm:text-lg font-bold text-foreground break-words">{t('grievance.mechanism.stats.res_time')}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs sm:text-sm text-muted-foreground pt-2 break-words">
                                {t('grievance.mechanism.footer')}
                            </p>
                        </div>
                    </motion.div>

                    {/* Jurisdiction Section */}
                    <motion.div {...fadeIn} className="bg-gradient-sacred text-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[3rem] shadow-glow overflow-hidden">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-serif font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 break-words leading-tight">
                            <MapPin className="w-5 h-5 sm:w-7 sm:h-7" />
                            <span className="break-words">{t('grievance.jurisdiction.title')}</span>
                        </h3>
                        <div className="space-y-3 sm:space-y-4 text-base sm:text-lg leading-relaxed">
                            <p className="opacity-90 break-words">
                                {t('grievance.jurisdiction.p1')}
                            </p>
                        </div>
                    </motion.div>

                    {/* Bottom Cards */}
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        <motion.div {...fadeIn} className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-[2.5rem] border border-border shadow-soft flex gap-4 sm:gap-6 items-start overflow-hidden">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground mb-2 break-words">{t('grievance.cards.compliance.title')}</h4>
                                <p className="text-sm sm:text-base text-muted-foreground break-words">{t('grievance.cards.compliance.text')}</p>
                            </div>
                        </motion.div>
                        <motion.div {...fadeIn} className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-[2.5rem] border border-border shadow-soft flex gap-4 sm:gap-6 items-start text-left overflow-hidden">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground mb-2 break-words">{t('grievance.cards.documentation.title')}</h4>
                                <p className="text-sm sm:text-base text-muted-foreground break-words">{t('grievance.cards.documentation.text')}</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}